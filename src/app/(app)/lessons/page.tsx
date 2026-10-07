import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { canOpenLesson, getProgress } from "@/lib/progress";
import { LEVEL_1_NAME, NO_LESSONS_MESSAGE } from "@/lib/constants";
import { LessonCard } from "@/components/lessons/LessonCard";
import { card, heroSurface } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Lessons — StockStreak" };

export default async function LessonsPage() {
  const user = await requireOnboardedUser();
  const { lessons, completedCount, totalLessons, levelComplete } = await getProgress(user.id);
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative text-xs font-bold tracking-wider uppercase">Level 1</p>
        <h1 className="relative mt-1 text-2xl font-extrabold sm:text-3xl">{LEVEL_1_NAME}</h1>
        <p className="relative mt-1 text-sm font-semibold">
          {levelComplete
            ? "🏆 Level complete — you finished every lesson!"
            : `${completedCount} of ${totalLessons} lessons completed`}
        </p>
        <div
          role="progressbar"
          aria-label="Level 1 progress"
          aria-valuemin={0}
          aria-valuemax={totalLessons}
          aria-valuenow={completedCount}
          className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-white/25"
        >
          <div className="h-full rounded-full bg-orange-300" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <ol className="flex flex-col gap-3" aria-label={`Level 1 — ${LEVEL_1_NAME} lessons`}>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonCard lesson={lesson} canOpen={canOpenLesson(lesson, user.role)} />
            </li>
          ))}
        </ol>
      )}

      {lessons.length > 0 && (
        <p className="text-center text-xs text-slate-600">
          Lessons unlock one at a time — finish a lesson&apos;s quiz to open the next one.
        </p>
      )}
    </div>
  );
}
