// InvestSmart's virtual portfolio: the assets and the month-by-month
// simulation. Pure and client-safe (the UI shows the asset list); the server
// runs the simulation, so results can't be faked from the browser.
//
// Each asset has an ASSUMED yearly return and volatility — round numbers for
// learning, not forecasts or real market data. Shares move together through
// one "market" factor (so a crash hits them all), gold has its own, and the
// savings account and FD don't move. Every month's numbers come from a fixed
// seed (portfolio, run, month), so the same history always replays the same.

export type AssetId = "savings" | "fd" | "gold" | "nifty" | "midcap" | "stock";

export type Asset = {
  id: AssetId;
  name: string;
  /** Plain-words description for students. */
  blurb: string;
  risk: "None" | "Low" | "Medium" | "High" | "Very high";
  /** Assumed yearly return and volatility (standard deviation), as fractions. */
  mu: number;
  sigma: number;
  /** How much it moves with the share market (0–1). */
  beta: number;
  factor: "none" | "market" | "gold";
};

export const ASSETS: Asset[] = [
  { id: "savings", name: "Savings account", blurb: "Safe and always available, but barely beats rising prices.", risk: "None", mu: 0.03, sigma: 0, beta: 0, factor: "none" },
  { id: "fd", name: "Fixed deposit", blurb: "A fixed, known rate. Steady, no surprises.", risk: "Low", mu: 0.065, sigma: 0, beta: 0, factor: "none" },
  { id: "gold", name: "Gold", blurb: "Moves on its own — often up when shares are down.", risk: "Medium", mu: 0.08, sigma: 0.14, beta: 0.9, factor: "gold" },
  { id: "nifty", name: "Nifty 50 index fund", blurb: "India's 50 biggest companies in one go. Ups and downs, spread out.", risk: "High", mu: 0.11, sigma: 0.16, beta: 0.95, factor: "market" },
  { id: "midcap", name: "Mid-cap fund", blurb: "Smaller, faster-growing companies. Bigger swings both ways.", risk: "High", mu: 0.13, sigma: 0.22, beta: 0.85, factor: "market" },
  { id: "stock", name: "One tech stock", blurb: "All your eggs in one company's basket. Thrilling. Risky.", risk: "Very high", mu: 0.12, sigma: 0.34, beta: 0.6, factor: "market" },
];

export const START_CASH = 100_000;
export const MIN_TRADE = 500;
export const FAST_FORWARD = [1, 6, 12, 60] as const;

export const findAsset = (id: string) => ASSETS.find((a) => a.id === id);

// ── Seeded randomness (deterministic, so a history replays identically)
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function uniform(seed: string) {
  // mulberry32, one draw
  let t = (hash(seed) + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** A standard normal draw (Box–Muller) from a seed. */
export function normal(seed: string) {
  const u1 = Math.max(1e-12, uniform(`${seed}:a`));
  const u2 = uniform(`${seed}:b`);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** One asset's simulated return for one month (a fraction, e.g. -0.05 = −5%). */
export function monthlyReturn(asset: Asset, seed: string, month: number): number {
  const drift = asset.mu / 12;
  if (asset.sigma === 0) return drift;
  const shared = asset.factor === "none" ? 0 : normal(`${seed}:${asset.factor}:${month}`);
  const own = normal(`${seed}:${asset.id}:${month}`);
  const shock = asset.beta * shared + Math.sqrt(1 - asset.beta * asset.beta) * own;
  // Log-normal step, centred so the long-run *compounded* growth matches mu —
  // the number students see. Volatility adds risk around it, not drag.
  const sd = asset.sigma / Math.sqrt(12);
  return Math.exp(Math.log(1 + asset.mu) / 12 + sd * shock) - 1;
}

export type Holding = { asset: AssetId; invested: number; value: number };

export type MonthResult = { month: number; holdings: Holding[]; totalBefore: number; totalAfter: number; change: number };

/** Moves every holding forward one simulated month. Cash doesn't change. */
export function simulateMonth(holdings: Holding[], cash: number, seed: string, month: number): MonthResult {
  const totalBefore = cash + holdings.reduce((s, h) => s + h.value, 0);
  const next = holdings.map((h) => {
    const asset = findAsset(h.asset)!;
    return { ...h, value: Math.max(0, h.value * (1 + monthlyReturn(asset, seed, month))) };
  });
  const totalAfter = cash + next.reduce((s, h) => s + h.value, 0);
  return { month, holdings: next, totalBefore, totalAfter, change: totalBefore > 0 ? totalAfter / totalBefore - 1 : 0 };
}

/** Share of the invested (non-cash) money in each asset. */
export function allocation(holdings: Holding[]) {
  const invested = holdings.reduce((s, h) => s + h.value, 0);
  return holdings.filter((h) => h.value > 0).map((h) => ({ asset: h.asset, share: invested > 0 ? h.value / invested : 0 }));
}

/** All in on one risky thing? Spread out? Used for the avatar's reactions. */
export function portfolioShape(holdings: Holding[], cash: number) {
  const total = cash + holdings.reduce((s, h) => s + h.value, 0);
  const stock = holdings.find((h) => h.asset === "stock")?.value ?? 0;
  const meaningful = holdings.filter((h) => total > 0 && h.value / total >= 0.15).length;
  return { allInStock: total > 0 && stock / total >= 0.8, diversified: meaningful >= 3 };
}
