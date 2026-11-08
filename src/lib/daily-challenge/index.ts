import type { Difficulty, ReadinessArea } from "@prisma/client";
import { db } from "../db";
import { dayNumber, istDayStart } from "../ist-date";
import { readChoiceOptions } from "../lesson-content";
import { READINESS_AREA_META } from "../readiness-areas";
import { seededShuffle } from "../seeded";
import { lessonAccess } from "../progress";
import { publicSteps } from "../scenarios";
import type { AllocateStep, ChoiceStep, MultiStep, PublicStep, StepDef } from "../scenarios/types";
import { BUDGET_FOLLOW_UPS, BUDGET_VARIANTS, SCAM_FOLLOW_UPS, SCAM_MESSAGES } from "./content";

// The Daily Challenge: a short multi-step set, a step up from the Question of
// the Day. The topic rotates through the week and the difficulty through the
// weeks; on quick-fire days a student who has shown mastery of the topic
// gets harder questions. Built the same way for a given student and day, so
// the server can rebuild it to check every answer.

export type DailyChallengeDef = {
  key: string;
  title: string;
  icon: string;
  area: ReadinessArea;
  difficulty: "Easy" | "Medium" | "Hard";
  /** Shown above the first step. */
  intro: string;
  steps: StepDef[];
  takeaway: string;
};

export type PublicDailyChallenge = Omit<DailyChallengeDef, "steps"> & { steps: PublicStep[] };

type Slot = { kind: "quickfire"; area: ReadinessArea } | { kind: "scams" } | { kind: "budget" };

// One slot per weekday, in IST day order.
const WEEK: Slot[] = [
  { kind: "quickfire", area: "BUDGETING" },
  { kind: "scams" },
  { kind: "quickfire", area: "CREDIT" },
  { kind: "budget" },
  { kind: "quickfire", area: "BANKING" },
  { kind: "quickfire", area: "TAX" },
  { kind: "quickfire", area: "INVESTING" },
];

const LEVELS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const LEVEL_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" } as const;
const QUICKFIRE_QUESTIONS = 5;
// At or above this quiz accuracy in a topic (before today), questions get harder.
const MASTERED_ACCURACY = 80;

// Quick-fire questions come only from lessons the student could open before
// today, so locked levels stay locked. When today's topic isn't open to them
// yet, it's a mixed review of everything they have unlocked.
type QuickFireTopic = { area: ReadinessArea; mixed: boolean; lessonIds: string[] };

async function quickFireTopic(userId: string, day: string, area: ReadinessArea): Promise<QuickFireTopic> {
  const { unlocked } = await lessonAccess(userId, istDayStart(day));
  const inArea = unlocked.filter((lesson) => lesson.area === area);
  if (inArea.length > 0) return { area, mixed: false, lessonIds: inArea.map((lesson) => lesson.id) };
  return { area: unlocked[0]?.area ?? area, mixed: true, lessonIds: unlocked.map((lesson) => lesson.id) };
}

const quickFireTitle = (topic: QuickFireTopic) =>
  topic.mixed ? "Quick-fire review" : `${READINESS_AREA_META[topic.area].label} quick-fire`;

/** Today's challenge name and icon, without building it, for cards and links. */
export async function dailyChallengeInfo(userId: string, day: string): Promise<{ title: string; icon: string }> {
  const slot = WEEK[dayNumber(day) % WEEK.length];
  if (slot.kind === "scams") return { title: "Spot the scams", icon: "🕵️" };
  if (slot.kind === "budget") return { title: "Build a budget", icon: "🧮" };
  const topic = await quickFireTopic(userId, day, slot.area);
  return { title: quickFireTitle(topic), icon: topic.mixed ? "⚡" : READINESS_AREA_META[topic.area].icon };
}

/** Today's Daily Challenge for this student. */
export async function getDailyChallenge(userId: string, day: string): Promise<DailyChallengeDef> {
  const n = dayNumber(day);
  const slot = WEEK[n % WEEK.length];
  const week = Math.floor(n / WEEK.length);
  if (slot.kind === "scams") return spotTheScams(day);
  if (slot.kind === "budget") return buildABudget(week);
  return quickFire(await quickFireTopic(userId, day, slot.area), LEVELS[week % LEVELS.length], userId, day);
}

function spotTheScams(day: string): DailyChallengeDef {
  const scams = seededShuffle(SCAM_MESSAGES.filter((m) => m.scam), `scams:${day}`).slice(0, 3);
  const genuine = seededShuffle(SCAM_MESSAGES.filter((m) => !m.scam), `genuine:${day}`).slice(0, 3);
  const messages = seededShuffle([...scams, ...genuine], `order:${day}`);
  const spot: MultiStep = {
    kind: "multi",
    prompt: "Which of these messages are scams? Select all that apply.",
    options: messages.map((m) => ({ text: m.text, correct: m.scam })),
    explanation: scams.map((m) => `🚩 ${m.why}`).join(" "),
  };
  return {
    key: "spot-the-scams",
    title: "Spot the scams",
    icon: "🕵️",
    area: "DIGITAL_SAFETY",
    difficulty: "Medium",
    intro: "Six messages landed on your phone today. Three are scams. Can you tell which?",
    steps: [spot, ...SCAM_FOLLOW_UPS],
    takeaway: "Urgency, a link, a fee to \"claim\" something, or a request for your PIN or OTP: any one of these is a red flag. Report fraud on 1930.",
  };
}

