import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { MASTERY_META, getMastery } from "@/lib/revision";
import { focusFor } from "@/lib/journey";
import { NO_LESSONS_MESSAGE, PATH_NAME } from "@/lib/constants";
import { JourneyMap, type MapChapter } from "@/components/lessons/JourneyMap";
import { PractiseSection } from "@/components/lessons/PractiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { TrophyIllustration } from "@/components/ui/illustrations";
import { IconTile, LessonIcon } from "@/components/ui/topic-icons";
import { card, primaryButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, ClockIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Money IQ — StockStreak" };

// Stars on the map, from the best quiz: 90%+ three, 60%+ two, otherwise one.
const starsFor = (score: number | null) => (score === null ? 0 : score >= 90 ? 3 : score >= 60 ? 2 : 1);

export default async function LearnPage() {
  const user = await requireOnboardedUser();
  const progress = await getProgress(user.id);
  const mastery = await getMastery(user.id, progress.lessons);

  const { lessons, levels, currentLevel, completedCount, totalLessons, levelComplete, next } = progress;
  const focus = focusFor(user.stage, user.goal);
  const upNext = next && !next.isRetake ? next.lesson : null;

  const chapters: MapChapter[] = levels.map((level) => ({
    id: level.chapter.id,
    number: level.chapter.number,
    title: level.chapter.title,
    stage: level.chapter.stage,
    icon: level.chapter.icon,
    status: level.status,
    completed: level.completed,
    isGoal: focus?.chapter.id === level.chapter.id,
    lessons: level.slugs.flatMap((slug) =>
      lessons
        .filter((lesson) => lesson.slug === slug)
        .map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          icon: lesson.icon,
          area: lesson.area,
          number: lesson.number,
          minutes: lesson.estimatedMinutes,
          status: lesson.status,
          locked: lesson.locked,
          stars: starsFor(lesson.quizScore),
          mastery: lesson.status === "completed" ? MASTERY_META[mastery.get(lesson.id) ?? "not-started"] : null,
          isNext: upNext?.id === lesson.id,
        })),
    ),
  }));

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow={
          levelComplete
            ? `Money IQ · All ${levels.length} levels complete`
            : currentLevel
              ? `Money IQ · Level ${currentLevel.chapter.number} of ${levels.length} · ${currentLevel.chapter.title}`
              : "Money IQ"
        }
        title={PATH_NAME}
        description="Learn about money, from your first stipend to your first salary — short lessons, real Indian examples, four levels that unlock in order."
        aside={
          <div className="flex items-center gap-3">
            <ProgressRing value={completedCount} max={totalLessons} label={`${PATH_NAME} progress`} />
            <p className="text-sm leading-snug text-slate-600">
              <span className="block font-semibold text-slate-900">
                {completedCount} of {totalLessons} lessons completed
              </span>
              {levels.filter((l) => l.status === "completed").length} of {levels.length} levels done
            </p>
          </div>
        }
      />

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <>
          {/* Continue learning */}
          {upNext ? (
            <section
              id="continue"
              className={`${card} flex animate-fade-up flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5`}
              aria-labelledby="continue-heading"
              style={{ animationDelay: "60ms" }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <IconTile area={upNext.area} size="lg">
                  <LessonIcon slug={upNext.slug} area={upNext.area} />
                </IconTile>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-brand-700">
                    {upNext.status === "in-progress" ? "Continue learning" : "Up next"} · Level {upNext.level} · Lesson{" "}
                    {String(upNext.number).padStart(2, "0")}
                  </p>
                  <h2 id="continue-heading" className="text-xl leading-tight text-slate-900 sm:text-2xl">
                    {upNext.title}
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" /> {upNext.estimatedMinutes} min
                    </span>
                    <span className="font-semibold text-orange-700">+{upNext.xpReward} XP</span>
                    {next?.reason && <span className="text-slate-500">{next.reason}</span>}
                  </p>
                </div>
              </div>
              <Link href={`/lessons/${upNext.slug}`} className={`${primaryButton} group shrink-0`}>
                {upNext.status === "in-progress" ? "Continue Learning" : "Start Learning"}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </section>
          ) : levelComplete ? (
            <section id="continue" className={`${card} flex items-center gap-4 p-5`}>
              <TrophyIllustration won className="h-16 w-16 shrink-0" />
              <div>
                <h2 className="text-xl text-slate-900">You&apos;ve finished all {levels.length} levels</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Keep it sharp: revise what you missed, take today&apos;s challenge, or retake a lesson to raise your stars.
                </p>
              </div>
            </section>
          ) : null}

          {/* Learning path */}
          <section id="path" className="scroll-mt-6" aria-labelledby="path-heading">
            <div className="mb-5">
              <p className="text-[13px] font-medium text-slate-500">
                {levels.length} levels · {totalLessons} lessons
              </p>
              <h2 id="path-heading" className="text-2xl text-slate-900 sm:text-3xl">
                Learning path
              </h2>
            </div>
            <JourneyMap chapters={chapters} levelComplete={levelComplete} />
          </section>

          <PractiseSection userId={user.id} xpTotal={user.xpTotal} lessons={lessons} />

          {/* The other two pillars */}
          <section aria-labelledby="pillars-heading" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <h2 id="pillars-heading" className="sr-only">
              Keep going
            </h2>
            <Link href="/invest" className={`${tile} group flex items-center gap-4 p-5`}>
              <IconTile area="INVESTING" size="lg">
                <TrendingUpIcon />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">Go deeper on investing</span>
                <span className="block text-sm text-slate-600">InvestSmart: inflation, the stock market, index funds, getting started — and the compounding simulator.</span>
              </span>
              <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/money" className={`${tile} group flex items-center gap-4 p-5`}>
              <IconTile area="BUDGETING" size="lg">
                <WalletIcon />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">Use it on your own money</span>
                <span className="block text-sm text-slate-600">Log spends, set budgets and savings goals in Money Manager.</span>
              </span>
              <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
