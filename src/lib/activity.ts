import { db } from "./db";
import { istDay, istDayStart, shiftDay } from "./ist-date";

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null;

export type WeeklySummary = {
  activeDays: number;
  lessonsCompleted: number;
  quizzes: number;
  /** Average quiz accuracy over the last 7 days, and the 7 before, null without quizzes. */
  quizAccuracy: number | null;
  previousQuizAccuracy: number | null;
  revisionCorrect: number;
  revisionTotal: number;
  /** Questions of the Day answered plus Daily Challenges finished. */
  daily: number;
  scenarios: number;
  xpEarned: number;
};

/** The last 7 IST days (today included), with quiz accuracy compared to the 7 before. */
export async function getWeeklySummary(userId: string, today = istDay()): Promise<WeeklySummary> {
  const weekStart = istDayStart(shiftDay(today, -6));
  const previousStart = istDayStart(shiftDay(today, -13));

  const [attempts, activeDays, revision, daily, scenarios, xp] = await Promise.all([
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED", completedAt: { gte: previousStart } },
      select: { completedAt: true, mastery: true, xpAwarded: true },
    }),
    db.activityDay.count({ where: { userId, frozen: false, day: { gte: shiftDay(today, -6) } } }),
    db.revisionAnswer.findMany({ where: { userId, answeredAt: { gte: weekStart } }, select: { isCorrect: true } }),
    Promise.all([
      db.dailyQuestionAnswer.count({ where: { userId, answeredAt: { gte: weekStart } } }),
      db.dailyChallengeRun.count({ where: { userId, completedAt: { gte: weekStart } } }),
    ]),
    db.scenarioRun.count({ where: { userId, completedAt: { gte: weekStart } } }),
    db.xPTransaction.aggregate({ where: { userId, createdAt: { gte: weekStart }, amount: { gt: 0 } }, _sum: { amount: true } }),
  ]);

  const thisWeek = attempts.filter((a) => a.completedAt && a.completedAt >= weekStart);
  const lastWeek = attempts.filter((a) => a.completedAt && a.completedAt < weekStart);

  return {
    activeDays,
    lessonsCompleted: thisWeek.filter((a) => (a.xpAwarded ?? 0) > 0).length,
    quizzes: thisWeek.length,
    quizAccuracy: average(thisWeek.map((a) => a.mastery ?? 0)),
    previousQuizAccuracy: average(lastWeek.map((a) => a.mastery ?? 0)),
    revisionCorrect: revision.filter((r) => r.isCorrect).length,
    revisionTotal: revision.length,
    daily: daily[0] + daily[1],
    scenarios,
    xpEarned: xp._sum.amount ?? 0,
  };
}

export type TodaysWins = {
  /** Streak milestones reached today, e.g. [{ days: 7, xp: 50 }]. */
  milestones: { description: string; xp: number }[];
  /** Missed days a streak freeze covered when the student came back today. */
  frozenDays: number;
};

/** Things worth celebrating that happened today, outside a results screen. */
export async function getTodaysWins(userId: string, today = istDay()): Promise<TodaysWins> {
  const since = istDayStart(today);
  const [milestones, frozenDays] = await Promise.all([
    db.xPTransaction.findMany({
      where: { userId, type: "STREAK_BONUS", createdAt: { gte: since } },
      select: { description: true, amount: true },
    }),
    db.activityDay.count({ where: { userId, frozen: true, createdAt: { gte: since } } }),
  ]);
  return { milestones: milestones.map((m) => ({ description: m.description ?? "Streak milestone", xp: m.amount })), frozenDays };
}
