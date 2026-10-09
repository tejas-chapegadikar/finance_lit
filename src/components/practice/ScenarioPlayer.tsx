"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { checkScenarioStep, completeScenario, type ScenarioCompletion, type StepCheck } from "@/actions/scenarios";
import type { PublicScenario, StepAnswer } from "@/lib/scenarios";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { Markdown } from "@/components/ui/Markdown";
import { OptionButton, type OptionState } from "@/components/ui/OptionButton";
import { Medal } from "@/components/ui/Medal";
import { card, primaryButton, secondaryButton, skyButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { ScenarioExhibit } from "./ScenarioExhibit";

type Checked = Extract<StepCheck, { status: "checked" }>;
type Completed = Extract<ScenarioCompletion, { status: "completed" }>;

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function verdict(points: number) {
  if (points >= 2) return { text: "Smart move", className: "border-emerald-300 bg-emerald-50 text-emerald-900", edge: "var(--color-emerald-200)" };
  if (points === 1) return { text: "Partly there", className: "border-amber-300 bg-amber-50 text-amber-900", edge: "var(--color-amber-200)" };
  return { text: "Not the best call", className: "border-rose-200 bg-rose-50 text-rose-900", edge: "var(--color-rose-200)" };
}

/** Plays an interactive scenario: each step is checked on the server, then the run is saved. */
export function ScenarioPlayer({ scenario, xpReward, firstRun }: { scenario: PublicScenario; xpReward: number; firstRun: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<StepAnswer[]>([]);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [completion, setCompletion] = useState<Completed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = scenario.steps[stepIndex];
  const isLast = stepIndex === scenario.steps.length - 1;

  // Draft answers for the current step.
  const [choice, setChoice] = useState<number | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [allocation, setAllocation] = useState<Record<string, number>>(() => initialAllocation(scenario, 0));

  function submit(answer: StepAnswer) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await checkScenarioStep(scenario.slug, stepIndex, answer);
        if (result.status === "slow-down") {
          setError(SLOW_DOWN_MESSAGE);
          return;
        }
        setAnswers((prev) => [...prev.slice(0, stepIndex), answer]);
        setChecked(result);
      } catch {
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
      setAllocation(initialAllocation(scenario, stepIndex + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    startTransition(async () => {
      try {
        const result = await completeScenario(scenario.slug, answers);
        if (result.status === "slow-down") {
          setError(SLOW_DOWN_MESSAGE);
          return;
        }
        setCompletion(result);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function restart() {
    setStepIndex(0);
    setAnswers([]);
    setChecked(null);
    setCompletion(null);
    setChoice(null);
    setPicks([]);
    setAllocation(initialAllocation(scenario, 0));
  }

  if (completion) {
    return (
      <section className={`${card} flex flex-col items-center p-6 text-center sm:p-8`} aria-labelledby="scenario-done">
        <span className="motion-safe:animate-pop">
          <Medal icon={scenario.icon} earned={completion.score > 0} />
        </span>
        <h2 id="scenario-done" className="mt-3 text-2xl font-extrabold text-slate-900">
          {completion.label}
        </h2>
        <p className="mt-1 text-slate-700">
          You scored <span className="font-extrabold text-slate-900">{completion.score}/{completion.maxScore}</span> on “{scenario.title}”.
        </p>
        {completion.xpAwarded > 0 ? (
          <p className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-extrabold text-orange-700 ring-2 ring-orange-200">
            ⭐ +{completion.xpAwarded} XP for your first run
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-slate-600">Replays don&apos;t earn XP — but they&apos;re great practice.</p>
        )}
        <div className="mt-5 w-full rounded-2xl bg-brand-50 p-4 text-left ring-1 ring-brand-100">
          <p className="text-xs font-extrabold tracking-wider text-brand-800 uppercase">Takeaway</p>
          <p className="mt-1 font-semibold text-slate-900">{scenario.takeaway}</p>
        </div>
        <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/practice" className={primaryButton}>
            Back to Practice
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <button type="button" onClick={restart} className={secondaryButton}>
            Try it again
          </button>
          {scenario.lessonSlug && (
            <Link href={`/lessons/${scenario.lessonSlug}`} className={secondaryButton}>
              Revisit the lesson
            </Link>
          )}
        </div>
      </section>
    );
  }

  const optionState = (i: number): OptionState => {
    if (!checked) return choice === i ? "pending" : "idle";
    if (choice !== i) return "dimmed";
    return checked.points >= 2 ? "correct" : checked.points === 0 ? "wrong" : "pending";
  };

  const left = step.kind === "allocate" ? step.total - Object.values(allocation).reduce((sum, v) => sum + v, 0) : 0;

  return (
    <div className="flex flex-col gap-5">
      <section className={`${card} flex flex-col gap-4 p-5 sm:p-6`}>
        <Markdown variant="plain">{scenario.intro}</Markdown>
        <ScenarioExhibit exhibit={scenario.exhibit} />
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="step-heading">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold tracking-wider text-brand-700 uppercase">
            Decision {stepIndex + 1} of {scenario.steps.length}
          </p>
          {firstRun && (
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
              +{xpReward} XP when you finish
            </span>
          )}
        </div>
        <h2 id="step-heading" className="mt-2 text-lg leading-snug font-bold text-slate-900 sm:text-xl">
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
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-[transform,box-shadow] duration-100 sm:text-base ${
                        on
                          ? "border-brand-500 bg-brand-50 text-slate-900 shadow-[0_4px_0_0_var(--color-brand-300)]"
                          : "border-slate-200 bg-white text-slate-800 shadow-[0_4px_0_0_var(--color-slate-200)] enabled:hover:border-brand-300"
                      } enabled:active:translate-y-[3px] disabled:opacity-80`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${
                          on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"
                        }`}
                      >
                        {on && <CheckIcon className="h-4 w-4" />}
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
                      <label htmlFor={`alloc-${bucket.id}`} className="font-bold text-slate-900">
                        {bucket.label}
                      </label>
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">{rupees(value)}</span>
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
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  left === 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                }`}
              >
                {left === 0
                  ? "✅ Every rupee has a job."
                  : left > 0
                    ? `${rupees(left)} still to plan`
                    : `${rupees(-left)} over your stipend — take some out`}
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
            className={`mt-4 rounded-2xl border-2 p-4 ${verdict(checked.points).className}`}
            style={{ boxShadow: `0 4px 0 0 ${verdict(checked.points).edge}` }}
          >
            <p className="font-extrabold">
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
            {isPending ? "Saving…" : isLast ? "See my result" : "Next decision"}
            {!isPending && <ArrowRightIcon className="h-4 w-4" />}
          </button>
        )}
      </section>
    </div>
  );
}

function initialAllocation(scenario: PublicScenario, stepIndex: number): Record<string, number> {
  const step = scenario.steps[stepIndex];
  if (step?.kind !== "allocate") return {};
  return Object.fromEntries(step.buckets.map((b) => [b.id, b.initial]));
}
