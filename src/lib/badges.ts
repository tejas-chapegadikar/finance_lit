import type { Prisma, ReadinessArea } from "@prisma/client";
import { PATH_SLUGS } from "./journey";
import type { LessonProgress } from "./progress";
import { PATH_NAME, QUESTIONS_PER_QUIZ } from "./constants";
import { READINESS_AREA_META } from "./readiness-areas";
import { CORE_SCENARIOS } from "./scenarios";
import { findChallenge } from "./challenges/content";
import { queueAvatarEvents } from "./avatar/queue";
import { AVATAR_ITEMS } from "./avatar";

// Achievement badges: each has one clear rule, and once earned it's stored
// for good (UserBadge), even if lessons are added later.

export type BadgeRule =
  | { kind: "lessons"; count: number }
  | { kind: "area"; area: ReadinessArea }
  | { kind: "level" }
  | { kind: "perfect-quizzes"; count: number }
  | { kind: "streak"; days: number }
  | { kind: "scenarios"; count: number }
  | { kind: "retained"; count: number }
  | { kind: "money-logs"; count: number }
  | { kind: "checkins"; count: number }
  | { kind: "goals"; count: number }
  | { kind: "challenge"; which: "habit" | "saving" };

export type Badge = { id: string; icon: string; name: string; rule: BadgeRule };

// Names celebrate what was achieved. Ids are permanent (stored in UserBadge),
// so a badge can be renamed without anyone losing it.
export const BADGES: Badge[] = [
  { id: "first-lesson", icon: "🌱", name: "First Steps", rule: { kind: "lessons", count: 1 } },
  { id: "budget-beginner", icon: "💰", name: "Budget Pro", rule: { kind: "area", area: "BUDGETING" } },
  { id: "scam-spotter", icon: "🛡️", name: "Scam Spotter", rule: { kind: "area", area: "DIGITAL_SAFETY" } },
  { id: "banking-beginner", icon: "🏦", name: "Banking Ace", rule: { kind: "area", area: "BANKING" } },
  { id: "credit-ready", icon: "💳", name: "Credit Savvy", rule: { kind: "area", area: "CREDIT" } },
  { id: "tax-smart", icon: "🧾", name: "Tax Smart", rule: { kind: "area", area: "TAX" } },
  { id: "quiz-champion", icon: "🏆", name: "Quiz Champion", rule: { kind: "perfect-quizzes", count: 3 } },
  { id: "seven-day-learner", icon: "🔥", name: "Consistency Champion", rule: { kind: "streak", days: 7 } },
  { id: "thirty-day-learner", icon: "🌟", name: "Habit Hero", rule: { kind: "streak", days: 30 } },
  { id: "scenario-solver", icon: "🧭", name: "Scenario Solver", rule: { kind: "scenarios", count: CORE_SCENARIOS.length } },
  { id: "memory-master", icon: "🧠", name: "Memory Master", rule: { kind: "retained", count: 10 } },
  { id: "financial-foundations", icon: "🎓", name: `${PATH_NAME} Graduate`, rule: { kind: "level" } },
  // Money habits, earned in Money Manager and Practice.
  { id: "money-tracker", icon: "📒", name: "Money Tracker", rule: { kind: "money-logs", count: 10 } },
  { id: "reality-checker", icon: "🔎", name: "Reality Checker", rule: { kind: "checkins", count: 7 } },
  { id: "goal-getter", icon: "🎯", name: "Goal Getter", rule: { kind: "goals", count: 1 } },
  { id: "habit-builder", icon: "🗓️", name: "Habit Builder", rule: { kind: "challenge", which: "habit" } },
  { id: "challenge-accepted", icon: "🏁", name: "Challenge Accepted", rule: { kind: "challenge", which: "saving" } },
];

