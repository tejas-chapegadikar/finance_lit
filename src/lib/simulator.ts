// The maths behind the compound interest simulator and the money insights.
// Pure and client-safe. Contributions go in at the start of each month and
// grow at the assumed yearly rate compounded monthly, the same convention
// the SIP lesson uses. Assumed returns are illustrations, never promises.

export type GrowthPoint = { year: number; invested: number; value: number };

export type GrowthResult = {
  invested: number;
  value: number;
  /** Growth = value − invested. */
  growth: number;
  /** One point per year, starting with year 0. */
  series: GrowthPoint[];
};

export function compoundGrowth({
  monthly,
  years,
  annualRatePct,
  initial = 0,
}: {
  monthly: number;
  years: number;
  annualRatePct: number;
  initial?: number;
}): GrowthResult {
  const r = annualRatePct / 100 / 12;
  let value = initial;
  let invested = initial;
  const series: GrowthPoint[] = [{ year: 0, invested, value }];
  for (let month = 1; month <= years * 12; month++) {
    value = (value + monthly) * (1 + r);
    invested += monthly;
    if (month % 12 === 0) series.push({ year: month / 12, invested, value: Math.round(value) });
  }
  return { invested, value: Math.round(value), growth: Math.round(value - invested), series };
}

/** Indian-style short amounts: ₹4,500 · ₹1.2 lakh · ₹1.7 crore. */
export function shortRupees(n: number): string {
  const v = Math.round(n);
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(v >= 10_00_00_000 ? 0 : 1).replace(/\.0$/, "")} crore`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(v >= 10_00_000 ? 0 : 1).replace(/\.0$/, "")} lakh`;
  return `₹${v.toLocaleString("en-IN")}`;
}
