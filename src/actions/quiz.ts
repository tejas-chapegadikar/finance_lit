"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { awardXp } from "@/lib/xp";
import { MAX_TRIES_PER_QUESTION, QUESTIONS_PER_QUIZ } from "@/lib/constants";
import { questionOutcome, summarizeAttempt } from "@/lib/quiz-outcome";
import { getOrCreateCoachHint, type CoachHint } from "@/lib/coach";

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
  await Promise.all([
    db.quizAttempt.updateMany({
      where: { userId: user.id, lessonId: lesson.id, status: "IN_PROGRESS" },
      data: { status: "ABANDONED" },
    }),
    // Feeds Day-7 / Day-30 retention on the admin metrics page.
    db.user.update({ where: { id: user.id }, data: { lastActivityDate: new Date() } }),
  ]);

  const attempt = await db.quizAttempt.create({
    data: { userId: user.id, lessonId: lesson.id, totalQuestions: QUESTIONS_PER_QUIZ },
  });

  return attempt.id;
}

async function loadQuestionInAttempt(attemptId: string, questionId: string, userId: string) {
  const attempt = await db.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found");
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This attempt is already complete");
  }

  const question = await db.question.findUnique({
    where: { id: questionId },
    include: {
      options: { orderBy: { order: "asc" } },
      lesson: { select: { title: true, contentMarkdown: true } },
    },
  });
  if (!question || question.lessonId !== attempt.lessonId) {
    throw new Error("Question not found");
  }

  const tries = await db.quizAnswer.findMany({
    where: { attemptId, questionId },
    orderBy: { tryNumber: "asc" },
  });

  return { question, tries };
}

export type AnswerResult =
  | { status: "correct"; tryNumber: number; correctOptionId: string; explanation: string }
  | { status: "try-again"; tryNumber: number; triesLeft: number }
  | { status: "revealed"; tryNumber: number; correctOptionId: string; explanation: string };

export async function submitAnswer(params: {
  attemptId: string;
  questionId: string;
  optionId: string;
}): Promise<AnswerResult> {
  const user = await requireOnboardedUser();
  const { attemptId, questionId, optionId } = params;
  const { question, tries } = await loadQuestionInAttempt(attemptId, questionId, user.id);

  // Correctness is decided here from the DB — never trust the client. The
  // correct option only leaves the server once the question is resolved.
  const selected = question.options.find((o) => o.id === optionId);
  const correct = question.options.find((o) => o.isCorrect);
  if (!selected || !correct) {
    throw new Error("Option not found");
  }
  if (questionOutcome(tries)) {
    throw new Error("This question is already answered");
  }
  if (tries.some((t) => t.selectedOptionId === optionId)) {
    throw new Error("You already tried that option");
  }

  const tryNumber = tries.length + 1;
  await db.quizAnswer.create({
    data: { attemptId, questionId, selectedOptionId: optionId, isCorrect: selected.isCorrect, tryNumber },
  });

  if (selected.isCorrect) {
    return { status: "correct", tryNumber, correctOptionId: correct.id, explanation: question.explanation };
  }
  if (tryNumber >= MAX_TRIES_PER_QUESTION) {
    return { status: "revealed", tryNumber, correctOptionId: correct.id, explanation: question.explanation };
  }
  return { status: "try-again", tryNumber, triesLeft: MAX_TRIES_PER_QUESTION - tryNumber };
}

export async function getCoachHint(params: { attemptId: string; questionId: string }): Promise<CoachHint> {
  const user = await requireOnboardedUser();
  const { question, tries } = await loadQuestionInAttempt(params.attemptId, params.questionId, user.id);

  if (questionOutcome(tries)) {
    throw new Error("This question is already answered");
  }
  const wrongOptionIds = tries.filter((t) => !t.isCorrect).map((t) => t.selectedOptionId);
  if (wrongOptionIds.length === 0) {
    throw new Error("Pick an answer first");
  }

  return getOrCreateCoachHint({
    questionId: question.id,
    prompt: question.prompt,
    explanation: question.explanation,
    options: question.options,
    lessonTitle: question.lesson.title,
    lessonContent: question.lesson.contentMarkdown,
    wrongOptionIds,
  });
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

  // Score and mastery are recomputed from stored answers, never trusted from
  // the client.
  const summary = summarizeAttempt(attempt.answers, attempt.totalQuestions);
  if (summary.resolved < attempt.totalQuestions) {
    throw new Error("Answer every question before finishing the quiz");
  }

  // XP only on a user's FIRST completed attempt per lesson — retakes still
  // count toward Financial Readiness, they just don't farm extra XP.
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
        score: summary.firstTry,
        mastery: summary.mastery,
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
  revalidatePath("/lessons");

  return { attemptId: attempt.id };
}
