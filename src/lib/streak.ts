import type { Prisma, User } from "@prisma/client";
import { daysBetween, istDay, shiftDay } from "./ist-date";
import { awardXp, xpKeys } from "./xp";
import { awardStreakBadges } from "./badges";
import { queueAvatarEvent } from "./avatar/queue";

// The learning streak: IST days in a row with a meaningful learning action
// (a quiz, scenario, revision answer, Question of the Day or Daily
// Challenge). Forgiving by design: a streak freeze quietly covers a missed
// day, freezes are earned (never bought), and milestones pay XP once each.

export const STREAK_MILESTONES = [
  { days: 3, xp: 15 },
  { days: 7, xp: 50 },
  { days: 14, xp: 75 },
  { days: 30, xp: 150 },
  { days: 100, xp: 500 },
];
export const MAX_STREAK_FREEZES = 2;
// A streak freeze is earned every time the streak reaches a multiple of this.
export const FREEZE_EVERY_DAYS = 7;

/**
 * Counts today (IST) toward the student's streak. Call it inside the
 * transaction that records the activity, after locking the user (lockUser),
 * so the streak can't drift from what actually happened.
 */
export async function recordStreakDay(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, streakLastDay: true, streakFreezes: true },
  });

  const today = istDay();
  if (user.streakLastDay === today) return;

  // Missed days since the last active day are covered by freezes, all of
  // them or none, so a freeze is never wasted on a streak that breaks anyway.
  const missed = user.streakLastDay ? daysBetween(user.streakLastDay, today) - 1 : null;
  const covered =
    missed !== null && missed > 0 && user.currentStreak > 0 && missed <= user.streakFreezes ? missed : 0;
  const continues = missed === 0 || covered > 0;
  const currentStreak = continues ? user.currentStreak + 1 : 1;
  let streakFreezes = user.streakFreezes - covered;
  if (currentStreak % FREEZE_EVERY_DAYS === 0 && streakFreezes < MAX_STREAK_FREEZES) streakFreezes++;
  const longestStreak = Math.max(user.longestStreak, currentStreak);

  await tx.activityDay.createMany({
    data: [
      ...Array.from({ length: covered }, (_, i) => ({ userId, day: shiftDay(user.streakLastDay!, i + 1), frozen: true })),
      { userId, day: today },
    ],
    skipDuplicates: true,
  });
  await tx.user.update({
    where: { id: userId },
    data: { currentStreak, longestStreak, streakLastDay: today, streakFreezes },
  });

  const milestone = STREAK_MILESTONES.find((m) => m.days === currentStreak);
  if (milestone) {
    await awardXp(tx, {
      userId,
      amount: milestone.xp,
      type: "STREAK_BONUS",
      idempotencyKey: xpKeys.streakMilestone(userId, milestone.days),
      description: `${milestone.days}-day learning streak`,
    });
    await queueAvatarEvent(tx, userId, "streak", `streak:${milestone.days}`, { days: milestone.days });
  }
  await awardStreakBadges(tx, userId, longestStreak);
}

export type StreakStatus = {
  /** The streak to show right now. */
  streak: number;
  doneToday: boolean;
  /** Nothing yet today, one activity keeps it going. */
  needsToday: boolean;
  /** Freezes that will be used to cover missed days when the student is next active. */
  freezesNeeded: number;
};

/**
 * The streak as it stands today. The stored count only changes on activity,
 * so a gap longer than the student's freezes means it has already lapsed.
 */
export function streakStatus(
  user: Pick<User, "currentStreak" | "streakLastDay" | "streakFreezes">,
  today = istDay(),
): StreakStatus {
  const none = { streak: 0, doneToday: false, needsToday: false, freezesNeeded: 0 };
  if (!user.streakLastDay || user.currentStreak === 0) return none;
  const missed = daysBetween(user.streakLastDay, today) - 1;
  if (missed < 0) return { streak: user.currentStreak, doneToday: true, needsToday: false, freezesNeeded: 0 };
  if (missed <= user.streakFreezes) {
    return { streak: user.currentStreak, doneToday: false, needsToday: true, freezesNeeded: missed };
  }
  return none;
}

export function displayStreak(user: Pick<User, "currentStreak" | "streakLastDay" | "streakFreezes">): number {
  return streakStatus(user).streak;
}

/** The next streak milestone above `streak`, if any. */
export function nextStreakMilestone(streak: number) {
  return STREAK_MILESTONES.find((m) => m.days > streak) ?? null;
}

export type DayMark = "active" | "frozen";

/** Active and frozen days from `from` to `to` (inclusive), for the streak calendar. */
export async function getActivityDays(db: Prisma.TransactionClient, userId: string, from: string, to: string) {
  const rows = await db.activityDay.findMany({
    where: { userId, day: { gte: from, lte: to } },
    select: { day: true, frozen: true },
  });
  return new Map<string, DayMark>(rows.map((r) => [r.day, r.frozen ? "frozen" : "active"]));
}
