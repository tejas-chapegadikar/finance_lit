"use server";

import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { feedbackRatelimit, isAllowed } from "@/lib/ratelimit";
import { lessonFeedbackSchema } from "@/lib/validations/feedback";
import { SLOW_DOWN_MESSAGE } from "@/lib/constants";

export type FeedbackResult = { status: "saved" } | { status: "error"; message: string };

/**
 * "Was this lesson clear and useful?" from the completion screen. One answer
 * per student per lesson — answering again replaces it — and only for a
 * lesson they've completed.
 */
export async function saveLessonFeedback(
  lessonId: string,
  input: { helpful: boolean; comment: string },
): Promise<FeedbackResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(feedbackRatelimit, user.id))) {
    return { status: "error", message: SLOW_DOWN_MESSAGE };
  }

  const parsed = lessonFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your feedback" };
  }

  const completed = await db.quizAttempt.count({ where: { userId: user.id, lessonId, status: "COMPLETED" } });
  if (completed === 0) {
    throw new Error("Lesson not completed");
  }

  await db.lessonFeedback.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, ...parsed.data },
    update: parsed.data,
  });
  return { status: "saved" };
}
