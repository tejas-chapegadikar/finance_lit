import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LessonForm } from "@/components/admin/LessonForm";
import { updateLesson } from "@/actions/admin-lessons";
import type { LessonInput } from "@/lib/validations/lesson";

export default async function EditLessonPage(props: PageProps<"/admin/lessons/[id]/edit">) {
  const { id } = await props.params;

  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  const defaultValues: LessonInput = {
    slug: lesson.slug,
    title: lesson.title,
    topic: lesson.topic,
    area: lesson.area,
    description: lesson.description,
    contentMarkdown: lesson.contentMarkdown,
    videoUrl: lesson.videoUrl,
    estimatedMinutes: lesson.estimatedMinutes,
    xpReward: lesson.xpReward,
    isPublished: lesson.isPublished,
    order: lesson.order,
    questions: lesson.questions.map((q) => ({
      prompt: q.prompt,
      explanation: q.explanation,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })),
  };

  // .bind() pre-applies the lesson id so the resulting function still
  // matches the (input) => Promise<void> shape LessonForm expects, while
  // remaining a valid Server Action reference to pass to a Client Component.
  const boundUpdateLesson = updateLesson.bind(null, lesson.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit lesson</h1>
      <LessonForm defaultValues={defaultValues} onSubmit={boundUpdateLesson} />
    </div>
  );
}
