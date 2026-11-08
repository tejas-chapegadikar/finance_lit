"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { LEARNER_STAGES } from "@/lib/learner-profile";
import { GoalPicker } from "@/components/onboarding/GoalPicker";
import { primaryButton } from "@/components/ui/button-styles";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function ProfileForm({
  displayName,
  collegeName,
  stage,
  goals: initialGoals,
}: {
  displayName: string;
  collegeName: string;
  stage: string;
  goals: string[];
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});
  const [goals, setGoals] = useState(initialGoals.filter((g) => g !== "EVERYTHING"));

  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            maxLength={40}
            defaultValue={displayName}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="collegeName" className="text-sm font-semibold text-slate-700">
            College <span className="font-normal text-slate-600">(optional)</span>
          </label>
          <input
            id="collegeName"
            name="collegeName"
            type="text"
            maxLength={200}
            defaultValue={collegeName}
            placeholder="Type your college name"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stage" className="text-sm font-semibold text-slate-700">
            Stage
          </label>
          <select id="stage" name="stage" required defaultValue={stage} className={inputClass}>
            <option value="" disabled>
              Where are you right now?
            </option>
            {LEARNER_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-slate-700">
          What you want to get better at <span className="font-normal text-slate-600">(pick as many as you like)</span>
        </legend>
        <GoalPicker value={goals} onChange={setGoals} compact />
        {goals.map((g) => (
          <input key={g} type="hidden" name="goals" value={g} />
        ))}
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className={`${primaryButton} self-start`}>
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
