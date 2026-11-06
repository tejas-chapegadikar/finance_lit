"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { isAllowed, moneyRatelimit } from "@/lib/ratelimit";
import { queueAvatarEvents, type AvatarEventInput } from "@/lib/avatar/queue";
import { ASSETS, FAST_FORWARD, MIN_TRADE, START_CASH, portfolioShape, simulateMonth, type AssetId, type Holding } from "@/lib/invest/sim";

// The virtual portfolio's actions. Only virtual money; every action is for
// the signed-in student's own portfolio, validated here, and the simulated
// returns are computed only on the server.

type Fail = { status: "invalid"; message: string } | { status: "slow-down" };
export type PortfolioResult = { status: "done" } | Fail;

const assetIds = ASSETS.map((a) => a.id) as [AssetId, ...AssetId[]];
const tradeSchema = z.object({
  asset: z.enum(assetIds),
  amount: z.coerce.number({ message: "Enter an amount" }).int("Use whole rupees").min(MIN_TRADE, `The smallest trade is ₹${MIN_TRADE}`),
});

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/invest");
}

async function load(tx: Parameters<Parameters<typeof db.$transaction>[0]>[0], userId: string) {
  // Lock the student's portfolio row for the whole action.
  const portfolio = await tx.virtualPortfolio.upsert({ where: { userId }, create: { userId, cash: START_CASH }, update: {} });
  await tx.$queryRaw`SELECT id FROM "VirtualPortfolio" WHERE id = ${portfolio.id} FOR UPDATE`;
  const holdings = await tx.virtualHolding.findMany({ where: { portfolioId: portfolio.id } });
  return { portfolio, holdings };
}

/** The avatar's take on the portfolio's shape after a trade (once per run). */
function shapeEvents(holdings: Holding[], cash: number, run: number): AvatarEventInput[] {
  const shape = portfolioShape(holdings, cash);
  const out: AvatarEventInput[] = [];
  if (shape.allInStock) out.push({ kind: "invest-allin", key: `invest-allin:${run}` });
  if (shape.diversified) out.push({ kind: "invest-diversified", key: `invest-diversified:${run}` });
  return out;
}

