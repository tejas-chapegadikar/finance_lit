// The central content catalogue, every piece of learning content on
// StockStreak, with a unique id, the pillar it belongs to, a topic tag and
// (for lessons) a learning objective. It exists for one rule:
//
//   DO NOT REPEAT TOPICS. Nothing may re-ask what another item already asks.
//
// `findDuplicates()` compares every item's text with every other item's and
// flags near-identical pairs. The seed refuses to run and `npm test` fails if
// any appear, so new content is checked against everything that exists.
//
// Two kinds of reuse are deliberate and excluded from the check:
//   • A lesson's practice questions are the same idea with a new example, 
//     they're for spaced recall (AI Coach checks and revision), by design.
//   • The Daily Challenge's quick-fire drills replay lesson questions as
//     review; they reference questions rather than adding new text.
//
// When you add content: give it an id and a topic here (lessons need an
// objective in LESSON_TOPICS), run `npm test`, and reword or drop anything
// it flags.

import { LEVEL_1_LESSONS } from "../../../prisma/content/level1";
import { INVEST_LESSONS, INVEST_PRACTICE } from "../../../prisma/content/investsmart";
import { LOANS_PRACTICE } from "../../../prisma/content/loans";
import { PRACTICE } from "../../../prisma/content/practice";
import { DAILY_QUESTIONS } from "../../../prisma/content/daily-questions";
import { CHALLENGES, HABIT_CHALLENGE } from "../challenges/content";
import { SCENARIOS } from "../scenarios/content";
import { SCAM_MESSAGES } from "../daily-challenge/content";
import { MONEY_FACTS } from "../money-facts";

export type Pillar = "money-iq" | "investsmart" | "money-manager" | "daily";
export type ContentKind = "quiz" | "practice" | "lesson-scenario" | "reality-check" | "fact" | "habit-step" | "challenge-step" | "scenario" | "spot-the-scam";

export type CatalogItem = {
  id: string;
  kind: ContentKind;
  pillar: Pillar;
  topic: string;
  text: string;
  /** The lesson a quiz/practice item belongs to. */
  lesson?: string;
};

/** One clearly defined learning objective per lesson, no two the same. */
export const LESSON_TOPICS: Record<string, { pillar: Pillar; topic: string; objective: string }> = {
  "budgeting-basics": { pillar: "money-iq", topic: "budgeting", objective: "Plan a month's money with the 50/30/20 rule and pay yourself first." },
  "compound-interest": { pillar: "money-iq", topic: "compounding", objective: "Tell simple from compound interest and estimate doubling with the Rule of 72." },
  "saving-vs-spending": { pillar: "money-iq", topic: "spending-habits", objective: "Resist impulse buys and lifestyle creep, and start an emergency fund." },
  "upi-digital-payments": { pillar: "money-iq", topic: "upi", objective: "Use UPI safely: when a PIN is needed, collect requests, and what to do after fraud." },
  "financial-scams": { pillar: "money-iq", topic: "scams", objective: "Recognise OTP, task, fake-job and digital-arrest scams aimed at students." },
  "bank-accounts": { pillar: "money-iq", topic: "banking", objective: "Choose the right account, avoid minimum-balance charges, and know DICGC cover." },
  "fd-rd": { pillar: "money-iq", topic: "deposits", objective: "Use FDs and RDs for short-term goals and know the cost of breaking them." },
  "cibil-score": { pillar: "money-iq", topic: "credit-score", objective: "Understand what builds or hurts a credit score, and build one from zero." },
  "credit-cards-101": { pillar: "money-iq", topic: "credit-cards", objective: "Use a credit card's limit, billing cycle and due date without paying interest." },
  "loans-emis": { pillar: "money-iq", topic: "loans", objective: "Read an EMI, compare flat vs reducing rates with the KFS, and spot illegal loan apps." },
  "first-salary-tax": { pillar: "money-iq", topic: "income-tax", objective: "Read a first payslip: CTC vs in-hand, PF, TDS and the default tax regime." },
  "stocks-mutual-funds-fds": { pillar: "money-iq", topic: "investment-types", objective: "Compare stocks, mutual funds and FDs on risk, return and time horizon." },
  "sip-starting-early": { pillar: "money-iq", topic: "sip", objective: "See how SIPs and rupee-cost averaging work, and why starting early matters." },
  "inflation-purchasing-power": { pillar: "investsmart", topic: "inflation", objective: "Explain inflation, saving vs investing, and real returns." },
  "how-stock-market-works": { pillar: "investsmart", topic: "stock-market", objective: "Explain exchanges, SEBI, demat accounts, IPOs, price moves and indices." },
  "index-funds-long-term": { pillar: "investsmart", topic: "index-investing", objective: "Weigh expense ratios and direct plans, and why time in the market beats timing it." },
  "start-investing-checklist": { pillar: "investsmart", topic: "getting-started", objective: "Complete KYC, match investments to goals and risk, and check advisers' SEBI registration." },
};

