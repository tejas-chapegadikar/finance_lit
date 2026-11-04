import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { LEVEL_1_LESSONS } from "./content/level1";
import { DAILY_QUESTIONS } from "./content/daily-questions";
import { PRACTICE as CORE_PRACTICE } from "./content/practice";
import { LOANS_PRACTICE } from "./content/loans";
import { INVEST_LESSONS, INVEST_PRACTICE } from "./content/investsmart";
import { LESSON_TRUST } from "./content/trust";
import { findDuplicates } from "../src/lib/content/catalog";
import type { SeedDailyQuestion, SeedLesson, SeedPractice } from "./content/types";

// Money IQ's path (Levels 1–4) plus the InvestSmart track.
const ALL_LESSONS: SeedLesson[] = [...LEVEL_1_LESSONS, ...INVEST_LESSONS];
const PRACTICE: Record<string, SeedPractice[]> = { ...CORE_PRACTICE, "loans-emis": LOANS_PRACTICE, ...INVEST_PRACTICE };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Pre-V1 lessons that became a V1 lesson keep their row — and anyone's
// progress on it — they're only renamed.
const RENAMED_SLUGS: Record<string, string> = {
  "saving-vs-spending-psychology": "saving-vs-spending",
  "upi-payment-safety": "upi-digital-payments",
  "common-financial-scams-india": "financial-scams",
  "bank-accounts-savings-instruments": "bank-accounts",
  "credit-score-cibil": "cibil-score",
  "income-tax-basics": "first-salary-tax",
  "investing-basics-stocks-mutual-funds-fds": "stocks-mutual-funds-fds",
  // Lesson 12 was briefly "SIPs & Insurance"; it's "SIPs and Starting Early" again.
  "sips-insurance": "sip-starting-early",
};

// Pre-V1 lessons with no V1 counterpart (insurance basics are covered inside
// lesson 12's "Protect before you invest").
const RETIRED_SLUGS = ["insurance-basics"];

const QUESTIONS_PER_LESSON = 5;
const OPTIONS_PER_CHOICE = 4;
// Each lesson's "Key concepts": three to five ideas to remember.
const MIN_KEY_TERMS = 3;
const MAX_KEY_TERMS = 5;

// Catch content typos (a missing option, two correct answers) before they
// reach students.
function assertChoices(label: string, options: { isCorrect: boolean }[]) {
  const correct = options.filter((o) => o.isCorrect).length;
  if (options.length !== OPTIONS_PER_CHOICE || correct !== 1) {
    throw new Error(`${label}: needs ${OPTIONS_PER_CHOICE} options with exactly 1 correct`);
  }
}

function validateContent() {
  const slugs = new Set<string>();
  for (const lesson of ALL_LESSONS) {
    if (slugs.has(lesson.slug)) throw new Error(`Duplicate lesson slug: ${lesson.slug}`);
    slugs.add(lesson.slug);
    if (lesson.questions.length !== QUESTIONS_PER_LESSON) {
      throw new Error(`${lesson.slug}: needs ${QUESTIONS_PER_LESSON} questions`);
    }
    if (lesson.keyTerms.length < MIN_KEY_TERMS || lesson.keyTerms.length > MAX_KEY_TERMS) {
      throw new Error(`${lesson.slug}: needs ${MIN_KEY_TERMS}–${MAX_KEY_TERMS} key concepts`);
    }
    assertChoices(`${lesson.slug} scenario`, lesson.scenario.options);
    lesson.questions.forEach((q, i) => assertChoices(`${lesson.slug} Q${i + 1}`, q.options));
    const practice = PRACTICE[lesson.slug];
    if (practice?.length !== lesson.questions.length) {
      throw new Error(`${lesson.slug}: needs one practice question per quiz question`);
    }
    practice.forEach((p, i) => assertChoices(`${lesson.slug} practice ${i + 1}`, p.options));
    const trust = LESSON_TRUST[lesson.slug];
    if (!trust || trust.sources.length === 0) throw new Error(`${lesson.slug}: needs sources and a review date`);
  }
  const keys = new Set<string>();
  for (const question of DAILY_QUESTIONS) {
    if (keys.has(question.key)) throw new Error(`Duplicate question key: ${question.key}`);
    keys.add(question.key);
    assertChoices(`question ${question.key}`, question.options);
  }
  // The no-repeats rule: nothing anywhere on StockStreak may re-ask
  // something another item already asks (see src/lib/content/catalog.ts).
  const duplicates = findDuplicates();
  if (duplicates.length) {
    throw new Error(`Repeated content:\n${duplicates.map((d) => `  ${d.a.id} ≈ ${d.b.id} (${d.score.toFixed(2)})`).join("\n")}`);
  }
}

async function renameOldSlugs() {
  for (const [from, to] of Object.entries(RENAMED_SLUGS)) {
    const [old, taken] = await Promise.all([
      db.lesson.findUnique({ where: { slug: from }, select: { id: true } }),
      db.lesson.findUnique({ where: { slug: to }, select: { id: true } }),
    ]);
    if (old && !taken) {
      await db.lesson.update({ where: { id: old.id }, data: { slug: to } });
      console.log(`Renamed lesson ${from} → ${to}`);
    }
  }
}

