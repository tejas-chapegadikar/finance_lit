import type { Prisma, ReadinessArea } from "@prisma/client";
import type { LessonProgress } from "./progress";
import { LEVEL_1_NAME } from "./constants";
import { READINESS_AREA_META } from "./readiness-areas";

export type Badge = {
  id: string;
  icon: string;
  name: string;
  /** Earned by completing every lesson in this area — or all of Level 1 when null. */
  area: ReadinessArea | null;
};

export const BADGES: Badge[] = [
  { id: "budget-beginner", icon: "💰", name: "Budget Beginner", area: "BUDGETING" },
  { id: "scam-spotter", icon: "🛡️", name: "Scam Spotter", area: "DIGITAL_SAFETY" },
  { id: "banking-beginner", icon: "🏦", name: "Banking Beginner", area: "BANKING" },
  { id: "credit-ready", icon: "💳", name: "Credit Ready", area: "CREDIT" },
  { id: "tax-smart", icon: "🧾", name: "Tax Smart", area: "TAX" },
  { id: "financial-foundations", icon: "🎓", name: `${LEVEL_1_NAME} Graduate`, area: null },
];

export type BadgeProgress = Badge & {
  /** The eligibility rule, e.g. "Complete all 3 Budgeting lessons". */
  rule: string;
  earnedAt: Date | null;
  /** Required lessons completed so far, out of `required`. */
  done: number;
  required: number;
};

function requiredLessons<T extends { area: ReadinessArea }>(badge: Badge, lessons: T[]): T[] {
  return badge.area ? lessons.filter((lesson) => lesson.area === badge.area) : lessons;
}

function ruleFor(badge: Badge, required: number): string {
  if (!badge.area) return `Complete all ${required} Level 1 lessons`;
  const label = READINESS_AREA_META[badge.area].label;
  if (required === 1) return `Complete the ${label} lesson`;
  if (required === 2) return `Complete both ${label} lessons`;
  return `Complete all ${required} ${label} lessons`;
}

/**
 * Every badge with its rule, combining the badges the student has been
 * awarded (stored, so they're kept even if lessons are added later) with
 * live progress toward the rest.
 */
export function getBadges(
  lessons: LessonProgress[],
  earned: { badgeId: string; earnedAt: Date }[],
): BadgeProgress[] {
  const earnedAt = new Map(earned.map((badge) => [badge.badgeId, badge.earnedAt]));
  return BADGES.map((badge) => {
    const required = requiredLessons(badge, lessons);
    return {
      ...badge,
      rule: ruleFor(badge, required.length),
      earnedAt: earnedAt.get(badge.id) ?? null,
      done: required.filter((lesson) => lesson.status === "completed").length,
      required: required.length,
    };
  });
}

/**
 * Awards every badge whose lessons are now all completed and that the student
 * doesn't have yet. Runs inside the quiz-completion transaction, so the
 * just-finished attempt counts; `quizAttemptId` lets its completion screen
 * celebrate what it unlocked.
 */
export async function awardEarnedBadges(tx: Prisma.TransactionClient, userId: string, quizAttemptId: string) {
  const [lessons, completed] = await Promise.all([
    tx.lesson.findMany({ where: { isPublished: true }, select: { id: true, area: true } }),
    tx.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: { lessonId: true },
      distinct: ["lessonId"],
    }),
  ]);
  const completedIds = new Set(completed.map((attempt) => attempt.lessonId));

  const eligible = BADGES.filter((badge) => {
    const required = requiredLessons(badge, lessons);
    return required.length > 0 && required.every((lesson) => completedIds.has(lesson.id));
  });
  if (eligible.length === 0) return;

  // The (userId, badgeId) unique index keeps badges already earned untouched.
  await tx.userBadge.createMany({
    data: eligible.map((badge) => ({ userId, badgeId: badge.id, quizAttemptId })),
    skipDuplicates: true,
  });
}
