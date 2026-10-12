import type { Prisma, RevisionItem } from "@prisma/client";
import { db } from "./db";
import { istDay, shiftDay } from "./ist-date";
import { questionOutcome } from "./quiz-outcome";
import { readChoiceOptions, type ChoiceOption } from "./lesson-content";
import type { LessonProgress } from "./progress";

// Spaced revision: a concept the student missed comes back 1, 3 and 7 days
// later (stages 0, 1 and 2); getting it right at stage 2 retires it. A
// lesson finished without mistakes gets one 7-day check instead.
export const REVISION_INTERVALS = [1, 3, 7];
export const FINAL_STAGE = REVISION_INTERVALS.length - 1;
export const REVISION_XP = 5;

export function dueDayFor(stage: number, from = istDay()): string {
  return shiftDay(from, REVISION_INTERVALS[Math.min(stage, FINAL_STAGE)]);
}

/** "tomorrow" / "in 3 days" — when an item at `stage` comes back. */
export function whenDue(stage: number): string {
  const days = REVISION_INTERVALS[Math.min(stage, FINAL_STAGE)];
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

/** What the AI Coach's follow-up check tells the student about their schedule. */
export function coachCheckNote(isCorrect: boolean): string {
  return isCorrect
    ? `We'll check it once more ${whenDue(1)}.`
    : `No worries — this one comes back ${whenDue(0)} in Revision.`;
}

type Answer = { questionId: string; tryNumber: number; isCorrect: boolean };

/**
 * After a quiz is completed: every question the student didn't get right
 * first time is scheduled for revision tomorrow — unless the AI Coach's check
 * during this attempt already scheduled it. A first completion also gets a
 * 7-day retention check on a question they got right.
 */
export async function scheduleRevisionForAttempt(
  tx: Prisma.TransactionClient,
  params: { userId: string; lessonId: string; quizAttemptId: string; questionIds: string[]; answers: Answer[]; firstCompletion: boolean },
) {
  const { userId, lessonId, quizAttemptId, questionIds, answers, firstCompletion } = params;
  const checked = new Set(
    (
      await tx.revisionAnswer.findMany({
        where: { quizAttemptId, context: "COACH_CHECK" },
        select: { item: { select: { questionId: true } } },
      })
    ).map((a) => a.item.questionId),
  );

  const firstTry: string[] = [];
  for (const questionId of questionIds) {
    const outcome = questionOutcome(answers.filter((a) => a.questionId === questionId));
    if (outcome === "first-try") {
      firstTry.push(questionId);
      continue;
    }
    if (!outcome || checked.has(questionId)) continue;
    const reset = { kind: "MISTAKE" as const, stage: 0, dueDay: dueDayFor(0), status: "ACTIVE" as const };
    await tx.revisionItem.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: { userId, lessonId, questionId, ...reset },
      update: reset,
    });
  }

  if (firstCompletion && firstTry.length > 0) {
    await tx.revisionItem.upsert({
      where: { userId_questionId: { userId, questionId: firstTry[firstTry.length - 1] } },
      create: {
        userId,
        lessonId,
        questionId: firstTry[firstTry.length - 1],
        kind: "CHECK",
        stage: FINAL_STAGE,
        dueDay: dueDayFor(FINAL_STAGE),
      },
      update: {},
    });
  }
}

/** Moves an item along the schedule after an answer; returns when it's next due, or null once retired. */
export function nextSchedule(item: Pick<RevisionItem, "kind" | "stage">, isCorrect: boolean, today = istDay()) {
  if (!isCorrect) {
    return { kind: "MISTAKE" as const, stage: 0, dueDay: dueDayFor(0, today), status: "ACTIVE" as const, lastCorrect: false };
  }
  if (item.kind === "CHECK" || item.stage >= FINAL_STAGE) {
    return { kind: item.kind, stage: item.stage, dueDay: today, status: "DONE" as const, lastCorrect: true };
  }
  const stage = item.stage + 1;
  return { kind: item.kind, stage, dueDay: dueDayFor(stage, today), status: "ACTIVE" as const, lastCorrect: true };
}

/**
 * The question to ask for an item: the practice version (same idea, new
 * example) when there is one, otherwise the original quiz question.
 */
export function revisionQuestion(question: {
  prompt: string;
  explanation: string;
  practicePrompt: string | null;
  practiceOptions: Prisma.JsonValue;
  practiceExplanation: string | null;
  options: { text: string; isCorrect: boolean }[];
}): { prompt: string; options: ChoiceOption[]; explanation: string } {
  const practice = readChoiceOptions(question.practiceOptions);
  if (question.practicePrompt && practice.length > 0) {
    return { prompt: question.practicePrompt, options: practice, explanation: question.practiceExplanation ?? "" };
  }
  return { prompt: question.prompt, options: question.options, explanation: question.explanation };
}

export async function countDueRevision(userId: string, today = istDay()) {
  return db.revisionItem.count({ where: { userId, status: "ACTIVE", dueDay: { lte: today } } });
}

export type MasteryStatus = "not-started" | "practising" | "needs-revision" | "provisional" | "retained";

export const MASTERY_META: Record<MasteryStatus, { label: string; className: string; rule: string }> = {
  "not-started": {
    label: "Not started",
    className: "bg-slate-100 text-slate-700",
    rule: "You haven't completed this lesson's quiz yet.",
  },
  practising: {
    label: "Practising",
    className: "bg-amber-100 text-amber-900",
    rule: "You missed something here and it's scheduled for revision.",
  },
  "needs-revision": {
    label: "Needs revision",
    className: "bg-rose-100 text-rose-800",
    rule: "A revision question for this topic is due now.",
  },
  provisional: {
    label: "Provisional mastery",
    className: "bg-brand-100 text-brand-800",
    rule: "You've learned it — a check in a few days will confirm it stuck.",
  },
  retained: {
    label: "Retained",
    className: "bg-emerald-100 text-emerald-800",
    rule: "You got it right again days later, after spaced revision.",
  },
};

/**
 * Topic mastery per lesson, from clear rules — never from XP:
 * not completed → not started; a revision item due now → needs revision;
 * an open item from a mistake → practising; only the retention check left
 * (or nothing scheduled yet) → provisional; everything passed → retained.
 */
export async function getMastery(userId: string, lessons: LessonProgress[], today = istDay()) {
  const items = await db.revisionItem.findMany({
    where: { userId },
    select: { lessonId: true, kind: true, status: true, dueDay: true },
  });
  const mastery = new Map<string, MasteryStatus>();
  for (const lesson of lessons) {
    const own = items.filter((item) => item.lessonId === lesson.id);
    const active = own.filter((item) => item.status === "ACTIVE");
    let status: MasteryStatus;
    if (lesson.status !== "completed") status = "not-started";
    else if (active.some((item) => item.dueDay <= today)) status = "needs-revision";
    else if (active.some((item) => item.kind === "MISTAKE")) status = "practising";
    else if (active.length > 0 || own.length === 0) status = "provisional";
    else status = "retained";
    mastery.set(lesson.id, status);
  }
  return mastery;
}
