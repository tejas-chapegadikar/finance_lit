import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { getMastery } from "@/lib/revision";
import { CHAPTERS, focusFor } from "@/lib/journey";
import { LEVEL_1_NAME, LEVEL_2_NAME, NO_LESSONS_MESSAGE } from "@/lib/constants";
import { LessonCard } from "@/components/lessons/LessonCard";
import { card, heroChip, heroSurface } from "@/components/ui/button-styles";
import { LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Learn — StockStreak" };

export default async function LessonsPage() {
  const user = await requireOnboardedUser();
  const progress = await getProgress(user.id);
  const { lessons, completedCount, totalLessons, levelComplete, next } = progress;
  const mastery = await getMastery(user.id, lessons);
  const focus = focusFor(user.stage, user.goal);
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const chapters = CHAPTERS.map((chapter) => ({
    chapter,
    lessons: chapter.lessonSlugs.flatMap((slug) => lessons.filter((lesson) => lesson.slug === slug)),
  })).filter((c) => c.lessons.length > 0);
  const inChapters = new Set(chapters.flatMap((c) => c.lessons.map((lesson) => lesson.id)));
  const others = lessons.filter((lesson) => !inChapters.has(lesson.id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>From your first stipend to your first salary</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold">Level 1 — {LEVEL_1_NAME}</h1>
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
            Every lesson is open — start wherever you need it most. A lesson is{" "}
            <span className="font-bold text-slate-900">completed</span> when you finish its 5-question quiz; mastery
            then grows with spaced revision.
          </p>
          {chapters.map(({ chapter, lessons: chapterLessons }) => {
            const isFocus = focus?.chapter.id === chapter.id;
            return (
              <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">
                      Chapter {chapter.number} · {chapter.stage}
                    </p>
                    <h2 id={`chapter-${chapter.id}`} className="text-lg font-extrabold text-slate-900">
                      <span aria-hidden>{chapter.icon}</span> {chapter.title}
                    </h2>
                  </div>
                  {isFocus && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
                      ⭐ Recommended for you
                    </span>
                  )}
                </div>
                <ol className="flex flex-col gap-3.5" aria-label={chapter.title}>
                  {chapterLessons.map((lesson) => (
                    <li key={lesson.id}>
                      <LessonCard
                        lesson={lesson}
                        mastery={mastery.get(lesson.id) ?? "not-started"}
                        recommended={next?.lesson.id === lesson.id && !next.isRetake}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
          {others.length > 0 && (
            <ol className="flex flex-col gap-3.5" aria-label="More lessons">
              {others.map((lesson) => (
                <li key={lesson.id}>
                  <LessonCard lesson={lesson} mastery={mastery.get(lesson.id) ?? "not-started"} recommended={false} />
                </li>
              ))}
            </ol>
          )}
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
