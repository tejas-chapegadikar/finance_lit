import type { Prisma, XPTransactionType } from "@prisma/client";
import { PATH_SLUGS } from "./journey";
import { queueAvatarEvent } from "./avatar/queue";
import { levelFor } from "./levels";

/** The avatar celebrates every this-many lifetime XP. */
export const XP_MILESTONE_STEP = 500;
import { PATH_NAME, LEVEL_COMPLETION_XP } from "./constants";

type AwardXpParams = {
  userId: string;
  amount: number;
  type: XPTransactionType;
  /** Identifies the reward itself, build it with `xpKeys`. */
  idempotencyKey: string;
  quizAttemptId?: string;
  description?: string;
};

/** One key per reward. A second award with the same key pays nothing. */
export const xpKeys = {
  lessonComplete: (userId: string, lessonId: string) => `lesson-complete:${userId}:${lessonId}`,
  questionOfTheDay: (userId: string, day: string) => `question-of-the-day:${userId}:${day}`,
  dailyChallenge: (userId: string, day: string) => `daily-challenge:${userId}:${day}`,
  missionBonus: (userId: string, day: string) => `missions:${userId}:${day}`,
  // Each streak milestone pays once per student, ever.
  streakMilestone: (userId: string, days: number) => `streak-milestone:${userId}:${days}`,
  levelComplete: (userId: string, level: number) => `level-complete:${userId}:${level}`,
  scenarioComplete: (userId: string, slug: string) => `scenario-complete:${userId}:${slug}`,
  // One reward per time an item comes due.
  revision: (itemId: string, stage: number, dueDay: string) => `revision:${itemId}:${stage}:${dueDay}`,
  redeem: (userId: string, rewardId: string) => `redeem:${userId}:${rewardId}`,
  // One money check-in reward per IST day.
  moneyCheckIn: (userId: string, day: string) => `money-checkin:${userId}:${day}`,
  // A challenge step pays once ever, so restarting a challenge earns nothing twice.
  challengeStep: (userId: string, challengeId: string, step: number) => `challenge-step:${userId}:${challengeId}:${step}`,
  challengeDone: (userId: string, challengeId: string) => `challenge-done:${userId}:${challengeId}`,
  personalityQuiz: (userId: string) => `personality:${userId}`,
  savingsGoal: (userId: string, goalId: string) => `savings-goal:${userId}:${goalId}`,
};

/**
 * Locks the student's row for the rest of the transaction. Every XP-awarding
 * transaction takes this lock before checking "has this already been
 * awarded?", so two concurrent requests (a double-click, two tabs) can't
 * both see "not yet" and award twice.
 */
export async function lockUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$executeRaw`SELECT 1 FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}

/**
 * Inserts an XPTransaction ledger row and keeps User.xpTotal in sync.
 * Must be called with a transaction client so both writes commit atomically
 * alongside whatever else the caller is doing (e.g. marking a quiz attempt
 * COMPLETED), a partial write here would desync the cached total from the
 * ledger it's supposed to mirror.
 *
 * Returns the XP actually awarded: 0 when this reward's idempotency key was
 * already used, the unique index is the last line of defence against a
 * duplicate reward, whatever the caller's own checks missed.
 */
export async function awardXp(tx: Prisma.TransactionClient, params: AwardXpParams): Promise<number> {
  const { userId, amount, type, idempotencyKey, quizAttemptId, description } = params;

  const { count } = await tx.xPTransaction.createMany({
    data: [{ userId, amount, type, idempotencyKey, quizAttemptId, description }],
    skipDuplicates: true,
  });
  if (count === 0) return 0;

  const { xpTotal } = await tx.user.update({
    where: { id: userId },
    data: { xpTotal: { increment: amount } },
    select: { xpTotal: true },
  });
  const level = levelFor(xpTotal).level;
  if (amount > 0 && level > levelFor(xpTotal - amount).level) {
    await queueAvatarEvent(tx, userId, "xp-level", `xp-level:${level}`, { level });
  }
  const crossed = Math.floor(xpTotal / XP_MILESTONE_STEP);
  if (amount > 0 && crossed > Math.floor((xpTotal - amount) / XP_MILESTONE_STEP)) {
    await queueAvatarEvent(tx, userId, "xp-milestone", `xp:${crossed * XP_MILESTONE_STEP}`, { xp: crossed * XP_MILESTONE_STEP });
  }
  return amount;
}

/**
 * Spends XP in the Rewards Store: a negative ledger row and a bump to
 * xpSpent. Lifetime XP (xpTotal) never goes down. Returns false when the
 * student can't afford it or already paid for this reward. Call inside a
 * transaction that has locked the user (lockUser).
 */
export async function spendXp(
  tx: Prisma.TransactionClient,
  params: { userId: string; cost: number; idempotencyKey: string; description: string },
): Promise<boolean> {
  const { userId, cost, idempotencyKey, description } = params;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { xpTotal: true, xpSpent: true } });
  if (user.xpTotal - user.xpSpent < cost) return false;

  const { count } = await tx.xPTransaction.createMany({
    data: [{ userId, amount: -cost, type: "REDEMPTION", idempotencyKey, description }],
    skipDuplicates: true,
  });
  if (count === 0) return false;

  await tx.user.update({ where: { id: userId }, data: { xpSpent: { increment: cost } } });
  return true;
}

/**
 * Awards the one-time path bonus if the student has now finished every
 * published lesson. Returns the XP awarded (0 if not complete or already paid).
 */
export async function awardLevelBonusIfComplete(
  tx: Prisma.TransactionClient,
  userId: string,
  quizAttemptId: string,
): Promise<number> {
  const alreadyAwarded = await tx.xPTransaction.count({ where: { userId, type: "LEVEL_COMPLETION" } });
  if (alreadyAwarded > 0) return 0;

  // The Money IQ path only, InvestSmart lessons don't hold back the bonus.
  const publishedCount = await tx.lesson.count({ where: { isPublished: true, slug: { in: PATH_SLUGS } } });
  const completed = await tx.quizAttempt.findMany({
    where: { userId, status: "COMPLETED", lesson: { isPublished: true, slug: { in: PATH_SLUGS } } },
    select: { lessonId: true },
    distinct: ["lessonId"],
  });
  if (publishedCount === 0 || completed.length < publishedCount) return 0;

  return awardXp(tx, {
    userId,
    amount: LEVEL_COMPLETION_XP,
    type: "LEVEL_COMPLETION",
    idempotencyKey: xpKeys.levelComplete(userId, 1),
    quizAttemptId,
    description: `${PATH_NAME} complete, all 4 levels`,
  });
}
