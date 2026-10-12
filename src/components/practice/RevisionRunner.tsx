"use client";

import { useState } from "react";
import Link from "next/link";
import { answerRevision } from "@/actions/revision";
import { ChoiceQuestion } from "@/components/ui/ChoiceQuestion";
import { card, primaryButton, skyButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export type RevisionCard = {
  itemId: string;
  lessonTitle: string;
  lessonIcon: string;
  kind: "MISTAKE" | "CHECK";
  prompt: string;
  options: string[];
};

/** Works through today's due revision questions one at a time. */
export function RevisionRunner({ cards }: { cards: RevisionCard[] }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const current = cards[index];

  if (done || !current) {
    return (
      <section className={`${card} flex flex-col items-center p-8 text-center`}>
        <h2 className="text-2xl font-extrabold text-slate-900">Revision done for today</h2>
        <p className="mt-1 text-slate-600">
          You got <span className="font-extrabold text-slate-900">{correct}</span> of {cards.length} right. Anything you
          missed comes back tomorrow.
        </p>
        <Link href="/dashboard" className={`${primaryButton} mt-5`}>
          Back to dashboard
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className={`${card} p-5 sm:p-6`} aria-labelledby="revision-question">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p id="revision-question" className="text-sm font-semibold text-brand-700">
          Question {index + 1} of {cards.length}
        </p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          <span aria-hidden>{current.lessonIcon}</span> {current.lessonTitle} ·{" "}
          {current.kind === "CHECK" ? "7-day check" : "Missed before"}
        </span>
      </div>
      <div className="mt-4">
        <ChoiceQuestion
          key={current.itemId}
          prompt={current.prompt}
          options={current.options}
          answer={answerRevision.bind(null, current.itemId)}
          onAnswered={(result) => {
            setAnswered(true);
            if (result.isCorrect) setCorrect((c) => c + 1);
          }}
        />
      </div>
      {answered && (
        <button
          type="button"
          onClick={() => {
            setAnswered(false);
            if (index + 1 < cards.length) setIndex(index + 1);
            else setDone(true);
          }}
          className={`${skyButton} mt-5 w-full py-3.5 text-base sm:w-auto`}
        >
          {index + 1 < cards.length ? "Next question" : "Finish revision"}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
