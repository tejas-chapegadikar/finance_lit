"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { completeOnboarding } from "@/actions/onboarding";
import { LEARNER_STAGES } from "@/lib/learner-profile";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { GoalPicker } from "./GoalPicker";

const TOTAL_STEPS = 4;

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function ChoiceTile({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left font-medium transition duration-150 active:scale-[0.99] ${
        selected ? "border-brand-500 bg-brand-50 text-slate-900 ring-2 ring-brand-100" : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
      }`}
    >
      <span className="flex-1">{children}</span>
      <span
        aria-hidden
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
        }`}
      >
        {selected && <CheckIcon className="h-3.5 w-3.5 animate-check" />}
      </span>
    </button>
  );
}

export function OnboardingFlow({ defaultName, nameKnown }: { defaultName: string; nameKnown: boolean }) {
  const [step, setStep] = useState(nameKnown && defaultName.trim().length >= 2 ? 2 : 1);
  const [displayName, setDisplayName] = useState(defaultName);
  const [stage, setStage] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // College (step 3) and the learning goal (step 4) are optional.
  const canContinue = (step === 1 && displayName.trim().length >= 2) || (step === 2 && stage !== "") || step >= 3;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        // Opens the dashboard when it succeeds.
        const result = await completeOnboarding({ displayName, stage, collegeName, goals });
        setError(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function next(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canContinue || isPending) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setError(null);
    } else {
      submit();
    }
  }

  return (
    <form onSubmit={next} className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeftIcon />
          </button>
        ) : (
          <span className="w-8" />
        )}
        <div
          role="progressbar"
          aria-label="Sign-up progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
          className="flex flex-1 gap-1.5"
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? "bg-emerald-500" : "bg-slate-200"}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-600 tabular-nums">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <h1 className="animate-fade-up text-3xl leading-tight text-slate-900">What should we call you?</h1>
          <label htmlFor="displayName" className="sr-only">
            Your name
          </label>
          <input
            id="displayName"
            autoFocus
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="Your name"
            className={inputClass}
          />
          <p className="text-sm text-slate-600">Shown on your dashboard and profile. You can change it later.</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          <h1 className="animate-fade-up text-3xl leading-tight text-slate-900">Where are you right now?</h1>
          <div role="radiogroup" aria-label="Your current stage" className="flex flex-col gap-2.5">
            {LEARNER_STAGES.map((s) => (
              <ChoiceTile key={s.value} selected={stage === s.value} onClick={() => setStage(s.value)}>
                {s.label}
              </ChoiceTile>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <h1 className="animate-fade-up text-3xl leading-tight text-slate-900">Which college do you attend?</h1>
          <label htmlFor="collegeName" className="sr-only">
            College name
          </label>
          <input
            id="collegeName"
            autoFocus
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            maxLength={200}
            placeholder="Type your college name"
            className={inputClass}
          />
          <p className="text-sm text-slate-600">Optional. Skip this if you&apos;ve graduated or would rather not say.</p>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-3">
          <h1 className="animate-fade-up text-3xl leading-tight text-slate-900">What do you want to get better at?</h1>
          <p className="-mt-1 text-sm text-slate-600">Pick as many as you want. You can change these later.</p>
          <GoalPicker value={goals} onChange={setGoals} />
          <p aria-live="polite" className="text-sm font-medium text-brand-700">
            {goals.length === 0 ? "" : goals.length === 1 ? "1 picked. Got room for more?" : `${goals.length} picked. Ambitious. I like it.`}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={!canContinue || isPending} className={`${primaryButton} w-full py-3.5 text-base`}>
        {isPending
          ? "Saving…"
          : (step === 3 && collegeName.trim() === "") || (step === 4 && goals.length === 0)
            ? "Skip for now"
            : step === TOTAL_STEPS
              ? "Finish"
              : "Continue"}
        {!isPending && <ArrowRightIcon className="h-4 w-4" />}
      </button>
    </form>
  );
}
