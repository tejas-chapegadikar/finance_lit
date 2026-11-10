import { compoundGrowth, shortRupees } from "../simulator";
import { EXPENSE_CATEGORIES, expenseCategory, rupees, type SpendKind } from "./categories";

// The Money Manager's maths, kept pure (no database, no clock) so it can be
// tested directly: a month summary, budget alerts, weekly and monthly trends
// and the insights. Everything is in whole rupees and IST "YYYY-MM-DD" days.
// Insights only ever describe the student's own logged numbers, nothing is
// invented, and with nothing logged there's nothing to say.

export const monthOf = (day: string) => day.slice(0, 7);

const pad = (n: number) => String(n).padStart(2, "0");

/** First and last IST day of a YYYY-MM month, and how many days it has. */
export function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { first: `${month}-01`, last: `${month}-${pad(count)}`, count };
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function monthLabel(month: string, style: "long" | "short" = "long"): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", style === "long" ? { month: "long", year: "numeric", timeZone: "UTC" } : { month: "short", timeZone: "UTC" });
}

export const isMonth = (value: unknown): value is string => typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

const dayIndex = (day: string) => Math.floor(Date.parse(`${day}T00:00:00Z`) / 864e5);
const fromIndex = (n: number) => new Date(n * 864e5).toISOString().slice(0, 10);

/** The Monday that starts the week containing `day`. */
export function weekStart(day: string): string {
  const n = dayIndex(day);
  const weekday = (new Date(n * 864e5).getUTCDay() + 6) % 7; // Monday = 0
  return fromIndex(n - weekday);
}

