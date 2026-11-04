import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCatalog, findConceptOverlaps, findDuplicates, LESSON_TOPICS, similarity } from "./catalog";
import { LEVEL_1_LESSONS } from "../../../prisma/content/level1";
import { INVEST_LESSONS } from "../../../prisma/content/investsmart";
import { DAILY_QUESTIONS } from "../../../prisma/content/daily-questions";
import { HABIT_CHALLENGE, SAVING_CHALLENGES } from "../challenges/content";
import { MONEY_FACTS } from "../money-facts";
import { CHAPTERS, INVEST_TRACK } from "../journey";

test("every catalogued item has a unique id", () => {
  const ids = buildCatalog().map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("no item repeats another (copied or reworded wording)", () => {
  const duplicates = findDuplicates();
  assert.deepEqual(
    duplicates.map((d) => `${d.a.id} ≈ ${d.b.id}`),
    [],
    "Reword or remove one of each pair, or record a reviewed reason in REVIEWED_DISTINCT",
  );
});

test("no Reality Check or money fact re-teaches a concept a lesson owns", () => {
  assert.deepEqual(
    findConceptOverlaps().map((o) => `${o.item.id} names “${o.concept}” (owned by ${o.lesson})`),
    [],
  );
});

test("the detector catches the kinds of repeats it exists for", () => {
  // Real pairs removed in the November 2026 content audit.
  assert.ok(similarity("Why should you add a nominee to your bank account?", "Why should you add a nominee to your savings account?") >= 0.45);
  assert.ok(similarity("You get a ₹5,000 monthly raise. Which plan helps you avoid lifestyle creep?", "You get a ₹5,000 raise. Which choice best avoids lifestyle creep?") >= 0.45);
  assert.ok(similarity("Riya gets ₹12,000 a month. Following 50/30/20, how much goes to savings?", "Riya gets ₹12,000 a month. Following 50/30/20, how much should go to savings?") >= 0.45);
  // …and leaves unrelated questions alone.
  assert.ok(similarity("What's a demat account for?", "Your laptop suddenly needs a ₹6,000 repair.") < 0.45);
});

test("every lesson has a learning objective, and no two share one", () => {
  const lessons = [...LEVEL_1_LESSONS, ...INVEST_LESSONS];
  for (const lesson of lessons) assert.ok(LESSON_TOPICS[lesson.slug]?.objective, `${lesson.slug} needs an objective`);
  const objectives = Object.values(LESSON_TOPICS).map((t) => t.objective);
  assert.equal(new Set(objectives).size, objectives.length);
  const topics = Object.values(LESSON_TOPICS).map((t) => t.topic);
  assert.equal(new Set(topics).size, topics.length, "two lessons claim the same topic");
});

test("lessons belong to exactly one place: a Money IQ level or the InvestSmart track", () => {
  const inLevels = CHAPTERS.flatMap((c) => c.lessonSlugs);
  for (const lesson of LEVEL_1_LESSONS) assert.ok(inLevels.includes(lesson.slug), `${lesson.slug} is in no level`);
  for (const lesson of INVEST_LESSONS) assert.ok(INVEST_TRACK.includes(lesson.slug), `${lesson.slug} is not on the InvestSmart track`);
  assert.equal(new Set([...inLevels, ...INVEST_TRACK]).size, inLevels.length + INVEST_TRACK.length);
});

test("the 30-day challenge has 30 distinct days in four weeks", () => {
  const steps = HABIT_CHALLENGE.steps;
  assert.equal(steps.length, 30);
  assert.equal(new Set(steps.map((s) => s.title)).size, 30, "two days share a title");
  assert.equal(new Set(steps.map((s) => s.task)).size, 30, "two days share a task");
  assert.deepEqual(
    HABIT_CHALLENGE.phases?.map((p) => p.from),
    [1, 8, 15, 22],
  );
});

test("saving challenges give a different tip every day", () => {
  for (const challenge of SAVING_CHALLENGES) {
    const bodies = challenge.steps.map((s) => s.body);
    assert.equal(new Set(bodies).size, bodies.length, `${challenge.id} repeats a tip`);
  }
});

test("Reality Check keys and fact ids are unique", () => {
  const keys = DAILY_QUESTIONS.map((q) => q.key);
  assert.equal(new Set(keys).size, keys.length);
  const ids = MONEY_FACTS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every Reality Check has exactly one best answer out of four", () => {
  for (const q of DAILY_QUESTIONS) {
    assert.equal(q.options.length, 4, q.key);
    assert.equal(q.options.filter((o) => o.isCorrect).length, 1, q.key);
  }
});
