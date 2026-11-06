import { db } from "../db";
import { START_CASH, type AssetId } from "./sim";

export type PortfolioView = {
  cash: number;
  month: number;
  total: number;
  /** Change since the start of this run, as a fraction. */
  sinceStart: number;
  lastChange: number;
  holdings: { asset: AssetId; invested: number; value: number }[];
  history: { month: number; total: number }[];
};

/** The student's virtual portfolio (created on first visit with virtual ₹1,00,000). */
export async function getPortfolio(userId: string): Promise<PortfolioView> {
  const portfolio = await db.virtualPortfolio.upsert({
    where: { userId },
    create: { userId, cash: START_CASH },
    update: {},
    include: { holdings: true, history: { orderBy: { month: "asc" } } },
  });
  const holdings = portfolio.holdings.filter((h) => h.value > 0.5).map((h) => ({ asset: h.asset as AssetId, invested: h.invested, value: h.value }));
  const total = portfolio.cash + holdings.reduce((s, h) => s + h.value, 0);
  return {
    cash: portfolio.cash,
    month: portfolio.month,
    total,
    sinceStart: total / START_CASH - 1,
    lastChange: portfolio.lastChange,
    holdings,
    history: [{ month: 0, total: START_CASH }, ...portfolio.history.map((h) => ({ month: h.month, total: h.total }))],
  };
}