export function findBadge(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

/** Everything the rules look at. */
export type BadgeStats = {
  lessons: Pick<LessonProgress, "area" | "status">[];
  perfectQuizzes: number;
  longestStreak: number;
  coreScenarios: number;
  retained: number;
  moneyLogs: number;
  checkIns: number;
  /** Savings goals of ₹500+ reached. */
  goalsReached: number;
  habitDone: number;
  savingDone: number;
};

/** Only goals at least this big count toward Goal Getter, a ₹1 goal isn't a goal. */
export const GOAL_BADGE_MIN = 500;

export type BadgeProgress = Badge & {
  /** The eligibility rule, e.g. "Complete all 3 Budgeting lessons". */
  ruleText: string;
  earnedAt: Date | null;
  /** Progress toward the rule, out of `required`. */
  done: number;
  required: number;
};

function progressFor(rule: BadgeRule, stats: BadgeStats): { done: number; required: number } {
  const completed = (lessons: BadgeStats["lessons"]) => lessons.filter((l) => l.status === "completed").length;
  switch (rule.kind) {
    case "lessons":
      return { done: Math.min(completed(stats.lessons), rule.count), required: rule.count };
    case "area": {
      const inArea = stats.lessons.filter((l) => l.area === rule.area);
      return { done: completed(inArea), required: inArea.length };
    }
    case "level":
      return { done: completed(stats.lessons), required: stats.lessons.length };
    case "perfect-quizzes":
      return { done: Math.min(stats.perfectQuizzes, rule.count), required: rule.count };
    case "streak":
      return { done: Math.min(stats.longestStreak, rule.days), required: rule.days };
    case "scenarios":
      return { done: Math.min(stats.coreScenarios, rule.count), required: rule.count };
    case "retained":
      return { done: Math.min(stats.retained, rule.count), required: rule.count };
    case "money-logs":
      return { done: Math.min(stats.moneyLogs, rule.count), required: rule.count };
    case "checkins":
      return { done: Math.min(stats.checkIns, rule.count), required: rule.count };
    case "goals":
      return { done: Math.min(stats.goalsReached, rule.count), required: rule.count };
    case "challenge":
      return { done: Math.min(rule.which === "habit" ? stats.habitDone : stats.savingDone, 1), required: 1 };
  }
}

function ruleText(rule: BadgeRule, required: number): string {
  switch (rule.kind) {
    case "lessons":
      return required === 1 ? "Complete your first lesson" : `Complete ${required} lessons`;
    case "area": {
      const label = READINESS_AREA_META[rule.area].label;
      if (required === 1) return `Complete the ${label} lesson`;
      if (required === 2) return `Complete both ${label} lessons`;
      return `Complete all ${required} ${label} lessons`;
    }
    case "level":
      return `Complete all ${required} ${PATH_NAME} lessons`;
    case "perfect-quizzes":
      return `Get every question right first try in ${required} quizzes`;
    case "streak":
      return `Reach a ${required}-day learning streak`;
    case "scenarios":
      return `Finish all ${required} money scenarios`;
    case "retained":
      return `Lock in ${required} questions through revision`;
    case "money-logs":
      return `Log ${required} entries in Money Manager`;
    case "checkins":
      return `Check in on your money on ${required} days`;
    case "goals":
      return `Reach a savings goal of ₹${GOAL_BADGE_MIN} or more`;
    case "challenge":
      return rule.which === "habit" ? "Finish the 30-day money habit challenge" : "Finish a saving challenge";
  }
}

/** Every badge with its rule and progress, plus when it was earned. */
export function getBadges(stats: BadgeStats, earned: { badgeId: string; earnedAt: Date }[]): BadgeProgress[] {
  const earnedAt = new Map(earned.map((badge) => [badge.badgeId, badge.earnedAt]));
  return BADGES.map((badge) => {
    const { done, required } = progressFor(badge.rule, stats);
    return { ...badge, ruleText: ruleText(badge.rule, required), earnedAt: earnedAt.get(badge.id) ?? null, done, required };
  });
}

// Every question right on the first try.
const PERFECT_QUIZ = { status: "COMPLETED", score: { gte: QUESTIONS_PER_QUIZ } } satisfies Prisma.QuizAttemptWhereInput;

/** The numbers badge rules need, for pages that show progress toward them. */
export async function loadBadgeStats(
  db: Prisma.TransactionClient,
  userId: string,
  lessons: BadgeStats["lessons"],
): Promise<BadgeStats> {
  const [perfectQuizzes, user, runs, retained, money] = await Promise.all([
    db.quizAttempt.count({ where: { userId, ...PERFECT_QUIZ } }),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { longestStreak: true } }),
    db.scenarioRun.findMany({ where: { userId }, select: { scenarioSlug: true }, distinct: ["scenarioSlug"] }),
    db.revisionItem.count({ where: { userId, status: "DONE" } }),
    loadMoneyStats(db, userId),
  ]);
  const core = new Set(CORE_SCENARIOS.map((s) => s.slug));
  return {
    lessons,
    perfectQuizzes,
    longestStreak: user.longestStreak,
    coreScenarios: runs.filter((r) => core.has(r.scenarioSlug)).length,
    retained,
    ...money,
  };
}

async function loadMoneyStats(db: Prisma.TransactionClient, userId: string) {
  const [moneyLogs, checkIns, goalsReached, finished] = await Promise.all([
    db.moneyEntry.count({ where: { userId } }),
    db.moneyCheckIn.count({ where: { userId } }),
    db.savingsGoal.count({ where: { userId, completedAt: { not: null }, target: { gte: GOAL_BADGE_MIN } } }),
    db.challengeEnrollment.findMany({ where: { userId, completedAt: { not: null } }, select: { challengeId: true } }),
  ]);
  const kinds = finished.map((e) => findChallenge(e.challengeId)?.kind);
  return {
    moneyLogs,
    checkIns,
    goalsReached,
    habitDone: kinds.filter((k) => k === "habit").length,
    savingDone: kinds.filter((k) => k === "saving").length,
  };
}

