import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { LEVEL_1_LESSONS } from "./content/level1";
import { DAILY_CHALLENGES } from "./content/challenges";
import type { SeedChallenge, SeedLesson } from "./content/types";

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
  "sip-starting-early": "sips-insurance",
};

// Pre-V1 lessons with no V1 counterpart (insurance moved into SIPs & Insurance).
const RETIRED_SLUGS = ["insurance-basics"];

const QUESTIONS_PER_LESSON = 5;
const OPTIONS_PER_CHOICE = 4;

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
  for (const lesson of LEVEL_1_LESSONS) {
    if (slugs.has(lesson.slug)) throw new Error(`Duplicate lesson slug: ${lesson.slug}`);
    slugs.add(lesson.slug);
    if (lesson.questions.length !== QUESTIONS_PER_LESSON) {
      throw new Error(`${lesson.slug}: needs ${QUESTIONS_PER_LESSON} questions`);
    }
    assertChoices(`${lesson.slug} scenario`, lesson.scenario.options);
    lesson.questions.forEach((q, i) => assertChoices(`${lesson.slug} Q${i + 1}`, q.options));
  }
  const keys = new Set<string>();
  for (const challenge of DAILY_CHALLENGES) {
    if (keys.has(challenge.key)) throw new Error(`Duplicate challenge key: ${challenge.key}`);
    keys.add(challenge.key);
    assertChoices(`challenge ${challenge.key}`, challenge.options);
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
  };

  const lesson = await db.lesson.upsert({
    where: { slug: data.slug },
    create: { slug: data.slug, ...fields },
    update: fields,
  });

  // Replace questions wholesale so the seed is safe to rerun — QuizAnswer
  // and CoachHint rows cascade, and XP already earned lives in XPTransaction.
  await db.question.deleteMany({ where: { lessonId: lesson.id } });
  for (const [qIndex, q] of data.questions.entries()) {
    await db.question.create({
      data: {
        lessonId: lesson.id,
        prompt: q.prompt,
        explanation: q.explanation,
        hint: q.hint,
        difficulty: q.difficulty,
        order: qIndex,
        options: {
          create: q.options.map((o, oIndex) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oIndex,
          })),
        },
      },
    });
  }

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

async function seedChallenge(data: SeedChallenge, order: number) {
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
  await db.dailyChallenge.upsert({ where: { id }, create: { id, ...fields }, update: fields });
}

async function main() {
  validateContent();

  console.log("Seeding Level 1 lessons...");
  await renameOldSlugs();
  for (const lesson of LEVEL_1_LESSONS) {
    await seedLesson(lesson);
  }
  await retireOldLessons();

  console.log("Seeding daily challenges...");
  for (const [i, challenge] of DAILY_CHALLENGES.entries()) {
    await seedChallenge(challenge, i);
  }
  console.log(`Seeded ${DAILY_CHALLENGES.length} daily challenges.`);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
