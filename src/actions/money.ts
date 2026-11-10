"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { daysBetween, istDay, istDayStart } from "@/lib/ist-date";
import { isAllowed, moneyRatelimit } from "@/lib/ratelimit";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";
import { completeQuest } from "@/lib/quests";
import { awardMoneyBadges } from "@/lib/badges";
import { alertAfterSpend, monthBounds, monthOf } from "@/lib/money";
import { queueAvatarEvent, queueAvatarEvents, type AvatarEventInput } from "@/lib/avatar/events";
import { BUDGET_WARN_PCT } from "@/lib/money";
import { expenseCategory } from "@/lib/money/categories";
import { SAVINGS_GOAL_XP, SAVINGS_GOAL_XP_MIN_DAYS, SAVINGS_GOAL_XP_MIN_TARGET } from "@/lib/constants";
import { EXPENSE_IDS, GOAL_ICONS, INCOME_IDS, MAX_ENTRY, MAX_GOAL } from "@/lib/money/categories";

// Money Manager actions. Every one checks the signed-in student, validates
// its input here (never trusting the browser), and only touches that
// student's own rows. Checking in on your money once a day pays a little XP
// and counts toward the streak, logging more doesn't pay more.

const ACTIVE_GOAL_LIMIT = 6;
// Entries can be back-dated, but not by more than this, and only today's
// entries count as today's check-in.
const MAX_BACKDATE_DAYS = 60;

type Fail = { status: "invalid"; message: string } | { status: "slow-down" };

function refresh() {
  // The layout too: it carries the avatar's reactions.
  revalidatePath("/", "layout");
  revalidatePath("/money");
  revalidatePath("/dashboard");
}

/**
 * Records today's money check-in (used by the money badges). The XP and the
 * streak day now come from the "log" daily quest.
 */
async function checkIn(tx: Prisma.TransactionClient, userId: string, day: string, kind: "LOGGED" | "NO_SPEND") {
  const { count } = await tx.moneyCheckIn.createMany({ data: [{ userId, day, kind }], skipDuplicates: true });
  // Logging a spend on a day first marked "no-spend" makes it a logged day.
  if (count === 0 && kind === "LOGGED") await tx.moneyCheckIn.updateMany({ where: { userId, day, kind: "NO_SPEND" }, data: { kind: "LOGGED" } });
  return count > 0;
}

const entrySchema = z
  .object({
    kind: z.enum(["INCOME", "EXPENSE"]),
    amount: z.coerce.number({ message: "Enter an amount" }).int("Use whole rupees").min(1, "Enter an amount above ₹0").max(MAX_ENTRY, "That's more than ₹10 lakh, double-check the amount"),
    category: z.string(),
    note: z.string().trim().max(80, "Keep the note under 80 characters").optional(),
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  })
  .refine((e) => (e.kind === "EXPENSE" ? EXPENSE_IDS : INCOME_IDS).includes(e.category), { message: "Pick a category", path: ["category"] });

export type AddEntryResult = { status: "saved"; questXp: number; alert: string | null } | Fail;

type EntryInput = { kind: string; amount: number | string; category: string; note?: string; day: string };

/** Validates an entry, including its date: not in the future, at most 60 days back. */
function parseEntry(input: EntryInput, today: string) {
  const parsed = entrySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, fail: { status: "invalid" as const, message: parsed.error.issues[0]?.message ?? "Please check the entry" } };
  const age = daysBetween(parsed.data.day, today);
  if (age < 0) return { ok: false as const, fail: { status: "invalid" as const, message: "That date is in the future" } };
  if (age > MAX_BACKDATE_DAYS) return { ok: false as const, fail: { status: "invalid" as const, message: "Entries can go back up to 60 days" } };
  return { ok: true as const, data: parsed.data };
}