/** Stores the badges in `ids` the student doesn't have yet; returns the new ones. */
async function grant(tx: Prisma.TransactionClient, userId: string, ids: string[], quizAttemptId?: string) {
  if (ids.length === 0) return [];
  const owned = await tx.userBadge.findMany({ where: { userId, badgeId: { in: ids } }, select: { badgeId: true } });
  const fresh = ids.filter((id) => !owned.some((o) => o.badgeId === id));
  if (fresh.length === 0) return [];
  await tx.userBadge.createMany({
    data: fresh.map((badgeId) => ({ userId, badgeId, quizAttemptId })),
    skipDuplicates: true,
  });
  await queueAvatarEvents(
    tx,
    userId,
    fresh.map((badgeId) => {
      const item = AVATAR_ITEMS.find((i) => i.unlock.type === "badge" && i.unlock.badgeId === badgeId);
      return { kind: "badge" as const, key: `badge:${badgeId}`, data: { badge: findBadge(badgeId)?.name ?? badgeId, item: item?.name } };
    }),
  );
  return fresh;
}

const ofKind = <K extends BadgeRule["kind"]>(kind: K) =>
  BADGES.filter((b): b is Badge & { rule: Extract<BadgeRule, { kind: K }> } => b.rule.kind === kind);

/**
 * After a quiz is completed (inside its transaction): lesson, area, path
 * and Quiz Champion badges. `quizAttemptId` lets the completion screen
 * celebrate what it unlocked.
 */
export async function awardLessonBadges(tx: Prisma.TransactionClient, userId: string, quizAttemptId: string) {
  const [lessons, completed, perfect] = await Promise.all([
    tx.lesson.findMany({ where: { isPublished: true, slug: { in: PATH_SLUGS } }, select: { id: true, area: true } }),
    tx.quizAttempt.findMany({ where: { userId, status: "COMPLETED" }, select: { lessonId: true }, distinct: ["lessonId"] }),
    tx.quizAttempt.count({ where: { userId, ...PERFECT_QUIZ } }),
  ]);
  const done = new Set(completed.map((a) => a.lessonId));
  const stats: BadgeStats = {
    lessons: lessons.map((l) => ({ area: l.area, status: done.has(l.id) ? "completed" : "not-started" })),
    perfectQuizzes: perfect,
    longestStreak: 0,
    coreScenarios: 0,
    retained: 0,
    moneyLogs: 0,
    checkIns: 0,
    goalsReached: 0,
    habitDone: 0,
    savingDone: 0,
  };
  const eligible = BADGES.filter((badge) => {
    if (!["lessons", "area", "level", "perfect-quizzes"].includes(badge.rule.kind)) return false;
    const { done: d, required } = progressFor(badge.rule, stats);
    return required > 0 && d >= required;
  });
  return grant(tx, userId, eligible.map((b) => b.id), quizAttemptId);
}

/** When the streak grows: Consistency Champion (7 days) and Habit Hero (30). */
export async function awardStreakBadges(tx: Prisma.TransactionClient, userId: string, longestStreak: number) {
  return grant(tx, userId, ofKind("streak").filter((b) => longestStreak >= b.rule.days).map((b) => b.id));
}

/** After a scenario run: Scenario Solver once every core scenario is done. */
export async function awardScenarioBadges(tx: Prisma.TransactionClient, userId: string) {
  const runs = await tx.scenarioRun.findMany({ where: { userId }, select: { scenarioSlug: true }, distinct: ["scenarioSlug"] });
  const core = new Set(CORE_SCENARIOS.map((s) => s.slug));
  const count = runs.filter((r) => core.has(r.scenarioSlug)).length;
  return grant(tx, userId, ofKind("scenarios").filter((b) => count >= b.rule.count).map((b) => b.id));
}

/** When a revision item is retired: Memory Master. */
export async function awardRevisionBadges(tx: Prisma.TransactionClient, userId: string) {
  const retained = await tx.revisionItem.count({ where: { userId, status: "DONE" } });
  return grant(tx, userId, ofKind("retained").filter((b) => retained >= b.rule.count).map((b) => b.id));
}

/** After Money Manager activity or a finished challenge: the money-habit badges. */
export async function awardMoneyBadges(tx: Prisma.TransactionClient, userId: string) {
  const money = await loadMoneyStats(tx, userId);
  const stats = { lessons: [], perfectQuizzes: 0, longestStreak: 0, coreScenarios: 0, retained: 0, ...money } satisfies BadgeStats;
  const eligible = BADGES.filter((badge) => {
    if (!["money-logs", "checkins", "goals", "challenge"].includes(badge.rule.kind)) return false;
    const { done, required } = progressFor(badge.rule, stats);
    return required > 0 && done >= required;
  });
  return grant(tx, userId, eligible.map((b) => b.id));
}
