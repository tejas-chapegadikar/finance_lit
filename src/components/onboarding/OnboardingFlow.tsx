"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeOnboarding } from "@/actions/onboarding";
import { LEARNER_STAGES, LEARNING_GOALS } from "@/lib/learner-profile";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

const TOTAL_STEPS = 4;

const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none focus:border-brand-500";

function ChoiceTile({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left font-semibold transition ${
        selected
          ? "border-brand-600 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-white text-slate-800 hover:border-brand-300 hover:bg-brand-50/50"
      }`}
    >
      <span className="flex-1">{children}</span>
      <span
        aria-hidden
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"
        }`}
      >
        {selected && <CheckIcon className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

export function OnboardingFlow({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(defaultName);
  const [stage, setStage] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canContinue =
    (step === 1 && displayName.trim().length >= 2) || (step === 2 && stage !== "") || step === 3 || (step === 4 && goal !== "");

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeOnboarding({ displayName, stage, collegeName, goal });
        if (result.error) {
          setError(result.error);
          return;
        }
        setDone(true);
      } catch {
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

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span aria-hidden className="text-6xl">
          🚀
        </span>
        <h1 className="text-2xl font-extrabold text-balance text-slate-900 sm:text-3xl">
          Your financial journey starts now.
        </h1>
        <p className="max-w-xs text-slate-600">
          We&apos;ll start you at Lesson 01 — Budgeting. It takes about 5 minutes.
        </p>
        <Link href="/dashboard" className={`${primaryButton} mt-2 w-full sm:w-auto`}>
          Go to my dashboard
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
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
            <span key={i} className={`h-2 flex-1 rounded-full ${i < step ? "bg-brand-600" : "bg-brand-100"}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-600 tabular-nums">
          {step}/{TOTAL_STEPS}
        </span>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">What should we call you?</h1>
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
          <h1 className="text-2xl font-extrabold text-slate-900">Where are you right now?</h1>
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
          <h1 className="text-2xl font-extrabold text-slate-900">Which college do you attend?</h1>
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
          <p className="text-sm text-slate-600">Optional — skip this if you&apos;ve graduated or would rather not say.</p>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900">What do you want to get better at?</h1>
          <div role="radiogroup" aria-label="Your goal" className="flex flex-col gap-2.5">
            {LEARNING_GOALS.map((g) => (
              <ChoiceTile key={g.value} selected={goal === g.value} onClick={() => setGoal(g.value)}>
                <span aria-hidden className="mr-2">
                  {g.icon}
                </span>
                {g.label}
              </ChoiceTile>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={!canContinue || isPending} className={`${primaryButton} w-full`}>
        {isPending
          ? "Saving…"
          : step === 3 && collegeName.trim() === ""
            ? "Skip for now"
            : step === TOTAL_STEPS
              ? "Finish"
              : "Continue"}
        {!isPending && <ArrowRightIcon className="h-4 w-4" />}
      </button>
    </form>
  );
}