/** After a spend: is its category (or the month) near or over budget? Server-computed. */
async function budgetAlertFor(tx: Prisma.TransactionClient, userId: string, category: string, day: string) {
  const month = monthOf(day);
  const { first, last } = monthBounds(month);
  const [budgets, inCategory, total] = await Promise.all([
    tx.moneyBudget.findMany({ where: { userId, month, category: { in: [category, "total"] } }, select: { category: true, amount: true } }),
    tx.moneyEntry.aggregate({ where: { userId, kind: "EXPENSE", category, day: { gte: first, lte: last } }, _sum: { amount: true } }),
    tx.moneyEntry.aggregate({ where: { userId, kind: "EXPENSE", day: { gte: first, lte: last } }, _sum: { amount: true } }),
  ]);
  if (budgets.length === 0) return null;
  const budget = budgets.find((b) => b.category === category)?.amount ?? null;
  const totalBudget = budgets.find((b) => b.category === "total")?.amount ?? null;
  const spentIn = inCategory._sum.amount ?? 0;
  const spentAll = total._sum.amount ?? 0;
  const events: AvatarEventInput[] = [];
  const level = (spent: number, cap: number | null) => (!cap ? null : spent > cap ? "over" : spent * 100 >= BUDGET_WARN_PCT * cap ? "near" : null);
  const add = (id: string, label: string, spent: number, cap: number | null) => {
    const l = level(spent, cap);
    if (l) events.push({ kind: l === "over" ? "budget-over" : "budget-near", key: `budget-${l}:${month}:${id}`, data: { label, pct: Math.round((spent / cap!) * 100) } });
  };
  add(category, expenseCategory(category).label, spentIn, budget);
  add("total", "Monthly budget", spentAll, totalBudget);
  // Past mid-month and comfortably under the monthly budget: say so, once.
  const dayOfMonth = Number(day.slice(8));
  if (totalBudget && dayOfMonth >= 15 && spentAll * 100 <= 90 * totalBudget * (dayOfMonth / Number(last.slice(8)))) {
    events.push({ kind: "on-track", key: `on-track:${month}` });
  }
  await queueAvatarEvents(tx, userId, events);
  return alertAfterSpend(category, spentIn, budget, spentAll, totalBudget);
}

export async function addMoneyEntry(input: EntryInput): Promise<AddEntryResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const today = istDay();
  const parsed = parseEntry(input, today);
  if (!parsed.ok) return parsed.fail;

  const { questXp, alert } = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const entry = await tx.moneyEntry.create({
      data: {
        userId: user.id,
        kind: parsed.data.kind,
        amount: parsed.data.amount,
        category: parsed.data.category,
        note: parsed.data.note || null,
        day: parsed.data.day,
      },
    });
    if (parsed.data.day === today) await checkIn(tx, user.id, today, "LOGGED");
    const quest = parsed.data.day === today && parsed.data.kind === "EXPENSE" ? await completeQuest(tx, user.id, "log") : { xp: 0, bonus: 0 };
    await awardMoneyBadges(tx, user.id);
    if (parsed.data.kind === "EXPENSE") {
      const expenses = await tx.moneyEntry.count({ where: { userId: user.id, kind: "EXPENSE" } });
      await queueAvatarEvent(tx, user.id, expenses === 1 ? "first-expense" : "expense", expenses === 1 ? "first-expense" : `expense:${entry.id}`);
    }
    const warning = parsed.data.kind === "EXPENSE" ? await budgetAlertFor(tx, user.id, parsed.data.category, parsed.data.day) : null;
    return { questXp: quest.xp + quest.bonus, alert: warning };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return { status: "saved", questXp, alert };
}

export type UpdateEntryResult = { status: "saved"; alert: string | null } | { status: "not-found" } | Fail;

