import Link from "next/link";
import type { Lesson } from "@prisma/client";

const TOPIC_ICONS: Record<string, string> = {
  Budgeting: "💰",
  Investing: "📈",
  Credit: "💳",
  Taxes: "🧾",
  Insurance: "🛡️",
  "Emergency Funds": "🆘",
};

function iconFor(topic: string) {
  return TOPIC_ICONS[topic] ?? "🎯";
}

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/10"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl">
          {iconFor(lesson.topic)}
        </span>
        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
          +{lesson.xpReward} XP
        </span>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">
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
