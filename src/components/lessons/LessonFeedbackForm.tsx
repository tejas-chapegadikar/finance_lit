"use client";

import { useState, useTransition } from "react";
import type { FeedbackResult } from "@/actions/feedback";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { FEEDBACK_COMMENT_MAX } from "@/lib/validations/feedback";
import { secondaryButton } from "@/components/ui/button-styles";

type Feedback = { helpful: boolean; comment: string };

/** "Was this lesson clear and useful?" — a thumbs choice plus an optional comment. */
export function LessonFeedbackForm({
  save,
  initial,
}: {
  save: (input: Feedback) => Promise<FeedbackResult>;
  initial: Feedback | null;
}) {
  const [helpful, setHelpful] = useState<boolean | null>(initial?.helpful ?? null);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [saved, setSaved] = useState(initial !== null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (helpful === null || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await save({ helpful, comment });
        if (result.status === "error") {
          setError(result.message);
          return;
        }
        setSaved(true);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  if (saved) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          Thanks — your feedback helps us make StockStreak clearer.
        </p>
        <button type="button" onClick={() => setSaved(false)} className="text-sm font-bold text-brand-700 hover:underline">
          Edit feedback
        </button>
      </div>
    );
  }

  const choice = (value: boolean, label: string, icon: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={helpful === value}
      onClick={() => setHelpful(value)}
      className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-bold transition-[transform,box-shadow] duration-100 ${
        helpful === value
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Was this lesson clear and useful?" className="flex flex-wrap gap-2">
        {choice(true, "Yes, it was", "👍")}
        {choice(false, "Not really", "👎")}
      </div>
      {helpful !== null && (
        <>
          <label htmlFor="feedback-comment" className="text-sm font-semibold text-slate-700">
            {helpful ? "What worked well?" : "What was confusing?"}{" "}
            <span className="font-normal text-slate-600">(optional)</span>
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={FEEDBACK_COMMENT_MAX}
            rows={3}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
          />
          <button type="submit" disabled={isPending} className={`${secondaryButton} self-start`}>
            {isPending ? "Sending…" : "Send feedback"}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}
    </form>
  );
}
