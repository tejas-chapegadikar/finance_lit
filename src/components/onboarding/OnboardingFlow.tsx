"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { finishOnboarding } from "@/actions/onboarding";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { LEARNER_STAGES, type LearnerStageValue } from "@/lib/learner-profile";
import { Burst } from "@/components/ui/Burst";
import { primaryButton } from "@/components/ui/button-styles";
import { FlameIcon, StarIcon } from "@/components/ui/icons";

const field =
  "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

/** First login: your name (required, shown on your profile), your college and your year (both optional). No skipping the name. */
export function OnboardingFlow({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [collegeName, setCollegeName] = useState("");
  const [stage, setStage] = useState<LearnerStageValue | "">("");
  const [touched, setTouched] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const nameError = name.trim().length < 2 ? "Please enter your name (at least 2 characters)." : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (nameError) return document.getElementById("name")?.focus();
    start(async () => {
      try {
        const result = await finishOnboarding({ name, collegeName, stage });
        if (result.status === "invalid") setError(result.message);
        else setXp(result.xp);
      } catch (err) {
        unstable_rethrow(err);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
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
        <p className="text-sm text-slate-600">One day down. Most people quit right about here. Don&apos;t.</p>
        <Link href="/dashboard" className={`${primaryButton} mt-2 w-full py-3.5 text-base`}>
          Let&apos;s go
        </Link>
      </div>
    );
  }

  const showNameError = touched && nameError;

  return (
    <form onSubmit={submit} noValidate className="flex animate-fade-up flex-col gap-5">
      <div>
        <h1 className="text-2xl leading-tight text-slate-900">Tell us about you</h1>
        <p className="mt-1 text-sm text-slate-600">Just three quick things. Only your name is needed.</p>
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Your name
        </label>
        <input
          id="name"
          autoFocus
          required
          autoComplete="name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!showNameError}
          aria-describedby={showNameError ? "name-error" : "name-hint"}
          className={`${field} ${showNameError ? "border-rose-500" : ""}`}
        />
        {showNameError ? (
          <p id="name-error" className="mt-1.5 text-sm font-medium text-rose-700">
            {nameError}
          </p>
        ) : (
          <p id="name-hint" className="mt-1.5 text-xs text-slate-600">
            This shows on your profile.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="college" className="text-sm font-semibold text-slate-700">
          College name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="college"
          autoComplete="organization"
          maxLength={120}
          value={collegeName}
          onChange={(e) => setCollegeName(e.target.value)}
          placeholder="e.g. St. Xavier's College, Mumbai"
          className={field}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">
          College year <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEARNER_STAGES.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={stage === s.value}
              onClick={() => setStage(stage === s.value ? "" : s.value)}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition ${stage === s.value ? "border-brand-900 bg-brand-900 font-semibold text-white" : "border-slate-200 bg-white font-medium text-slate-700"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${primaryButton} w-full py-3.5 text-base`}>
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
