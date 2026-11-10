import assert from "node:assert/strict";
import test from "node:test";
import { levelFor, xpForLevel } from "./levels";

test("level thresholds", () => {
  assert.equal(xpForLevel(1), 0);
  assert.equal(xpForLevel(2), 100);
  assert.equal(xpForLevel(3), 300);
});

test("level progress at the edges", () => {
  assert.deepEqual(levelFor(0), { level: 1, into: 0, span: 100, toNext: 100, percent: 0 });
  assert.equal(levelFor(99).level, 1);
  assert.equal(levelFor(100).level, 2);
  assert.equal(levelFor(300).level, 3);
  assert.equal(levelFor(150).percent, 25);
  assert.equal(levelFor(-5).level, 1);
});
