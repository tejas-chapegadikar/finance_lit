import assert from "node:assert/strict";
import test from "node:test";
import { spendingVerdict, verdictText, type SpendRow } from "./roasts";

const TODAY = "2026-11-12"; // a Thursday
const spend = (amount: number, category: string, day = TODAY, note: string | null = null, createdAt: string | null = null): SpendRow => ({
  amount,
  category,
  note,
  day,
  createdAt,
});
const verdict = (entries: SpendRow[], totalBudget: number | null = null) => spendingVerdict({ today: TODAY, entries, totalBudget });

test("nothing logged, or a calm week: no roast", () => {
  assert.equal(verdict([]), null);
  assert.equal(verdict([spend(300, "food"), spend(200, "travel")]), null);
});

test("a big food week → the food roast, with the real amount and the app from the notes", () => {
  const v = verdict([spend(900, "food", TODAY, "Swiggy dinner"), spend(940, "food", "2026-11-10", "swiggy"), spend(500, "travel")]);
  assert.equal(v?.id, "food");
  assert.equal(v?.expression, "shocked");
  assert.equal(verdictText(v!, "mild", 0), "₹1,840 on Swiggy this week. Your kitchen misses you.");
  assert.equal(verdict([spend(1200, "food")])?.values.place, "food");
});

test("three shopping buys in two days → sale buys; two aren't enough", () => {
  const v = verdict([spend(400, "shopping"), spend(300, "shopping", "2026-11-11"), spend(250, "shopping", "2026-11-11")]);
  assert.equal(v?.id, "saleBuys");
  assert.match(verdictText(v!, "savage", 0), /^3 sale buys in 2 days\./);
  assert.equal(verdict([spend(400, "shopping"), spend(300, "shopping", "2026-11-09"), spend(250, "shopping", "2026-11-09")]), null);
});

test("shopping logged at 2 AM (India time) → the late-night roast", () => {
  // 20:30 UTC on the 11th is 2:00 AM on the 12th in India.
  const v = verdict([spend(999, "shopping", TODAY, null, "2026-11-11T20:30:00Z")]);
  assert.equal(v?.id, "lateNight");
  assert.equal(v?.values.time, "2 AM");
  assert.equal(verdict([spend(999, "shopping", TODAY, null, "2026-11-12T06:30:00Z")]), null, "noon is fine");
});

test("lots of small spends → small sips, big leaks", () => {
  const chai = Array.from({ length: 14 }, (_, i) => spend(20, "food", shiftBack(i % 7), "chai"));
  const v = verdict(chai);
  assert.equal(v?.id, "smallSpends");
  assert.equal(verdictText(v!, "spicy", 0), "₹20 chai, 14 times. That's ₹280. Small sips, big leaks.");
});

test("over the month's budget → budget crossed, with the day it happened", () => {
  const v = verdict([spend(3000, "food", "2026-11-03"), spend(2500, "shopping", "2026-11-10")], 5000);
  assert.equal(v?.id, "budgetCrossed");
  assert.equal(v?.expression, "sad");
  assert.equal(v?.values.weekday, "Tuesday");
});

test("essentials are never roasted: rent alone blowing the budget isn't a roast", () => {
  assert.equal(verdict([spend(9000, "bills", "2026-11-02"), spend(200, "food")], 5000), null);
  const fees = Array.from({ length: 8 }, () => spend(50, "education"));
  assert.equal(verdict(fees), null, "small education spends are fine");
});

test("a logged week under the weekly budget → praise", () => {
  const week = ["2026-11-06", "2026-11-08", "2026-11-10", TODAY].map((day) => spend(150, "food", day));
  const v = verdict(week, 6000);
  assert.equal(v?.kind, "hype");
  assert.equal(v?.expression, "proud");
});

function shiftBack(i: number) {
  return `2026-11-${String(12 - i).padStart(2, "0")}`;
}
