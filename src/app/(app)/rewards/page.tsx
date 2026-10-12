import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { REWARDS, REWARD_KIND_LABEL, findReward, nextReward, spendableXp, type RewardKind } from "@/lib/rewards";
import { findAvatarItem, readAvatar } from "@/lib/avatar";
import { RewardCard } from "@/components/rewards/RewardCard";
import { Avatar } from "@/components/avatar/Avatar";
import { card, heroChip, heroSurface, softButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Rewards — StockStreak" };

const KINDS: RewardKind[] = ["avatar", "title", "theme", "scenario"];

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function RewardsPage() {
  const user = await requireOnboardedUser();
  const unlocks = await db.rewardUnlock.findMany({ where: { userId: user.id }, orderBy: { unlockedAt: "desc" } });
  const owned = new Set(unlocks.map((u) => u.rewardId));
  const balance = spendableXp(user);
  const avatar = readAvatar(user.avatar);
  const wearing = new Set(Object.values(avatar));
  const next = nextReward(owned);

  return (
    <div className="flex flex-col gap-6">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-14 -bottom-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p>
              <span className={heroChip}>Rewards Store</span>
            </p>
            <h1 className="mt-3 text-3xl font-extrabold">Spend XP on things you&apos;ll like</h1>
          </div>
          <span aria-hidden className="hidden h-28 w-24 shrink-0 items-end justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 sm:flex">
            <Avatar config={avatar} className="h-24 w-auto" />
          </span>
        </div>
        <dl className="relative mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="flex flex-col-reverse justify-end rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/15">
            <dt className="mt-0.5 text-xs font-semibold">Available to spend</dt>
            <dd className="font-display text-3xl font-extrabold tabular-nums">⭐ {balance.toLocaleString("en-IN")}</dd>
          </div>
          <div className="flex flex-col-reverse justify-end rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/15">
            <dt className="mt-0.5 text-xs font-semibold">Lifetime XP earned</dt>
            <dd className="font-display text-3xl font-extrabold tabular-nums">{user.xpTotal.toLocaleString("en-IN")}</dd>
          </div>
        </dl>
        {next && (
          <p className="relative mt-4">
            <span className={heroChip}>
              {balance >= next.cost
                ? `🎁 You can unlock ${next.name} now`
                : `🎁 Next reward: ${next.name} — ${next.cost - balance} XP to go`}
            </span>
          </p>
        )}
      </section>

      <p className={`${card} p-4 text-sm text-slate-700`}>
        <span className="font-bold text-slate-900">How it works:</span> you earn XP only for real learning — lessons,
        scenarios, revision, daily missions and the daily question and challenge. Spending XP never lowers your lifetime
        XP, badges or readiness score. Everything here is cosmetic or extra practice — no cash value, no advantages.
      </p>

      <Link href="/profile/avatar" className={`${card} flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}>
        <span aria-hidden className="flex h-16 w-14 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-100">
          <Avatar config={avatar} className="h-14 w-auto" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold text-slate-900">Avatar studio</span>
          <span className="block text-sm text-slate-600">Try on anything before you unlock it, and mix free basics with your unlocks.</span>
        </span>
        <span className={`${softButton} hidden shrink-0 sm:inline-flex`}>
          Open
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </Link>

      {KINDS.map((kind) => (
        <section key={kind} aria-labelledby={`kind-${kind}`} className="flex flex-col gap-3">
          <h2 id={`kind-${kind}`} className="text-lg font-extrabold text-slate-900">
            {REWARD_KIND_LABEL[kind]}
          </h2>
          {kind === "avatar" && (
            <p className="-mt-2 text-sm text-slate-600">
              Special items — like the Flame hoodie and the Crown — can&apos;t be bought: they unlock with streaks and badges.
            </p>
          )}
          <ul className="grid gap-4 sm:grid-cols-2">
            {REWARDS.filter((r) => r.kind === kind).map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                owned={owned.has(reward.id)}
                equipped={user.title === reward.id || user.theme === reward.id || wearing.has(reward.id)}
                balance={balance}
                avatar={avatar}
              />
            ))}
          </ul>
        </section>
      ))}

      <section className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-5 text-slate-600">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
          🎟️
        </span>
        <div>
          <p className="text-xs font-bold tracking-wider uppercase">Coming later</p>
          <p className="font-extrabold text-slate-700">Student vouchers</p>
          <p className="text-sm">Partner-funded discounts may come later — only once partners are confirmed. No cash rewards.</p>
        </div>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-extrabold text-slate-900">
          Redemption history
        </h2>
        {unlocks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Nothing unlocked yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {unlocks.map((unlock) => (
              <li key={unlock.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">
                    {findReward(unlock.rewardId)?.name ?? findAvatarItem(unlock.rewardId)?.name ?? unlock.rewardId}
                  </span>
                  <span className="text-xs text-slate-600">{formatDate(unlock.unlockedAt)}</span>
                </span>
                <span className="shrink-0 font-extrabold text-slate-700 tabular-nums">−{unlock.costXp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
