"use server";

import { redirect } from "next/navigation";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { requireAppUser } from "@/lib/auth";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { istDay } from "@/lib/ist-date";
import { monthOf } from "@/lib/money";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser } from "@/lib/xp";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";

export type OnboardingResult = { status: "done"; xp: number } | { status: "invalid"; message: string };

/** Saves the three answers (any can be blank), pays the welcome XP once and starts the streak. */
export async function finishOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const user = await requireAppUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Please check your answers" };
  const { income, budget, goalName, goalTarget } = parsed.data;
  if (goalName && !goalTarget) return { status: "invalid", message: "Add a target amount, or clear the goal name" };
  const day = istDay();

  const xp = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { onboardingCompletedAt: true, avatar: true } });
    // A double submit must not add the income or goal twice.
    if (fresh.onboardingCompletedAt) return 0;
    if (income) await tx.moneyEntry.create({ data: { userId: user.id, kind: "INCOME", amount: income, category: "pocket-money", day } });
    if (budget) await tx.moneyBudget.create({ data: { userId: user.id, month: monthOf(day), category: "total", amount: budget } });
    if (goalName && goalTarget) await tx.savingsGoal.create({ data: { userId: user.id, name: goalName, icon: "target", target: goalTarget } });
    await tx.user.update({ where: { id: user.id }, data: { onboardingCompletedAt: new Date(), ...(fresh.avatar ? {} : { avatar: DEFAULT_AVATAR }) } });
    const awarded = await awardXp(tx, { userId: user.id, amount: 20, type: "SIGNUP_BONUS", idempotencyKey: `onboarding:${user.id}`, description: "Finished setup" });
    await recordStreakDay(tx, user.id);
    return awarded;
  }, SLOW_DB_TRANSACTION);
  return { status: "done", xp };
}

/** "Skip setup": straight to Today, nothing saved. */
export async function skipOnboarding() {
  const user = await requireAppUser();
  await db.user.update({ where: { id: user.id }, data: { onboardingCompletedAt: user.onboardingCompletedAt ?? new Date(), ...(user.avatar ? {} : { avatar: DEFAULT_AVATAR }) } });
  redirect("/dashboard");
}
