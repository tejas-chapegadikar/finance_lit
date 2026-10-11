import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { MASTERY_META, getMastery } from "@/lib/revision";
import { CHAPTERS, focusFor } from "@/lib/journey";
import { RANKS, rankFor } from "@/lib/ranks";
import { LEVEL_1_NAME, NO_LESSONS_MESSAGE } from "@/lib/constants";
import { JourneyMap, type MapChapter } from "@/components/lessons/JourneyMap";
import { card, heroChip, heroSurface, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Learn — StockStreak" };

// Stars on the map, from the best quiz: 90%+ three, 60%+ two, otherwise one.
const starsFor = (score: number | null) => (score === null ? 0 : score >= 90 ? 3 : score >= 60 ? 2 : 1);

export default async function LessonsPage() {
  const user = await requireOnboardedUser();
  const progress = await getProgress(user.id);
  const { lessons, completedCount, totalLessons, levelComplete, next, overall } = progress;
  const mastery = await getMastery(user.id, lessons);
  const focus = focusFor(user.stage, user.goal);
  const rank = rankFor(completedCount, overall, totalLessons);
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const upNext = next && !next.isRetake ? next.lesson : null;

  const chapters: MapChapter[] = CHAPTERS.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    stage: chapter.stage,
    icon: chapter.icon,
    recommended: focus?.chapter.id === chapter.id,
    lessons: chapter.lessonSlugs.flatMap((slug) =>
      lessons
        .filter((lesson) => lesson.slug === slug)
        .map((lesson) => {
          const status = mastery.get(lesson.id) ?? "not-started";
          return {
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            icon: lesson.icon,
            number: lesson.number,
            minutes: lesson.estimatedMinutes,
            status: lesson.status,
            stars: starsFor(lesson.quizScore),
            mastery: lesson.status === "completed" ? MASTERY_META[status] : null,
            isNext: upNext?.id === lesson.id,
          };
        }),
    ),
  })).filter((chapter) => chapter.lessons.length > 0);

  return (
    <div className="flex flex-col gap-5">
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:order-2" aria-label="Your journey">
            <section className={`${card} p-5`} aria-labelledby="rank-heading">
              <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Your rank</p>
              <h2 id="rank-heading" className="mt-1 text-xl font-extrabold text-slate-900">
                <span aria-hidden>{rank.current.icon}</span> {rank.current.name}
              </h2>
              {rank.next ? (
                <>
                  <div
                    role="progressbar"
                    aria-label={`Progress to ${rank.next.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={rank.percent}
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-100"
                  >
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${rank.percent}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{rank.toNext}.</p>
                </>
              ) : (
                <p className="mt-2 text-sm font-semibold text-emerald-800">The top rank — you&apos;ve mastered Level 1. 👑</p>
              )}
              <ol className="mt-4 flex justify-between" aria-label="All ranks">
                {RANKS.map((r) => {
                  const reached = RANKS.indexOf(r) <= RANKS.findIndex((x) => x.id === rank.current.id);
                  return (
                    <li key={r.id} title={r.name} className="flex flex-col items-center">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                          reached ? "bg-brand-100 ring-2 ring-brand-400" : "bg-slate-100 opacity-60 grayscale"
                        }`}
                      >
                        <span aria-hidden>{r.icon}</span>
                      </span>
                      <span className="sr-only">
                        {r.name}
                        {reached ? " (reached)" : ""}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {upNext && (
              <Link href="#up-next" className={`${primaryButton} w-full`}>
                Jump to your next lesson
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}

            <p className="text-sm text-slate-600">
              Every lesson is open — tap any stop on the map. A lesson is{" "}
              <span className="font-bold text-slate-900">completed</span> when you finish its quiz; your stars come from
              your best quiz, and mastery grows with spaced revision.
            </p>
          </aside>

          <JourneyMap chapters={chapters} levelComplete={levelComplete} />
        </div>
      )}
    </div>
  );
}
