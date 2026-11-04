"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { awardLevelBonusIfComplete, awardXp, lockUser, xpKeys } from "@/lib/xp";
import { awardLessonBadges } from "@/lib/badges";
import { reactToQuiz } from "@/lib/avatar/learning";
import { COACH_UNAVAILABLE_MESSAGE, MAX_TRIES_PER_QUESTION, QUESTIONS_PER_QUIZ } from "@/lib/constants";
import { questionOutcome, summarizeAttempt } from "@/lib/quiz-outcome";
import {
  COACH_MODEL,
  MAX_FOLLOW_UPS,
  MAX_FOLLOW_UP_LENGTH,
  answerFollowUp,
  fallbackHint,
  getOrCreateCoachHint,
  type CoachHint,
} from "@/lib/coach";
import { assertLessonUnlocked, fetchProgress, readinessAfterQuiz } from "@/lib/progress";
import { recordStreakDay } from "@/lib/streak";
import { coachCheckNote, dueDayFor, revisionQuestion, scheduleRevisionForAttempt } from "@/lib/revision";
import { readChoiceOptions } from "@/lib/lesson-content";
import { coachRatelimit, isAllowed, quizAnswerRatelimit } from "@/lib/ratelimit";

/**
 * Starts a fresh attempt and opens it. A form action (the lesson page's
 * "Start quiz" button) rather than something the quiz page does while
 * rendering, so prefetches and re-renders never create attempts.
 */
export async function beginQuiz(lessonId: string) {
  const user = await requireOnboardedUser();

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true, slug: true, isPublished: true } });
  if (!lesson?.isPublished) {
    throw new Error("Lesson not found");
  }
  // Levels open in order — checked here, not just hidden in the page.
  await assertLessonUnlocked(user.id, lesson.id);

  // Abandon any stale in-progress attempt for this lesson (e.g. from a
  // refresh mid-quiz) so we don't accumulate dangling IN_PROGRESS rows.
  await Promise.all([
    db.quizAttempt.updateMany({
      where: { userId: user.id, lessonId: lesson.id, status: "IN_PROGRESS" },
      data: { status: "ABANDONED" },
    }),
    // When the student was last active — kept for Day-7 / Day-30 retention.
    db.user.update({ where: { id: user.id }, data: { lastActivityDate: new Date() } }),
  ]);

  const attempt = await db.quizAttempt.create({
    data: { userId: user.id, lessonId: lesson.id, totalQuestions: QUESTIONS_PER_QUIZ },
  });

  redirect(`/lessons/${lesson.slug}/quiz/${attempt.id}`);
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
  | { status: "revealed"; tryNumber: number; correctOptionId: string; explanation: string }
  | { status: "slow-down" };

export async function submitAnswer(params: {
  attemptId: string;
  questionId: string;
  optionId: string;
}): Promise<AnswerResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(quizAnswerRatelimit, user.id))) {
    return { status: "slow-down" };
  }

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

/**
 * The AI Coach only ever sees this one question, its options, the course
 * explanation and the lesson text — never the rest of the curriculum or
 * anything about the student.
 */
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

  // Over the limit: still help the student, just without a model call.
  if (!(await isAllowed(coachRatelimit, user.id))) {
    return fallbackHint(wrongOptionIds.length, question.hint);
  }

  return getOrCreateCoachHint({
    questionId: question.id,
    prompt: question.prompt,
    explanation: question.explanation,
    options: question.options,
    lessonTitle: question.lesson.title,
    lessonContent: question.lesson.contentMarkdown,
    authoredHint: question.hint,
    wrongOptionIds,
  });
}

/**
 * Finishes the quiz and opens the completion screen. Only returns (with
 * "restarted") when the student has since started this quiz again elsewhere.
 */