const ALL_LESSONS = [...LEVEL_1_LESSONS, ...INVEST_LESSONS];
const ALL_PRACTICE: Record<string, { prompt: string }[]> = { ...PRACTICE, "loans-emis": LOANS_PRACTICE, ...INVEST_PRACTICE };

/** Every catalogued item, built from the live content files. */
export function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const lesson of ALL_LESSONS) {
    const meta = LESSON_TOPICS[lesson.slug];
    const pillar = meta?.pillar ?? "money-iq";
    const topic = meta?.topic ?? "untagged";
    items.push({ id: `lesson:${lesson.slug}:scenario`, kind: "lesson-scenario", pillar, topic, text: lesson.scenario.prompt, lesson: lesson.slug });
    lesson.questions.forEach((q, i) =>
      items.push({ id: `lesson:${lesson.slug}:q${i + 1}`, kind: "quiz", pillar, topic, text: q.prompt, lesson: lesson.slug }),
    );
    (ALL_PRACTICE[lesson.slug] ?? []).forEach((p, i) =>
      items.push({ id: `lesson:${lesson.slug}:p${i + 1}`, kind: "practice", pillar, topic, text: p.prompt, lesson: lesson.slug }),
    );
  }
  for (const q of DAILY_QUESTIONS) {
    items.push({ id: `reality-check:${q.key}`, kind: "reality-check", pillar: "daily", topic: q.area.toLowerCase(), text: q.prompt });
  }
  for (const fact of MONEY_FACTS) {
    items.push({ id: `fact:${fact.id}`, kind: "fact", pillar: "daily", topic: "money-facts", text: fact.text });
  }
  for (const challenge of CHALLENGES) {
    // Saving challenges repeat one task daily by design (that's the
    // challenge); their daily tips are what must stay distinct.
    const habit = challenge.id === HABIT_CHALLENGE.id;
    challenge.steps.forEach((step, i) => {
      if (!habit && i > 0 && step.task === challenge.steps[0].task) {
        items.push({ id: `challenge:${challenge.id}:${i + 1}`, kind: "challenge-step", pillar: "daily", topic: challenge.id, text: step.body });
        return;
      }
      items.push({
        id: `challenge:${challenge.id}:${i + 1}`,
        kind: habit ? "habit-step" : "challenge-step",
        pillar: "daily",
        topic: challenge.id,
        text: habit ? `${step.title}. ${step.task}` : step.body,
      });
      if (step.quiz) {
        items.push({ id: `challenge:${challenge.id}:${i + 1}:quiz`, kind: "habit-step", pillar: "daily", topic: challenge.id, text: step.quiz.prompt });
      }
    });
  }
  for (const scenario of SCENARIOS) {
    scenario.steps.forEach((step, i) =>
      items.push({ id: `scenario:${scenario.slug}:${i + 1}`, kind: "scenario", pillar: "daily", topic: scenario.area.toLowerCase(), text: step.prompt }),
    );
  }
  SCAM_MESSAGES.forEach((m, i) => items.push({ id: `spot-the-scam:${i + 1}`, kind: "spot-the-scam", pillar: "daily", topic: "scams", text: m.text }));
  return items;
}

// ── Near-duplicate detection
const STOP = new Set(
  "a an the and or but of to in on at for from by with without your you you're youre yours i i'm im me my we our it it's its is are was were be been being this that these those what which who whom how why when where do does did done have has had will would can could should may might must not no yes than then there their they them he she his her if so as just only about into over under up down out more most less much many very really one two three all any each every some such own same other new now today tomorrow".split(
    " ",
  ),
);

/** Lower-case content words, with trailing plural "s" removed. */
export function contentWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/₹\s?[\d,]+/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  return new Set(words);
}

/** Dice similarity of two texts' content words (0–1); 0 unless they share at least MIN_SHARED words. */
export function similarity(a: string, b: string): number {
  const x = contentWords(a);
  const y = contentWords(b);
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return shared < MIN_SHARED ? 0 : (2 * shared) / (x.size + y.size);
}

const LESSON_KINDS = new Set<ContentKind>(["quiz", "practice", "lesson-scenario"]);
/** Kinds that put a lesson into practice, they apply its concepts by design. */
const APPLY_KINDS = new Set<ContentKind>(["habit-step", "challenge-step", "scenario", "spot-the-scam"]);

