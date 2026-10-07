"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { OptionButton, type OptionState } from "./OptionButton";

export type ChoiceResult =
  | { status: "answered"; isCorrect: boolean; correctIndex: number; explanation: string; xpAwarded?: number }
  | { status: "slow-down" }
  | { status: "new-day" };

export type ChoiceAnswer = {
  pickedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  xpAwarded?: number;
};

/**
 * A single-pick question checked on the server (a lesson's "What would you
 * do?" scenario, or the Daily Money Challenge). The browser only ever knows
 * the option texts until an answer comes back.
 */
export function ChoiceQuestion({
  prompt,
  options,
  answer,
  initialAnswer,
  onAnswered,
}: {
  prompt: string;
  options: string[];
  answer: (optionIndex: number) => Promise<ChoiceResult>;
  initialAnswer?: ChoiceAnswer | null;
  onAnswered?: (answer: ChoiceAnswer) => void;
}) {
  const router = useRouter();
  const [pickedIndex, setPickedIndex] = useState<number | null>(initialAnswer?.pickedIndex ?? null);
  const [result, setResult] = useState<ChoiceAnswer | null>(initialAnswer ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function stateOf(index: number): OptionState {
    if (result) {
      if (index === result.correctIndex) return "correct";
      return index === result.pickedIndex ? "wrong" : "dimmed";
    }
    return index === pickedIndex ? "pending" : "idle";
  }

  function choose(index: number) {
    if (result || isPending) return;
    setPickedIndex(index);
    setError(null);
    startTransition(async () => {
      try {
        const response = await answer(index);
        if (response.status === "slow-down") {
          setPickedIndex(null);
          setError(SLOW_DOWN_MESSAGE);
          return;
        }
        if (response.status === "new-day") {
          // Midnight IST passed while the page was open — load the new challenge.
          router.refresh();
          return;
        }
        const answered: ChoiceAnswer = { ...response, pickedIndex: index };
        setResult(answered);
        onAnswered?.(answered);
      } catch {
        setPickedIndex(null);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg leading-snug font-bold text-slate-900">{prompt}</p>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Answer options">
        {options.map((option, i) => (
          <OptionButton
            key={i}
            index={i}
            text={option}
            state={stateOf(i)}
            disabled={isPending}
            onSelect={() => choose(i)}
          />
        ))}
      </div>

      {result && (
        <div
          role="status"
          className={`rounded-2xl border-2 p-4 ${
            result.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-rose-200 bg-rose-50"
          }`}
        >
          <p className={`font-bold ${result.isCorrect ? "text-emerald-800" : "text-rose-800"}`}>
            {result.isCorrect ? "✅ Great choice!" : "❌ Not quite — here's why"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.explanation}</p>
          {result.xpAwarded ? (
            <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-bold text-orange-700 ring-1 ring-orange-200">
              ⭐ +{result.xpAwarded} XP
            </p>
          ) : null}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
