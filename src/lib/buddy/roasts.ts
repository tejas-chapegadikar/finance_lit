import type { Expression } from "@/components/avatar/Avatar";
import { HYPE, ROASTS, fill, pick, type RoastId, type RoastLevel } from "../../content/buddy-messages";
import { rupees } from "../money/categories";
import { shiftDay } from "../ist-date";

// The buddy's spending roasts: worked out from what you actually logged,
// never random. One rule wins, in this order: budget crossed → shopping late
// at night → lots of shopping in 2 days → a big food week → lots of small
// spends. Praise when a whole week stays under budget. Only wants (food,
// shopping, fun, other) are ever roasted: rent, bills, education and travel
// never are. Nothing here mentions income or balances. Pure, so it's tested.

export type SpendRow = { amount: number; category: string; note: string | null; day: string; createdAt?: string | Date | null };

export type SpendingInput = {
  /** Today in India, YYYY-MM-DD. */
  today: string;
  /** Expenses (not income) from at least the start of this month and the last 7 days. */
  entries: SpendRow[];
  /** This month's overall budget, if one is set. */
  totalBudget: number | null;
};

export type BuddyVerdict =
  | { kind: "roast"; id: RoastId; expression: Expression; values: Record<string, string | number> }
  | { kind: "hype"; id: "underBudget"; expression: Expression; values: Record<string, string | number> };

/** Categories that are wants, so fair game. Everything else is an essential. */
const WANTS = new Set(["food", "shopping", "entertainment", "other"]);
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const FOOD_WEEK_MIN = 1000;
export const SMALL_SPEND_MAX = 60;

/** The hour in India (0-23) when an entry was logged. */
function istHourOf(at: string | Date) {
  const d = new Date(at);
  return Math.floor((d.getUTCHours() * 60 + d.getUTCMinutes() + 330) / 60) % 24;
}
const clock = (hour: number) => `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
const sum = (rows: SpendRow[]) => rows.reduce((s, r) => s + r.amount, 0);
const daysIn = (month: string) => new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();

function placeOf(rows: SpendRow[]) {
  const notes = rows.map((r) => r.note ?? "").join(" ");
  const swiggy = (notes.match(/swiggy/gi) ?? []).length;
  const zomato = (notes.match(/zomato/gi) ?? []).length;
  if (swiggy === 0 && zomato === 0) return "food";
  return swiggy >= zomato ? "Swiggy" : "Zomato";
}

function thingOf(rows: SpendRow[]) {
  const notes = rows.map((r) => r.note ?? "").join(" ");
  if (/\b(chai|tea)\b/i.test(notes)) return "chai";
  if (/\bcoffee\b/i.test(notes)) return "coffee";
  return rows.filter((r) => r.category === "food").length * 2 >= rows.length ? "snacks" : "little buys";
}

export function spendingVerdict({ today, entries, totalBudget }: SpendingInput): BuddyVerdict | null {
  const month = today.slice(0, 7);
  const weekStart = shiftDay(today, -6);
  const thisMonth = entries.filter((e) => e.day.startsWith(month) && e.day <= today);
  const week = entries.filter((e) => e.day >= weekStart && e.day <= today);
  const twoDays = entries.filter((e) => e.day >= shiftDay(today, -1) && e.day <= today);

  // 1. Over the month's budget, and not just because of rent or fees.
  const monthSpent = sum(thisMonth);
  if (totalBudget && monthSpent > totalBudget && sum(thisMonth.filter((e) => WANTS.has(e.category))) * 4 >= monthSpent) {
    let running = 0;
    const crossed = [...thisMonth].sort((a, b) => a.day.localeCompare(b.day)).find((e) => (running += e.amount) > totalBudget);
    const weekday = WEEKDAYS[new Date(`${crossed?.day ?? today}T00:00:00Z`).getUTCDay()];
    return { kind: "roast", id: "budgetCrossed", expression: "sad", values: { weekday, over: rupees(monthSpent - totalBudget) } };
  }

  // 2. Shopping logged in the middle of the night.
  const late = twoDays.find((e) => e.category === "shopping" && e.createdAt && istHourOf(e.createdAt) < 5);
  if (late?.createdAt) return { kind: "roast", id: "lateNight", expression: "smirk", values: { time: clock(istHourOf(late.createdAt)) } };

  // 3. Three or more shopping buys in two days.
  const buys = twoDays.filter((e) => e.category === "shopping");
  if (buys.length >= 3) return { kind: "roast", id: "saleBuys", expression: "smirk", values: { count: buys.length } };

  // 4. A big food week: at least ₹1,000 and over a third of the week's spending.
  const food = week.filter((e) => e.category === "food");
  const foodTotal = sum(food);
  if (foodTotal >= FOOD_WEEK_MIN && foodTotal * 3 > sum(week)) {
    return { kind: "roast", id: "food", expression: "shocked", values: { amount: rupees(foodTotal), place: placeOf(food) } };
  }

  // 5. Six or more small wants this week.
  const small = week.filter((e) => WANTS.has(e.category) && e.amount <= SMALL_SPEND_MAX);
  if (small.length >= 6) {
    const sorted = small.map((e) => e.amount).sort((a, b) => a - b);
    const each = sorted[Math.floor(sorted.length / 2)];
    return {
      kind: "roast",
      id: "smallSpends",
      expression: "smirk",
      values: { each: rupees(each), thing: thingOf(small), count: small.length, total: rupees(sum(small)) },
    };
  }

  // Praise: a whole week of logging (4+ days) and still under the weekly share of the budget.
  const loggedDays = new Set(week.map((e) => e.day)).size;
  if (totalBudget && loggedDays >= 4 && sum(week) <= (totalBudget * 7) / daysIn(month)) {
    return { kind: "hype", id: "underBudget", expression: "proud", values: {} };
  }
  return null;
}

/** The words for a verdict, in the student's roast level. */
export function verdictText(verdict: BuddyVerdict, level: RoastLevel, seed: number) {
  const lines = verdict.kind === "hype" ? HYPE.underBudget : ROASTS[verdict.id][level];
  return fill(pick(lines, seed), verdict.values);
}
