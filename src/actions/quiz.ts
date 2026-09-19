"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { awardXp } from "@/lib/xp";
import { QUESTIONS_PER_QUIZ } from "@/lib/constants";

export async function startAttempt(lessonId: string) {
  const user = await requireOnboardedUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, isPublished: true },
  });
  if (!lesson || !lesson.isPublished) {
    throw new Error("Lesson not found");
  }

  // Abandon any stale in-progress attempt for this lesson (e.g. from a
  // refresh mid-quiz) so we don't accumulate dangling IN_PROGRESS rows.
  await db.quizAttempt.updateMany({
    where: { userId: user.id, lessonId: lesson.id, status: "IN_PROGRESS" },
    data: { status: "ABANDONED" },
  });

  const attempt = await db.quizAttempt.create({
    data: { userId: user.id, lessonId: lesson.id, totalQuestions: QUESTIONS_PER_QUIZ },
  });

  return attempt.id;
}

export async function submitAnswer(params: {
  attemptId: string;
  questionId: string;
  optionId: string;
}) {
  const user = await requireOnboardedUser();
  const { attemptId, questionId, optionId } = params;

  const attempt = await db.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id) {
    throw new Error("Attempt not found");
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This attempt is already complete");
  }

  const question = await db.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });
  if (!question || question.lessonId !== attempt.lessonId) {
    throw new Error("Question not found");
  }

  // isCorrect is computed here, server-side, from the DB — never trust a
  // client-supplied correctness flag.
  const selectedOption = question.options.find((o) => o.id === optionId);
  if (!selectedOption) {
    throw new Error("Option not found");
  }

  const answer = await db.quizAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: {
      attemptId,
      questionId,
      selectedOptionId: optionId,
      isCorrect: selectedOption.isCorrect,
    },
    update: {
      selectedOptionId: optionId,
      isCorrect: selectedOption.isCorrect,
    },
  });

  return {
    isCorrect: answer.isCorrect,
    explanation: question.explanation,
    correctOptionId: question.options.find((o) => o.isCorrect)?.id,
  };
}

export async function completeAttempt(attemptId: string) {
  const user = await requireOnboardedUser();

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true, lesson: true },
  });
  if (!attempt || attempt.userId !== user.id) {
    throw new Error("Attempt not found");
  }
  if (attempt.status === "COMPLETED") {
    return { attemptId: attempt.id };
  }

  // Score is recomputed from stored answers, never trusted from the client.
  const score = attempt.answers.filter((a) => a.isCorrect).length;

  // XP only on a user's FIRST completed attempt per lesson — retakes still
  // work and still show feedback, they just don't farm extra XP.
  const priorCompleted = await db.quizAttempt.findFirst({
    where: {
      userId: user.id,
      lessonId: attempt.lessonId,
      status: "COMPLETED",
      NOT: { id: attempt.id },
    },
  });
  const xpAwarded = priorCompleted ? 0 : attempt.lesson.xpReward;

  await db.$transaction(async (tx) => {
    await tx.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "COMPLETED",
        score,
        completedAt: new Date(),
        xpAwarded,
      },
    });

    if (xpAwarded > 0) {
      await awardXp(tx, {
        userId: user.id,
        amount: xpAwarded,
        type: "QUIZ_COMPLETION",
        quizAttemptId: attempt.id,
        description: `Completed "${attempt.lesson.title}"`,
      });
    }
  });

  revalidatePath("/dashboard");

  return { attemptId: attempt.id };
}