export async function investVirtual(input: { asset: string; amount: number | string }): Promise<PortfolioResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const parsed = tradeSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Check the amount" };
  const { asset, amount } = parsed.data;

  const result = await db.$transaction(async (tx) => {
    const { portfolio, holdings } = await load(tx, user.id);
    if (amount > portfolio.cash + 0.01) return { status: "invalid" as const, message: `You have ₹${Math.floor(portfolio.cash).toLocaleString("en-IN")} of virtual cash left` };
    await tx.virtualPortfolio.update({ where: { id: portfolio.id }, data: { cash: { decrement: amount } } });
    await tx.virtualHolding.upsert({
      where: { portfolioId_asset: { portfolioId: portfolio.id, asset } },
      create: { portfolioId: portfolio.id, asset, invested: amount, value: amount },
      update: { invested: { increment: amount }, value: { increment: amount } },
    });
    const after: Holding[] = [...holdings.filter((h) => h.asset !== asset).map((h) => ({ asset: h.asset as AssetId, invested: h.invested, value: h.value }))];
    const existing = holdings.find((h) => h.asset === asset);
    after.push({ asset, invested: (existing?.invested ?? 0) + amount, value: (existing?.value ?? 0) + amount });
    await queueAvatarEvents(tx, user.id, [
      { kind: "invest-first", key: "invest-first" },
      ...shapeEvents(after, portfolio.cash - amount, portfolio.run),
    ]);
    return { status: "done" as const };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return result;
}

export async function sellVirtual(input: { asset: string; amount: number | string | "all" }): Promise<PortfolioResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const asset = z.enum(assetIds).safeParse(input.asset);
  if (!asset.success) return { status: "invalid", message: "Pick something to sell" };

  const result = await db.$transaction(async (tx) => {
    const { portfolio, holdings } = await load(tx, user.id);
    const holding = holdings.find((h) => h.asset === asset.data);
    if (!holding || holding.value < 1) return { status: "invalid" as const, message: "You don't hold any of that" };
    const amount = input.amount === "all" ? holding.value : Number(input.amount);
    if (!Number.isFinite(amount) || amount < 1 || amount > holding.value + 0.01) return { status: "invalid" as const, message: "Enter an amount you hold" };
    const share = Math.min(1, amount / holding.value);
    await tx.virtualHolding.update({
      where: { id: holding.id },
      data: { value: holding.value - amount, invested: holding.invested * (1 - share) },
    });
    await tx.virtualPortfolio.update({ where: { id: portfolio.id }, data: { cash: { increment: amount } } });
    // Selling a share-market holding right after a big fall: panic-selling.
    if (portfolio.lastChange <= -0.06 && asset.data !== "savings" && asset.data !== "fd") {
      await queueAvatarEvents(tx, user.id, [{ kind: "invest-panic", key: `invest-panic:${portfolio.run}:${portfolio.month}` }]);
    }
    return { status: "done" as const };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return result;
}

/** Fast-forwards simulated months; the history replays the same for the same choices. */
export async function fastForward(months: number): Promise<PortfolioResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  if (!(FAST_FORWARD as readonly number[]).includes(months)) return { status: "invalid", message: "Pick how far to fast-forward" };

  const result = await db.$transaction(async (tx) => {
    const { portfolio, holdings } = await load(tx, user.id);
    const seed = `${portfolio.id}:${portfolio.run}`;
    let current: Holding[] = holdings.map((h) => ({ asset: h.asset as AssetId, invested: h.invested, value: h.value }));
    const snapshots: { month: number; total: number }[] = [];
    const events: AvatarEventInput[] = [];
    let worst = 0;
    let lastChange = 0;
    const startTotal = portfolio.cash + current.reduce((s, h) => s + h.value, 0);
    for (let i = 1; i <= months; i++) {
      const month = portfolio.month + i;
      const r = simulateMonth(current, portfolio.cash, seed, month);
      current = r.holdings;
      lastChange = r.change;
      if (r.change < worst) worst = r.change;
      if (r.change <= -0.06) events.push({ kind: "invest-crash", key: `invest-crash:${portfolio.run}:${month}`, data: { pct: Math.round(-r.change * 100) } });
      snapshots.push({ month, total: r.totalAfter });
    }
    for (const h of current) {
      await tx.virtualHolding.update({ where: { portfolioId_asset: { portfolioId: portfolio.id, asset: h.asset } }, data: { value: h.value } });
    }
    await tx.virtualSnapshot.createMany({ data: snapshots.map((s) => ({ portfolioId: portfolio.id, ...s })), skipDuplicates: true });
    await tx.virtualPortfolio.update({ where: { id: portfolio.id }, data: { month: portfolio.month + months, lastChange } });
    // One crash reaction per fast-forward (the worst), or a good run.
    const endTotal = snapshots.at(-1)!.total;
    const crash = events.sort((a, b) => Number(b.data?.pct ?? 0) - Number(a.data?.pct ?? 0))[0];
    const reactions: AvatarEventInput[] = crash ? [crash] : endTotal / startTotal - 1 >= 0.08 ? [{ kind: "invest-up", key: `invest-up:${portfolio.run}:${portfolio.month + months}`, data: { pct: Math.round((endTotal / startTotal - 1) * 100) } }] : [];
    await queueAvatarEvents(tx, user.id, reactions);
    return { status: "done" as const };
  }, SLOW_DB_TRANSACTION);

  refresh();
  return result;
}

/** Starts over with virtual ₹1,00,000. */
export async function resetPortfolio(): Promise<PortfolioResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  await db.$transaction(async (tx) => {
    const { portfolio } = await load(tx, user.id);
    await tx.virtualHolding.deleteMany({ where: { portfolioId: portfolio.id } });
    await tx.virtualSnapshot.deleteMany({ where: { portfolioId: portfolio.id } });
    await tx.virtualPortfolio.update({ where: { id: portfolio.id }, data: { cash: START_CASH, month: 0, lastChange: 0, run: { increment: 1 } } });
  }, SLOW_DB_TRANSACTION);
  refresh();
  return { status: "done" };
}
