"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { primaryButton } from "@/components/ui/button-styles";

export function OnboardingForm({ defaultDisplayName }: { defaultDisplayName: string }) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="displayName" className="text-sm font-medium text-neutral-700">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={40}
          defaultValue={defaultDisplayName}
          placeholder="How should we show your name?"
          className="rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
        />
        <p className="text-xs text-neutral-500">
          Shown on your profile. You can change it any time.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="collegeName" className="text-sm font-medium text-neutral-700">
          College <span className="font-normal text-neutral-500">(current or most recent)</span>
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

      <button type="submit" disabled={isPending} className={primaryButton}>
        {isPending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
