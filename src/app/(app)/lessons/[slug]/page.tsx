import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LessonVideo } from "@/components/lessons/LessonVideo";

export default async function LessonPage(props: PageProps<"/lessons/[slug]">) {
  await requireOnboardedUser();
  const { slug } = await props.params;

  const lesson = await db.lesson.findUnique({ where: { slug } });
  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {lesson.topic}
        </span>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      <LessonVideo url={lesson.videoUrl} />

      <div className="prose prose-neutral max-w-none">
        <ReactMarkdown>{lesson.contentMarkdown}</ReactMarkdown>
      </div>

      <Link
        href={`/lessons/${lesson.slug}/quiz`}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-900/20 transition hover:brightness-110"
      >
        Start Quiz <span className="rounded-full bg-white/20 px-2 py-0.5">+{lesson.xpReward} XP</span>
      </Link>
    </article>
  );
}
