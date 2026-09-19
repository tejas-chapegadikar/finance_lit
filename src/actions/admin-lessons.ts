"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonSchema, type LessonInput } from "@/lib/validations/lesson";
import { adminActionRatelimit, checkRatelimit } from "@/lib/ratelimit";

async function guardAdminAction(adminId: string) {
  // Fail open if Upstash isn't configured yet (e.g. local dev before the
  // founder has set up the Redis env vars) — admin actions shouldn't be
  // blocked entirely by missing rate-limit infra.
  const allowed = await checkRatelimit(adminActionRatelimit, adminId).catch(() => true);
  if (!allowed) {
    throw new Error("Too many requests — please slow down");
  }
}

export async function createLesson(input: LessonInput) {
  const admin = await requireAdmin();
  await guardAdminAction(admin.id);

  const parsed = lessonSchema.parse(input);

  const lesson = await db.lesson.create({
    data: {
      slug: parsed.slug,
      title: parsed.title,
      topic: parsed.topic,
      description: parsed.description,
      contentMarkdown: parsed.contentMarkdown,
      videoUrl: parsed.videoUrl,
      estimatedMinutes: parsed.estimatedMinutes,
      xpReward: parsed.xpReward,
      isPublished: parsed.isPublished,
      order: parsed.order,
      authorId: admin.id,
      questions: {
        create: parsed.questions.map((q, qIndex) => ({
          prompt: q.prompt,
          explanation: q.explanation,
          order: qIndex,
          options: {
            create: q.options.map((o, oIndex) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: oIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/lessons");
  revalidatePath("/admin/lessons");
  redirect(`/admin/lessons/${lesson.id}/edit`);
}

export async function updateLesson(lessonId: string, input: LessonInput) {
  const admin = await requireAdmin();
  await guardAdminAction(admin.id);

  const parsed = lessonSchema.parse(input);

  await db.$transaction(async (tx) => {
    await tx.lesson.update({
      where: { id: lessonId },
      data: {
        slug: parsed.slug,
        title: parsed.title,
        topic: parsed.topic,
        description: parsed.description,
        contentMarkdown: parsed.contentMarkdown,
        videoUrl: parsed.videoUrl,
        estimatedMinutes: parsed.estimatedMinutes,
        xpReward: parsed.xpReward,
        isPublished: parsed.isPublished,
        order: parsed.order,
      },
    });

    // Replace all questions/options wholesale — simpler than diffing, and
    // admin lesson edits are infrequent, low-volume writes. Cascades handle
    // cleaning up any historical QuizAnswer rows tied to the old questions.
    await tx.question.deleteMany({ where: { lessonId } });
    for (const [qIndex, q] of parsed.questions.entries()) {
      await tx.question.create({
        data: {
          lessonId,
          prompt: q.prompt,
          explanation: q.explanation,
          order: qIndex,
          options: {
            create: q.options.map((o, oIndex) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: oIndex,
            })),
          },
        },
      });
    }
  });

  revalidatePath("/lessons");
  revalidatePath(`/lessons/${parsed.slug}`);
  revalidatePath("/admin/lessons");
}
