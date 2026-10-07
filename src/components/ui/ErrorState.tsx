"use client";

import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { primaryButton } from "./button-styles";

/** Shared body for the error boundaries. `retry` re-renders the failed segment. */
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-900/5">
      <span aria-hidden className="text-4xl">
        😕
      </span>
      <h1 className="text-xl font-extrabold text-slate-900">{GENERIC_ERROR_MESSAGE}</h1>
      <p className="text-sm text-slate-600">If it keeps happening, refresh the page or come back in a minute.</p>
      <button type="button" onClick={retry} className={`${primaryButton} mt-2`}>
        Try again
      </button>
    </div>
  );
}
