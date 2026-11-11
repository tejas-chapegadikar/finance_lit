"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setRoastLevel } from "@/actions/guide";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";

const LEVELS = [
  { id: "mild", label: "Mild", hint: "Gentle nudges" },
  { id: "spicy", label: "Spicy", hint: "Friendly roasting" },
  { id: "savage", label: "Savage", hint: "No mercy (still no personal attacks)" },
] as const;

/** Settings: how hard the avatar roasts. */
export function RoastLevelPicker({ initial }: { initial: string }) {
  const [level, setLevel] = useState(initial);
  const [pending, start] = useTransition();
  function pick(next: string) {
    const previous = level;
    setLevel(next);
    start(async () => {
      try {
        const result = await setRoastLevel(next);
        if (result.status !== "saved") setLevel(previous);
      } catch {
        setLevel(previous);
        toast.error(GENERIC_ERROR_MESSAGE);
      }
    });
  }
  return (
    <div>
      <p id="roast-label" className="text-sm font-semibold text-slate-900">
        Roast level
      </p>
      <div role="radiogroup" aria-labelledby="roast-label" className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={level === l.id}
            disabled={pending}
            onClick={() => pick(l.id)}
            className={`min-h-11 rounded-lg px-2 text-sm transition ${level === l.id ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-slate-600"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-600">{LEVELS.find((l) => l.id === level)?.hint}</p>
    </div>
  );
}
