"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeChallengeStep, joinChallenge, restartChallenge } from "@/actions/challenges";
import type { ChallengeStep } from "@/lib/challenges";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { OptionButton, type OptionState } from "@/components/ui/OptionButton";
import { Burst } from "@/components/ui/Burst";
import { ArrowRightIcon, CheckIcon, StarIcon } from "@/components/ui/icons";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";

type Done = { xpAwarded: number; finished: boolean; correct?: number; explanation?: string };

/** Today's step of a challenge: read it, do it, tap done — or answer its question. */
export function ChallengeStepCard({
  challengeId,
  stepNumber,
  step,
  checkedInToday,
}: {
  challengeId: string;
  stepNumber: number;
  step: ChallengeStep;
  checkedInToday: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function complete(pick?: number) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await completeChallengeStep(challengeId, pick);
        if (result.status === "done") return setDone(result);
        if (result.status === "needs-checkin") return setMessage("Check in on Money Manager first — log today's spends or mark a no-spend day.");
        if (result.status === "come-back-tomorrow") return setMessage("You've done today's step. The next one opens tomorrow.");
        if (result.status === "slow-down") return setMessage(SLOW_DOWN_MESSAGE);
        setMessage(GENERIC_ERROR_MESSAGE);
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  const optionState = (i: number): OptionState => {
    if (!done) return choice === i ? "pending" : "idle";
    if (i === done.correct) return "correct";
    return i === choice ? "wrong" : "dimmed";
  };

  return (
    <section aria-labelledby="step-today-heading" className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      {done && <Burst />}
      <p className="text-[13px] font-medium text-brand-700">Today · Step {stepNumber}</p>
      <h2 id="step-today-heading" className="mt-1 text-2xl leading-tight text-slate-900">
        {step.title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{step.body}</p>
      <p className="mt-4 border-l-2 border-brand-300 pl-4 font-medium text-slate-900">{step.task}</p>

      {step.kind === "quiz" && step.quiz && (
        <div className="mt-5">
          <p className="font-semibold text-slate-900">{step.quiz.prompt}</p>
          <div className="mt-3 flex flex-col gap-2.5" role="group" aria-label="Answer options">
            {step.quiz.options.map((option, i) => (
              <OptionButton
                key={i}
                index={i}
                text={option}
                state={optionState(i)}
                disabled={isPending || !!done}
                onSelect={() => {
                  setChoice(i);
                  complete(i);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step.kind === "log" && !checkedInToday && !done && (
        <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-950">
          This step needs today&apos;s money check-in.{" "}
          <Link href="/money" className="font-semibold underline underline-offset-4">
            Open Money Manager
          </Link>{" "}
          and log today&apos;s spends (or mark a no-spend day), then come back.
        </p>
      )}

      {done ? (
        <div role="status" className="mt-5 animate-fade-up">
          {done.explanation && <p className="text-sm leading-relaxed text-slate-700">{done.explanation}</p>}
          <p className="mt-3 inline-flex flex-wrap items-center gap-2 font-semibold text-emerald-800">
            <CheckIcon className="h-5 w-5" />
            {done.finished ? "Challenge complete!" : "Step done — see you tomorrow."}
            {done.xpAwarded > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-sm text-orange-800 ring-1 ring-orange-100">
                <StarIcon className="h-3.5 w-3.5 text-orange-500" /> +{done.xpAwarded} XP
              </span>
            )}
          </p>
        </div>
      ) : (
        step.kind !== "quiz" && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => complete()} disabled={isPending || (step.kind === "log" && !checkedInToday)} className={primaryButton}>
              {isPending ? "Saving…" : "Done for today"}
            </button>
            {step.link && (
              <Link href={step.link.href} className={secondaryButton}>
                {step.link.label}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        )
      )}
      {message && (
        <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
          {message}
        </p>
      )}
    </section>
  );
}

export function JoinChallengeButton({ challengeId, label = "Start the challenge" }: { challengeId: string; label?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              const result = await joinChallenge(challengeId);
              if (result.status === "slow-down") setError(SLOW_DOWN_MESSAGE);
            } catch {
              setError(GENERIC_ERROR_MESSAGE);
            }
          })
        }
        className={`${primaryButton} px-6 py-3 text-base`}
      >
        {isPending ? "Starting…" : label}
        <ArrowRightIcon className="h-4 w-4" />
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function RestartChallengeButton({ challengeId }: { challengeId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => void (await restartChallenge(challengeId)))}
      className={secondaryButton}
    >
      {isPending ? "Restarting…" : "Do it again (for practice — no XP)"}
    </button>
  );
}
