import Link from "next/link";
import type { LessonProgress, LessonStatus } from "@/lib/progress";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { CheckIcon, LockIcon } from "@/components/ui/icons";

const STATUS: Record<LessonStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  continue: { label: "Continue", className: "bg-orange-700 text-white shadow-sm shadow-orange-900/20" },
  locked: { label: "Locked", className: "bg-slate-100 text-slate-600" },
};

/** One numbered row in the lesson library. Locked rows aren't links (except for admins). */
export function LessonCard({ lesson, canOpen }: { lesson: LessonProgress; canOpen: boolean }) {
  const area = READINESS_AREA_META[lesson.area];
  const status = STATUS[lesson.status];
  const locked = lesson.status === "locked";

  const body = (
    <>
      <span className="w-7 shrink-0 text-sm font-extrabold text-slate-500 tabular-nums">
        {String(lesson.number).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
          locked ? "bg-slate-100 grayscale" : area.chipBg
        }`}
      >
        {lesson.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate font-bold ${locked ? "text-slate-600" : "text-slate-900"}`}>
          {lesson.title}
        </span>
        <span className="mt-0.5 block text-xs font-semibold text-slate-600">
          <span className={locked ? "" : area.labelText}>{area.label}</span> · {lesson.estimatedMinutes} min · +
          {lesson.xpReward} XP
        </span>
      </span>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
      >
        {lesson.status === "completed" && <CheckIcon className="h-3.5 w-3.5" />}
        {locked && <LockIcon className="h-3.5 w-3.5" />}
        {lesson.status === "continue" && <span aria-hidden>🔓</span>}
        {/* On phones, completed/locked rows show just the icon to leave room for the title. */}
        <span className={lesson.status === "continue" ? "" : "sr-only sm:not-sr-only"}>{status.label}</span>
      </span>
    </>
  );

  const rowClass = "flex items-center gap-3 rounded-2xl p-3 shadow-sm shadow-slate-900/5 sm:gap-4 sm:p-4";

  if (!canOpen) {
    return (
      <div
        aria-disabled
        className={`${rowClass} bg-slate-50 ring-1 ring-slate-900/5`}
        title="Finish the previous lesson to unlock this one"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className={`${rowClass} bg-white transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/10 ${
        lesson.status === "continue" ? "ring-2 ring-orange-300" : "ring-1 ring-slate-900/5"
      }`}
    >
      {body}
    </Link>
  );
}
