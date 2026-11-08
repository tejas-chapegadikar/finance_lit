// Learner ranks: named stages that reflect learning progress, never time
// spent or XP. Each needs a number of completed lessons; the top rank also
// needs a Financial Readiness score that shows the topics are mastered.
// Kept free of Prisma imports so client components can use it.

export type Rank = { id: string; name: string; icon: string; lessons: number; readiness?: number };

export const RANKS: Rank[] = [
  { id: "money-rookie", name: "Money Rookie", icon: "🌱", lessons: 0 },
  { id: "budget-boss", name: "Budget Boss", icon: "💼", lessons: 3 },
  { id: "credit-pro", name: "Credit Pro", icon: "💳", lessons: 6 },
  { id: "investing-explorer", name: "Investing Explorer", icon: "🧭", lessons: 9 },
  // "All lessons" is filled in from the live lesson count.
  { id: "money-master", name: "Money Master", icon: "👑", lessons: Infinity, readiness: 80 },
];

export type RankProgress = {
  current: Rank;
  next: Rank | null;
  /** What it takes to reach the next rank, in plain words. */
  toNext: string | null;
  /** 0-100 progress from the current rank toward the next. */
  percent: number;
};

/** The student's rank from completed lessons and readiness (0-100). */
export function rankFor(completedCount: number, readiness: number, totalLessons: number): RankProgress {
  const ranks = RANKS.map((rank) => (rank.lessons === Infinity ? { ...rank, lessons: totalLessons } : rank));
  const reached = (rank: Rank) => completedCount >= rank.lessons && readiness >= (rank.readiness ?? 0);
  const index = ranks.reduce((best, rank, i) => (reached(rank) ? i : best), 0);
  const current = ranks[index];
  const next = ranks[index + 1] ?? null;
  if (!next) return { current, next: null, toNext: null, percent: 100 };

  const lessonsLeft = Math.max(0, next.lessons - completedCount);
  const toNext =
    lessonsLeft > 0
      ? `Complete ${lessonsLeft} more ${lessonsLeft === 1 ? "lesson" : "lessons"} to reach ${next.name}`
      : `Raise your readiness to ${next.readiness} (now ${readiness}) to become ${next.name}. Retake lessons and clear your revision`;
  const span = next.lessons - current.lessons;
  const lessonPart = span > 0 ? (completedCount - current.lessons) / span : 1;
  const readinessPart = next.readiness ? Math.min(1, readiness / next.readiness) : 1;
  const percent = Math.round(Math.min(1, lessonsLeft > 0 ? lessonPart : readinessPart) * 100);
  return { current, next, toNext, percent };
}
