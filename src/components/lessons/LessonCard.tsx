import Link from "next/link";
import type { LessonProgress, LessonStatus } from "@/lib/progress";
import { MASTERY_META, type MasteryStatus } from "@/lib/revision";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { CheckIcon, ClockIcon } from "@/components/ui/icons";

const STATUS: Record<LessonStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  "in-progress": { label: "In progress", className: "bg-orange-100 text-orange-800" },
  "not-started": { label: "Not started", className: "bg-slate-100 text-slate-700" },
};

/** One numbered row in the lesson library: number, title, topic, time, XP, status and mastery. */
export function LessonCard({
  lesson,
  mastery,
  recommended,
}: {
  lesson: LessonProgress;
  mastery: MasteryStatus;
  recommended: boolean;
}) {
  const area = READINESS_AREA_META[lesson.area];
  const status = STATUS[lesson.status];
  const number = String(lesson.number).padStart(2, "0");

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className={`flex items-center gap-3 rounded-2xl bg-white p-3 transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 active:translate-y-[3px] sm:gap-4 sm:p-4 ${
        recommended
          ? "ring-2 ring-orange-300 shadow-[0_4px_0_0_var(--color-orange-300)] active:shadow-[0_1px_0_0_var(--color-orange-300)]"
          : "ring-1 ring-slate-900/5 shadow-[0_4px_0_0_var(--color-slate-200)] active:shadow-[0_1px_0_0_var(--color-slate-200)]"
      }`}
    >
      <span
        aria-hidden
        className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-[0_3px_0_0_rgb(15_23_42/0.08)] ${area.chipBg}`}
      >
        {lesson.icon}
        <span
          className={`absolute -top-1.5 -left-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-extrabold text-white tabular-nums ring-2 ring-white ${
            lesson.status === "completed" ? "bg-emerald-700" : "bg-brand-600"
          }`}
        >
          {number}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="sr-only">Lesson {number}: </span>
        <span className="block font-bold text-slate-900">{lesson.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-600">
          <span className={area.labelText}>{area.label}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {lesson.estimatedMinutes} min
          </span>
          <span aria-hidden>·</span>
          <span>+{lesson.xpReward} XP</span>
        </span>
        {lesson.status === "completed" && (
          <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${MASTERY_META[mastery].className}`}>
            Mastery: {MASTERY_META[mastery].label}
          </span>
        )}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${status.className}`}
        >
          {lesson.status === "completed" && <CheckIcon className="h-3.5 w-3.5" />}
          {status.label}
        </span>
        {recommended && (
          <span className="text-xs font-extrabold text-orange-700">
            {lesson.status === "in-progress" ? "Continue →" : "Start →"}
          </span>
        )}
      </span>
    </Link>
  );
}
