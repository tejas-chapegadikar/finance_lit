import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome } from "@/lib/quiz-outcome";
import { coachCheckNote, revisionQuestion } from "@/lib/revision";
import { readChoiceOptions } from "@/lib/lesson-content";
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

  const checks = await db.revisionAnswer.findMany({
    where: { quizAttemptId: attempt.id, context: "COACH_CHECK" },
    select: { optionIndex: true, isCorrect: true, item: { select: { questionId: true } } },
  });

  // Correct answers only go to the browser for questions already resolved.
  const questions: QuizQuestion[] = attempt.lesson.questions.map((question) => {
    const practice = question.practicePrompt ? revisionQuestion(question) : null;
    const practiceOptions = practice ? readChoiceOptions(practice.options) : [];
    const check = checks.find((c) => c.item.questionId === question.id);
    const tries = attempt.answers.filter((a) => a.questionId === question.id);
    const outcome = questionOutcome(tries);
    const correct = question.options.find((o) => o.isCorrect);
    return {
      id: question.id,
      prompt: question.prompt,
      difficulty: question.difficulty,
      options: question.options.map(({ id, text }) => ({ id, text })),
      wrongOptionIds: tries.filter((t) => !t.isCorrect).map((t) => t.selectedOptionId),
      practice: practice ? { prompt: practice.prompt, options: practiceOptions.map((o) => o.text) } : null,
      coachCheck:
        practice && check
          ? {
              pickedIndex: check.optionIndex,
              isCorrect: check.isCorrect,
              correctIndex: practiceOptions.findIndex((o) => o.isCorrect),
              explanation: practice.explanation,
              note: coachCheckNote(check.isCorrect),
            }
          : null,
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
