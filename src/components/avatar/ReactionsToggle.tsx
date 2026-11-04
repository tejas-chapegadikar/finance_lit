"use client";

import { useState, useTransition } from "react";
import { setAvatarReactions } from "@/actions/avatar";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";

/** Settings: should your avatar pop up and react to what you do? */
export function ReactionsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    setError(null);
    startTransition(async () => {
      try {
        await setAvatarReactions(next);
      } catch {
        setOn(!next);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span id="reactions-label" className="text-sm">
          <span className="block font-semibold text-slate-900">Avatar pop-ups</span>
          <span className="text-slate-600">Your avatar pops up with a short comment when you finish a lesson, log money, reach a goal and more.</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="reactions-label"
          onClick={toggle}
          disabled={isPending}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-300"} disabled:opacity-60`}
        >
          <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
