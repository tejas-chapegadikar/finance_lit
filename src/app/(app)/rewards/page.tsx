import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { REWARDS, REWARD_KIND_LABEL, findReward, nextReward, spendableXp, type RewardKind } from "@/lib/rewards";
import { findAvatarItem, readAvatar } from "@/lib/avatar";
import { RewardCard } from "@/components/rewards/RewardCard";
import { RewardTabs } from "@/components/rewards/RewardTabs";
import { Avatar } from "@/components/avatar/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RewardIcon } from "@/components/ui/topic-icons";
import { ArrowRightIcon, GiftIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Rewards — StockStreak" };

const KINDS: RewardKind[] = ["avatar", "title", "theme", "scenario"];

const KIND_NOTE: Partial<Record<RewardKind, string>> = {
  avatar: "Special items — like the Flame hoodie and the Crown — can't be bought: they unlock with streaks and badges.",
  title: "A title sits under your name on your profile and in the sidebar.",
  theme: "A theme colours the cover of your profile.",
  scenario: "Extra real-life decisions to practise, beyond the core path.",
};

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
  const displayName = getDisplayName(user);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="Rewards"
        title="Spend your XP"
        description="Avatar items, profile titles, themes and bonus scenarios. Spending never lowers your lifetime XP, badges or readiness — and nothing here has cash value or gives an advantage."
        aside={
          <div className="min-w-[15rem] rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
              <StarIcon className="h-4 w-4 text-orange-500" /> Available to spend
            </p>
            <p className="mt-1 font-display text-[2.5rem] leading-none font-semibold text-orange-600">
              <CountUp value={balance} id="xp-balance" />
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 tabular-nums">{user.xpTotal.toLocaleString("en-IN")}</span> lifetime XP — spending never lowers it
            </p>
          </div>
        }
      >
        {next && (
          <div className="flex max-w-xl items-center gap-3">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <GiftIcon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">
                {balance >= next.cost ? (
                  <>
                    You can unlock <span className="font-semibold text-slate-900">{next.name}</span> now.
                  </>
                ) : (
                  <>
                    Next reward: <span className="font-semibold text-slate-900">{next.name}</span> — {next.cost - balance} XP to go.
                  </>
                )}
              </p>
              <ProgressBar value={Math.min(balance, next.cost)} max={next.cost} label={`Progress to ${next.name}`} tone="bg-orange-400" size="sm" className="mt-1.5" />
            </div>
          </div>
        )}
      </PageHeader>

      <Link
        href="/profile/avatar"
        className="group relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-peach-100 p-5 transition duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-6"
      >
        <span aria-hidden className="pointer-events-none absolute -top-24 -right-16 -z-10 h-64 w-64 rounded-full bg-white/50" />
        <span aria-hidden className="flex h-32 w-32 shrink-0 items-end justify-center self-center overflow-hidden rounded-full bg-white/70 ring-1 ring-orange-100 sm:self-auto">
          <Avatar config={avatar} className="h-28 w-auto transition duration-300 group-hover:scale-105" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium text-orange-800">Avatar studio</span>
          <span className="mt-0.5 block font-display text-2xl leading-tight font-semibold text-slate-900 sm:text-[1.75rem]">Make it yours</span>
          <span className="mt-1 block max-w-md text-sm text-slate-700">Try on anything before you unlock it, and mix free basics with your unlocks.</span>
        </span>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-slate-800">
          Open the studio
          <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </Link>

      <section aria-labelledby="store-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="store-heading" className="text-2xl text-slate-900">
            The store
          </h2>
          <p className="text-sm text-slate-500">You earn XP only for real learning — lessons, scenarios, revision, daily missions and the daily question and challenge.</p>
        </div>
        <RewardTabs
          tabs={KINDS.map((kind) => {
            const items = REWARDS.filter((r) => r.kind === kind);
            return {
              id: kind,
              label: REWARD_KIND_LABEL[kind],
              count: items.length,
              content: (
                <section aria-labelledby={`kind-${kind}`}>
                  <h3 id={`kind-${kind}`} className="sr-only">
                    {REWARD_KIND_LABEL[kind]}
                  </h3>
                  {KIND_NOTE[kind] && <p className="mb-4 text-sm text-slate-600">{KIND_NOTE[kind]}</p>}
                  <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    {items.map((reward) => (
                      <RewardCard
                        key={reward.id}
                        reward={reward}
                        owned={owned.has(reward.id)}
                        equipped={user.title === reward.id || user.theme === reward.id || wearing.has(reward.id)}
                        balance={balance}
                        avatar={avatar}
                        displayName={displayName}
                      />
                    ))}
                  </ul>
                </section>
              ),
            };
          })}
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-xl text-slate-900">
            Redemption history
          </h2>
          {unlocks.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">Nothing unlocked yet — your first reward will show up here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
              {unlocks.map((unlock) => {
                const reward = findReward(unlock.rewardId);
                return (
                  <li key={unlock.id} className="flex items-center gap-3 py-3">
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <RewardIcon id={unlock.rewardId} kind={reward?.kind ?? "avatar"} scenarioSlug={reward?.scenarioSlug} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900">
                        {reward?.name ?? findAvatarItem(unlock.rewardId)?.name ?? unlock.rewardId}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(unlock.unlockedAt)}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-slate-700 tabular-nums">−{unlock.costXp} XP</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="self-start rounded-2xl border border-dashed border-slate-300 p-5">
          <p className="text-[13px] font-medium text-slate-500">Coming later</p>
          <p className="mt-0.5 font-semibold text-slate-900">Student vouchers</p>
          <p className="mt-1 text-sm text-slate-600">Partner-funded discounts may come later — only once partners are confirmed. No cash rewards.</p>
        </section>
      </div>
    </div>
  );
}
