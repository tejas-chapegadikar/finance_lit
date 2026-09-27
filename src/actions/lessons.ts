"use server";

import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";

export async function recordLessonView(lessonId: string) {
  const user = await requireOnboardedUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { isPublished: true },
  });
  if (!lesson?.isPublished) {
    return;
  }

  await db.lessonView.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId },
    update: {},
  });
}
