import { cache } from "react";
import type { Lesson, ReadinessArea } from "@prisma/client";
import { db } from "./db";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "./readiness-areas";
import { chapterOf, focusFor, recommendedOrder } from "./journey";

export type LessonSummary = Pick<
  Lesson,
  "id" | "slug" | "title" | "icon" | "area" | "description" | "estimatedMinutes" | "xpReward" | "order"
>;

/** Not started → In progress (opened, or a quiz begun) → Completed (finished the quiz). */
export type LessonStatus = "not-started" | "in-progress" | "completed";

export type LessonProgress = LessonSummary & {
  /** 1-based position in Level 1 — the 01–12 numbers in the library. */
  number: number;
  status: LessonStatus;
  /** Quiz accuracy (0-100) on the student's best attempt; null until completed. */
  quizScore: number | null;
  /** 0-100: this lesson's contribution to Financial Readiness. */
  score: number;
  /** When the student first finished this lesson's quiz, if ever. */
  firstCompletedAt: Date | null;
};

export type AreaReadiness = {
  area: ReadinessArea;
  label: string;
  icon: string;
  score: number;
  lessonCount: number;
  completedCount: number;
  /** Average quiz accuracy over the area's completed lessons; null before any. */
  quizAccuracy: number | null;
};

export type NextStep = { lesson: LessonProgress; reason: string; isRetake: boolean };

/** An area whose quiz answers suggest the student hasn't got it yet. */
export type ReviewSuggestion = { area: AreaReadiness; lesson: LessonProgress };

export type Progress = {
  lessons: LessonProgress[];
  areas: AreaReadiness[];
  /** Financial Readiness, 0-100. */
  overall: number;
  completedCount: number;
  totalLessons: number;
  levelComplete: boolean;
  /** What the Continue Learning card points at; null once there's nothing left to do. */
  next: NextStep | null;
  /** The weakest area to revisit, when the student's quiz accuracy there is low. */
  review: ReviewSuggestion | null;
};

// Financial Readiness — the same rule for every student, so scores compare:
// a completed lesson earns COMPLETION_POINTS for finishing it plus up to
// QUIZ_POINTS for quiz accuracy on the best attempt (answers solved after a
// Coach hint count half). Unfinished lessons earn nothing, every lesson counts
// equally toward the overall score, and each area averages its own lessons.
export const COMPLETION_POINTS = 30;
export const QUIZ_POINTS = 70;
// Below this quiz accuracy, an area (or a lesson) is suggested for review.
export const WEAK_ACCURACY = 60;

const lessonSummarySelect = {
  id: true,
  slug: true,
  title: true,
  icon: true,
  area: true,
  description: true,
  estimatedMinutes: true,
  xpReward: true,
  order: true,
} as const;

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const lessonScore = (quizScore: number | null) =>
  quizScore === null ? 0 : Math.round(COMPLETION_POINTS + (QUIZ_POINTS * quizScore) / 100);

/**
 * Everything the dashboard, library and profile show about a student's
 * progress, computed from their lesson views and quiz attempts (nothing here
 * is stored). Every lesson is open; the next one is recommended along the
 * college-to-first-salary journey, starting from the chapter that fits the
 * student's goal or stage.
 */
