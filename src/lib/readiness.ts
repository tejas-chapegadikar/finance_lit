import type { Lesson, ReadinessArea } from "@prisma/client";
import { db } from "./db";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "./readiness-areas";

type LessonSummary = Pick<
  Lesson,
  "id" | "slug" | "title" | "topic" | "area" | "description" | "estimatedMinutes" | "xpReward" | "order"
>;

export type AreaReadiness = {
  area: ReadinessArea;
  label: string;
  group: string;
  icon: string;
  score: number;
  lessonCount: number;
  completedCount: number;
};

export type NextStep = { lesson: LessonSummary; reason: string; isRetake: boolean };

export type Readiness = {
  overall: number;
  areas: AreaReadiness[];
  completedCount: number;
  totalLessons: number;
  /** Best mastery (0-100) per completed lesson id. */
  masteryByLesson: Map<string, number>;
  next: NextStep | null;
};

/** Best mastery (0-100) per lesson the student has completed at least once. */
export async function getBestMasteryByLesson(userId: string): Promise<Map<string, number>> {
  const attempts = await db.quizAttempt.findMany({
    where: { userId, status: "COMPLETED" },
    select: { lessonId: true, mastery: true },
  });

  const masteryByLesson = new Map<string, number>();
  for (const attempt of attempts) {
    const best = masteryByLesson.get(attempt.lessonId) ?? 0;
    masteryByLesson.set(attempt.lessonId, Math.max(best, attempt.mastery ?? 0));
  }
  return masteryByLesson;
}

/**
 * Rule-based Financial Readiness: a lesson's mastery is the student's best
 * completed attempt, an area's score is the average mastery across its
 * lessons (unfinished ones count as 0), and the overall score weights the six
 * areas equally.
 */
export async function getReadiness(userId: string): Promise<Readiness> {
  const [lessons, masteryByLesson] = await Promise.all([
    db.lesson.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        topic: true,
        area: true,
        description: true,
        estimatedMinutes: true,
        xpReward: true,
        order: true,
      },
    }),
    getBestMasteryByLesson(userId),
  ]);

  const areas: AreaReadiness[] = [];
  for (const area of READINESS_AREA_VALUES) {
    const areaLessons = lessons.filter((lesson) => lesson.area === area);
    if (areaLessons.length === 0) continue;
    const total = areaLessons.reduce((sum, lesson) => sum + (masteryByLesson.get(lesson.id) ?? 0), 0);
    const { label, group, icon } = READINESS_AREA_META[area];
    areas.push({
      area,
      label,
      group,
      icon,
      score: Math.round(total / areaLessons.length),
      lessonCount: areaLessons.length,
      completedCount: areaLessons.filter((lesson) => masteryByLesson.has(lesson.id)).length,
    });
  }

  const overall = areas.length
    ? Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length)
    : 0;

  return {
    overall,
    areas,
    completedCount: lessons.filter((lesson) => masteryByLesson.has(lesson.id)).length,
    totalLessons: lessons.length,
    masteryByLesson,
    next: recommendNext(lessons, masteryByLesson, areas),
  };
}

function recommendNext(
  lessons: LessonSummary[],
  masteryByLesson: Map<string, number>,
  areas: AreaReadiness[],
): NextStep | null {
  const areaScore = new Map(areas.map((area) => [area.area, area.score]));
  const byWeakestArea = (a: LessonSummary, b: LessonSummary) =>
    (areaScore.get(a.area) ?? 0) - (areaScore.get(b.area) ?? 0) || a.order - b.order;

  const notStarted = lessons.filter((lesson) => !masteryByLesson.has(lesson.id));
  if (notStarted.length === lessons.length && lessons.length > 0) {
    return { lesson: lessons[0], reason: "Start here — the foundation for everything else", isRetake: false };
  }
  if (notStarted.length > 0) {
    const lesson = [...notStarted].sort(byWeakestArea)[0];
    const score = areaScore.get(lesson.area) ?? 0;
    const label = READINESS_AREA_META[lesson.area].label;
    return {
      lesson,
      reason: score === 0 ? `New area for you: ${label}` : `Your weakest area: ${label} (${score}/100)`,
      isRetake: false,
    };
  }

  const toImprove = lessons
    .filter((lesson) => (masteryByLesson.get(lesson.id) ?? 0) < 100)
    .sort((a, b) => (masteryByLesson.get(a.id) ?? 0) - (masteryByLesson.get(b.id) ?? 0) || a.order - b.order);
  if (toImprove.length > 0) {
    const lesson = toImprove[0];
    return {
      lesson,
      reason: `Retake to raise your ${READINESS_AREA_META[lesson.area].label} score`,
      isRetake: true,
    };
  }

  return null;
}
