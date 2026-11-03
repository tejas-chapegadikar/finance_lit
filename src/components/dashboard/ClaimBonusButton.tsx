"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimMissionBonus } from "@/actions/missions";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { GiftIcon } from "@/components/ui/icons";
import { Burst } from "@/components/ui/Burst";

/** Claims the all-missions bonus; the server re-checks the missions first. */
export function ClaimBonusButton({ xp }: { xp: number }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function claim() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await claimMissionBonus();
        if (result.status === "claimed") {
          setClaimed(true);
          setMessage(`+${result.xpAwarded} XP — all missions done!`);
          router.refresh();
        }
        if (result.status === "already") setMessage("Bonus already claimed today.");
        if (result.status === "not-yet") setMessage("Finish all three missions first.");
        if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {!claimed && (
        <button
          type="button"
          onClick={claim}
          disabled={isPending}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-orange-300 active:scale-[0.98] disabled:opacity-60"
        >
          <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 animate-shine bg-white/40 blur-sm" />
          <GiftIcon className="relative h-4 w-4" />
          <span className="relative">{isPending ? "Claiming…" : `Claim +${xp} XP bonus`}</span>
        </button>
      )}
      {message && (
        <p role="status" className="relative text-sm font-semibold text-slate-800">
          {claimed && <Burst />}
          {message}
        </p>
      )}
    </div>
  );
}
