import { db } from "./db";
import type { UnlockContext } from "./avatar";

/** What a student has unlocked: store purchases, badges and their best streak. */
export async function getAvatarUnlocks(userId: string): Promise<UnlockContext> {
  const [unlocks, badges, user] = await Promise.all([
    db.rewardUnlock.findMany({ where: { userId }, select: { rewardId: true } }),
    db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { longestStreak: true } }),
  ]);
  return {
    owned: new Set(unlocks.map((u) => u.rewardId)),
    badges: new Set(badges.map((b) => b.badgeId)),
    longestStreak: user.longestStreak,
  };
}
