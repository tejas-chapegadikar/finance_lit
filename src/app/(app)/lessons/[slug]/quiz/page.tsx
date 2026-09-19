import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startAttempt } from "@/actions/quiz";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export default async function QuizPage(props: PageProps<"/lessons/[slug]/quiz">) {
  await requireOnboardedUser();
  const { slug } = await props.params;

  const lesson = await db.lesson.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: { id: true, text: true, order: true },
          },
        },
      },
    },
  });

  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  const attemptId = await startAttempt(lesson.id);

  const questions = lesson.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
  }));

  return (
    <QuizRunner
      attemptId={attemptId}
      lessonSlug={lesson.slug}
      lessonTitle={lesson.title}
      questions={questions}
    />
  );
}
