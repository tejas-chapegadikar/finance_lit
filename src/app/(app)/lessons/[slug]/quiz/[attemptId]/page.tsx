import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome } from "@/lib/quiz-outcome";
import { QuizRunner, type QuizQuestion } from "@/components/quiz/QuizRunner";

export const metadata: Metadata = { title: "Quiz — StockStreak" };

export default async function QuizPage(props: PageProps<"/lessons/[slug]/quiz/[attemptId]">) {
  const user = await requireOnboardedUser();
  const { slug, attemptId } = await props.params;

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      lesson: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      answers: { orderBy: { tryNumber: "asc" } },
    },
  });

  if (!attempt || attempt.userId !== user.id || attempt.lesson.slug !== slug) {
    notFound();
  }
  if (attempt.status === "COMPLETED") {
    redirect(`/lessons/${slug}/quiz/results/${attempt.id}`);
  }
  if (attempt.status === "ABANDONED") {
    redirect(`/lessons/${slug}`);
  }

  // Correct answers only go to the browser for questions already resolved.
  const questions: QuizQuestion[] = attempt.lesson.questions.map((question) => {
    const tries = attempt.answers.filter((a) => a.questionId === question.id);
    const outcome = questionOutcome(tries);
    const correct = question.options.find((o) => o.isCorrect);
    return {
      id: question.id,
      prompt: question.prompt,
      difficulty: question.difficulty,
      options: question.options.map(({ id, text }) => ({ id, text })),
      wrongOptionIds: tries.filter((t) => !t.isCorrect).map((t) => t.selectedOptionId),
      resolution:
        outcome && correct
          ? {
              status: outcome === "revealed" ? "revealed" : "correct",
              tryNumber: tries.length,
              correctOptionId: correct.id,
              explanation: question.explanation,
            }
          : null,
    };
  });

  return (
    <QuizRunner
      attemptId={attempt.id}
      lessonSlug={attempt.lesson.slug}
      lessonTitle={attempt.lesson.title}
      questions={questions}
    />
  );
}
