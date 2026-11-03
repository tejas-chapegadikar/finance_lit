import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { MASTERY_META, countDueRevision, getMastery } from "@/lib/revision";
import { chapterOf, focusFor } from "@/lib/journey";
import { getTodaysQuestion } from "@/lib/daily-question";
import { dailyChallengeInfo } from "@/lib/daily-challenge";
import { getDailyMissions } from "@/lib/missions";
import { REWARDS } from "@/lib/rewards";
import { SCENARIOS, SCENARIO_XP, maxScore } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { istDay } from "@/lib/ist-date";
import { NO_LESSONS_MESSAGE, PATH_NAME } from "@/lib/constants";
import { JourneyMap, type MapChapter } from "@/components/lessons/JourneyMap";
import { TodayPanel } from "@/components/dashboard/TodayPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { TrophyIllustration } from "@/components/ui/illustrations";
import { IconTile, LessonIcon, ScenarioIcon } from "@/components/ui/topic-icons";
import { card, primaryButton, secondaryButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon, RefreshIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Learn — StockStreak" };

// Stars on the map, from the best quiz: 90%+ three, 60%+ two, otherwise one.
const starsFor = (score: number | null) => (score === null ? 0 : score >= 90 ? 3 : score >= 60 ? 2 : 1);

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" });

export default async function LearnPage() {
  const user = await requireOnboardedUser();
  const today = istDay();
  const progress = await getProgress(user.id);
  const [mastery, question, challengeRun, challenge, missions, due, nextItem, runs, unlocks] = await Promise.all([
    getMastery(user.id, progress.lessons),
    getTodaysQuestion(user.id),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { xpAwarded: true } }),
    dailyChallengeInfo(user.id, today),
    getDailyMissions(user.id, today),
    countDueRevision(user.id),
    db.revisionItem.findFirst({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { dueDay: "asc" }, select: { dueDay: true } }),
    db.scenarioRun.groupBy({ by: ["scenarioSlug"], where: { userId: user.id }, _max: { score: true } }),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
  ]);

  const { lessons, levels, currentLevel, completedCount, totalLessons, levelComplete, next, review } = progress;
  const focus = focusFor(user.stage, user.goal);
  const upNext = next && !next.isRetake ? next.lesson : null;
  const best = new Map(runs.map((r) => [r.scenarioSlug, r._max.score ?? 0]));
  const owned = new Set(unlocks.map((u) => u.rewardId));

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
            ? `All ${levels.length} levels complete`
            : currentLevel
              ? `Level ${currentLevel.chapter.number} of ${levels.length} · ${currentLevel.chapter.title}`
              : "Your learning path"
        }
        title={PATH_NAME}
        description="From your first stipend to your first salary — four levels, each one unlocking the next."
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

          {/* Practise and revise — everything that used to be under Practice */}
          <section id="practise" className="scroll-mt-6" aria-labelledby="practise-heading">
            <div className="max-w-2xl">
              <h2 id="practise-heading" className="text-2xl text-slate-900 sm:text-3xl">
                Practise &amp; revise
              </h2>
              <p className="mt-1.5 text-[15px] text-slate-600">Lock in what you&apos;ve learned — revision, daily challenges and real-life money scenarios.</p>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
              <section id="review" className="flex scroll-mt-6 flex-col" aria-labelledby="review-heading">
                <h3 id="review-heading" className="text-xl text-slate-900">
                  Review &amp; revise
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Questions you missed come back after 1, 3 and 7 days — with a fresh example each time — so they stick.
                </p>
                <p className="mt-5 flex items-baseline gap-3 border-t border-slate-200 pt-5">
                  <span className="font-display text-6xl leading-none font-semibold text-slate-900 tabular-nums">{due}</span>
                  <span className="text-[15px] text-slate-600">due now</span>
                </p>
                {!due && nextItem && <p className="mt-2 text-sm text-slate-600">Next one comes back on {formatDay(nextItem.dueDay)}.</p>}
                {!due && !nextItem && <p className="mt-2 text-sm text-slate-600">Nothing to revise yet — missed quiz questions will show up here.</p>}
                {review && (
                  <Link href={`/lessons/${review.lesson.slug}`} className={`${tile} mt-4 flex items-start gap-3 p-3.5 text-sm text-slate-700`}>
                    <IconTile area={review.lesson.area} size="sm">
                      <RefreshIcon />
                    </IconTile>
                    <span>
                      <span className="font-semibold text-slate-900">Review {review.area.label}:</span> you&apos;ve got {review.area.quizAccuracy}% right so far — retake “
                      {review.lesson.title}”.
                    </span>
                  </Link>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {due > 0 && (
                    <Link href="/revision" className={primaryButton}>
                      Start revision
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href="/profile#mastery-heading" className={secondaryButton}>
                    Topic mastery
                  </Link>
                </div>
              </section>

              <TodayPanel
                id="daily"
                headingLevel="h3"
                layout="stack"
                questionXp={question?.answer ? question.answer.xpAwarded : null}
                questionPrompt={question?.question.prompt}
                challengeTitle={challenge.title}
                challengeXp={challengeRun ? challengeRun.xpAwarded : null}
                missions={missions}
              />
            </div>

            <section id="scenarios" className="mt-14 scroll-mt-6" aria-labelledby="scenarios-heading">
              <div className="max-w-2xl">
                <h3 id="scenarios-heading" className="text-xl text-slate-900">
                  Money scenarios
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Real-life decisions with consequences. Each opens with its lesson&apos;s level · +{SCENARIO_XP} XP the first time
                  · numbers are illustrative.
                </p>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SCENARIOS.map((scenario) => {
                  const reward = scenario.bonus ? REWARDS.find((r) => r.scenarioSlug === scenario.slug) : undefined;
                  const lesson = lessons.find((l) => l.slug === scenario.lessonSlug);
                  const levelLocked = !!lesson?.locked;
                  const rewardLocked = !!reward && !owned.has(reward.id);
                  const area = READINESS_AREA_META[scenario.area];
                  const score = best.get(scenario.slug);
                  const level = scenario.lessonSlug ? chapterOf(scenario.lessonSlug) : undefined;
                  const body = (
                    <>
                      <IconTile area={scenario.area} muted={levelLocked || rewardLocked}>
                        <ScenarioIcon slug={scenario.slug} area={scenario.area} />
                      </IconTile>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-xs font-medium">
                          <span className={levelLocked || rewardLocked ? "text-slate-500" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {scenario.minutes} min
                          </span>
                        </span>
                        <span className={`mt-1 block leading-snug font-semibold ${levelLocked ? "text-slate-600" : "text-slate-900"}`}>{scenario.title}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                          {levelLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <LockIcon className="h-3.5 w-3.5" /> Opens with Level {level?.number}
                            </span>
                          ) : rewardLocked ? (
                            <span className="inline-flex items-center gap-1 text-orange-700">
                              <LockIcon className="h-3.5 w-3.5" /> Unlock for {reward!.cost} XP in Rewards
                            </span>
                          ) : score !== undefined ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <CheckIcon className="h-3.5 w-3.5" /> Done · best score {score}/{maxScore(scenario)}
                            </span>
                          ) : (
                            <span className="text-brand-700">Play · +{SCENARIO_XP} XP</span>
                          )}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={scenario.slug}>
                      {levelLocked ? (
                        <div className="flex h-full items-start gap-3 rounded-2xl border border-dashed border-slate-300 p-4">{body}</div>
                      ) : (
                        <Link href={rewardLocked ? "/rewards" : `/practice/${scenario.slug}`} className={`${tile} flex h-full items-start gap-3 p-4`}>
                          {body}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </section>
        </>
      )}
    </div>
  );
}
