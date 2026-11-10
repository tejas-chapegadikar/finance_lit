"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { acceptTerms, declineTerms } from "@/actions/consent";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ConsentCheck } from "./ConsentCheck";

/** The one-time agreement. Deliberately plain: no jokes where someone is giving consent. */
export function ConsentForm() {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Tick the box to continue.");
      return;
    }
    start(async () => {
      try {
        const result = await acceptTerms(true);
        if (result?.error) setError(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <form onSubmit={submit} className={`${card} flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-4 p-6 sm:p-8`}>
      <h1 className="text-2xl text-slate-900">Before you continue</h1>
      <p className="text-sm leading-relaxed text-slate-600">
        We save your name, progress and whatever money entries you add, so the app can work for you. The{" "}
        <Link href="/privacy" className="font-semibold text-brand-700 underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        explains what we keep, who helps us run it, and how to delete it.
      </p>
      <ConsentCheck
        checked={agreed}
        onChange={(v) => {
          setAgreed(v);
          setError(null);
        }}
      />
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${primaryButton} w-full py-3 text-[15px]`}>
        {pending ? "Saving…" : "Agree and continue"}
      </button>
      <button type="button" onClick={() => start(() => declineTerms())} className={`${secondaryButton} w-full py-3 text-[15px]`}>
        No thanks, sign out
      </button>
    </form>
  );
}
