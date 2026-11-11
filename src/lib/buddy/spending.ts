import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { shiftDay } from "../ist-date";
import { readRoastLevel } from "../avatar/hub";
import { seedOf } from "../../content/buddy-messages";
import { spendingVerdict, verdictText, type BuddyVerdict } from "./roasts";

type Client = Prisma.TransactionClient | typeof db;

/** The buddy's verdict on a student's real spending (this month and the last 7 days). */
export async function getSpendingVerdict(client: Client, userId: string, today: string): Promise<BuddyVerdict | null> {
  const monthStart = `${today.slice(0, 7)}-01`;
  const weekStart = shiftDay(today, -6);
  const from = weekStart < monthStart ? weekStart : monthStart;
  const [entries, budget] = await Promise.all([
    client.moneyEntry.findMany({
      where: { userId, kind: "EXPENSE", day: { gte: from, lte: today } },
      select: { amount: true, category: true, note: true, day: true, createdAt: true },
    }),
    client.moneyBudget.findFirst({ where: { userId, month: today.slice(0, 7), category: "total" }, select: { amount: true } }),
  ]);
  return spendingVerdict({ today, entries, totalBudget: budget?.amount ?? null });
}

/** The verdict as words in the student's roast level, plus the face to make. */
export function sayVerdict(verdict: BuddyVerdict, roastLevel: string | null | undefined, seed: string) {
  return { text: verdictText(verdict, readRoastLevel(roastLevel), seedOf(seed)), expression: verdict.expression };
}
