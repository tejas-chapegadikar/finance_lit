import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { AVATAR_ITEMS, isAvatarItemUnlocked, readAvatar, unlockText } from "@/lib/avatar";
import { getAvatarUnlocks } from "@/lib/avatar-unlocks";
import { spendableXp } from "@/lib/rewards";
import { AvatarStudio, type StudioItem } from "@/components/avatar/AvatarStudio";
import { heroChip, heroSurface } from "@/components/ui/button-styles";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Avatar studio — StockStreak" };

export default async function AvatarStudioPage() {
  const user = await requireOnboardedUser();
  const unlocks = await getAvatarUnlocks(user.id);
  const items: StudioItem[] = AVATAR_ITEMS.map((item) => ({
    id: item.id,
    slot: item.slot,
    name: item.name,
    unlocked: isAvatarItemUnlocked(item, unlocks),
    cost: item.unlock.type === "xp" ? item.unlock.cost : null,
    how: unlockText(item),
    rare: !!item.rare,
  }));

  return (
    <div className="flex flex-col gap-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Profile
      </Link>
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-14 -bottom-24 h-64 w-64 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>Avatar studio</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold">Make it yours</h1>
        <p className="relative mt-2">
          <span className={heroChip}>Basics are free · store items cost XP · special items unlock with milestones</span>
        </p>
      </section>
      <AvatarStudio initial={readAvatar(user.avatar)} items={items} balance={spendableXp(user)} />
    </div>
  );
}
