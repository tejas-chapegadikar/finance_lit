import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { REWARDS, REWARD_KIND_LABEL, findReward, nextReward, spendableXp, type RewardKind } from "@/lib/rewards";
import { findAvatarItem, readAvatar } from "@/lib/avatar";
import { RewardCard } from "@/components/rewards/RewardCard";
import { Avatar } from "@/components/avatar/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { card, softButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";

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
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Rewards"
        title="Spend your XP"
        description="Avatar items, profile titles, themes and bonus scenarios. Spending never lowers your lifetime XP, badges or readiness — and nothing here has cash value or gives an advantage."
      >
        <dl className={`${card} grid max-w-xl grid-cols-2 divide-x divide-slate-200`}>
          <div className="flex flex-col-reverse justify-end p-4">
            <dt className="mt-0.5 text-sm text-slate-600">Available to spend</dt>
            <dd className="flex items-center gap-1.5 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
              <StarIcon className="h-6 w-6 text-amber-500" />
              {balance.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end p-4">
            <dt className="mt-0.5 text-sm text-slate-600">Lifetime XP earned</dt>
            <dd className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">{user.xpTotal.toLocaleString("en-IN")}</dd>
          </div>
        </dl>
        {next && (
          <p className="text-sm text-slate-700">
            {balance >= next.cost ? (
              <>
                You can unlock <span className="font-semibold">{next.name}</span> now.
              </>
            ) : (
              <>
                Next reward: <span className="font-semibold">{next.name}</span> — {next.cost - balance} XP to go.
              </>
            )}
          </p>
        )}
      </PageHeader>

      <p className="text-sm text-slate-600">
        You earn XP only for real learning — lessons, scenarios, revision, daily missions and the daily question and challenge.
      </p>

      <Link href="/profile/avatar" className={`${tile} flex items-center gap-4 p-4`}>
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

      <section className="rounded-2xl border border-dashed border-slate-300 p-5 text-slate-600">
        <p className="text-sm font-semibold text-slate-500">Coming later</p>
        <p className="font-bold text-slate-800">Student vouchers</p>
        <p className="text-sm">Partner-funded discounts may come later — only once partners are confirmed. No cash rewards.</p>
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
