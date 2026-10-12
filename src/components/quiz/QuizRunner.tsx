"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { submitAnswer, getCoachHint, completeAttempt, answerCoachCheck } from "@/actions/quiz";
import { ChoiceQuestion, type ChoiceAnswer } from "@/components/ui/ChoiceQuestion";
import type { CoachHint } from "@/lib/coach";
import { GENERIC_ERROR_MESSAGE, MAX_TRIES_PER_QUESTION, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { heroChip, heroSurface, primaryButton, skyButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, XIcon } from "@/components/ui/icons";
import type { OptionState } from "@/components/ui/OptionButton";
import { QuestionCard } from "./QuestionCard";
import { CoachPanel } from "./CoachPanel";
import { AnswerBanner } from "./AnswerBanner";
import { CoachFollowUp, type FollowUp } from "./CoachFollowUp";

export type Resolution = {
  status: "correct" | "revealed";
  tryNumber: number;
  correctOptionId: string;
  explanation: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  difficulty: string;
  options: { id: string; text: string }[];
  /** Wrong picks already made on this question — set when resuming after a refresh. */
  wrongOptionIds: string[];
  /** Set when the question was already resolved before this page load. */
  resolution: Resolution | null;
  /** The Coach's follow-up question (same idea, new example), asked after a miss. */
  practice: { prompt: string; options: string[] } | null;
  /** The answer to that follow-up, if already given. */
  coachCheck: ChoiceAnswer | null;
  /** Questions already asked to the Coach about this one. */
  followUps: FollowUp[];
};

// A question answered first time needs no follow-up; a miss gets the Coach's check.
function needsCheck(question: QuizQuestion, resolution: Resolution | null) {
  return !!question.practice && !!resolution && (resolution.status === "revealed" || resolution.tryNumber > 1);
}

export function QuizRunner({
  attemptId,
  lessonSlug,
  lessonTitle,
  questions,
}: {
  attemptId: string;
  lessonSlug: string;
  lessonTitle: string;
  questions: QuizQuestion[];
}) {
  // Resume at the first unresolved question (or the last one, if all are done).
  const firstOpen = questions.findIndex((q) => !q.resolution);
  const startIndex = firstOpen === -1 ? Math.max(0, questions.length - 1) : firstOpen;
  const resumed = questions[startIndex];
  const resumeNeedsHint = !!resumed && !resumed.resolution && resumed.wrongOptionIds.length > 0;

  const [index, setIndex] = useState(startIndex);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>(resumed?.wrongOptionIds ?? []);
  const [hint, setHint] = useState<CoachHint | null>(null);
  const [hintLoading, setHintLoading] = useState(resumeNeedsHint);
  const [resolution, setResolution] = useState<Resolution | null>(resumed?.resolution ?? null);
  const [error, setError] = useState<string | null>(null);
  const [restarted, setRestarted] = useState(false);
  const [checkDone, setCheckDone] = useState(!!resumed?.coachCheck);
  const [isPending, startTransition] = useTransition();

  const question = questions[index];
  const isLastQuestion = index === questions.length - 1;
  const answeredCount = index + (resolution ? 1 : 0);

  // After a refresh mid-question, bring back the Coach's hint for the wrong picks so far.
  const resumedQuestionId = resumed?.id;
  useEffect(() => {
    if (!resumeNeedsHint || !resumedQuestionId) return;
    let cancelled = false;
    getCoachHint({ attemptId, questionId: resumedQuestionId })
      .then((h) => {
        if (!cancelled) setHint(h);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHintLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId, resumeNeedsHint, resumedQuestionId]);

  function stateOf(optionId: string): OptionState {
    if (resolution) {
      if (optionId === resolution.correctOptionId) return "correct";
      return wrongOptionIds.includes(optionId) ? "wrong" : "dimmed";
    }
    if (wrongOptionIds.includes(optionId)) return "wrong";
    return optionId === pendingOptionId ? "pending" : "idle";
  }

  function handleSelect(optionId: string) {
    if (resolution || isPending) return;
    setPendingOptionId(optionId);
    setError(null);

    startTransition(async () => {
      try {
        const result = await submitAnswer({ attemptId, questionId: question.id, optionId });
        setPendingOptionId(null);

        if (result.status === "slow-down") {
          setError(SLOW_DOWN_MESSAGE);
          return;
        }

        if (result.status === "try-again") {
          setWrongOptionIds((ids) => [...ids, optionId]);
          setHint(null);
          setHintLoading(true);
          try {
            setHint(await getCoachHint({ attemptId, questionId: question.id }));
          } finally {
            setHintLoading(false);
          }
          return;
        }

        if (result.status === "revealed") {
          setWrongOptionIds((ids) => [...ids, optionId]);
        }
        setResolution({
          status: result.status,
          tryNumber: result.tryNumber,
          correctOptionId: result.correctOptionId,
          explanation: result.explanation,
        });
      } catch {
        setPendingOptionId(null);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function handleNext() {
    if (isLastQuestion) {
      setError(null);
      startTransition(async () => {
        try {
          // Redirects to the completion screen when it succeeds.
          const result = await completeAttempt(attemptId);
          if (result?.status === "restarted") setRestarted(true);
        } catch (err) {
          unstable_rethrow(err);
          setError(GENERIC_ERROR_MESSAGE);
        }
      });
      return;
    }

    const next = questions[index + 1];
    setIndex(index + 1);
    setPendingOptionId(null);
    setWrongOptionIds(next.wrongOptionIds);
    setHint(null);
    setResolution(next.resolution);
    setCheckDone(!!next.coachCheck);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (restarted) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-900/5">
        <p className="font-bold text-slate-900">You restarted this quiz in another tab.</p>
        <p className="mt-1 text-sm text-slate-600">Carry on there, or start a fresh attempt from the lesson.</p>
        <Link href={`/lessons/${lessonSlug}`} className={`${primaryButton} mt-4`}>
          Back to the lesson
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className={`${heroSurface} relative overflow-hidden px-4 pt-4 pb-5 sm:px-6`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-20 h-44 w-44 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <Link
            href={`/lessons/${lessonSlug}`}
            aria-label="Exit quiz"
            className="rounded-xl p-1.5 text-white transition hover:bg-white/15"
          >
            <XIcon className="h-6 w-6" />
          </Link>
          <p className="font-display flex-1 text-center text-xl font-extrabold">
            Question {index + 1} of {questions.length}
          </p>
          <span aria-hidden className="w-9" />
        </div>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answeredCount}
          aria-valuetext={`${answeredCount} of ${questions.length} answered`}
          className="relative mt-4 h-3 overflow-hidden rounded-full bg-brand-900/30"
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <p className="relative mt-3 flex justify-center">
          <span className={`${heroChip} max-w-full min-w-0`}>
            <span className="truncate">{lessonTitle} · Quiz</span>
          </span>
        </p>
      </div>

      <QuestionCard
        prompt={question.prompt}
        difficulty={question.difficulty}
        options={question.options}
        stateOf={stateOf}
        onSelect={handleSelect}
        disabled={isPending}
      />

      {!resolution && (hintLoading || hint) && (
        <CoachPanel hint={hint} loading={hintLoading} triesLeft={MAX_TRIES_PER_QUESTION - wrongOptionIds.length} />
      )}

      {resolution && (
        <AnswerBanner status={resolution.status} tryNumber={resolution.tryNumber} explanation={resolution.explanation} />
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {resolution && needsCheck(question, resolution) && question.practice && (
        <section
          key={question.id}
          aria-labelledby="coach-check-heading"
          className="rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-[0_4px_0_0_var(--color-brand-100)]"
        >
          <p id="coach-check-heading" className="text-sm font-extrabold text-brand-700">
            💡 AI Coach · Check you&apos;ve got it
          </p>
          <p className="mb-3 text-sm text-slate-600">Same idea, different example. This one doesn&apos;t change your score.</p>
          <ChoiceQuestion
            prompt={question.practice.prompt}
            options={question.practice.options}
            answer={answerCoachCheck.bind(null, attemptId, question.id)}
            initialAnswer={question.coachCheck}
            onAnswered={() => setCheckDone(true)}
            labels={{ right: "🎯 You've got it!", wrong: "❌ Not yet" }}
          />
        </section>
      )}

      {resolution && (
        <CoachFollowUp
          key={`ask-${question.id}`}
          attemptId={attemptId}
          questionId={question.id}
          missed={resolution.status === "revealed" || resolution.tryNumber > 1}
          initial={question.followUps}
        />
      )}

      {resolution && (!needsCheck(question, resolution) || checkDone) && (
        <button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          className={`${skyButton} w-full py-3.5 text-base sm:ml-auto sm:w-auto`}
        >
          {isPending ? "Loading…" : isLastQuestion ? "Finish quiz" : "Next question"}
          {!isPending && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
