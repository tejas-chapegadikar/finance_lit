import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { readChoiceOptions, readKeyTerms } from "@/lib/lesson-content";
import { OPTIONS_PER_QUESTION } from "@/lib/constants";
import { LessonForm } from "@/components/admin/LessonForm";
import { updateLesson } from "@/actions/admin-lessons";
import type { LessonInput } from "@/lib/validations/lesson";

function padOptions(options: { text: string; isCorrect: boolean }[]) {
  return Array.from({ length: OPTIONS_PER_QUESTION }, (_, i) => options[i] ?? { text: "", isCorrect: false });
}

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

  const keyTerms = readKeyTerms(lesson.keyTerms);
  const defaultValues: LessonInput = {
    slug: lesson.slug,
    title: lesson.title,
    icon: lesson.icon,
    area: lesson.area,
    description: lesson.description,
    hook: lesson.hook,
    contentMarkdown: lesson.contentMarkdown,
    keyTerms: keyTerms.length > 0 ? keyTerms : [{ term: "", definition: "" }],
    example: lesson.example,
    scenarioPrompt: lesson.scenarioPrompt,
    scenarioOptions: padOptions(readChoiceOptions(lesson.scenarioOptions)),
    scenarioExplanation: lesson.scenarioExplanation,
    estimatedMinutes: lesson.estimatedMinutes,
    xpReward: lesson.xpReward,
    isPublished: lesson.isPublished,
    order: lesson.order,
    questions: lesson.questions.map((q) => ({
      prompt: q.prompt,
      explanation: q.explanation,
      hint: q.hint ?? "",
      difficulty: q.difficulty,
      options: padOptions(q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))),
    })),
  };

  // .bind() pre-applies the lesson id so the resulting function still
  // matches the (input) => Promise<void> shape LessonForm expects, while
  // remaining a valid Server Action reference to pass to a Client Component.
  const boundUpdateLesson = updateLesson.bind(null, lesson.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          {lesson.icon} {lesson.title}
        </h1>
        {lesson.isPublished && (
          <Link href={`/lessons/${lesson.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">
            View as a student →
          </Link>
        )}
      </div>
      <LessonForm defaultValues={defaultValues} onSubmit={boundUpdateLesson} />
    </div>
  );
}
