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

  await Promise.all([
    db.lessonView.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId },
      update: {},
    }),
    // Feeds Day-7 / Day-30 retention on the admin metrics page.
    db.user.update({ where: { id: user.id }, data: { lastActivityDate: new Date() } }),
  ]);
}
