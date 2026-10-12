"use client";

import { useState, useTransition } from "react";
import { claimMissionBonus } from "@/actions/missions";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { primaryButton } from "@/components/ui/button-styles";

/** Claims the all-missions bonus; the server re-checks the missions first. */
export function ClaimBonusButton({ xp }: { xp: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function claim() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await claimMissionBonus();
        if (result.status === "claimed") setMessage(`+${result.xpAwarded} XP — all missions done!`);
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
      <button type="button" onClick={claim} disabled={isPending} className={primaryButton}>
        {isPending ? "Claiming…" : `Claim +${xp} XP bonus`}
      </button>
      {message && (
        <p role="status" className="text-sm font-bold text-slate-800">
          {message}
        </p>
      )}
    </div>
  );
}
