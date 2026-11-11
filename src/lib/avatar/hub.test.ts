import assert from "node:assert/strict";
import test from "node:test";
import * as lines from "../../content/avatar-lines";
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
    [{ spendingRoast: "Bro, are you managing your finances or sponsoring the entire restaurant?" }, "spent", "money"],
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
  assert.match(m.text, /Learn pe tap kar\.$/);
  assert.ok(!m.text.includes("{"));
});

test("roast engine lines are used for Spicy and Savage, never for Mild", () => {
  const roast = "Netflix is getting richer, and you're getting poorer.";
  assert.ok(hubMessage({ ...base, spendingRoast: roast }, "savage", 1).text.startsWith(roast));
  assert.ok(!hubMessage({ ...base, spendingRoast: roast }, "mild", 1).text.includes("Netflix"));
});

test("roast level falls back to Spicy", () => {
  assert.equal(readRoastLevel("savage"), "savage");
  assert.equal(readRoastLevel("nonsense"), "spicy");
  assert.equal(readRoastLevel(null), "spicy");
});

test("every state has at least 3 lines per roast level, and lines rotate", () => {
  for (const [state, levels] of Object.entries(lines.HUB_LINES)) {
    for (const [level, list] of Object.entries(levels)) {
      assert.ok(list.length >= 3, `${state}/${level}`);
      assert.equal(new Set(list).size, list.length, `${state}/${level} repeats`);
    }
  }
  assert.notEqual(hubMessage({ ...base, isNew: true }, "spicy", 0).text, hubMessage({ ...base, isNew: true }, "spicy", 1).text);
});

test("roast safety: no em dash, nothing about family, looks or income, no swearing", () => {
  const all: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") all.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(Object.fromEntries(Object.entries(lines).filter(([, v]) => typeof v !== "function")));
  const banned =
    /—|\b(papa|mummy|maa|baap|parents?|family|ghar wale|shakal|mota|moti|kaala|income|salary|stipend|gareeb|bhikari|chutiya|saala|bsdk|bc|mc|kamina|idiot|stupid|ugly|fat)\b/i;
  for (const line of all) assert.ok(!banned.test(line), `bad line: ${line}`);
  assert.ok(all.length > 80);
});
