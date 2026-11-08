"use client";

import { useState, useTransition } from "react";
import { askCoach } from "@/actions/quiz";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { skyButton } from "@/components/ui/button-styles";
import { SparklesIcon } from "@/components/ui/icons";
import { CoachAvatar } from "./CoachPanel";

const MAX_FOLLOW_UPS = 3;
const MAX_LENGTH = 300;

export type FollowUp = { message: string; reply: string };

/** "Ask the Coach": a few follow-up questions about a question already answered. */
export function CoachFollowUp({
  attemptId,
  questionId,
  missed,
  initial,
}: {
  attemptId: string;
  questionId: string;
  /** Offers "Why was my answer wrong?" when the student missed it. */
  missed: boolean;
  initial: FollowUp[];
}) {
  const [open, setOpen] = useState(initial.length > 0);
  const [history, setHistory] = useState(initial);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const remaining = MAX_FOLLOW_UPS - history.length;
  const suggestions = [
    ...(missed ? ["Why was my first answer wrong?"] : []),
    "Explain it more simply",
    "Give me another example",
  ];

  function ask(message: string) {
    const text = message.trim();
    if (!text || isPending) return;
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await askCoach({ attemptId, questionId, message: text });
        if (result.status === "answered") {
          setHistory((h) => [...h, { message: text, reply: result.reply }]);
          setDraft("");
        }
        if (result.status === "unavailable") setNotice(result.message);
        if (result.status === "limit") setNotice("That's the follow-ups for this question. Revisit the lesson for more.");
        if (result.status === "slow-down") setNotice(SLOW_DOWN_MESSAGE);
      } catch {
        setNotice(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 self-start rounded-xl px-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
      >
        <SparklesIcon className="h-4 w-4" />
        Still unsure? Ask the AI Coach a follow-up
      </button>
    );
  }

  return (
    <section aria-labelledby={`ask-${questionId}`} className="animate-fade-up rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <CoachAvatar />
        <h2 id={`ask-${questionId}`} className="font-sans text-sm font-semibold tracking-normal text-slate-900">
          Ask the AI Coach
        </h2>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Plain-language help with this question, not personal financial advice. Please don&apos;t share personal details.
      </p>

      {history.length > 0 && (
        <ol className="mt-3 flex flex-col gap-2 text-sm" aria-label="Your conversation">
          {history.map((turn, i) => (
            <li key={i} className="flex flex-col gap-1.5">
              <p className="self-end rounded-2xl rounded-br-md bg-brand-600 px-3 py-2 font-semibold text-white">{turn.message}</p>
              <p className="animate-fade-up self-start rounded-2xl rounded-tl-md bg-slate-50 px-3 py-2 text-slate-800 ring-1 ring-slate-200">{turn.reply}</p>
            </li>
          ))}
        </ol>
      )}

      {remaining > 0 ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isPending}
                onClick={() => ask(s)}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <label htmlFor={`ask-input-${questionId}`} className="sr-only">
              Your question for the Coach
            </label>
            <input
              id={`ask-input-${questionId}`}
              value={draft}
              maxLength={MAX_LENGTH}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
            <button type="submit" disabled={isPending || !draft.trim()} className={`${skyButton} px-4 py-2`}>
              {isPending ? "Thinking…" : "Ask"}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-600">
            {remaining} {remaining === 1 ? "question" : "questions"} left for this one.
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold text-slate-700">That&apos;s the follow-ups for this question. Revisit the lesson for more.</p>
      )}

      {isPending && (
        <p className="mt-2 text-sm font-semibold text-slate-600" aria-live="polite">
          The Coach is thinking…
        </p>
      )}
      {notice && (
        <p role="status" className="mt-2 text-sm font-semibold text-slate-800">
          {notice}
        </p>
      )}
    </section>
  );
}
