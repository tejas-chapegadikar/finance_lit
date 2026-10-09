import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { LEVEL_1_NAME, LEVEL_2_NAME, NO_LESSONS_MESSAGE } from "@/lib/constants";
import { LessonCard } from "@/components/lessons/LessonCard";
import { card, heroChip, heroSurface } from "@/components/ui/button-styles";
import { LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Lessons — StockStreak" };

export default async function LessonsPage() {
  const user = await requireOnboardedUser();
  const { lessons, completedCount, totalLessons, levelComplete } = await getProgress(user.id);
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>Learning path · Level 1</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold">{LEVEL_1_NAME}</h1>
        <p className="relative mt-2">
          <span className={heroChip}>
            {levelComplete
              ? "🏆 Level complete — you finished every lesson!"
              : `Progress: ${completedCount}/${totalLessons} lessons completed`}
          </span>
        </p>
        <div
          role="progressbar"
          aria-label="Level 1 progress"
          aria-valuemin={0}
          aria-valuemax={totalLessons}
          aria-valuenow={completedCount}
          className="relative mt-4 h-3 overflow-hidden rounded-full bg-brand-900/30"
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            Lessons unlock in order. A lesson is <span className="font-bold text-slate-900">completed</span> when you
            finish its 5-question quiz — that also opens the next one.
          </p>
          <ol className="flex flex-col gap-3.5" aria-label={`Level 1 — ${LEVEL_1_NAME} lessons`}>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <LessonCard lesson={lesson} />
              </li>
            ))}
          </ol>
        </>
      )}

      <section
        aria-label="Level 2"
        className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-5 text-slate-600"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
          <LockIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-wider uppercase">Level 2 · Coming soon</p>
          <p className="font-extrabold text-slate-700">{LEVEL_2_NAME}</p>
          <p className="text-sm">Apply what you learned to salaries, budgeting, loans and real decisions.</p>
        </div>
      </section>
    </div>
  );
}
