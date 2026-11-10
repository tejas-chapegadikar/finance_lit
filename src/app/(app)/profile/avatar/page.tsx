import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay, istDayStart, shiftDay } from "@/lib/ist-date";
import { AVATAR_ITEMS, avatarName, isAvatarItemUnlocked, readAvatar, unlockText } from "@/lib/avatar";
import { getAvatarUnlocks } from "@/lib/avatar-unlocks";
import { AvatarStudio, type StudioItem } from "@/components/avatar/AvatarStudio";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Avatar Studio | Rupli" };

const RECENT_DAYS = 14;

export default async function AvatarStudioPage() {
  const user = await requireOnboardedUser();
  const since = istDayStart(shiftDay(istDay(), -RECENT_DAYS));
  const [unlocks, recentPurchases, recentBadges] = await Promise.all([
    getAvatarUnlocks(user.id),
    db.rewardUnlock.findMany({ where: { userId: user.id, unlockedAt: { gte: since } }, select: { rewardId: true } }),
    db.userBadge.findMany({ where: { userId: user.id, earnedAt: { gte: since } }, select: { badgeId: true } }),
  ]);
  const boughtRecently = new Set(recentPurchases.map((r) => r.rewardId));
  const earnedRecently = new Set(recentBadges.map((b) => b.badgeId));
  const items: StudioItem[] = AVATAR_ITEMS.map((item) => ({
    id: item.id,
    slot: item.slot,
    name: item.name,
    unlocked: isAvatarItemUnlocked(item, unlocks),
    cost: item.unlock.type === "xp" ? item.unlock.cost : null,
    how: unlockText(item),
    rare: !!item.rare,
    recent: (item.unlock.type === "xp" && boughtRecently.has(item.id)) || (item.unlock.type === "badge" && earnedRecently.has(item.unlock.badgeId)),
  }));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Profile
      </Link>
      <PageHeader
        eyebrow="Avatar Studio"
        title="Make it yours"
        description="Your avatar is you. It carries your name everywhere. Basics are free; everything else unlocks as you earn XP, finish lessons, keep streaks and win badges. Try anything on first."
      />
      <AvatarStudio initial={readAvatar(user.avatar)} items={items} xpTotal={user.xpTotal} name={avatarName(user)} />
    </div>
  );
}
