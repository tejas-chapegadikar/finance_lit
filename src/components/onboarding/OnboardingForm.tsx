"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";

type College = { id: string; name: string; city: string };

export function OnboardingForm({ colleges }: { colleges: College[] }) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="collegeId" className="text-sm font-medium">
          College
        </label>
        <select
          id="collegeId"
          name="collegeId"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Select your college</option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {college.name} — {college.city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+91XXXXXXXXXX"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
