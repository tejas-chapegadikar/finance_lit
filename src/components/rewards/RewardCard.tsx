"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { equipReward, redeemReward } from "@/actions/rewards";
import { wearAvatarItem } from "@/actions/avatar";
import type { Reward } from "@/lib/rewards";
import { HEAD_SLOTS, type AvatarConfig } from "@/lib/avatar";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { primaryButton, secondaryButton, softButton, tile } from "@/components/ui/button-styles";
import { Avatar } from "@/components/avatar/Avatar";
import { Burst } from "@/components/ui/Burst";
import { RewardIcon } from "@/components/ui/topic-icons";
import { CheckIcon, CrownIcon, LockIcon, StarIcon } from "@/components/ui/icons";

/** What the item looks like: your avatar wearing it, the theme's colours, the title as a name tag, or the scenario. */
function Preview({ reward, avatar, displayName }: { reward: Reward; avatar: AvatarConfig; displayName: string }) {
  if (reward.kind === "avatar" && reward.slot) {
    const head = HEAD_SLOTS.includes(reward.slot);
    return (
      <span className="flex h-full w-full items-end justify-center bg-gradient-to-b from-slate-50 to-peach-100/70">
        <Avatar config={{ ...avatar, [reward.slot]: reward.id }} crop={head ? "head" : "full"} className={head ? "h-[88%] w-auto" : "h-[92%] w-auto"} />
      </span>
    );
  }
  if (reward.kind === "theme") {
    return <span className={`flex h-full w-full items-end p-3 ${reward.gradient ?? "bg-slate-100"}`} />;
  }
  if (reward.kind === "title") {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 px-3">
        <span className="max-w-full truncate text-xs text-slate-500">{displayName}</span>
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
          <RewardIcon id={reward.id} kind={reward.kind} className="h-4 w-4 text-brand-600" />
          <span className="truncate">{reward.name}</span>
        </span>
      </span>
    );
  }
  return (
    <span className="flex h-full w-full items-center justify-center bg-slate-50">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
        <RewardIcon id={reward.id} kind={reward.kind} scenarioSlug={reward.scenarioSlug} className="h-7 w-7" />
      </span>
    </span>
  );
}

/**
 * One Rewards Store item: unlock it with XP, then wear it (avatar items,
 * titles, themes) or play it (bonus scenarios).
 */
export function RewardCard({
  reward,
  owned,
  equipped,
  balance,
  avatar,
  displayName = "You",
}: {
  reward: Reward;
  owned: boolean;
  equipped: boolean;
  balance: number;
  /** The student's avatar, to preview avatar items on. */
  avatar: AvatarConfig;
  /** For previewing profile titles. */
  displayName?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const affordable = balance >= reward.cost;

  function run(action: () => Promise<void>) {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        unstable_rethrow(err);
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function unlock() {
    run(async () => {
      const result = await redeemReward(reward.id);
      setConfirming(false);
      if (result.status === "not-enough-xp") setMessage("You don't have enough XP for this yet.");
      if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      if (result.status === "unlocked") {
        setJustUnlocked(true);
        setMessage(reward.kind === "avatar" ? "Unlocked — your avatar is wearing it." : "Unlocked.");
      }
    });
  }

  return (
    <li className={`${tile} flex flex-col overflow-hidden ${justUnlocked ? "ring-2 ring-emerald-300" : ""}`}>
      <div aria-hidden className="relative h-36 border-b border-slate-100 sm:h-40">
        <Preview reward={reward} avatar={avatar} displayName={displayName} />
        {reward.rare && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-orange-800 ring-1 ring-orange-200">
            <CrownIcon className="h-3 w-3" /> Rare
          </span>
        )}
        {owned && (
          <span
            className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              equipped ? "bg-slate-900 text-white" : "bg-white/95 text-emerald-800 ring-1 ring-emerald-200"
            } ${justUnlocked ? "animate-check" : ""}`}
          >
            <CheckIcon className="h-3 w-3" /> {equipped ? "In use" : "Owned"}
          </span>
        )}
        {justUnlocked && <Burst />}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="leading-snug font-semibold text-slate-900">{reward.name}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{reward.description}</p>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {!owned && (
            <p className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-orange-600">
              <StarIcon className="h-4 w-4 text-orange-500" />
              {reward.cost} XP
            </p>
          )}
          {!owned && !confirming && (
            <button
              type="button"
              disabled={!affordable || isPending}
              onClick={() => setConfirming(true)}
              aria-label={affordable ? `Unlock for ${reward.cost} XP` : undefined}
              className={`${secondaryButton} w-full`}
            >
              {!affordable && <LockIcon className="h-4 w-4" />}
              {affordable ? "Unlock" : `${reward.cost - balance} more XP needed`}
            </button>
          )}
          {!owned && confirming && (
            <div className="flex animate-fade-up flex-col gap-2">
              <button type="button" disabled={isPending} onClick={unlock} className={`${primaryButton} w-full`}>
                {isPending ? "Unlocking…" : `Yes, spend ${reward.cost} XP`}
              </button>
              <button type="button" disabled={isPending} onClick={() => setConfirming(false)} className={`${secondaryButton} w-full`}>
                Cancel
              </button>
            </div>
          )}
          {owned && reward.kind === "scenario" && reward.scenarioSlug && (
            <Link href={`/practice/${reward.scenarioSlug}`} className={`${softButton} w-full`}>
              Play it
            </Link>
          )}
          {owned && reward.kind === "avatar" && !equipped && (
            <button type="button" disabled={isPending} onClick={() => run(() => wearAvatarItem(reward.id))} className={`${softButton} w-full`}>
              {isPending ? "Saving…" : "Wear it"}
            </button>
          )}
          {owned && (reward.kind === "title" || reward.kind === "theme") && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => equipReward(reward.kind as "title" | "theme", equipped ? null : reward.id))}
              className={`${equipped ? secondaryButton : softButton} w-full`}
            >
              {isPending ? "Saving…" : equipped ? "Take off" : reward.kind === "title" ? "Wear this title" : "Use this theme"}
            </button>
          )}
          {owned && reward.kind === "avatar" && equipped && <p className="py-2 text-center text-sm font-medium text-slate-500">Your avatar is wearing it</p>}
        </div>
        {message && (
          <p role="status" className="mt-2 text-sm font-semibold text-slate-700">
            {message}
          </p>
        )}
      </div>
    </li>
  );
}
