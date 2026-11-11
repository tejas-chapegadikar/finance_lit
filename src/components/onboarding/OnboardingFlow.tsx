"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { finishOnboarding, skipOnboarding } from "@/actions/onboarding";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { rupees } from "@/lib/money/categories";
import { Burst } from "@/components/ui/Burst";
import { primaryButton } from "@/components/ui/button-styles";
import { FlameIcon, StarIcon } from "@/components/ui/icons";

const STEPS = 4;
const digits = (v: string) => v.replace(/[^\d]/g, "").slice(0, 8);

function Amount({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-200">
        <span aria-hidden className="font-display text-3xl text-slate-500">
          ₹
        </span>
        <input id={id} autoFocus inputMode="numeric" autoComplete="off" value={value} onChange={(e) => onChange(digits(e.target.value))} placeholder="0" className="w-full bg-transparent px-2 py-3 font-display text-3xl text-slate-900 outline-none placeholder:text-slate-300" />
      </div>
    </div>
  );
}

/** First login: three questions, one per screen. Every one can be skipped. */
export function OnboardingFlow({ defaultNickname }: { defaultNickname: string }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(defaultNickname);
  const [income, setIncome] = useState("");
  const [budget, setBudget] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [xp, setXp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const suggested = income ? String(Math.round(Number(income) * 0.8)) : "";

  function finish(withGoal: boolean) {
    setError(null);
    start(async () => {
      try {
        const result = await finishOnboarding({ nickname, income, budget, goalName: withGoal ? goalName : "", goalTarget: withGoal ? goalTarget : "" });
        if (result.status === "invalid") setError(result.message);
        else setXp(result.xp);
      } catch (e) {
        unstable_rethrow(e);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function next(skip = false) {
    setError(null);
    if (step === 0) {
      if (skip) setNickname(defaultNickname);
      setStep(1);
    } else if (step === 1) {
      if (skip) setIncome("");
      else setBudget(suggested);
      setStep(2);
    } else if (step === 2) {
      if (skip) setBudget("");
      setStep(3);
    } else finish(!skip);
  }

  if (xp !== null) {
    return (
      <div role="status" className="relative flex animate-fade-up flex-col items-center gap-3 py-4 text-center">
        <Burst />
        <p className="inline-flex items-center gap-2 font-display text-3xl font-bold text-slate-900">
          <StarIcon className="h-7 w-7 text-orange-500" /> +20 XP
        </p>
        <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FlameIcon className="h-5 w-5 animate-flicker text-orange-500" /> Day 1 streak started
        </p>
        <p className="text-sm text-slate-600">One day down. Statistically, this is where most people quit.</p>
        <Link href="/dashboard" className={`${primaryButton} mt-2 w-full py-3.5 text-base`}>
          Go to Today
        </Link>
      </div>
    );
  }

  const canContinue = step === 0 ? nickname.trim().length > 0 : step === 1 ? !!income : step === 2 ? !!budget : !!goalName.trim() && !!goalTarget;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue && !pending) next();
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <div role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} className="flex gap-1.5">
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-brand-500" : i < step ? "w-2.5 bg-brand-900" : "w-2.5 bg-slate-200"}`} />
          ))}
        </div>
        <button type="button" onClick={() => start(() => skipOnboarding())} disabled={pending} className="min-h-10 text-sm font-semibold text-slate-600">
          Skip setup
        </button>
      </div>

      <div key={step} className="flex animate-fade-up flex-col gap-3">
        {step === 0 && (
          <>
            <h1 className="text-2xl leading-tight text-slate-900">What should I call you?</h1>
            <p className="text-sm text-slate-600">A nickname is fine. I&apos;ll use it when I&apos;m roasting you.</p>
            <label htmlFor="nickname" className="sr-only">
              Nickname
            </label>
            <input
              id="nickname"
              autoFocus
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
            />
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-2xl leading-tight text-slate-900">How much money do you get each month?</h1>
            <p className="text-sm text-slate-600">Pocket money, stipend, salary. Round it off, we won&apos;t audit you.</p>
            <Amount id="income" label="Monthly money" value={income} onChange={setIncome} />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl leading-tight text-slate-900">How much do you want to spend at most?</h1>
            <p className="text-sm text-slate-600">{income ? `We've suggested 80% of ${rupees(Number(income))}. The rest is meant to survive.` : "Pick your monthly limit."}</p>
            <Amount id="budget" label="Monthly budget" value={budget} onChange={setBudget} />
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl leading-tight text-slate-900">What are you saving for?</h1>
            <p className="text-sm text-slate-600">Optional. Money without a job tends to find one on Swiggy.</p>
            <div>
              <label htmlFor="goal-name" className="text-sm font-medium text-slate-700">
                Goal name
              </label>
              <input id="goal-name" autoFocus maxLength={40} value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g. Goa trip" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Target amount</p>
              <Amount id="goal-target" label="Target amount" value={goalTarget} onChange={setGoalTarget} />
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button type="submit" disabled={!canContinue || pending} className={`${primaryButton} w-full py-3.5 text-base`}>
          {pending ? "Saving…" : step === STEPS - 1 ? "Finish" : "Next"}
        </button>
        <button type="button" onClick={() => next(true)} disabled={pending} className="min-h-11 text-sm font-semibold text-slate-600">
          {step === STEPS - 1 ? "Skip and finish" : "Skip this"}
        </button>
      </div>
    </form>
  );
}
