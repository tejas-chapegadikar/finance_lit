import { db } from "../db";
import { INVEST_TRACK } from "../journey";

/**
 * The simulators open after the first InvestSmart lesson. Anyone who has
 * already used the portfolio keeps access, so no one loses what they built.
 */
export async function investToolsUnlocked(userId: string): Promise<boolean> {
  const [finished, portfolio] = await Promise.all([
    db.quizAttempt.count({ where: { userId, status: "COMPLETED", lesson: { slug: INVEST_TRACK[0] } } }),
    db.virtualPortfolio.findUnique({ where: { userId }, select: { month: true, _count: { select: { holdings: true } } } }),
  ]);
  return finished > 0 || (!!portfolio && (portfolio.month > 0 || portfolio._count.holdings > 0));
}

export const LOCKED_TOOL_MESSAGE = "Finish the first InvestSmart lesson to unlock this.";