export async function completeAttempt(attemptId: string): Promise<{ status: "restarted" }> {
  const user = await requireOnboardedUser();

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      lesson: { select: { id: true, slug: true, title: true, xpReward: true, questions: { select: { id: true } } } },
    },
  });
  if (!attempt || attempt.userId !== user.id) {
    throw new Error("Attempt not found");
  }
  const resultsUrl = `/lessons/${attempt.lesson.slug}/quiz/results/${attempt.id}`;
  if (attempt.status === "COMPLETED") {
    redirect(resultsUrl);
  }
  if (attempt.status === "ABANDONED") {
    return { status: "restarted" };
  }

  // Score and mastery are recomputed from stored answers, never trusted from
  // the client.
  const summary = summarizeAttempt(attempt.answers, attempt.totalQuestions);
  if (summary.resolved < attempt.totalQuestions) {
    throw new Error("Answer every question before finishing the quiz");
  }

  const progressBefore = await fetchProgress(user.id);
  const readinessBefore = progressBefore.overall;
  const readinessAfter = readinessAfterQuiz(progressBefore, attempt.lessonId, summary.mastery);

  let completedNow: { firstCompletion: boolean } | null = null;
  await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);

    // XP only on a student's FIRST completed attempt per lesson — retakes
    // still count toward Financial Readiness, they just don't farm XP.
    const priorCompleted = await tx.quizAttempt.count({
      where: { userId: user.id, lessonId: attempt.lessonId, status: "COMPLETED", NOT: { id: attempt.id } },
    });
    const xpAwarded = priorCompleted > 0 ? 0 : attempt.lesson.xpReward;

    // Conditional update: if a concurrent request already finished this
    // attempt, it did the awarding and this one does nothing.
    const { count } = await tx.quizAttempt.updateMany({
      where: { id: attempt.id, status: "IN_PROGRESS" },
      data: {
        status: "COMPLETED",
        score: summary.firstTry,
        mastery: summary.mastery,
        completedAt: new Date(),
        xpAwarded,
        readinessBefore,
        readinessAfter,
      },
    });
    if (count === 0) return;
    completedNow = { firstCompletion: priorCompleted === 0 };

    if (xpAwarded > 0) {
      const awarded = await awardXp(tx, {
        userId: user.id,
        amount: xpAwarded,
        type: "QUIZ_COMPLETION",
        idempotencyKey: xpKeys.lessonComplete(user.id, attempt.lessonId),
        quizAttemptId: attempt.id,
        description: `Completed "${attempt.lesson.title}"`,
      });
      if (awarded !== xpAwarded) {
        // This lesson's reward was already paid — the completion screen must say +0.
        await tx.quizAttempt.update({ where: { id: attempt.id }, data: { xpAwarded: awarded } });
      }
      await awardLevelBonusIfComplete(tx, user.id, attempt.id);
    }
    await awardLessonBadges(tx, user.id, attempt.id);
    await scheduleRevisionForAttempt(tx, {
      userId: user.id,
      lessonId: attempt.lessonId,
      quizAttemptId: attempt.id,
      questionIds: attempt.lesson.questions.map((q) => q.id),
      answers: attempt.answers,
      firstCompletion: priorCompleted === 0,
    });
    await recordStreakDay(tx, user.id);
  }, SLOW_DB_TRANSACTION);

  // The avatar reacts to what this attempt changed (lesson, level, rank, unlocks).
  const done = completedNow as { firstCompletion: boolean } | null;
  if (done) {
    await reactToQuiz(
      user.id,
      { id: attempt.id, lessonId: attempt.lessonId, firstTry: summary.firstTry, total: attempt.totalQuestions, firstCompletion: done.firstCompletion },
      progressBefore,
      await fetchProgress(user.id),
    );
  }

  // The shared layout shows XP, so refresh it along with the destination.
  revalidatePath("/", "layout");
  redirect(resultsUrl);
}

export type CoachCheckResult =
  | { status: "answered"; isCorrect: boolean; correctIndex: number; explanation: string; note: string }
  | { status: "slow-down" };

/**
 * The AI Coach's follow-up after a missed question: the same idea with a
 * different example. Checked here, never in the browser. Getting it right
 * schedules a revision check in 3 days; missing it brings it back tomorrow.
 * One answer per question per attempt — asking again returns the first.
 */