/**
 * Pairs that are deliberately related, so not duplicates:
 *  - a lesson's quiz and its own practice questions (spaced recall);
 *  - a lesson and an activity that applies it (a challenge step, a scenario,
 *    a spot-the-scam message), those ask you to *do* the thing, not re-learn it.
 */
function exempt(a: CatalogItem, b: CatalogItem) {
  if (a.lesson && a.lesson === b.lesson && LESSON_KINDS.has(a.kind) && LESSON_KINDS.has(b.kind)) return true;
  return (LESSON_KINDS.has(a.kind) && APPLY_KINDS.has(b.kind)) || (APPLY_KINDS.has(a.kind) && LESSON_KINDS.has(b.kind));
}

/**
 * Pairs the detector flags that a person has reviewed and judged distinct,
 * with the reason. Keep this list short, rewording is usually better.
 */
export const REVIEWED_DISTINCT: { a: string; b: string; why: string }[] = [
  { a: "lesson:compound-interest:q4", b: "lesson:fd-rd:p4", why: "Calculating simple interest vs how FD interest is taxed." },
  { a: "lesson:compound-interest:p4", b: "lesson:fd-rd:p4", why: "Calculating simple interest vs how FD interest is taxed." },
  { a: "lesson:cibil-score:scenario", b: "lesson:credit-cards-101:p1", why: "Building a score with a new card vs what a credit limit means." },
];

function reviewed(a: CatalogItem, b: CatalogItem) {
  return REVIEWED_DISTINCT.some((r) => (r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id));
}

export const DUPLICATE_THRESHOLD = 0.45;
const MIN_SHARED = 3;
/** Texts this short don't carry enough words to compare fairly. */
const MIN_WORDS = 3;

export type Duplicate = { a: CatalogItem; b: CatalogItem; score: number };

export function findDuplicates(items: CatalogItem[] = buildCatalog(), threshold = DUPLICATE_THRESHOLD): Duplicate[] {
  const out: Duplicate[] = [];
  const sized = items.map((item) => ({ item, words: contentWords(item.text).size }));
  for (let i = 0; i < sized.length; i++) {
    for (let j = i + 1; j < sized.length; j++) {
      const a = sized[i];
      const b = sized[j];
      if (a.words < MIN_WORDS || b.words < MIN_WORDS || exempt(a.item, b.item) || reviewed(a.item, b.item)) continue;
      const score = similarity(a.item.text, b.item.text);
      if (score >= threshold) out.push({ a: a.item, b: b.item, score });
    }
  }
  return out.sort((p, q) => q.score - p.score);
}

// ── Concept ownership
// Copied wording is easy to catch; the same concept in new words isn't. So
// each lesson OWNS its key concepts (its multi-word key terms). A Reality
// Check question or money fact that names a concept a lesson owns repeats
// that lesson, unless it's listed here with a clearly different objective.

export const ALLOWED_CONCEPT_OVERLAPS: Record<string, string> = {
  "reality-check:parents-health-cover":
    "SIP lesson: why to get health cover before investing. This question: checking the dependent-age limit on a family policy.",
  "reality-check:wrong-upi-transfer": "UPI lesson: what a UPI ID is and fraud. This question: recovering a mistaken transfer.",
  "fact:free-credit-report": "CIBIL lesson: what builds a score. This fact: your right to a free yearly report.",
  "fact:senior-fd-rates": "FD lesson: how FDs work. This fact: the extra rate banks often give senior citizens.",
};

/** Each lesson's owned concepts: its multi-word key terms, lower-cased, without brackets. */
export function ownedConcepts(): { lesson: string; concept: string }[] {
  return ALL_LESSONS.flatMap((lesson) =>
    lesson.keyTerms
      .map((t) => t.term.replace(/\(.*?\)/g, "").trim().toLowerCase())
      .filter((term) => term.includes(" "))
      .map((concept) => ({ lesson: lesson.slug, concept })),
  );
}

export type ConceptOverlap = { item: CatalogItem; lesson: string; concept: string };

export function findConceptOverlaps(items: CatalogItem[] = buildCatalog()): ConceptOverlap[] {
  const concepts = ownedConcepts();
  return items
    .filter((item) => (item.kind === "reality-check" || item.kind === "fact") && !(item.id in ALLOWED_CONCEPT_OVERLAPS))
    .flatMap((item) => {
      const text = item.text.toLowerCase();
      return concepts.filter(({ concept }) => text.includes(concept)).map(({ lesson, concept }) => ({ item, lesson, concept }));
    });
}
