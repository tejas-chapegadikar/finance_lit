import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMoneyMonth, type MoneyEntryRow, type TrendPoint } from "../money/calc";
import { moneyRoast } from "./roast";

let n = 0;
const spend = (amount: number, category: string, day = "2026-11-10"): MoneyEntryRow => ({ id: `e${n++}`, kind: "EXPENSE", amount, category, note: null, day });
const earn = (amount: number): MoneyEntryRow => ({ id: `e${n++}`, kind: "INCOME", amount, category: "pocket-money", note: null, day: "2026-11-01" });
const month = (entries: MoneyEntryRow[], budgets: { category: string; amount: number }[] = []) =>
  buildMoneyMonth({ month: "2026-11", today: "2026-11-20", entries, budgets, previousByCategory: {}, checkIns: 0, checkedInToday: false });
const weeks = (amounts: number[]): TrendPoint[] => amounts.map((amount, i) => ({ key: `w${i}`, label: `w${i}`, amount, current: i === amounts.length - 1 }));
const roast = (entries: MoneyEntryRow[], opts: { budgets?: { category: string; amount: number }[]; weekly?: number[] } = {}) =>
  moneyRoast({ month: month(entries, opts.budgets), weekly: weeks(opts.weekly ?? [0, 0, 0, 0, 0, 0, 0, 0]), name: "Riya" });

test("nothing logged → a nudge, not a made-up roast", () => {
  assert.equal(roast([]).id, "empty");
});

test("food at 60% of spending → the food roast, with the real share", () => {
  const r = roast([earn(10000), spend(3000, "food"), spend(2000, "travel")]);
  assert.equal(r.id, "food");
  assert.ok(r.lines.some((l) => l.includes("60%")), r.lines.join(" | "));
});

test("shopping and entertainment get their own roasts", () => {
  assert.equal(roast([earn(10000), spend(1500, "shopping"), spend(2000, "bills")]).id, "shopping");
  assert.equal(roast([earn(10000), spend(1000, "entertainment"), spend(2000, "bills")]).id, "entertainment");
});

test("saving 40% or more of income → praise", () => {
  const r = roast([earn(10000), spend(3000, "bills"), spend(1000, "travel"), spend(800, "education")]);
  assert.equal(r.id, "saver");
  assert.equal(r.tone, "praise");
});

test("over the monthly budget → the boundaries roast", () => {
  assert.equal(roast([earn(10000), spend(6000, "bills")], { budgets: [{ category: "total", amount: 5000 }] }).id, "over-budget");
});

test("three full weeks in a row over the limit → the stronger warning (beats everything but 'empty')", () => {
  // Budget ₹6,000 → about ₹1,400 a week. The last three full weeks were over; this week doesn't count.
  const r = roast([earn(10000), spend(4000, "food")], { budgets: [{ category: "total", amount: 6000 }], weekly: [0, 0, 0, 900, 1600, 1700, 1800, 100] });
  assert.equal(r.id, "weeks-over");
  assert.ok(r.lines[0].startsWith("3 weeks"), r.lines[0]);
  // Only two weeks over → not the streak warning.
  assert.notEqual(roast([earn(10000), spend(4000, "food")], { budgets: [{ category: "total", amount: 6000 }], weekly: [0, 0, 0, 0, 900, 1700, 1800, 100] }).id, "weeks-over");
});

test("a balanced month → a healthy comment", () => {
  const r = roast([earn(10000), spend(3000, "bills"), spend(1800, "food"), spend(1000, "travel"), spend(700, "education")]);
  assert.equal(r.id, "healthy");
});