export async function answerCoachCheck(
  attemptId: string,
  questionId: string,
  optionIndex: number,
): Promise<CoachCheckResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(quizAnswerRatelimit, user.id))) {
    return { status: "slow-down" };
  }

  const attempt = await db.quizAttempt.findUnique({ where: { id: attemptId }, select: { userId: true, lessonId: true } });
  if (!attempt || attempt.userId !== user.id) throw new Error("Attempt not found");
  const question = await db.question.findUnique({ where: { id: questionId }, include: { options: true } });
  if (!question || question.lessonId !== attempt.lessonId) throw new Error("Question not found");

  const tries = await db.quizAnswer.findMany({ where: { attemptId, questionId } });
  const outcome = questionOutcome(tries);
  if (outcome !== "with-coach" && outcome !== "revealed") throw new Error("No check needed for this question");

  const practice = revisionQuestion(question);
  const options = readChoiceOptions(practice.options);
  const correctIndex = options.findIndex((o) => o.isCorrect);
  if (!Number.isInteger(optionIndex) || !options[optionIndex] || correctIndex === -1) throw new Error("Option not found");

  const result = (isCorrect: boolean): CoachCheckResult => ({
    status: "answered",
    isCorrect,
    correctIndex,
    explanation: practice.explanation,
    note: coachCheckNote(isCorrect),
  });

  const existing = await db.revisionAnswer.findFirst({
    where: { quizAttemptId: attemptId, context: "COACH_CHECK", item: { questionId } },
  });
  if (existing) return result(existing.isCorrect);

  const isCorrect = options[optionIndex].isCorrect;
  const stage = isCorrect ? 1 : 0;
  const schedule = { kind: "MISTAKE" as const, stage, dueDay: dueDayFor(stage), status: "ACTIVE" as const, lastCorrect: isCorrect };
  try {
    await db.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      const item = await tx.revisionItem.upsert({
        where: { userId_questionId: { userId: user.id, questionId } },
        create: { userId: user.id, lessonId: attempt.lessonId, questionId, ...schedule },
        update: schedule,
      });
      await tx.revisionAnswer.create({
        data: { itemId: item.id, userId: user.id, context: "COACH_CHECK", stage, optionIndex, isCorrect, quizAttemptId: attemptId },
      });
    }, SLOW_DB_TRANSACTION);
  } catch (err) {
    // A double tap: the first answer won.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const first = await db.revisionAnswer.findFirst({
        where: { quizAttemptId: attemptId, context: "COACH_CHECK", item: { questionId } },
      });
      if (first) return result(first.isCorrect);
    }
    throw err;
  }
  return result(isCorrect);
}

export type FollowUpResult =
  | { status: "answered"; reply: string; remaining: number }
  | { status: "unavailable"; message: string }
  | { status: "limit" }
  | { status: "slow-down" };

/**
 * A follow-up question to the AI Coach about a question the student has
 * already answered. The Coach sees only this lesson, this question and the
 * conversation so far. A few per question, so model calls stay bounded.
 */
export async function askCoach(params: { attemptId: string; questionId: string; message: string }): Promise<FollowUpResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(coachRatelimit, user.id))) return { status: "slow-down" };

  const message = params.message.trim().slice(0, MAX_FOLLOW_UP_LENGTH);
  if (!message) throw new Error("Type a question first");

  const attempt = await db.quizAttempt.findUnique({ where: { id: params.attemptId }, select: { userId: true, lessonId: true } });
  if (!attempt || attempt.userId !== user.id) throw new Error("Attempt not found");
  const question = await db.question.findUnique({
    where: { id: params.questionId },
    include: { options: { orderBy: { order: "asc" } }, lesson: { select: { title: true, contentMarkdown: true } } },
  });
  if (!question || question.lessonId !== attempt.lessonId) throw new Error("Question not found");

  const [tries, history] = await Promise.all([
    db.quizAnswer.findMany({ where: { attemptId: params.attemptId, questionId: question.id }, orderBy: { tryNumber: "asc" } }),
    db.coachFollowUp.findMany({
      where: { attemptId: params.attemptId, questionId: question.id },
      orderBy: { createdAt: "asc" },
      select: { message: true, reply: true },
    }),
  ]);
  // Only once the answer is on screen — follow-ups never give a question away.
  if (!questionOutcome(tries)) throw new Error("Answer the question first");
  if (history.length >= MAX_FOLLOW_UPS) return { status: "limit" };

  const reply = await answerFollowUp({
    lessonTitle: question.lesson.title,
    lessonContent: question.lesson.contentMarkdown,
    prompt: question.prompt,
    options: question.options,
    explanation: question.explanation,
    picks: tries.map((t) => question.options.find((o) => o.id === t.selectedOptionId)?.text ?? ""),
    history,
    message,
  });
  if (!reply) return { status: "unavailable", message: COACH_UNAVAILABLE_MESSAGE };

  await db.coachFollowUp.create({
    data: { userId: user.id, attemptId: params.attemptId, questionId: question.id, message, reply, model: COACH_MODEL },
  });
  return { status: "answered", reply, remaining: MAX_FOLLOW_UPS - history.length - 1 };
}
