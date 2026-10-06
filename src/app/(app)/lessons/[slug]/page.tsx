import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LessonVideo } from "@/components/lessons/LessonVideo";
import { RecordLessonView } from "@/components/lessons/RecordLessonView";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";

export async function generateMetadata(
  props: PageProps<"/lessons/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const lesson = await db.lesson.findUnique({ where: { slug }, select: { title: true } });
  return { title: lesson ? `${lesson.title} — StockStreak` : "Lesson — StockStreak" };
}

export default async function LessonPage(props: PageProps<"/lessons/[slug]">) {
  await requireOnboardedUser();
  const { slug } = await props.params;

  const lesson = await db.lesson.findUnique({ where: { slug } });
  if (!lesson || !lesson.isPublished) {
    notFound();
  }

  const area = READINESS_AREA_META[lesson.area];

  return (
    <article className="flex flex-col gap-6">
      <div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${area.chipBg} ${area.labelText}`}
        >
          <span aria-hidden>{area.icon}</span>
          {area.group}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-neutral-900">{lesson.title}</h1>
        <p className="mt-1 text-neutral-600">{lesson.description}</p>
        <p className="mt-2 text-xs font-medium text-neutral-500">
          {lesson.estimatedMinutes} min · Builds your {area.label} score · +{lesson.xpReward} XP
        </p>
      </div>

      <LessonVideo url={lesson.videoUrl} />
      <RecordLessonView lessonId={lesson.id} />

      <div className="rounded-3xl bg-white p-6 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5 sm:p-8">
        <div className="prose prose-neutral max-w-none prose-headings:text-neutral-900">
          <ReactMarkdown>{lesson.contentMarkdown}</ReactMarkdown>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-lg font-bold">Ready to test yourself?</p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-violet-100">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Five quick questions. Get one wrong and the AI Coach helps you work it out.
          </p>
        </div>
        {/* No prefetch: rendering the quiz page starts a quiz attempt. */}
        <Link href={`/lessons/${lesson.slug}/quiz`} prefetch={false} className={`${primaryButton} shrink-0`}>
          Start quiz
          <span className="rounded-full bg-white/20 px-2 py-0.5">+{lesson.xpReward} XP</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