const isWeekend = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`).getUTCDay();
  return d === 0 || d === 6;
};

export type MoneyEntryRow = { id: string; kind: "INCOME" | "EXPENSE"; amount: number; category: string; note: string | null; day: string };

export type CategoryTotal = {
  id: string;
  label: string;
  kind: SpendKind;
  amount: number;
  budget: number | null;
  /** The same category's spending last month. */
  previous: number;
};

export type MoneyMonth = {
  month: string;
  label: string;
  isCurrent: boolean;
  daysInMonth: number;
  /** Days of the month so far (all of them for a past month). */
  daysElapsed: number;
  income: number;
  spent: number;
  byCategory: CategoryTotal[];
  byKind: Record<SpendKind, number>;
  daily: { day: string; amount: number }[];
  totalBudget: number | null;
  budgets: Record<string, number>;
  smallSpends: { count: number; total: number };
  weekend: { perDay: number; days: number };
  weekday: { perDay: number; days: number };
  previousSpent: number;
  checkIns: number;
  checkedInToday: boolean;
  entries: MoneyEntryRow[];
};

export type MonthInput = {
  month: string;
  today: string;
  entries: MoneyEntryRow[];
  budgets: { category: string; amount: number }[];
  /** Last month's expenses, by category. */
  previousByCategory: Record<string, number>;
  checkIns: number;
  checkedInToday: boolean;
};

/** Summarises one month of a student's entries. */
export function buildMoneyMonth({ month, today, entries, budgets, previousByCategory, checkIns, checkedInToday }: MonthInput): MoneyMonth {
  const { count } = monthBounds(month);
  const isCurrent = monthOf(today) === month;
  const daysElapsed = isCurrent ? Number(today.slice(8)) : count;
  const expenses = entries.filter((e) => e.kind === "EXPENSE");
  const income = entries.filter((e) => e.kind === "INCOME").reduce((sum, e) => sum + e.amount, 0);
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const budgetMap = Object.fromEntries(budgets.map((b) => [b.category, b.amount]));
  const perCategory = new Map<string, number>();
  for (const e of expenses) perCategory.set(e.category, (perCategory.get(e.category) ?? 0) + e.amount);
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    kind: c.kind,
    amount: perCategory.get(c.id) ?? 0,
    budget: budgetMap[c.id] ?? null,
    previous: previousByCategory[c.id] ?? 0,
  }))
    .filter((c) => c.amount > 0 || c.budget !== null)
    .sort((a, b) => b.amount - a.amount);

  const byKind: Record<SpendKind, number> = { need: 0, want: 0, mixed: 0 };
  for (const e of expenses) byKind[expenseCategory(e.category).kind] += e.amount;

  const perDay = new Map<string, number>();
  for (const e of expenses) perDay.set(e.day, (perDay.get(e.day) ?? 0) + e.amount);
  const daily = Array.from({ length: count }, (_, i) => {
    const day = `${month}-${pad(i + 1)}`;
    return { day, amount: perDay.get(day) ?? 0 };
  });

  const elapsedDays = daily.slice(0, daysElapsed);
  const weekendDays = elapsedDays.filter((d) => isWeekend(d.day));
  const weekdayDays = elapsedDays.filter((d) => !isWeekend(d.day));
  const avg = (days: typeof daily) => (days.length ? days.reduce((s, d) => s + d.amount, 0) / days.length : 0);
  const small = expenses.filter((e) => e.amount <= 150 && expenseCategory(e.category).kind !== "need");

  return {
    month,
    label: monthLabel(month),
    isCurrent,
    daysInMonth: count,
    daysElapsed,
    income,
    spent,
    byCategory,
    byKind,
    daily,
    totalBudget: budgetMap.total ?? null,
    budgets: budgetMap,
    smallSpends: { count: small.length, total: small.reduce((s, e) => s + e.amount, 0) },
    weekend: { perDay: Math.round(avg(weekendDays)), days: weekendDays.length },
    weekday: { perDay: Math.round(avg(weekdayDays)), days: weekdayDays.length },
    previousSpent: Object.values(previousByCategory).reduce((s, n) => s + n, 0),
    checkIns,
    checkedInToday,
    entries,
  };
}

// ── Budget alerts
export const BUDGET_WARN_PCT = 80;

export type BudgetAlert = {
  /** "total" or a category id. */
  id: string;
  label: string;
  level: "near" | "over";
  spent: number;
  budget: number;
  pct: number;
};

/** Budgets at 80% or more, the overall budget first, then the most-used categories. */
export function budgetAlerts(m: Pick<MoneyMonth, "spent" | "totalBudget" | "byCategory">): BudgetAlert[] {
  const make = (id: string, label: string, spent: number, budget: number): BudgetAlert | null => {
    // Compare exact amounts (₹799 of ₹1,000 is not yet 80%); round only for display.
    if (spent * 100 < BUDGET_WARN_PCT * budget) return null;
    const pct = Math.round((spent / budget) * 100);
    return { id, label, level: spent > budget ? "over" : "near", spent, budget, pct };
  };
  const out: BudgetAlert[] = [];
  if (m.totalBudget) {
    const total = make("total", "Monthly budget", m.spent, m.totalBudget);
    if (total) out.push(total);
  }
  const categories = m.byCategory
    .filter((c) => c.budget)
    .map((c) => make(c.id, c.label, c.amount, c.budget!))
    .filter((a): a is BudgetAlert => a !== null)
    .sort((a, b) => b.pct - a.pct);
  return [...out, ...categories];
}

/** The alert for one category right after a spend, or null if it's still comfortably under budget. */
export function alertAfterSpend(category: string, spentInCategory: number, budget: number | null, spentTotal: number, totalBudget: number | null): string | null {
  const parts: string[] = [];
  if (budget) {
    const pct = Math.round((spentInCategory / budget) * 100);
    if (spentInCategory > budget) parts.push(`${expenseCategory(category).label} is ${rupees(spentInCategory - budget)} over its ${rupees(budget)} budget.`);
    else if (spentInCategory * 100 >= BUDGET_WARN_PCT * budget) parts.push(`${expenseCategory(category).label} is at ${pct}% of its ${rupees(budget)} budget.`);
  }
  if (totalBudget) {
    const pct = Math.round((spentTotal / totalBudget) * 100);
    if (spentTotal > totalBudget) parts.push(`You're ${rupees(spentTotal - totalBudget)} over this month's budget.`);
    else if (spentTotal * 100 >= BUDGET_WARN_PCT * totalBudget) parts.push(`You've used ${pct}% of this month's budget.`);
  }
  return parts.length ? `Heads up: ${parts.join(" ")}` : null;
}

// ── Trends
export type TrendPoint = { key: string; label: string; amount: number; current: boolean };

/** Spending per week (the last `weeks`, Monday-start) and per month (the last `months`), oldest first. */
export function summariseTrends(expenses: { amount: number; day: string }[], today: string, weeks = 8, months = 6) {
  const thisWeek = weekStart(today);
  const weekKeys = Array.from({ length: weeks }, (_, i) => fromIndex(dayIndex(thisWeek) - 7 * (weeks - 1 - i)));
  const thisMonth = monthOf(today);
  const monthKeys = Array.from({ length: months }, (_, i) => shiftMonth(thisMonth, -(months - 1 - i)));
  const perWeek = new Map<string, number>();
  const perMonth = new Map<string, number>();
  for (const e of expenses) {
    if (e.day > today) continue;
    const w = weekStart(e.day);
    perWeek.set(w, (perWeek.get(w) ?? 0) + e.amount);
    const m = monthOf(e.day);
    perMonth.set(m, (perMonth.get(m) ?? 0) + e.amount);
  }
  const shortDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  return {
    weekly: weekKeys.map((key): TrendPoint => ({ key, label: shortDay(key), amount: perWeek.get(key) ?? 0, current: key === thisWeek })),
    monthly: monthKeys.map((key): TrendPoint => ({ key, label: monthLabel(key, "short"), amount: perMonth.get(key) ?? 0, current: key === thisMonth })),
  };
}

// ── Insights
// Fixed monthly costs happen once; only flexible spending sets the daily pace.
const FIXED = new Set(["bills", "education"]);

export type Insight = {
  id: string;
  tone: "good" | "warn" | "info";
  title: string;
  text: string;
  href?: string;
  cta?: string;
};

export type GoalSummary = { name: string; saved: number; target: number; completed: boolean };

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

/** How much this month's flexible spending projects to by month-end. */
export function projectSpending(m: Pick<MoneyMonth, "byCategory" | "spent" | "daysElapsed" | "daysInMonth">) {
  const fixed = m.byCategory.filter((c) => FIXED.has(c.id)).reduce((sum, c) => sum + c.amount, 0);
  const avgDaily = m.daysElapsed > 0 ? (m.spent - fixed) / m.daysElapsed : 0;
  return { avgDaily, projected: Math.round(m.spent + avgDaily * (m.daysInMonth - m.daysElapsed)) };
}

/**
 * What the month's numbers are saying, specific, a little cheeky, always
 * true. Ordered by how useful they are; the caller shows the first few.
 */
export function moneyInsights(m: MoneyMonth, goals: GoalSummary[] = []): Insight[] {
  const out: Insight[] = [];
  if (m.spent === 0 && m.income === 0) {
    return [
      {
        id: "empty",
        tone: "info",
        title: "Your wallet is a mystery novel",
        text: "Nothing logged yet. Add your pocket money or stipend and today's spends. Two minutes now, a lot less “where did it all go?” later.",
      },
    ];
  }
  const { avgDaily, projected } = projectSpending(m);

  // Pace: will the money last the month?
  if (m.isCurrent && m.spent > 0 && m.daysElapsed >= 3 && m.income > 0) {
    if (projected > m.income) {
      const runsOut = m.daysElapsed + Math.floor(Math.max(0, m.income - m.spent) / Math.max(1, avgDaily));
      out.push({
        id: "pace",
        tone: "warn",
        title: runsOut < m.daysInMonth ? `At this pace, the money runs out around the ${ordinal(Math.max(1, runsOut))}` : "Heading over budget",
        text: `Besides fixed bills, you're spending about ${rupees(avgDaily)} a day. That's ${rupees(projected)} by month-end, ${rupees(projected - m.income)} more than came in. The month is longer than it looks.`,
      });
    } else {
      out.push({
        id: "pace",
        tone: "good",
        title: "On track to finish the month with money left",
        text: `At about ${rupees(avgDaily)} a day on top of fixed bills, you'd spend ${rupees(projected)} this month and keep roughly ${rupees(m.income - projected)}. Future you says thanks.`,
      });
    }
  } else if (m.isCurrent && m.income === 0 && m.spent > 0) {
    out.push({
      id: "income",
      tone: "info",
      title: "Add what came in",
      text: "Log your pocket money, stipend or salary for the month to see what's left and whether it'll last.",
    });
  }

  // Budgets.
  const over = m.byCategory.filter((c) => c.budget !== null && c.amount > c.budget);
  if (over.length > 0) {
    const worst = [...over].sort((a, b) => b.amount - b.budget! - (a.amount - a.budget!))[0];
    out.push({
      id: "over-budget",
      tone: "warn",
      title: `${worst.label} is ${rupees(worst.amount - worst.budget!)} over budget`,
      text: over.length > 1 ? `${over.length} categories are over their budgets this month.` : "A budget only works if it's a little annoying. This is the annoying part.",
      href: "/money?tab=budgets",
      cta: "Review budgets",
    });
  } else if (m.totalBudget !== null && m.spent > m.totalBudget) {
    out.push({ id: "over-total", tone: "warn", title: `${rupees(m.spent - m.totalBudget)} over your monthly budget`, text: "Time for a few slow-spending days." });
  }

  // A goal that's nearly there.
  const near = goals.filter((g) => !g.completed && g.target > 0 && g.saved / g.target >= 0.8).sort((a, b) => b.saved / b.target - a.saved / a.target)[0];
  if (near) {
    out.push({
      id: "goal-near",
      tone: "good",
      title: `You're close to “${near.name}”`,
      text: `${rupees(near.saved)} of ${rupees(near.target)} saved, just ${rupees(near.target - near.saved)} to go.`,
      href: "/money?tab=goals",
      cta: "Add to it",
    });
  }

  // The biggest category, in plain numbers.
  const top = m.byCategory.find((c) => c.amount > 0);
  if (top && m.spent >= 300) {
    out.push({
      id: "top-category",
      tone: "info",
      title: `You spent ${rupees(top.amount)} on ${top.label.toLowerCase()} ${m.isCurrent ? "this month" : `in ${m.label}`}`,
      text: `That's ${Math.round((top.amount / m.spent) * 100)}% of everything you spent, your biggest category.`,
    });
  }

  // A category that grew compared with last month (enough to matter).
  const grew = m.byCategory
    .filter((c) => c.previous > 0 && c.amount - c.previous >= Math.max(300, c.previous * 0.25))
    .sort((a, b) => b.amount - b.previous - (a.amount - a.previous))[0];
  if (grew) {
    out.push({
      id: "category-up",
      tone: "info",
      title: `Your ${grew.label.toLowerCase()} spending went up compared with last month`,
      text: `${rupees(grew.amount)} so far vs ${rupees(grew.previous)} last month, ${rupees(grew.amount - grew.previous)} more.`,
    });
  }

  // Wants and the 50/30/20 guideline (shopping + entertainment).
  if (m.spent >= 500 && m.byKind.want > 0) {
    const wantShare = Math.round((m.byKind.want / m.spent) * 100);
    out.push(
      wantShare > 40
        ? {
            id: "wants",
            tone: "warn",
            title: `Shopping and entertainment are ${wantShare}% of your spending`,
            text: "The 50/30/20 rule suggests about 30% for wants. Not a crime, but your carts are doing very well this month.",
            href: "/lessons/budgeting-basics",
            cta: "Revisit budgeting",
          }
        : { id: "wants", tone: "good", title: `Wants at ${wantShare}% of spending`, text: "Within the ~30% that the 50/30/20 rule suggests: fun, without the month-end panic." },
    );
  }

  // Small leaks.
  if (m.smallSpends.count >= 5) {
    out.push({
      id: "leaks",
      tone: "warn",
      title: `${m.smallSpends.count} small spends added up to ${rupees(m.smallSpends.total)}`,
      text: "Each one under ₹150, none of them memorable. Small, quiet, and surprisingly expensive.",
    });
  }

  // Weekends.
  if (m.weekend.days >= 2 && m.weekday.days >= 3 && m.weekday.perDay > 0 && m.weekend.perDay >= m.weekday.perDay * 1.5) {
    out.push({
      id: "weekend",
      tone: "info",
      title: `Weekend you spends ${(m.weekend.perDay / m.weekday.perDay).toFixed(1)}× more per day`,
      text: `${rupees(m.weekend.perDay)} a day on weekends vs ${rupees(m.weekday.perDay)} on weekdays. Plan the weekend beforehand and it stops being an ambush.`,
    });
  }

  // Compared with last month, overall.
  if (m.previousSpent > 0 && m.spent > 0) {
    const compare = m.isCurrent ? projected : m.spent;
    const diff = compare - m.previousSpent;
    if (Math.abs(diff) >= Math.max(200, m.previousSpent * 0.1)) {
      out.push({
        id: "vs-last",
        tone: diff < 0 ? "good" : "info",
        title: diff < 0 ? `${rupees(-diff)} less than last month${m.isCurrent ? " (on this pace)" : ""}` : `${rupees(diff)} more than last month${m.isCurrent ? " (on this pace)" : ""}`,
        text: `Last month you spent ${rupees(m.previousSpent)}.`,
      });
    }
  }

  // What wants could become, if invested instead (an illustration, not advice).
  if (m.byKind.want >= 300) {
    const monthly = Math.round(m.byKind.want / 2 / 10) * 10;
    const tenYears = compoundGrowth({ monthly, years: 10, annualRatePct: 10 });
    out.push({
      id: "compound",
      tone: "info",
      title: `Half your wants, invested monthly, could grow to about ${shortRupees(tenYears.value)}`,
      text: `${rupees(monthly)} a month for 10 years at an assumed 10% a year: ${shortRupees(tenYears.invested)} put in. An illustration: real returns go up and down and aren't guaranteed.`,
      href: `/invest/simulator?monthly=${monthly}&years=10&rate=10`,
      cta: "Try the simulator",
    });
  }

  return out;
}
