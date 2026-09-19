"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeAttempt } from "@/actions/quiz";
import { QuestionCard } from "./QuestionCard";
import { FeedbackBanner } from "./FeedbackBanner";

type Option = { id: string; text: string; order: number };
type Question = { id: string; prompt: string; options: Option[] };
type Feedback = {
  isCorrect: boolean;
  explanation: string;
  correctOptionId?: string;
};

export function QuizRunner({
  attemptId,
  lessonSlug,
  questions,
}: {
  attemptId: string;
  lessonSlug: string;
  lessonTitle: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = questions[index];
  const isLastQuestion = index === questions.length - 1;

  function handleSelect(optionId: string) {
    if (feedback) return;
    setSelectedOptionId(optionId);
    startTransition(async () => {
      const result = await submitAnswer({
        attemptId,
        questionId: currentQuestion.id,
        optionId,
      });
      setFeedback(result);
    });
  }

  function handleNext() {
    if (isLastQuestion) {
      startTransition(async () => {
        await completeAttempt(attemptId);
        router.push(`/lessons/${lessonSlug}/quiz/results/${attemptId}`);
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelectedOptionId(null);
    setFeedback(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
          Question {index + 1}/{questions.length}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all"
            style={{ width: `${((index + (feedback ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        feedback={feedback}
        onSelect={handleSelect}
        disabled={isPending}
      />

      {feedback && <FeedbackBanner feedback={feedback} />}

      {feedback && (
        <button
          onClick={handleNext}
          disabled={isPending}
          className="ml-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-900/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Loading…" : isLastQuestion ? "See results" : "Next question"}
        </button>
      )}
    </div>
  );
}
