"use server";

import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { readChoiceOptions } from "@/lib/lesson-content";
import { isAllowed, quizAnswerRatelimit } from "@/lib/ratelimit";

export async function recordLessonView(lessonId: string) {
  const user = await requireOnboardedUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { isPublished: true },
  });
  if (!lesson?.isPublished) {
    return;
  }

  await Promise.all([
    db.lessonView.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId },
      update: {},
    }),
    // When the student was last active — kept for Day-7 / Day-30 retention.
    db.user.update({ where: { id: user.id }, data: { lastActivityDate: new Date() } }),
  ]);
}

export type ScenarioResult =
  | { status: "answered"; isCorrect: boolean; correctIndex: number; explanation: string }
  | { status: "slow-down" };

/**
 * Checks a "What would you do?" answer on the server. Only the student's
 * first answer is kept, so answering again after reading the explanation
 * doesn't hide how they decided the first time.
 */
export async function answerScenario(lessonId: string, optionIndex: number): Promise<ScenarioResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(quizAnswerRatelimit, user.id))) {
    return { status: "slow-down" };
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { isPublished: true, scenarioOptions: true, scenarioExplanation: true },
  });
  if (!lesson?.isPublished) {
    throw new Error("Lesson not found");
  }

  const options = readChoiceOptions(lesson.scenarioOptions);
  const picked = options[optionIndex];
  const correctIndex = options.findIndex((o) => o.isCorrect);
  if (!Number.isInteger(optionIndex) || !picked || correctIndex === -1) {
    throw new Error("Option not found");
  }

  await db.scenarioAnswer.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, optionIndex, isCorrect: picked.isCorrect },
    update: {},
  });

  return { status: "answered", isCorrect: picked.isCorrect, correctIndex, explanation: lesson.scenarioExplanation };
}
