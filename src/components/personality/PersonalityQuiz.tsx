"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePersonality } from "@/actions/personality";
import { PERSONALITY_QUESTIONS } from "@/lib/personality";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { StepBar } from "@/components/ui/ProgressBar";
import { ArrowLeftIcon } from "@/components/ui/icons";

const LETTERS = ["A", "B", "C", "D"];

/** Six quick questions, one at a time. Scoring happens on the server. */
export function PersonalityQuiz({ next }: { next: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const question = PERSONALITY_QUESTIONS[index];

  function pick(option: number) {
    const updated = [...answers.slice(0, index), option];
    setAnswers(updated);
    setError(null);
    if (index < PERSONALITY_QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }
    startTransition(async () => {
      try {
        const result = await savePersonality(updated);
        if (result.status === "saved") router.push(next);
        else setError(result.status === "slow-down" ? SLOW_DOWN_MESSAGE : GENERIC_ERROR_MESSAGE);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <section aria-labelledby="personality-question" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {index > 0 && (
          <button type="button" onClick={() => setIndex(index - 1)} aria-label="Previous question" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        )}
        <StepBar done={index} total={PERSONALITY_QUESTIONS.length} current label="Quiz progress" className="flex-1" />
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {index + 1}/{PERSONALITY_QUESTIONS.length}
        </span>
      </div>
      <h2 key={index} id="personality-question" className="animate-fade-up text-2xl leading-snug text-slate-900 sm:text-3xl">
        {question.prompt}
      </h2>
      <div key={`options-${index}`} role="group" aria-label="Pick the one that's most you" className="flex flex-col gap-2.5">
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            disabled={isPending}
            onClick={() => pick(i)}
            className={`flex animate-fade-up items-center gap-3.5 rounded-2xl border bg-white px-4 py-3.5 text-left text-[15px] leading-snug font-medium text-slate-800 transition duration-150 hover:-translate-y-px hover:border-slate-300 active:scale-[0.99] disabled:opacity-60 sm:text-base ${
              answers[index] === i ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">{LETTERS[i]}</span>
            <span className="flex-1">{option}</span>
          </button>
        ))}
      </div>
      {isPending && <p className="text-sm font-medium text-slate-600">Reading your money vibes…</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
      <p className="text-xs text-slate-500">No right answers — pick what you&apos;d actually do, not what you think you should.</p>
    </section>
  );
}
