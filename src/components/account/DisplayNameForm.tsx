"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateDisplayName } from "@/actions/profile";

export function DisplayNameForm({ currentDisplayName }: { currentDisplayName: string }) {
  const [state, formAction, isPending] = useActionState(updateDisplayName, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Display name updated");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="displayName" className="text-sm font-medium text-neutral-700">
        Display name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={40}
          defaultValue={currentDisplayName}
          className="flex-1 rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-900/20 hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