async function seedLesson(data: SeedLesson) {
  const trust = LESSON_TRUST[data.slug];
  const practice = PRACTICE[data.slug];
  const fields = {
    title: data.title,
    icon: data.icon,
    area: data.area,
    description: data.description,
    hook: data.hook,
    contentMarkdown: data.learn,
    keyTerms: data.keyTerms,
    example: data.example,
    scenarioPrompt: data.scenario.prompt,
    scenarioOptions: data.scenario.options,
    scenarioExplanation: data.scenario.explanation,
    estimatedMinutes: data.estimatedMinutes,
    xpReward: data.xpReward,
    isPublished: true,
    order: data.order,
    sources: trust.sources,
    reviewedAt: new Date(`${trust.reviewedAt}T00:00:00+05:30`),
    appliesTo: trust.appliesTo ?? null,
  };

  const lesson = await db.lesson.upsert({
    where: { slug: data.slug },
    create: { slug: data.slug, ...fields },
    update: fields,
  });

  // Update questions and options in place, matched by position, so rerunning
  // the seed keeps their ids — students' quiz answers, Coach hints and
  // revision schedules all point at them.
  const existing = await db.question.findMany({
    where: { lessonId: lesson.id },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
  for (const [qIndex, q] of data.questions.entries()) {
    const questionFields = {
      prompt: q.prompt,
      explanation: q.explanation,
      hint: q.hint,
      difficulty: q.difficulty,
      order: qIndex,
      practicePrompt: practice[qIndex].prompt,
      practiceOptions: practice[qIndex].options,
      practiceExplanation: practice[qIndex].explanation,
    };
    const current = existing.find((e) => e.order === qIndex);
    if (!current) {
      await db.question.create({
        data: {
          lessonId: lesson.id,
          ...questionFields,
          options: { create: q.options.map((o, oIndex) => ({ text: o.text, isCorrect: o.isCorrect, order: oIndex })) },
        },
      });
      continue;
    }
    const textChanged = current.prompt !== q.prompt;
    await db.question.update({ where: { id: current.id }, data: questionFields });
    for (const [oIndex, o] of q.options.entries()) {
      const option = current.options.find((co) => co.order === oIndex);
      if (option) {
        await db.option.update({ where: { id: option.id }, data: { text: o.text, isCorrect: o.isCorrect } });
      } else {
        await db.option.create({ data: { questionId: current.id, text: o.text, isCorrect: o.isCorrect, order: oIndex } });
      }
    }
    // A reworded question makes its cached AI hints stale.
    if (textChanged) await db.coachHint.deleteMany({ where: { questionId: current.id } });
  }
  await db.question.deleteMany({ where: { lessonId: lesson.id, order: { gte: data.questions.length } } });

  console.log(`Seeded lesson: ${String(data.order).padStart(2, "0")} ${lesson.title}`);
}

async function retireOldLessons() {
  for (const slug of RETIRED_SLUGS) {
    const lesson = await db.lesson.findUnique({
      where: { slug },
      select: { id: true, _count: { select: { attempts: true } } },
    });
    if (!lesson) continue;

    // Quiz attempts reference the lesson (and XP history references the
    // attempts), so a lesson someone has taken is hidden rather than deleted.
    if (lesson._count.attempts === 0) {
      await db.lesson.delete({ where: { id: lesson.id } });
      console.log(`Deleted retired lesson: ${slug}`);
    } else {
      await db.lesson.update({ where: { id: lesson.id }, data: { isPublished: false, order: 999 } });
      console.log(`Unpublished retired lesson: ${slug}`);
    }
  }
}

async function seedDailyQuestion(data: SeedDailyQuestion, order: number) {
  // A stable id keeps reruns idempotent without needing a separate key column.
  const id = `seed_${data.key}`;
  const fields = {
    prompt: data.prompt,
    options: data.options,
    explanation: data.explanation,
    area: data.area,
    isPublished: true,
    order,
  };
  await db.dailyQuestion.upsert({ where: { id }, create: { id, ...fields }, update: fields });
}

async function main() {
  validateContent();

  console.log("Seeding Money IQ and InvestSmart lessons...");
  await renameOldSlugs();
  for (const lesson of ALL_LESSONS) {
    await seedLesson(lesson);
  }
  await retireOldLessons();

  console.log("Seeding Daily Money Reality Checks...");
  for (const [i, question] of DAILY_QUESTIONS.entries()) {
    await seedDailyQuestion(question, i);
  }
  // Questions removed from the content (because they repeated a lesson) are
  // hidden, not deleted — students' past answers still point at them.
  const hidden = await db.dailyQuestion.updateMany({
    where: { id: { startsWith: "seed_", notIn: DAILY_QUESTIONS.map((q) => `seed_${q.key}`) }, isPublished: true },
    data: { isPublished: false },
  });
  if (hidden.count) console.log(`Hid ${hidden.count} retired questions.`);
  console.log(`Seeded ${DAILY_QUESTIONS.length} Questions of the Day.`);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
