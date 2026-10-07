import type { Prisma, User } from "@prisma/client";
import { istDay, shiftDay } from "./ist-date";

/**
 * Counts today (IST) toward the student's streak. Call it inside the
 * transaction that records the activity — finishing a quiz or answering the
 * daily challenge — so the streak can't drift from what actually happened.
 */
export async function recordStreakDay(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, streakLastDay: true },
  });

  const today = istDay();
  if (user.streakLastDay === today) return;

  const currentStreak = user.streakLastDay === shiftDay(today, -1) ? user.currentStreak + 1 : 1;
  await tx.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      streakLastDay: today,
    },
  });
}

/**
 * The streak to show right now. The stored count only changes on activity,
 * so a streak whose last day is before yesterday has already lapsed.
 */
export function displayStreak(user: Pick<User, "currentStreak" | "streakLastDay">): number {
  if (!user.streakLastDay) return 0;
  const today = istDay();
  return user.streakLastDay === today || user.streakLastDay === shiftDay(today, -1) ? user.currentStreak : 0;
}