export async function fetchProgress(userId: string): Promise<Progress> {
  const [student, lessons, attempts, views] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { stage: true, goal: true } }),
    db.lesson.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: lessonSummarySelect,
    }),
    db.quizAttempt.findMany({
      where: { userId },
      select: { lessonId: true, status: true, mastery: true, completedAt: true },
    }),
    db.lessonView.findMany({ where: { userId }, select: { lessonId: true } }),
  ]);

  const started = new Set([...views.map((v) => v.lessonId), ...attempts.map((a) => a.lessonId)]);
  const bestMastery = new Map<string, number>();
  const firstCompletedAt = new Map<string, Date>();
  for (const attempt of attempts) {
    if (attempt.status !== "COMPLETED") continue;
    bestMastery.set(attempt.lessonId, Math.max(bestMastery.get(attempt.lessonId) ?? 0, attempt.mastery ?? 0));
    const first = firstCompletedAt.get(attempt.lessonId);
    if (attempt.completedAt && (!first || attempt.completedAt < first)) {
      firstCompletedAt.set(attempt.lessonId, attempt.completedAt);
    }
  }

  const lessonProgress = lessons.map((lesson, i): LessonProgress => {
    const quizScore = bestMastery.get(lesson.id) ?? null;
    return {
      ...lesson,
      number: i + 1,
      status: quizScore !== null ? "completed" : started.has(lesson.id) ? "in-progress" : "not-started",
      quizScore,
      score: lessonScore(quizScore),
      firstCompletedAt: firstCompletedAt.get(lesson.id) ?? null,
    };
  });

  const areas = READINESS_AREA_VALUES.flatMap((area): AreaReadiness[] => {
    const inArea = lessonProgress.filter((lesson) => lesson.area === area);
    if (inArea.length === 0) return [];
    const scores = inArea.flatMap((lesson) => (lesson.quizScore === null ? [] : [lesson.quizScore]));
    const { label, icon } = READINESS_AREA_META[area];
    return [
      {
        area,
        label,
        icon,
        score: average(inArea.map((lesson) => lesson.score)),
        lessonCount: inArea.length,
        completedCount: scores.length,
        quizAccuracy: scores.length ? average(scores) : null,
      },
    ];
  });

  const completedCount = lessonProgress.filter((lesson) => lesson.status === "completed").length;
  // An unfinished lesson the student already started comes first; then the
  // journey, from the chapter that fits their goal or stage.
  const order = recommendedOrder(
    lessonProgress.map((lesson) => ({ slug: lesson.slug, area: lesson.area })),
    student?.stage ?? null,
    student?.goal ?? null,
  );
  const unfinished = order
    .map((slug) => lessonProgress.find((lesson) => lesson.slug === slug)!)
    .filter((lesson) => lesson.status !== "completed");
  const upNext = unfinished.find((lesson) => lesson.status === "in-progress") ?? unfinished[0] ?? null;
  const focus = focusFor(student?.stage ?? null, student?.goal ?? null);
  const review = weakestArea(areas, lessonProgress);

  return {
    lessons: lessonProgress,
    areas,
    overall: average(lessonProgress.map((lesson) => lesson.score)),
    completedCount,
    totalLessons: lessonProgress.length,
    levelComplete: lessonProgress.length > 0 && completedCount === lessonProgress.length,
    next: recommendNext(upNext, review, completedCount, focus),
    review,
  };
}

/** Per-request cached progress for pages; actions call fetchProgress directly. */
export const getProgress = cache(fetchProgress);

/**
 * Financial Readiness once a quiz finished with `mastery` counts — the
 * lesson's best attempt wins. Lets the completion screen's "before → after"
 * be saved together with the attempt itself.
 */
export function readinessAfterQuiz(progress: Progress, lessonId: string, mastery: number): number {
  return average(
    progress.lessons.map((lesson) =>
      lesson.id === lessonId ? lessonScore(Math.max(lesson.quizScore ?? 0, mastery)) : lesson.score,
    ),
  );
}

// "Struggling with credit questions → review credit": the area with the
// lowest quiz accuracy below WEAK_ACCURACY, and its weakest completed lesson.
function weakestArea(areas: AreaReadiness[], lessons: LessonProgress[]): ReviewSuggestion | null {
  const area = areas
    .filter((a) => a.quizAccuracy !== null && a.quizAccuracy < WEAK_ACCURACY)
    .sort((a, b) => (a.quizAccuracy ?? 0) - (b.quizAccuracy ?? 0))[0];
  if (!area) return null;
  const lesson = lessons
    .filter((l) => l.area === area.area && l.quizScore !== null)
    .sort((a, b) => (a.quizScore ?? 0) - (b.quizScore ?? 0) || a.number - b.number)[0];
  return lesson ? { area, lesson } : null;
}

// Students never have to decide what to learn next: it's the next lesson in
// their journey (their focus chapter first, with the reason), then — once
// everything is done — a review of their weakest area.
function recommendNext(
  upNext: LessonProgress | null,
  review: ReviewSuggestion | null,
  completedCount: number,
  focus: ReturnType<typeof focusFor>,
): NextStep | null {
  if (upNext) {
    const chapter = chapterOf(upNext.slug);
    const reason =
      upNext.status === "in-progress"
        ? "You've started this one — pick up where you left off"
        : focus && chapter?.id === focus.chapter.id
          ? `Recommended because ${focus.why}`
          : completedCount === 0
            ? "Start here — the foundation for everything else"
            : `Next in your journey${chapter ? ` · Chapter ${chapter.number}: ${chapter.title}` : ""}`;
    return { lesson: upNext, isRetake: false, reason };
  }
  if (review) {
    return {
      lesson: review.lesson,
      isRetake: true,
      reason: `You've answered ${review.area.quizAccuracy}% of ${review.area.label} questions correctly — a retake will strengthen it`,
    };
  }
  return null;
}