function buildABudget(week: number): DailyChallengeDef {
  const { income, essentials, city } = BUDGET_VARIANTS[week % BUDGET_VARIANTS.length];
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const plan: AllocateStep = {
    kind: "allocate",
    prompt: `Your internship in ${city} pays ${rupees(income)} a month, and your essentials come to about ${rupees(essentials)}. Plan the month.`,
    total: income,
    increment: 500,
    buckets: [
      { id: "essentials", label: "Essentials", hint: `Rent, food, travel, phone, about ${rupees(essentials)}`, initial: income / 2 },
      { id: "savings", label: "Savings", hint: "Emergency fund and goals", initial: income / 4 },
      { id: "wants", label: "Wants", hint: "Eating out, shopping, trips", initial: income / 4 },
    ],
    evaluate: (values) => {
      const feedback: string[] = [];
      if (values.essentials < essentials) {
        feedback.push(`❌ Essentials need about ${rupees(essentials)}. ${rupees(values.essentials)} leaves a bill unpaid.`);
        return { points: 0, feedback };
      }
      feedback.push("✅ Essentials covered.");
      const share = Math.round((values.savings / income) * 100);
      if (values.savings >= income * 0.1) {
        feedback.push(`✅ ${rupees(values.savings)} saved, ${share}% of your income, set aside first.`);
        return { points: 2, feedback };
      }
      if (values.savings > 0) {
        feedback.push(`⚠️ ${rupees(values.savings)} saved is a start. Aim for at least 10% (${rupees(income * 0.1)}).`);
        return { points: 1, feedback };
      }
      feedback.push(`❌ Nothing saved. Even 10% (${rupees(income * 0.1)}) builds an emergency fund over time.`);
      return { points: 1, feedback };
    },
  };
  return {
    key: "build-a-budget",
    title: "Build a budget",
    icon: "🧮",
    area: "BUDGETING",
    difficulty: "Medium",
    intro: "Plan a month on an internship stipend, then handle two everyday money moments.",
    steps: [plan, ...BUDGET_FOLLOW_UPS],
    takeaway: "Cover essentials, save first (even 10% counts), and when a budget runs short, move money from wants, not from savings.",
  };
}

type PoolQuestion = { prompt: string; options: { text: string; isCorrect: boolean }[]; explanation: string; difficulty: Difficulty };

async function quickFire(topic: QuickFireTopic, level: Difficulty, userId: string, day: string): Promise<DailyChallengeDef> {
  const { area, lessonIds } = topic;
  const [questions, attempts] = await Promise.all([
    db.question.findMany({
      where: { lessonId: { in: lessonIds } },
      orderBy: [{ lesson: { order: "asc" } }, { order: "asc" }],
      include: { options: { orderBy: { order: "asc" } } },
    }),
    // Only what happened before today, so the set stays the same all day.
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED", completedAt: { lt: istDayStart(day) }, lessonId: { in: lessonIds } },
      select: { lessonId: true, mastery: true },
    }),
  ]);

  // Lesson questions and their practice versions (same idea, new example).
  const pool: PoolQuestion[] = questions.flatMap((q) => {
    const original = { prompt: q.prompt, options: q.options, explanation: q.explanation, difficulty: q.difficulty };
    const practice = readChoiceOptions(q.practiceOptions);
    return q.practicePrompt && practice.length > 0
      ? [original, { prompt: q.practicePrompt, options: practice, explanation: q.practiceExplanation ?? "", difficulty: q.difficulty }]
      : [original];
  });

  const best = new Map<string, number>();
  for (const a of attempts) best.set(a.lessonId, Math.max(best.get(a.lessonId) ?? 0, a.mastery ?? 0));
  const accuracy = best.size ? [...best.values()].reduce((s, v) => s + v, 0) / best.size : 0;
  const mastered = best.size > 0 && accuracy >= MASTERED_ACCURACY;
  const target = mastered ? LEVELS[Math.min(LEVELS.indexOf(level) + 1, LEVELS.length - 1)] : level;

  // Closest to the target difficulty first, shuffled within each band.
  const distance = (q: PoolQuestion) => Math.abs(LEVELS.indexOf(q.difficulty) - LEVELS.indexOf(target));
  const picked = seededShuffle(pool, `quickfire:${area}:${day}`)
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, QUICKFIRE_QUESTIONS);

  const label = topic.mixed ? "review" : READINESS_AREA_META[area].label;
  const steps: ChoiceStep[] = picked.map((q) => {
    const correct = q.options.find((o) => o.isCorrect);
    return {
      kind: "choice",
      prompt: q.prompt,
      options: seededShuffle(q.options, `options:${q.prompt}:${day}`).map((o) => ({
        text: o.text,
        points: o.isCorrect ? 2 : 0,
        feedback: o.isCorrect ? q.explanation : `The answer: ${correct?.text}. ${q.explanation}`,
      })),
    };
  });

  return {
    key: topic.mixed ? "quickfire-review" : `quickfire-${area}`,
    title: quickFireTitle(topic),
    icon: topic.mixed ? "⚡" : READINESS_AREA_META[area].icon,
    area,
    difficulty: LEVEL_LABEL[target],
    intro: topic.mixed
      ? "Five quick questions from the levels you've unlocked so far. How many can you get right?"
      : mastered
        ? `Five quick ${label} questions, a step harder, because you've been acing this topic.`
        : `Five quick ${label} questions. How many can you get right?`,
    steps,
    takeaway: topic.mixed
      ? "Missed one? Revisit that lesson, and Revision brings back anything you miss in a lesson quiz."
      : `Missed one? Revisit the ${label} lessons, and Revision brings back anything you miss in a lesson quiz.`,
  };
}

/** The challenge without answers or feedback, safe to send to the browser. */
export function publicDailyChallenge(def: DailyChallengeDef): PublicDailyChallenge {
  return { ...def, steps: publicSteps(def.steps) };
}
