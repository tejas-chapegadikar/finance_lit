import { test } from "node:test";
import assert from "node:assert/strict";
import { compoundGrowth, shortRupees } from "./simulator";
import { scorePersonality } from "./personality";

test("compounding matches the textbook formula (money added at the start of each month)", () => {
  // FV = P × ((1 + r)^n − 1) / r × (1 + r), r = 10%/12, n = 120:
  // ₹1,000 a month for 10 years at 10% ≈ ₹2,06,552.
  const r = 0.1 / 12;
  const expected = 1000 * ((Math.pow(1 + r, 120) - 1) / r) * (1 + r);
  const result = compoundGrowth({ monthly: 1000, years: 10, annualRatePct: 10 });
  assert.equal(result.invested, 120000);
  assert.ok(Math.abs(result.value - expected) <= 1, `${result.value} vs ${expected}`);
  assert.ok(result.value > 206000 && result.value < 207000);
  assert.equal(result.growth, result.value - result.invested);
});

test("a lump sum grows by monthly compounding", () => {
  // ₹10,000 at 12% for a year: 10,000 × 1.01¹² ≈ ₹11,268.
  assert.equal(compoundGrowth({ monthly: 0, years: 1, annualRatePct: 12, initial: 10000 }).value, 11268);
});

test("the SIP lesson's example: ₹3,000 a month for 39 years at 10% is about ₹1.7 crore", () => {
  assert.equal(shortRupees(compoundGrowth({ monthly: 3000, years: 39, annualRatePct: 10 }).value), "₹1.7 crore");
});

test("one point per year, and the last point is the final value", () => {
  const result = compoundGrowth({ monthly: 500, years: 5, annualRatePct: 8 });
  assert.deepEqual(result.series.map((p) => p.year), [0, 1, 2, 3, 4, 5]);
  assert.equal(result.series.at(-1)?.value, result.value);
  assert.equal(result.series[3].invested, 18000);
});

test("short Indian amounts", () => {
  assert.equal(shortRupees(4500), "₹4,500");
  assert.equal(shortRupees(120000), "₹1.2 lakh");
  assert.equal(shortRupees(1500000), "₹15 lakh");
  assert.equal(shortRupees(17000000), "₹1.7 crore");
});

test("personality scoring: majority wins, ties go to the latest answer, bad input is rejected", () => {
  assert.equal(scorePersonality([0, 0, 0, 0, 0, 0]), "impulse-buyer");
  assert.equal(scorePersonality([4, 4, 4, 1, 1, 0]), "smart-planner");
  assert.equal(scorePersonality([1, 1, 3, 3, 2, 2]), "procrastinator"); // three-way tie → last answer
  assert.equal(scorePersonality([0, 0, 0]), null);
  assert.equal(scorePersonality([0, 0, 0, 0, 0, 5]), null);
  assert.equal(scorePersonality([0, 0, 0, 0, 0, 1.5]), null);
});
