// The college-to-first-salary journey: Level 1's 12 lessons in four chapters,
// each tied to a life stage. Kept free of Prisma imports so client
// components can use it too.

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
    lessonSlugs: ["fd-rd", "cibil-score", "credit-cards-101"],
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

// The chapter to start with, why, and (for a goal) the topic to put first in it.
type Focus = { chapterId: string; why: string; area?: string };

// A learning goal picks the chapter to start with; without one, the stage does.
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

/** The chapter to recommend first for this student, and why — or null to follow the journey in order. */
export function focusFor(stage: string | null, goal: string | null): (Focus & { chapter: Chapter }) | null {
  const focus = (goal && GOAL_FOCUS[goal]) || (stage && STAGE_FOCUS[stage]) || null;
  const chapter = focus && CHAPTERS.find((c) => c.id === focus.chapterId);
  return focus && chapter ? { ...focus, chapter } : null;
}

/**
 * Lesson slugs in the order to recommend them: the focus chapter first (with
 * the goal's own topic leading it), then the rest of the journey in order.
 * Lessons in no chapter (future lessons) go last, in their own order.
 */
export function recommendedOrder(
  lessons: { slug: string; area: string }[],
  stage: string | null,
  goal: string | null,
): string[] {
  const focus = focusFor(stage, goal);
  const chapters = focus ? [focus.chapter, ...CHAPTERS.filter((c) => c.id !== focus.chapterId)] : CHAPTERS;
  const known = new Set(lessons.map((l) => l.slug));
  const ordered = chapters.flatMap((chapter) => {
    const slugs = chapter.lessonSlugs.filter((slug) => known.has(slug));
    if (chapter.id !== focus?.chapterId || !focus.area) return slugs;
    const first = slugs.filter((slug) => lessons.find((l) => l.slug === slug)?.area === focus.area);
    return [...first, ...slugs.filter((slug) => !first.includes(slug))];
  });
  return [...ordered, ...lessons.map((l) => l.slug).filter((slug) => !ordered.includes(slug))];
}
