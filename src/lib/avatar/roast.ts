import type { Expression } from "@/components/avatar/Avatar";
import { rupees } from "../money/categories";
import { budgetAlerts, projectSpending, type MoneyMonth, type TrendPoint } from "../money/calc";

// The avatar's money roast: what it says about YOUR money, worked out from
// the transactions you've logged — never random. One rule wins, in this
// order: nothing logged yet → three weeks over budget in a row → over the
// monthly budget → one category eating the month (food, shopping, fun) →
// saving a lot → close to the budget → a healthy month. Each rule has a few
// lines so it doesn't repeat; numbers in the lines are your own.
// Pure, so it's tested (roast.test.ts).

export type RoastTone = "nudge" | "warn" | "roast" | "praise";

export type Roast = { id: string; tone: RoastTone; expression: Expression; lines: string[] };

export type RoastInput = {
  month: MoneyMonth;
  /** Spending per week, oldest first; the last one is this (unfinished) week. */
  weekly: TrendPoint[];
  name: string;
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** How many of the last full weeks (newest first, not counting this one) were over the weekly limit. */
function weeksOver(weekly: TrendPoint[], limit: number) {
  let streak = 0;
  for (let i = weekly.length - 2; i >= 0; i--) {
    if (weekly[i].amount > limit && limit > 0) streak++;
    else break;
  }
  return streak;
}

export function moneyRoast({ month: m, weekly, name }: RoastInput): Roast {
  if (m.entries.length === 0) {
    return {
      id: "empty",
      tone: "nudge",
      expression: "thinking",
      lines: [
        "Your wallet is a mystery novel. Log one spend and let's start the investigation.",
        `${name}, zero entries. Either you spend nothing, or you're hiding something. I know which one.`,
        "Add your pocket money and one expense — I promise to roast responsibly.",
      ],
    };
  }

  // A weekly limit: the monthly budget spread over the month, or (without a
  // budget) what came in, spread the same way.
  const weeklyLimit = m.totalBudget ? (m.totalBudget * 7) / m.daysInMonth : m.income ? (m.income * 7) / m.daysInMonth : 0;
  const streak = weeksOver(weekly, weeklyLimit);
  if (streak >= 3) {
    return {
      id: "weeks-over",
      tone: "roast",
      expression: "shocked",
      lines: [
        `${streak} weeks in a row over your limit. At this point your budget is just a suggestion to you.`,
        `${name}, ${streak} straight weeks over budget. That's not a phase, that's a lifestyle. Let's fix one category this week.`,
        "Three weeks of overspending in a row. Your future self has filed a complaint.",
      ],
    };
  }

  if (m.totalBudget && m.spent > m.totalBudget) {
    return {
      id: "over-budget",
      tone: "roast",
      expression: "confused",
      lines: [
        "Your budget said NO, but apparently you don't understand boundaries.",
        `${rupees(m.spent - m.totalBudget)} over this month's budget. The budget is crying in a corner.`,
        `${name}, we've officially left the budget behind. Slow-spending days start now?`,
      ],
    };
  }

  const cat = (id: string) => m.byCategory.find((c) => c.id === id)?.amount ?? 0;
  const food = cat("food");
  const shopping = cat("shopping");
  const fun = cat("entertainment");
  if (m.spent >= 500) {
    if (pct(food, m.spent) >= 40) {
      return {
        id: "food",
        tone: "roast",
        expression: "shocked",
        lines: [
          "Bro, are you managing your finances or sponsoring the entire restaurant?",
          `${rupees(food)} on food — ${pct(food, m.spent)}% of everything you spent. The delivery apps send their regards.`,
          `${name}, your stomach has a bigger budget than your future. Mess food exists, I hear.`,
        ],
      };
    }
    if (pct(shopping, m.spent) >= 30) {
      return {
        id: "shopping",
        tone: "roast",
        expression: "facepalm",
        lines: [
          "Your wallet needs therapy after seeing these shopping transactions.",
          `${rupees(shopping)} on shopping this month. The 24-hour rule is begging for a chance.`,
          `${pct(shopping, m.spent)}% of your spending went to shopping. Your cart is living better than your savings.`,
        ],
      };
    }
    if (pct(fun, m.spent) >= 25) {
      return {
        id: "entertainment",
        tone: "roast",
        expression: "sleepy",
        lines: [
          "Netflix is getting richer, and you're getting poorer.",
          `${rupees(fun)} on entertainment. You're basically a shareholder in fun now — minus the returns.`,
          `${name}, ${pct(fun, m.spent)}% of your money went to entertainment. At least the plot twists were good?`,
        ],
      };
    }
  }

  if (m.income > 0 && m.spent > 0 && pct(m.income - m.spent, m.income) >= 40 && m.daysElapsed >= 7) {
    return {
      id: "saver",
      tone: "praise",
      expression: "celebrating",
      lines: [
        "Okay, financial genius! Didn't expect this level of responsibility from you.",
        `${pct(m.income - m.spent, m.income)}% of your money is still with you. Who taught you this? Oh right — me.`,
        `${name}, you're saving like a pro. I'm proud and slightly suspicious.`,
      ],
    };
  }

  const near = budgetAlerts(m).find((a) => a.level === "near");
  if (near) {
    return {
      id: "near-budget",
      tone: "warn",
      expression: "thinking",
      lines: [
        `${near.label} is at ${near.pct}%. One more “small treat” and we're officially in trouble.`,
        "We're close to the budget line. Walk slowly, spend slower.",
      ],
    };
  }

  const { projected } = projectSpending(m);
  if (m.isCurrent && m.income > 0 && projected > m.income) {
    return {
      id: "pace",
      tone: "warn",
      expression: "confused",
      lines: [
        `At this pace you'll spend about ${rupees(projected)} — more than came in. The month is longer than your money.`,
        "The maths says the money runs out before the month does. Let's not prove the maths right.",
      ],
    };
  }

  return {
    id: "healthy",
    tone: "praise",
    expression: "happy",
    lines: [
      "Spending looks balanced. I'm almost disappointed — I had roasts ready.",
      `${name}, this is a healthy month. Keep logging and I'll keep the jokes gentle.`,
      "No disasters detected. Suspicious, but I'll allow it.",
    ],
  };
}
