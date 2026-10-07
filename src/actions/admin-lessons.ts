"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminAction } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { lessonSchema, type LessonInput } from "@/lib/validations/lesson";

function lessonFields(parsed: LessonInput) {
  return {
    slug: parsed.slug,
    title: parsed.title,
    icon: parsed.icon,
    area: parsed.area,
    description: parsed.description,
    hook: parsed.hook,
    contentMarkdown: parsed.contentMarkdown,
    keyTerms: parsed.keyTerms,
    example: parsed.example,
    scenarioPrompt: parsed.scenarioPrompt,
    scenarioOptions: parsed.scenarioOptions,
    scenarioExplanation: parsed.scenarioExplanation,
    estimatedMinutes: parsed.estimatedMinutes,
    xpReward: parsed.xpReward,
    isPublished: parsed.isPublished,
    order: parsed.order,
  };
}

function questionFields(q: LessonInput["questions"][number], qIndex: number) {
  return {
    prompt: q.prompt,
    explanation: q.explanation,
    hint: q.hint,
    difficulty: q.difficulty,
    order: qIndex,
    options: {
      create: q.options.map((o, oIndex) => ({ text: o.text, isCorrect: o.isCorrect, order: oIndex })),
    },
  };
}

function revalidateLessonPages(slug: string) {
  revalidatePath("/lessons");
  revalidatePath(`/lessons/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/lessons");
}

export async function createLesson(input: LessonInput) {
  const admin = await guardAdminAction();
  const parsed = lessonSchema.parse(input);

  const lesson = await db.lesson.create({
    data: {
      ...lessonFields(parsed),
      authorId: admin.id,
      questions: { create: parsed.questions.map(questionFields) },
    },
  });

  revalidateLessonPages(lesson.slug);
  redirect(`/admin/lessons/${lesson.id}/edit`);
}

export async function updateLesson(lessonId: string, input: LessonInput) {
  await guardAdminAction();
  const parsed = lessonSchema.parse(input);

  await db.$transaction(async (tx) => {
    await tx.lesson.update({ where: { id: lessonId }, data: lessonFields(parsed) });

    // Replace all questions/options wholesale — simpler than diffing, and
    // admin lesson edits are infrequent, low-volume writes. Cascades handle
    // cleaning up any historical QuizAnswer rows tied to the old questions.
    await tx.question.deleteMany({ where: { lessonId } });
    for (const [qIndex, q] of parsed.questions.entries()) {
      await tx.question.create({ data: { lessonId, ...questionFields(q, qIndex) } });
    }
  });

  revalidateLessonPages(parsed.slug);
}
