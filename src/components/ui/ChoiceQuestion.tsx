"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rightLine, wrongLine } from "@/lib/avatar/quiz-lines";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { OptionButton, type OptionState } from "./OptionButton";
import { StarIcon } from "./icons";

export type ChoiceResult =
  | {
      status: "answered";
      isCorrect: boolean;
      correctIndex: number;
      explanation: string;
      xpAwarded?: number;
      /** What happens next, e.g. when a revision question comes back. */
      note?: string;
    }
  | { status: "slow-down" }
  | { status: "new-day" };

export type ChoiceAnswer = {
  pickedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  xpAwarded?: number;
  note?: string;
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
  labels,
}: {
  labels?: { right: string; wrong: string };
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
          // Midnight IST passed while the page was open, load the new challenge.
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
      <p className="text-lg leading-snug font-semibold text-slate-900">{prompt}</p>

      <div className="flex flex-col gap-3" role="group" aria-label="Answer options">
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
          className={`animate-fade-up rounded-2xl p-4 ring-1 ${result.isCorrect ? "bg-emerald-50 ring-emerald-200" : "bg-rose-50 ring-rose-200"}`}
        >
          <p className={`font-semibold ${result.isCorrect ? "text-emerald-900" : "text-rose-900"}`}>
            {result.isCorrect ? (labels?.right ?? rightLine(prompt)) : (labels?.wrong ?? wrongLine(prompt))}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{result.explanation}</p>
          {result.note && <p className="mt-2 text-sm font-semibold text-slate-900">{result.note}</p>}
          {result.xpAwarded ? (
            <p className="mt-3 inline-flex animate-pop items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-800 ring-1 ring-orange-200">
              <StarIcon className="h-4 w-4 text-orange-500" /> +{result.xpAwarded} XP
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
