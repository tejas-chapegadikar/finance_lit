import Link from "next/link";
import type { Lesson } from "@prisma/client";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { getTopicIcon } from "@/lib/topic-style";
import { CheckIcon } from "@/components/ui/icons";

type LessonCardLesson = Pick<
  Lesson,
  "slug" | "title" | "topic" | "area" | "description" | "estimatedMinutes" | "xpReward"
>;

/** `mastery` is the student's best quiz result (0-100), absent until they finish the quiz. */
export function LessonCard({ lesson, mastery }: { lesson: LessonCardLesson; mastery?: number }) {
  const area = READINESS_AREA_META[lesson.area];
  const completed = mastery !== undefined;

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/10"
    >
      <div className="flex items-start justify-between">
        <span aria-hidden className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${area.chipBg}`}>
          {getTopicIcon(lesson.topic)}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            <CheckIcon className="h-3.5 w-3.5" />
            {mastery}% mastery
          </span>
        ) : (
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
            +{lesson.xpReward} XP
          </span>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-violet-700">
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{lesson.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <span aria-hidden>🎬</span>
        {lesson.estimatedMinutes} min · video + reading
        {completed && <span className="text-emerald-700">· Completed</span>}
      </div>
    </Link>
  );
}
