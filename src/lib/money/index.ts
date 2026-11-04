import { db } from "../db";
import { istDay, shiftDay } from "../ist-date";
import { buildMoneyMonth, monthBounds, monthOf, shiftMonth, summariseTrends, type MoneyMonth } from "./calc";

// The Money Manager's data access: every query is scoped to one student's
// own rows (userId), and the maths lives in ./calc so it can be tested.

export * from "./calc";

export async function getMoneyMonth(userId: string, month = monthOf(istDay())): Promise<MoneyMonth> {
  const today = istDay();
  const { first, last } = monthBounds(month);
  const previous = monthBounds(shiftMonth(month, -1));
  const [entries, budgets, previousByCategory, checkIns, checkedInToday] = await Promise.all([
    db.moneyEntry.findMany({
      where: { userId, day: { gte: first, lte: last } },
      orderBy: [{ day: "desc" }, { createdAt: "desc" }],
      select: { id: true, kind: true, amount: true, category: true, note: true, day: true },
    }),
    db.moneyBudget.findMany({ where: { userId, month }, select: { category: true, amount: true } }),
    db.moneyEntry.groupBy({
      by: ["category"],
      where: { userId, kind: "EXPENSE", day: { gte: previous.first, lte: previous.last } },
      _sum: { amount: true },
    }),
    db.moneyCheckIn.count({ where: { userId, day: { gte: first, lte: last } } }),
    db.moneyCheckIn.count({ where: { userId, day: today } }),
  ]);
  return buildMoneyMonth({
    month,
    today,
    entries,
    budgets,
    previousByCategory: Object.fromEntries(previousByCategory.map((r) => [r.category, r._sum.amount ?? 0])),
    checkIns,
    checkedInToday: checkedInToday > 0,
  });
}

/** Weekly (last 8) and monthly (last 6) spending totals for the trend charts. */
export async function getMoneyTrends(userId: string, today = istDay()) {
  const since = `${shiftMonth(monthOf(today), -5)}-01`;
  const from = since < shiftDay(today, -56) ? since : shiftDay(today, -56);
  const expenses = await db.moneyEntry.findMany({
    where: { userId, kind: "EXPENSE", day: { gte: from, lte: today } },
    select: { amount: true, day: true },
  });
  return summariseTrends(expenses, today);
}

export type MoneyWeek = { spent: number; previousSpent: number; checkIns: number; saved: number };

/** The last 7 IST days of money (today included), with the 7 before for comparison. */
export async function getMoneyWeek(userId: string, today = istDay()): Promise<MoneyWeek> {
  const from = shiftDay(today, -6);
  const prevFrom = shiftDay(today, -13);
  const prevTo = shiftDay(today, -7);
  const [spent, previousSpent, checkIns, saved] = await Promise.all([
    db.moneyEntry.aggregate({ where: { userId, kind: "EXPENSE", day: { gte: from, lte: today } }, _sum: { amount: true } }),
    db.moneyEntry.aggregate({ where: { userId, kind: "EXPENSE", day: { gte: prevFrom, lte: prevTo } }, _sum: { amount: true } }),
    db.moneyCheckIn.count({ where: { userId, day: { gte: from, lte: today } } }),
    db.savingsDeposit.aggregate({ where: { userId, day: { gte: from, lte: today } }, _sum: { amount: true } }),
  ]);
  return {
    spent: spent._sum.amount ?? 0,
    previousSpent: previousSpent._sum.amount ?? 0,
    checkIns,
    saved: Math.max(0, saved._sum.amount ?? 0),
  };
}
