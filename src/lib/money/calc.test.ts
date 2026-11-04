import { test } from "node:test";
import assert from "node:assert/strict";
import { alertAfterSpend, budgetAlerts, buildMoneyMonth, moneyInsights, monthBounds, projectSpending, shiftMonth, summariseTrends, weekStart, type MoneyEntryRow } from "./calc";

let n = 0;
const spend = (amount: number, category: string, day: string): MoneyEntryRow => ({ id: `e${n++}`, kind: "EXPENSE", amount, category, note: null, day });
const earn = (amount: number, day: string): MoneyEntryRow => ({ id: `e${n++}`, kind: "INCOME", amount, category: "pocket-money", note: null, day });

const month = (entries: MoneyEntryRow[], extra: Partial<Parameters<typeof buildMoneyMonth>[0]> = {}) =>
  buildMoneyMonth({ month: "2026-11", today: "2026-11-06", entries, budgets: [], previousByCategory: {}, checkIns: 0, checkedInToday: false, ...extra });

test("month bounds and shifting handle month lengths and year ends", () => {
  assert.deepEqual(monthBounds("2026-02"), { first: "2026-02-01", last: "2026-02-28", count: 28 });
  assert.deepEqual(monthBounds("2028-02").count, 29);
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
});

test("totals: income, spending, balance and categories come only from the entries", () => {
  const m = month([earn(10000, "2026-11-01"), spend(4000, "bills", "2026-11-01"), spend(250, "food", "2026-11-02"), spend(350, "food", "2026-11-05")]);
  assert.equal(m.income, 10000);
  assert.equal(m.spent, 4600);
  assert.deepEqual(
    m.byCategory.map((c) => [c.id, c.amount]),
    [
      ["bills", 4000],
      ["food", 600],
    ],
  );
  assert.equal(m.daysElapsed, 6);
  assert.equal(m.daily.length, 30);
  assert.equal(m.daily[4].amount, 350);
});

test("spending pace ignores one-off fixed bills", () => {
  // ₹4,000 rent on day 1 plus ₹600 of food over 6 days → ₹100 a day of flexible
  // spending → ₹4,600 + ₹100 × 24 remaining days = ₹7,000 by month-end.
  const m = month([earn(10000, "2026-11-01"), spend(4000, "bills", "2026-11-01"), spend(600, "food", "2026-11-03")]);
  assert.deepEqual(projectSpending(m), { avgDaily: 100, projected: 7000 });
  const pace = moneyInsights(m).find((i) => i.id === "pace");
  assert.equal(pace?.tone, "good");
  assert.match(pace!.text, /₹7,000/);
});

test("budget alerts: nothing below 80%, 'near' from 80%, 'over' above 100%", () => {
  const at = (spent: number) => budgetAlerts(month([spend(spent, "food", "2026-11-02")], { budgets: [{ category: "food", amount: 1000 }] }));
  assert.deepEqual(at(799), []);
  assert.equal(at(800)[0].level, "near");
  assert.equal(at(1000)[0].level, "near");
  assert.equal(at(1001)[0].level, "over");
  // The overall budget comes first.
  const both = budgetAlerts(month([spend(950, "food", "2026-11-02")], { budgets: [{ category: "food", amount: 1000 }, { category: "total", amount: 900 }] }));
  assert.deepEqual(both.map((a) => [a.id, a.level]), [["total", "over"], ["food", "near"]]);
});

test("the alert after a spend says how close or how far over", () => {
  assert.equal(alertAfterSpend("food", 500, 1000, 500, null), null);
  assert.equal(alertAfterSpend("food", 850, 1000, 850, null), "Heads up: Food is at 85% of its ₹1,000 budget.");
  assert.equal(alertAfterSpend("food", 1200, 1000, 1200, null), "Heads up: Food is ₹200 over its ₹1,000 budget.");
  assert.equal(alertAfterSpend("travel", 100, null, 9500, 10000), "Heads up: You've used 95% of this month's budget.");
});

test("insights never invent anything when nothing is logged", () => {
  const insights = moneyInsights(month([]));
  assert.deepEqual(insights.map((i) => i.id), ["empty"]);
});

test("insights: biggest category, a category that grew, and a goal that's nearly there", () => {
  const m = month([earn(12000, "2026-11-01"), spend(1800, "food", "2026-11-02"), spend(900, "travel", "2026-11-03")], { previousByCategory: { travel: 400, food: 2000 } });
  const insights = moneyInsights(m, [{ name: "Goa trip", saved: 4200, target: 5000, completed: false }]);
  const byId = new Map(insights.map((i) => [i.id, i]));
  assert.equal(byId.get("top-category")?.title, "You spent ₹1,800 on food this month");
  assert.equal(byId.get("category-up")?.title, "Your travel spending went up compared with last month");
  assert.match(byId.get("goal-near")!.text, /₹800 to go/);
  // Food went down, so it's not reported as up.
  assert.ok(!insights.some((i) => i.id === "category-up" && i.title.includes("food")));
});

test("weekly trends start on Monday and monthly trends cover six months", () => {
  assert.equal(weekStart("2026-11-04"), "2026-11-02"); // a Wednesday → Monday
  assert.equal(weekStart("2026-11-02"), "2026-11-02");
  assert.equal(weekStart("2026-11-08"), "2026-11-02"); // Sunday
  const { weekly, monthly } = summariseTrends(
    [
      { amount: 100, day: "2026-11-03" },
      { amount: 50, day: "2026-10-30" },
      { amount: 999, day: "2026-11-09" }, // after "today": ignored
    ],
    "2026-11-04",
  );
  assert.equal(weekly.length, 8);
  assert.deepEqual(weekly.at(-1), { key: "2026-11-02", label: "2 Nov", amount: 100, current: true });
  assert.equal(weekly.at(-2)?.amount, 50);
  assert.deepEqual(monthly.map((p) => p.key), ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
  assert.deepEqual(monthly.slice(-2).map((p) => p.amount), [50, 100]);
});
