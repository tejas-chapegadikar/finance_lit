import Link from "next/link";
import type { Lesson } from "@prisma/client";
import { getTopicStyle } from "@/lib/topic-style";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const style = getTopicStyle(lesson.topic);

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/10"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${style.chipBg}`}>
          {style.icon}
        </span>
        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
          +{lesson.xpReward} XP
        </span>
      </div>
      <div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${style.labelText}`}>
          {lesson.topic}
        </span>
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-violet-700">
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{lesson.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-neutral-400">
        <span aria-hidden>🎬</span>
        {lesson.estimatedMinutes} min lesson
      </div>
    </Link>
  );
}
