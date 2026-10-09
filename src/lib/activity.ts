import { db } from "./db";
import { istDay, istDayStart, shiftDay } from "./ist-date";
import { getBadges } from "./badges";
import { REWARDS, spendableXp } from "./rewards";
import type { LessonProgress } from "./progress";
import { READINESS_AREA_META } from "./readiness-areas";

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null;

export type WeeklySummary = {
  activeDays: number;
  lessonsCompleted: number;
  quizzes: number;
  /** Average quiz accuracy over the last 7 days, and the 7 before — null without quizzes. */
  quizAccuracy: number | null;
  previousQuizAccuracy: number | null;
  revisionCorrect: number;
  revisionTotal: number;
  challenges: number;
  scenarios: number;
  xpEarned: number;
};

/** The last 7 IST days (today included), with quiz accuracy compared to the 7 before. */
export async function getWeeklySummary(userId: string, today = istDay()): Promise<WeeklySummary> {
  const weekStart = istDayStart(shiftDay(today, -6));
  const previousStart = istDayStart(shiftDay(today, -13));

  const [attempts, challenges, revision, scenarios, xp] = await Promise.all([
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED", completedAt: { gte: previousStart } },
      select: { completedAt: true, mastery: true, xpAwarded: true },
    }),
    db.challengeAnswer.findMany({ where: { userId, answeredAt: { gte: weekStart } }, select: { answeredAt: true } }),
    db.revisionAnswer.findMany({ where: { userId, answeredAt: { gte: weekStart } }, select: { answeredAt: true, isCorrect: true } }),
    db.scenarioRun.findMany({ where: { userId, completedAt: { gte: weekStart } }, select: { completedAt: true } }),
    db.xPTransaction.aggregate({ where: { userId, createdAt: { gte: weekStart }, amount: { gt: 0 } }, _sum: { amount: true } }),
  ]);

  const thisWeek = attempts.filter((a) => a.completedAt && a.completedAt >= weekStart);
  const lastWeek = attempts.filter((a) => a.completedAt && a.completedAt < weekStart);
  const days = new Set(
    [
      ...thisWeek.map((a) => a.completedAt!),
      ...challenges.map((c) => c.answeredAt),
      ...revision.map((r) => r.answeredAt),
      ...scenarios.map((s) => s.completedAt),
    ].map((date) => istDay(date)),
  );

  return {
    activeDays: days.size,
    lessonsCompleted: thisWeek.filter((a) => (a.xpAwarded ?? 0) > 0).length,
    quizzes: thisWeek.length,
    quizAccuracy: average(thisWeek.map((a) => a.mastery ?? 0)),
    previousQuizAccuracy: average(lastWeek.map((a) => a.mastery ?? 0)),
    revisionCorrect: revision.filter((r) => r.isCorrect).length,
    revisionTotal: revision.length,
    challenges: challenges.length,
    scenarios: scenarios.length,
    xpEarned: xp._sum.amount ?? 0,
  };
}

/** Whether the student did a lesson quiz or a scenario today (IST). */
export async function learnedToday(userId: string, today = istDay()): Promise<boolean> {
  const since = istDayStart(today);
  const [quiz, scenario] = await Promise.all([
    db.quizAttempt.count({ where: { userId, status: "COMPLETED", completedAt: { gte: since } } }),
    db.scenarioRun.count({ where: { userId, completedAt: { gte: since } } }),
  ]);
  return quiz + scenario > 0;
}

export type Milestone = { icon: string; title: string; text: string; href: string };

/**
 * The closest milestone to aim for: the badge with the fewest lessons left,
 * or — once every badge is earned — the next reward XP can unlock.
 */
export function nextMilestone(
  lessons: LessonProgress[],
  earnedBadges: { badgeId: string; earnedAt: Date }[],
  user: { xpTotal: number; xpSpent: number },
  ownedRewards: string[],
): Milestone | null {
  const badge = getBadges(lessons, earnedBadges)
    .filter((b) => !b.earnedAt && b.required > b.done)
    .sort((a, b) => a.required - a.done - (b.required - b.done))[0];
  if (badge) {
    const left = badge.required - badge.done;
    const area = badge.area ? READINESS_AREA_META[badge.area].label : "Level 1";
    return {
      icon: badge.icon,
      title: `${badge.name} badge`,
      text: `Complete ${left} more ${area} ${left === 1 ? "lesson" : "lessons"} to earn it.`,
      href: "/lessons",
    };
  }

  const reward = REWARDS.filter((r) => !ownedRewards.includes(r.id)).sort((a, b) => a.cost - b.cost)[0];
  if (!reward) return null;
  const balance = spendableXp(user);
  return {
    icon: reward.icon,
    title: reward.name,
    text:
      balance >= reward.cost
        ? `You have enough XP to unlock it now (${reward.cost} XP).`
        : `Earn ${reward.cost - balance} more XP to unlock it in the Rewards Store.`,
    href: "/rewards",
  };
}