/** Edits one of your own entries. Editing never pays XP or changes check-ins. */
export async function updateMoneyEntry(entryId: string, input: EntryInput): Promise<UpdateEntryResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const parsed = parseEntry(input, istDay());
  if (!parsed.ok) return parsed.fail;

  const result = await db.$transaction(async (tx) => {
    const { count } = await tx.moneyEntry.updateMany({
      where: { id: String(entryId), userId: user.id },
      data: { kind: parsed.data.kind, amount: parsed.data.amount, category: parsed.data.category, note: parsed.data.note || null, day: parsed.data.day },
    });
    if (count === 0) return { status: "not-found" as const };
    const alert = parsed.data.kind === "EXPENSE" ? await budgetAlertFor(tx, user.id, parsed.data.category, parsed.data.day) : null;
    return { status: "saved" as const, alert };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return result;
}

export async function deleteMoneyEntry(entryId: string): Promise<{ status: "deleted" | "not-found" } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const { count } = await db.moneyEntry.deleteMany({ where: { id: String(entryId), userId: user.id } });
  refresh();
  return { status: count > 0 ? "deleted" : "not-found" };
}

export type NoSpendResult = { status: "checked-in"; checkInXp: number } | { status: "already" | "has-spends" } | Fail;

/** "I spent nothing today", today's check-in without an entry. */
export async function markNoSpendDay(): Promise<NoSpendResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const day = istDay();
  const spends = await db.moneyEntry.count({ where: { userId: user.id, day, kind: "EXPENSE" } });
  if (spends > 0) return { status: "has-spends" };

  const xp = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const fresh = await checkIn(tx, user.id, day, "NO_SPEND");
    await awardMoneyBadges(tx, user.id);
    if (!fresh) return 0;
    await queueAvatarEvent(tx, user.id, "no-spend", `no-spend:${day}`);
    // A genuine no-spend day counts as today's "log" quest.
    const quest = await completeQuest(tx, user.id, "log");
    return Math.max(1, quest.xp + quest.bonus);
  }, SLOW_DB_TRANSACTION);

  refresh();
  return xp > 0 ? { status: "checked-in", checkInXp: xp } : { status: "already" };
}

const budgetSchema = z.array(
  z.object({
    category: z.string().refine((c) => c === "total" || EXPENSE_IDS.includes(c)),
    amount: z.coerce.number().int().min(0).max(MAX_ENTRY).nullable(),
  }),
);

/** Sets this month's budgets; an empty or zero amount removes that budget. */
export async function saveBudgets(input: { category: string; amount: number | string | null }[]): Promise<{ status: "saved"; xp: number } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const parsed = budgetSchema.safeParse(input.map((b) => ({ ...b, amount: b.amount === "" ? null : b.amount })));
  if (!parsed.success) return { status: "invalid", message: "Budgets must be whole rupees between ₹0 and ₹10 lakh" };
  const month = monthOf(istDay());

  const xp = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    for (const { category, amount } of parsed.data) {
      if (!amount) {
        await tx.moneyBudget.deleteMany({ where: { userId: user.id, month, category } });
      } else {
        await tx.moneyBudget.upsert({
          where: { userId_month_category: { userId: user.id, month, category } },
          create: { userId: user.id, month, category, amount },
          update: { amount },
        });
      }
    }
    if (!parsed.data.some((b) => b.amount)) return 0;
    return awardXp(tx, { userId: user.id, amount: 10, type: "SIGNUP_BONUS", idempotencyKey: `first-budget:${user.id}`, description: "First budget set" });
  }, SLOW_DB_TRANSACTION);

  refresh();
  return { status: "saved", xp };
}

