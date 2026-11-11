import assert from "node:assert/strict";
import test from "node:test";
import { hubMessage, hubState, readRoastLevel, type HubInput } from "./hub";

const base: HubInput = {
  questsDone: 0,
  questsTotal: 3,
  isNew: false,
  unfinishedLesson: null,
  nextLesson: { title: "Compound Interest", minutes: 6 },
  spendingRoast: null,
  spentToday: true,
  investTouched: true,
};

test("every Home state, with sample data", () => {
  const cases: [Partial<HubInput>, string, string | null][] = [
    [{ isNew: true }, "new", "learn"],
    [{ unfinishedLesson: { title: "Budgeting", minutes: 4 } }, "unfinished", "learn"],
    [{ spendingRoast: "₹1,840 on Swiggy this week. Your kitchen misses you." }, "spent", "money"],
    [{ spentToday: false }, "noExpense", "money"],
    [{ investTouched: false }, "investIdle", "invest"],
    [{}, "nextLesson", "learn"],
    [{ questsDone: 3 }, "done", null],
  ];
  for (const [patch, state, highlight] of cases) {
    const message = hubMessage({ ...base, ...patch }, "spicy", 0);
    assert.equal(message.state, state);
    assert.equal(message.highlight, highlight);
    assert.ok(message.text.length > 20);
  }
});

test("a finished day wins over everything; new users come next", () => {
  assert.equal(hubState({ ...base, questsDone: 3, isNew: true, spentToday: false }), "done");
  assert.equal(hubState({ ...base, isNew: true, spentToday: false }), "new");
});

test("lesson details and the closing instruction are filled in", () => {
  const m = hubMessage({ ...base, unfinishedLesson: { title: "Budgeting", minutes: 4 } }, "spicy", 0);
  assert.match(m.text, /Budgeting/);
  assert.match(m.text, /4 min/);
  assert.match(m.text, /Tap Learn\.$/);
  assert.ok(!m.text.includes("{"));
});

test("a real spending roast is used as the line, at any roast level", () => {
  const roast = "₹1,840 on Swiggy this week. Your kitchen misses you.";
  assert.ok(hubMessage({ ...base, spendingRoast: roast }, "savage", 1).text.startsWith(roast));
  assert.ok(hubMessage({ ...base, spendingRoast: roast }, "mild", 1).text.startsWith(roast));
});

test("roast level falls back to Spicy", () => {
  assert.equal(readRoastLevel("savage"), "savage");
  assert.equal(readRoastLevel("nonsense"), "spicy");
  assert.equal(readRoastLevel(null), "spicy");
});

test("lines rotate", () => {
  assert.notEqual(hubMessage({ ...base, isNew: true }, "spicy", 0).text, hubMessage({ ...base, isNew: true }, "spicy", 1).text);
});
