"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicStep, StepAnswer, StepCheck } from "@/lib/scenarios";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { OptionButton, type OptionState } from "@/components/ui/OptionButton";
import { card, skyButton } from "@/components/ui/button-styles";
import { StepBar } from "@/components/ui/ProgressBar";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

type Checked = Extract<StepCheck, { status: "checked" }>;

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function verdict(points: number) {
  if (points >= 2) return { text: "Smart move", className: "bg-emerald-50 text-emerald-900 ring-emerald-200" };
  if (points === 1) return { text: "Partly there", className: "bg-amber-50 text-amber-900 ring-amber-200" };
  return { text: "Not the best call", className: "bg-rose-50 text-rose-900 ring-rose-200" };
}

function initialAllocation(steps: PublicStep[], stepIndex: number): Record<string, number> {
  const step = steps[stepIndex];
  if (step?.kind !== "allocate") return {};
  return Object.fromEntries(step.buckets.map((b) => [b.id, b.initial]));
}

/**
 * Walks a student through a set of steps (choices, "select all", money
 * allocations). Each step is checked on the server; after the last one,
 * `finish` saves the run and the parent shows the result.
 */
export function StepRunner({
  steps,
  stepNoun,
  xpNote,
  check,
  finish,
}: {
  steps: PublicStep[];
  /** "Decision" or "Question", shown as "Decision 1 of 3". */
  stepNoun: string;
  /** e.g. "+50 XP when you finish". */
  xpNote?: string;
  check: (stepIndex: number, answer: StepAnswer) => Promise<StepCheck>;
  finish: (answers: StepAnswer[]) => Promise<"done" | "slow-down" | "new-day">;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswer[]>([]);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Draft answers for the current step.
  const [choice, setChoice] = useState<number | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [allocation, setAllocation] = useState<Record<string, number>>(() => initialAllocation(steps, 0));

  function submit(answer: StepAnswer) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await check(stepIndex, answer);
        if (result.status === "new-day") {
          router.refresh();
          return;
        }
        if (result.status === "slow-down") {
          setChoice(null);
          setError(SLOW_DOWN_MESSAGE);
          return;
        }
        setAnswers((prev) => [...prev.slice(0, stepIndex), answer]);
        setChecked(result);
      } catch {
        setChoice(null);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function next() {
    setError(null);
    if (!isLast) {
      setStepIndex(stepIndex + 1);
      setChecked(null);
      setChoice(null);
      setPicks([]);
      setAllocation(initialAllocation(steps, stepIndex + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    startTransition(async () => {
      try {
        const status = await finish(answers);
        if (status === "new-day") router.refresh();
        if (status === "slow-down") setError(SLOW_DOWN_MESSAGE);
        if (status === "done") window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  const optionState = (i: number): OptionState => {
    if (!checked) return choice === i ? "pending" : "idle";
    if (choice !== i) return "dimmed";
    return checked.points >= 2 ? "correct" : checked.points === 0 ? "wrong" : "pending";
  };

  const left = step.kind === "allocate" ? step.total - Object.values(allocation).reduce((sum, v) => sum + v, 0) : 0;

  return (
    <section className={`${card} p-5 sm:p-6`} aria-labelledby="step-heading">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500 tabular-nums">
          {stepNoun} {stepIndex + 1} of {steps.length}
        </p>
        {xpNote && (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
            {xpNote}
          </span>
        )}
      </div>
      <StepBar done={stepIndex + (checked ? 1 : 0)} total={steps.length} current={!checked} label="Progress" className="mt-3" />
      <h2 key={stepIndex} id="step-heading" className="mt-5 animate-fade-up text-xl leading-snug text-slate-900 sm:text-2xl">
        {step.prompt}
      </h2>

      <div className="mt-4">
        {step.kind === "choice" && (
          <div className="flex flex-col gap-3" role="group" aria-label="Your choice">
            {step.options.map((option, i) => (
              <OptionButton
                key={i}
                index={i}
                text={option}
                state={optionState(i)}
                disabled={isPending || !!checked}
                onSelect={() => {
                  setChoice(i);
                  submit(i);
                }}
              />
            ))}
          </div>
        )}

        {step.kind === "multi" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3" role="group" aria-label="Select all that apply">
              {step.options.map((option, i) => {
                const on = picks.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    disabled={isPending || !!checked}
                    onClick={() => setPicks(on ? picks.filter((p) => p !== i) : [...picks, i])}
                    className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-[15px] leading-snug font-medium transition duration-150 active:scale-[0.99] sm:text-base ${
                      on
                        ? "border-brand-500 bg-brand-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-800 enabled:hover:border-slate-300"
                    } disabled:opacity-80`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                        on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {on && <CheckIcon className="h-4 w-4 animate-check" />}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
            {!checked && (
              <button
                type="button"
                onClick={() => submit(picks)}
                disabled={isPending || picks.length === 0}
                className={`${skyButton} self-start`}
              >
                {isPending ? "Checking…" : "Check my answer"}
              </button>
            )}
          </div>
        )}

        {step.kind === "allocate" && (
          <div className="flex flex-col gap-4">
            {step.buckets.map((bucket) => {
              const value = allocation[bucket.id] ?? 0;
              return (
                <div key={bucket.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`alloc-${bucket.id}`} className="font-semibold text-slate-900">
                      {bucket.label}
                    </label>
                    <span className="font-display text-xl font-semibold text-slate-900 tabular-nums">{rupees(value)}</span>
                  </div>
                  <p className="text-xs text-slate-600">{bucket.hint}</p>
                  <input
                    id={`alloc-${bucket.id}`}
                    type="range"
                    min={0}
                    max={step.total}
                    step={step.increment}
                    value={value}
                    disabled={isPending || !!checked}
                    onChange={(e) => setAllocation({ ...allocation, [bucket.id]: Number(e.target.value) })}
                    className="mt-3 w-full accent-brand-600"
                  />
                </div>
              );
            })}
            <p
              role="status"
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                left === 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
              }`}
            >
              {left === 0
                ? "Every rupee has a job."
                : left > 0
                  ? `${rupees(left)} still to plan`
                  : `${rupees(-left)} over your budget. Take some out`}
            </p>
            {!checked && (
              <button
                type="button"
                onClick={() => submit(allocation)}
                disabled={isPending || left !== 0}
                className={`${skyButton} self-start`}
              >
                {isPending ? "Checking…" : "Lock in my plan"}
              </button>
            )}
          </div>
        )}
      </div>

      {checked && (
        <div
          role="status"
          className={`mt-4 animate-fade-up rounded-2xl p-4 ring-1 ${verdict(checked.points).className}`}
        >
          <p className="font-semibold">
            {verdict(checked.points).text} · {checked.points}/{checked.maxPoints}
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm leading-relaxed text-slate-800">
            {checked.feedback.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {checked && (
        <button type="button" onClick={next} disabled={isPending} className={`${skyButton} mt-5 w-full py-3.5 text-base sm:w-auto`}>
          {isPending ? "Saving…" : isLast ? "See my result" : `Next ${stepNoun.toLowerCase()}`}
          {!isPending && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      )}
    </section>
  );
}