const goalSchema = z.object({
  name: z.string().trim().min(1, "Give your goal a name").max(40, "Keep the name under 40 characters"),
  icon: z.enum(GOAL_ICONS),
  target: z.coerce.number({ message: "Enter a target" }).int("Use whole rupees").min(100, "Set a target of at least ₹100").max(MAX_GOAL, "That target is too big"),
  targetDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function createSavingsGoal(input: { name: string; icon: string; target: number | string; targetDay?: string }): Promise<{ status: "created" } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Please check the goal" };
  if (parsed.data.targetDay && parsed.data.targetDay < istDay()) return { status: "invalid", message: "Pick a date in the future" };
  const active = await db.savingsGoal.count({ where: { userId: user.id, completedAt: null } });
  if (active >= ACTIVE_GOAL_LIMIT) return { status: "invalid", message: `You can have up to ${ACTIVE_GOAL_LIMIT} goals going at once. Finish or remove one first` };

  await db.savingsGoal.create({
    data: { userId: user.id, name: parsed.data.name, icon: parsed.data.icon, target: parsed.data.target, targetDay: parsed.data.targetDay ?? null },
  });
  refresh();
  return { status: "created" };
}

export type DepositResult = { status: "saved"; saved: number; justCompleted: boolean; goalXp: number } | { status: "not-found" } | Fail;

/**
 * XP for reaching a goal, if it qualifies: a real target (₹500+), a goal
 * that's at least a week old, and no other goal rewarded this month.
 */
async function awardGoalXp(tx: Prisma.TransactionClient, userId: string, goal: { id: string; name: string; target: number; createdAt: Date }) {
  if (goal.target < SAVINGS_GOAL_XP_MIN_TARGET) return 0;
  if (Date.now() - goal.createdAt.getTime() < SAVINGS_GOAL_XP_MIN_DAYS * 864e5) return 0;
  const monthStart = istDayStart(`${monthOf(istDay())}-01`);
  const thisMonth = await tx.xPTransaction.count({ where: { userId, type: "SAVINGS_GOAL", createdAt: { gte: monthStart } } });
  if (thisMonth > 0) return 0;
  return awardXp(tx, {
    userId,
    amount: SAVINGS_GOAL_XP,
    type: "SAVINGS_GOAL",
    idempotencyKey: xpKeys.savingsGoal(userId, goal.id),
    description: `Reached the savings goal “${goal.name}”`,
  });
}

/** Adds money to a goal, or takes it out, with a negative amount (never below ₹0). */
export async function addToSavingsGoal(goalId: string, amountInput: number | string): Promise<DepositResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const amount = Number(amountInput);
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > MAX_ENTRY) return { status: "invalid", message: "Enter a whole-rupee amount" };

  const result = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const goal = await tx.savingsGoal.findFirst({ where: { id: String(goalId), userId: user.id } });
    if (!goal) return { status: "not-found" as const };
    if (goal.saved + amount < 0) return { status: "invalid" as const, message: `You can take out up to ${goal.saved.toLocaleString("en-IN")}` };
    const saved = goal.saved + amount;
    const justCompleted = !goal.completedAt && saved >= goal.target;
    await tx.savingsGoal.update({
      where: { id: goal.id },
      data: { saved, ...(justCompleted ? { completedAt: new Date() } : {}) },
    });
    const deposit = await tx.savingsDeposit.create({ data: { goalId: goal.id, userId: user.id, amount, day: istDay() } });
    if (amount > 0 && !justCompleted) {
      const halfway = goal.saved * 2 < goal.target && saved * 2 >= goal.target;
      await queueAvatarEvent(tx, user.id, halfway ? "goal-half" : "deposit", halfway ? `goal-half:${goal.id}` : `deposit:${deposit.id}`, {
        goal: goal.name,
        amount: `₹${amount.toLocaleString("en-IN")}`,
      });
    }
    if (justCompleted) await queueAvatarEvent(tx, user.id, "goal-reached", `goal:${goal.id}`, { goal: goal.name });
    let goalXp = 0;
    if (justCompleted) {
      await awardMoneyBadges(tx, user.id);
      goalXp = await awardGoalXp(tx, user.id, goal);
    }
    return { status: "saved" as const, saved, justCompleted, goalXp };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return result;
}

export async function deleteSavingsGoal(goalId: string): Promise<{ status: "deleted" | "not-found" } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const { count } = await db.savingsGoal.deleteMany({ where: { id: String(goalId), userId: user.id } });
  refresh();
  return { status: count > 0 ? "deleted" : "not-found" };
}

/** The "check your budget and insights" quest: done by opening the Money overview. */
export async function completeCheckQuest(): Promise<{ xp: number }> {
  const user = await requireOnboardedUser();
  const result = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    return completeQuest(tx, user.id, "check");
  }, SLOW_DB_TRANSACTION);
  if (result.xp > 0) refresh();
  return { xp: result.xp + result.bonus };
}
