// The Money IQ path ("Financial Foundations"): 13 lessons in four levels, each tied to a
// life stage. Levels open in order, Level N once Level N−1 is complete.
// Kept free of Prisma imports so client components can use it.
// (In code a level is a "chapter"; students see "Level 1–4".)

export type Chapter = {
  id: string;
  number: number;
  title: string;
  /** Who it's most useful for right now. */
  stage: string;
  icon: string;
  lessonSlugs: string[];
};

export const CHAPTERS: Chapter[] = [
  {
    id: "first-stipend",
    number: 1,
    title: "Your first stipend",
    stage: "College & internships",
    icon: "🎒",
    lessonSlugs: ["budgeting-basics", "compound-interest", "saving-vs-spending"],
  },
  {
    id: "pay-safely",
    number: 2,
    title: "Paying and banking safely",
    stage: "Everyone with a UPI app",
    icon: "🛡️",
    lessonSlugs: ["upi-digital-payments", "financial-scams", "bank-accounts"],
  },
  {
    id: "save-and-borrow",
    number: 3,
    title: "Saving and credit",
    stage: "Before your first card or loan",
    icon: "💳",
    lessonSlugs: ["fd-rd", "cibil-score", "credit-cards-101", "loans-emis"],
  },
  {
    id: "first-salary",
    number: 4,
    title: "Your first salary",
    stage: "Final year & first job",
    icon: "💼",
    lessonSlugs: ["first-salary-tax", "stocks-mutual-funds-fds", "sip-starting-early"],
  },
];

// The level a student's goal (or, without one, their stage) points to, and why.
type Focus = { chapterId: string; why: string; area?: string };

const GOAL_FOCUS: Record<string, Focus> = {
  MANAGING_MONEY: { chapterId: "first-stipend", why: "you want to get better at managing money", area: "BUDGETING" },
  AVOIDING_SCAMS: { chapterId: "pay-safely", why: "you want to avoid financial scams", area: "DIGITAL_SAFETY" },
  CREDIT: { chapterId: "save-and-borrow", why: "you want to understand credit", area: "CREDIT" },
  SALARY_TAXES: { chapterId: "first-salary", why: "you want to understand salary and taxes", area: "TAX" },
  INVESTING: { chapterId: "first-salary", why: "you want to learn investing basics", area: "INVESTING" },
};

const STAGE_FOCUS: Record<string, Focus> = {
  FINAL_YEAR: { chapterId: "first-salary", why: "your first salary is coming up" },
  GRADUATE_WORKING: { chapterId: "first-salary", why: "you're starting to earn" },
};

export function chapterOf(slug: string): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.lessonSlugs.includes(slug));
}

/** What to lean towards for this student: every goal counts, the first one leads. Null if nothing to go on. */
export function focusFor(stage: string | null, goals: readonly string[]): (Focus & { chapter: Chapter; areas: string[]; chapterIds: string[] }) | null {
  const fromGoals = goals.flatMap((goal) => GOAL_FOCUS[goal] ?? []);
  const focus = fromGoals[0] ?? (stage && STAGE_FOCUS[stage]) ?? null;
  const chapter = focus && CHAPTERS.find((c) => c.id === focus.chapterId);
  if (!focus || !chapter) return null;
  const areas = fromGoals.flatMap((g) => g.area ?? []);
  return { ...focus, chapter, areas, chapterIds: fromGoals.length ? fromGoals.map((g) => g.chapterId) : [focus.chapterId] };
}

/** completed · current (the one to work on now) · available (opened early) · locked. */
export type LevelStatus = "completed" | "current" | "available" | "locked";

export type LevelAccess = {
  chapter: Chapter;
  /** Published lessons in this level, in order. */
  slugs: string[];
  completed: number;
  status: LevelStatus;
};

/**
 * Sequential levels. Level 1 is always open; Level N opens once every lesson
 * in Level N−1 is completed (its quiz finished, the existing completion
 * rule). A level where the student has already completed a lesson stays
 * open, so progress made before levels were locked is never taken away.
 */
export function levelAccess(published: Set<string>, completed: Set<string>): LevelAccess[] {
  let previousComplete = true;
  let currentFound = false;
  return CHAPTERS.map((chapter) => ({ chapter, slugs: chapter.lessonSlugs.filter((slug) => published.has(slug)) }))
    .filter((level) => level.slugs.length > 0)
    .map(({ chapter, slugs }) => {
      const done = slugs.filter((slug) => completed.has(slug)).length;
      const isComplete = done === slugs.length;
      const unlocked = previousComplete || done > 0;
      previousComplete = isComplete;
      let status: LevelStatus;
      if (isComplete) status = "completed";
      else if (!unlocked) status = "locked";
      else if (!currentFound) {
        status = "current";
        currentFound = true;
      } else status = "available";
      return { chapter, slugs, completed: done, status };
    });
}

/**
 * InvestSmart, the investing track. It sits beside the Money IQ path rather
 * than inside it, so its lessons never change the path's counts, readiness or
 * completion bonus. Its lessons open in order: the first is always open, each
 * next one once the one before is completed.
 */
export const INVEST_TRACK = ["inflation-purchasing-power", "how-stock-market-works", "index-funds-long-term", "start-investing-checklist"];

export const isInvestLesson = (slug: string) => INVEST_TRACK.includes(slug);

/** The Money IQ path's lesson slugs (Levels 1–4), in order. */
export const PATH_SLUGS = CHAPTERS.flatMap((chapter) => chapter.lessonSlugs);

function investUnlocked(slug: string, completed: Set<string>) {
  const i = INVEST_TRACK.indexOf(slug);
  return i === 0 || (i > 0 && completed.has(INVEST_TRACK[i - 1]));
}

/**
 * Whether a lesson is open. InvestSmart lessons follow their own order;
 * lessons outside every level and track open once all levels are done.
 */
export function isLessonUnlocked(slug: string, levels: LevelAccess[], completed: Set<string> = new Set()): boolean {
  if (isInvestLesson(slug)) return investUnlocked(slug, completed);
  const level = levels.find((l) => l.slugs.includes(slug));
  if (level) return level.status !== "locked";
  return levels.every((l) => l.status === "completed");
}
