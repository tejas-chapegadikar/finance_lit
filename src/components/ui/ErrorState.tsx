"use client";

import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { primaryButton } from "./button-styles";

/** Shared body for the error boundaries. `retry` re-renders the failed segment. */
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-2xl text-slate-900">{GENERIC_ERROR_MESSAGE}</h1>
      <p className="text-sm text-slate-600">If it keeps happening, refresh the page or come back in a minute.</p>
      <button type="button" onClick={retry} className={`${primaryButton} mt-2`}>
        Try again
      </button>
    </div>
  );
}
