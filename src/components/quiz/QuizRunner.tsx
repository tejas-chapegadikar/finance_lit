"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitAnswer, getCoachHint, completeAttempt } from "@/actions/quiz";
import { MAX_TRIES_PER_QUESTION } from "@/lib/constants";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, XIcon } from "@/components/ui/icons";
import { QuestionCard, type OptionState } from "./QuestionCard";
import { CoachPanel } from "./CoachPanel";
import { AnswerBanner } from "./AnswerBanner";

type Option = { id: string; text: string };
type Question = { id: string; prompt: string; options: Option[] };
type Resolution = {
  status: "correct" | "revealed";
  tryNumber: number;
  correctOptionId: string;
  explanation: string;
};

export function QuizRunner({
  attemptId,
  lessonSlug,
  lessonTitle,
  questions,
}: {
  attemptId: string;
  lessonSlug: string;
  lessonTitle: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);
  const [hint, setHint] = useState<{ level: number; text: string } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const question = questions[index];
  const isLastQuestion = index === questions.length - 1;
  const answeredCount = index + (resolution ? 1 : 0);

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

        if (result.status === "try-again") {
          setWrongOptionIds((ids) => [...ids, optionId]);
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
        setError("Something went wrong — please try again.");
      }
    });
  }

  function handleNext() {
    if (isLastQuestion) {
      startTransition(async () => {
        try {
          await completeAttempt(attemptId);
          router.push(`/lessons/${lessonSlug}/quiz/results/${attemptId}`);
        } catch {
          setError("Couldn't finish the quiz — please try again.");
        }
      });
      return;
    }

    setIndex((i) => i + 1);
    setPendingOptionId(null);
    setWrongOptionIds([]);
    setHint(null);
    setResolution(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/lessons/${lessonSlug}`}
          aria-label="Exit quiz"
          className="rounded-full p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-800"
        >
          <XIcon />
        </Link>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answeredCount}
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-orange-100"
        >
          <div
            className="h-full rounded-full bg-orange-600 transition-all duration-500"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-neutral-600">
          {answeredCount}/{questions.length}
        </span>
      </div>

      <p className="-mb-2 truncate text-sm font-semibold text-neutral-500">{lessonTitle}</p>

      <QuestionCard
        number={index + 1}
        total={questions.length}
        prompt={question.prompt}
        options={question.options}
        stateOf={stateOf}
        onSelect={handleSelect}
        disabled={isPending}
      />

      {!resolution && (hintLoading || hint) && (
        <CoachPanel
          hint={hint}
          loading={hintLoading}
          triesLeft={MAX_TRIES_PER_QUESTION - wrongOptionIds.length}
        />
      )}

      {resolution && (
        <AnswerBanner
          status={resolution.status}
          tryNumber={resolution.tryNumber}
          explanation={resolution.explanation}
        />
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {resolution && (
        <button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          className={`${primaryButton} w-full sm:ml-auto sm:w-auto`}
        >
          {isPending ? "Loading…" : isLastQuestion ? "See results" : "Next question"}
          {!isPending && <ArrowRightIcon className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
