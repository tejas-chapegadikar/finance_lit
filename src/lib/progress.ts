import { cache } from "react";
import type { Lesson, ReadinessArea, Role } from "@prisma/client";
import { db } from "./db";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "./readiness-areas";

export type LessonSummary = Pick<
  Lesson,
  "id" | "slug" | "title" | "icon" | "area" | "description" | "estimatedMinutes" | "xpReward" | "order"
>;

export type LessonStatus = "completed" | "continue" | "locked";

export type LessonProgress = LessonSummary & {
  /** 1-based position in Level 1 — the 01–12 numbers in the library. */
  number: number;
  status: LessonStatus;
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
};

export type NextStep = { lesson: LessonProgress; reason: string; isRetake: boolean };

export type Progress = {
  lessons: LessonProgress[];
  areas: AreaReadiness[];
  /** Financial Readiness, 0-100. */
  overall: number;
  completedCount: number;
  totalLessons: number;
  levelComplete: boolean;
  /** What the dashboard's Continue Learning card points at; null once there's nothing left to do. */
  next: NextStep | null;
  /** A finished lesson worth retaking, suggested alongside `next`. */
  brushUp: LessonProgress | null;
};

// A lesson's readiness score: 80% from the student's best quiz result and 20%
// from getting the "What would you do?" scenario right on their first answer.
const QUIZ_WEIGHT = 0.8;
const SCENARIO_WEIGHT = 0.2;
// Finished lessons scoring below this get suggested for a retake.
export const WEAK_LESSON_SCORE = 60;

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

/**
 * Everything the dashboard, library and profile show about a student's
 * progress, computed from their quiz attempts and scenario answers (nothing
 * here is stored). Lessons unlock in order: the first is always open, and
 * each one after it opens once the one before it is finished.
 */
export async function fetchProgress(userId: string): Promise<Progress> {
  const [lessons, attempts, scenarioAnswers] = await Promise.all([
    db.lesson.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: lessonSummarySelect,
    }),
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: { lessonId: true, mastery: true, completedAt: true },
    }),
    db.scenarioAnswer.findMany({ where: { userId }, select: { lessonId: true, isCorrect: true } }),
  ]);

  const bestMastery = new Map<string, number>();
  const firstCompletedAt = new Map<string, Date>();
  for (const attempt of attempts) {
    bestMastery.set(attempt.lessonId, Math.max(bestMastery.get(attempt.lessonId) ?? 0, attempt.mastery ?? 0));
    const first = firstCompletedAt.get(attempt.lessonId);
    if (attempt.completedAt && (!first || attempt.completedAt < first)) {
      firstCompletedAt.set(attempt.lessonId, attempt.completedAt);
    }
  }
  const scenarioCorrect = new Set(scenarioAnswers.filter((a) => a.isCorrect).map((a) => a.lessonId));

  let previousCompleted = true;
  const lessonProgress = lessons.map((lesson, i): LessonProgress => {
    const completed = bestMastery.has(lesson.id);
    const status: LessonStatus = completed ? "completed" : previousCompleted ? "continue" : "locked";
    previousCompleted = completed;
    return {
      ...lesson,
      number: i + 1,
      status,
      score: Math.round(
        QUIZ_WEIGHT * (bestMastery.get(lesson.id) ?? 0) + SCENARIO_WEIGHT * (scenarioCorrect.has(lesson.id) ? 100 : 0),
      ),
      firstCompletedAt: firstCompletedAt.get(lesson.id) ?? null,
    };
  });

  const areas = READINESS_AREA_VALUES.flatMap((area): AreaReadiness[] => {
    const inArea = lessonProgress.filter((lesson) => lesson.area === area);
    if (inArea.length === 0) return [];
    const { label, icon } = READINESS_AREA_META[area];
    return [
      {
        area,
        label,
        icon,
        score: Math.round(inArea.reduce((sum, lesson) => sum + lesson.score, 0) / inArea.length),
        lessonCount: inArea.length,
        completedCount: inArea.filter((lesson) => lesson.status === "completed").length,
      },
    ];
  });

  const completedCount = lessonProgress.filter((lesson) => lesson.status === "completed").length;
  const upNext = lessonProgress.find((lesson) => lesson.status === "continue") ?? null;
  const weakest = weakestFinishedLesson(lessonProgress);

  return {
    lessons: lessonProgress,
    areas,
    // Areas weigh equally, so being ready across all six matters more than
    // acing one.
    overall: areas.length ? Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length) : 0,
    completedCount,
    totalLessons: lessonProgress.length,
    levelComplete: lessonProgress.length > 0 && completedCount === lessonProgress.length,
    next: recommendNext(upNext, weakest, completedCount),
    brushUp: upNext ? weakest : null,
  };
}

/** Per-request cached progress for pages; actions call fetchProgress directly. */
export const getProgress = cache(fetchProgress);

function weakestFinishedLesson(lessons: LessonProgress[]): LessonProgress | null {
  return (
    lessons
      .filter((lesson) => lesson.status === "completed" && lesson.score < WEAK_LESSON_SCORE)
      .sort((a, b) => a.score - b.score || a.number - b.number)[0] ?? null
  );
}

// Students never have to decide what to learn next: it's the next lesson in
// order, then — once everything is done — a retake of their weakest lesson.
function recommendNext(
  upNext: LessonProgress | null,
  weakest: LessonProgress | null,
  completedCount: number,
): NextStep | null {
  if (upNext) {
    return {
      lesson: upNext,
      isRetake: false,
      reason: completedCount === 0 ? "Start here — the foundation for everything else" : "Next up in Level 1",
    };
  }
  if (weakest) {
    return {
      lesson: weakest,
      isRetake: true,
      reason: `You scored ${weakest.score}/100 here — a retake will lift your ${READINESS_AREA_META[weakest.area].label} readiness`,
    };
  }
  return null;
}

/** Admins can open any lesson to review content; students follow the unlock order. */
export function canOpenLesson(lesson: LessonProgress, role: Role): boolean {
  return lesson.status !== "locked" || role === "ADMIN";
}
