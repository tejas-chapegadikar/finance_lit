"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { equipReward, redeemReward } from "@/actions/rewards";
import type { Reward } from "@/lib/rewards";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { primaryButton, secondaryButton, softButton, tile } from "@/components/ui/button-styles";

/** One Rewards Store item: unlock it with XP, then wear it (titles, themes) or play it (scenarios). */
export function RewardCard({
  reward,
  owned,
  equipped,
  balance,
}: {
  reward: Reward;
  owned: boolean;
  equipped: boolean;
  balance: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
      if (result.status === "unlocked") setMessage("Unlocked! 🎉");
    });
  }

  return (
    <li className={`${tile} flex flex-col p-4`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
            reward.gradient ?? "bg-brand-50"
          }`}
        >
          {reward.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-slate-900">{reward.name}</p>
          <p className="text-sm text-slate-600">{reward.description}</p>
          <p className="mt-1 text-sm font-extrabold text-orange-700">⭐ {reward.cost} XP</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!owned && !confirming && (
          <button
            type="button"
            disabled={!affordable || isPending}
            onClick={() => setConfirming(true)}
            className={affordable ? primaryButton : secondaryButton}
          >
            {affordable ? `Unlock for ${reward.cost} XP` : `${reward.cost - balance} more XP needed`}
          </button>
        )}
        {!owned && confirming && (
          <>
            <button type="button" disabled={isPending} onClick={unlock} className={primaryButton}>
              {isPending ? "Unlocking…" : `Yes, spend ${reward.cost} XP`}
            </button>
            <button type="button" disabled={isPending} onClick={() => setConfirming(false)} className={secondaryButton}>
              Cancel
            </button>
          </>
        )}
        {owned && reward.kind === "scenario" && reward.scenarioSlug && (
          <Link href={`/practice/${reward.scenarioSlug}`} className={softButton}>
            Play it
          </Link>
        )}
        {owned && reward.kind !== "scenario" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => equipReward(reward.kind as "title" | "theme", equipped ? null : reward.id))}
            className={equipped ? secondaryButton : softButton}
          >
            {isPending ? "Saving…" : equipped ? "Take off" : reward.kind === "title" ? "Wear this title" : "Use this theme"}
          </button>
        )}
        {owned && (
          <span className="text-xs font-extrabold text-emerald-800">{equipped ? "✓ In use" : "✓ Unlocked"}</span>
        )}
      </div>
      {message && (
        <p role="status" className="mt-2 text-sm font-semibold text-slate-700">
          {message}
        </p>
      )}
    </li>
  );
}
