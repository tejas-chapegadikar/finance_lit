import { db } from "./db";
import { AVATAR_ITEMS, isAvatarItemUnlocked, type UnlockContext } from "./avatar";
import { PATH_SLUGS, INVEST_TRACK } from "./journey";

/** What a student has unlocked: earlier purchases, badges, best streak, lessons completed and lifetime XP. */
export async function getAvatarUnlocks(userId: string): Promise<UnlockContext> {
  const [unlocks, badges, user, lessons] = await Promise.all([
    db.rewardUnlock.findMany({ where: { userId }, select: { rewardId: true } }),
    db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { longestStreak: true, xpTotal: true } }),
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED", lesson: { isPublished: true, slug: { in: [...PATH_SLUGS, ...INVEST_TRACK] } } },
      select: { lessonId: true },
      distinct: ["lessonId"],
    }),
  ]);
  return {
    owned: new Set(unlocks.map((u) => u.rewardId)),
    badges: new Set(badges.map((b) => b.badgeId)),
    longestStreak: user.longestStreak,
    lessonsCompleted: lessons.length,
    xpTotal: user.xpTotal,
  };
}

/** Ids of every avatar item this student has unlocked. */
export function unlockedItemIds(ctx: UnlockContext): string[] {
  return AVATAR_ITEMS.filter((item) => isAvatarItemUnlocked(item, ctx)).map((item) => item.id);
}
