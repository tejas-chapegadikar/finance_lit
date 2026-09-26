"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="collegeName" className="text-sm font-medium text-neutral-700">
          College
        </label>
        <input
          id="collegeName"
          name="collegeName"
          type="text"
          required
          placeholder="e.g. BITS Pilani"
          className="rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+91XXXXXXXXXX"
          className="rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-900/20 hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
