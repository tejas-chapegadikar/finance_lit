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
import {
  DAILY_CHALLENGE_XP,
  MISSION_BONUS_XP,
  NO_LESSONS_MESSAGE,
  PATH_NAME,
  QUESTION_OF_THE_DAY_XP,
} from "@/lib/constants";
import { JourneyMap, type MapChapter } from "@/components/lessons/JourneyMap";
import { ClaimBonusButton } from "@/components/dashboard/ClaimBonusButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { card, primaryButton, softButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ChevronRightIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

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
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
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
    <div className="flex flex-col gap-8">
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
      >
        <div className="max-w-md">
          <div
            role="progressbar"
            aria-label={`${PATH_NAME} progress`}
            aria-valuemin={0}
            aria-valuemax={totalLessons}
            aria-valuenow={completedCount}
            aria-valuetext={`${completedCount} of ${totalLessons} lessons completed`}
            className="h-2 overflow-hidden rounded-full bg-slate-200"
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            {completedCount} of {totalLessons} lessons completed
          </p>
        </div>
      </PageHeader>

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <>
          {/* Continue learning */}
          {upNext ? (
            <section id="continue" className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`} aria-labelledby="continue-heading">
              <span aria-hidden className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${READINESS_AREA_META[upNext.area].chipBg}`}>
                {upNext.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-700">
                  {upNext.status === "in-progress" ? "Continue learning" : "Up next"} · Level {upNext.level}
                </p>
                <h2 id="continue-heading" className="text-xl font-extrabold text-slate-900">
                  {upNext.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">{next?.reason}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" /> {upNext.estimatedMinutes} min
                  </span>
                  <span className="font-semibold text-amber-800">+{upNext.xpReward} XP</span>
                </p>
              </div>
              <Link href={`/lessons/${upNext.slug}`} className={`${primaryButton} shrink-0`}>
                {upNext.status === "in-progress" ? "Continue Learning" : "Start Learning"}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>
          ) : levelComplete ? (
            <section id="continue" className={`${card} p-6 text-center`}>
              <h2 className="text-xl font-extrabold text-slate-900">You&apos;ve finished all {levels.length} levels</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                Keep it sharp: revise what you missed, take today&apos;s challenge, or retake a lesson to raise your stars.
              </p>
            </section>
          ) : null}

          {/* Learning path */}
          <section id="path" className="scroll-mt-6" aria-labelledby="path-heading">
            <h2 id="path-heading" className="mb-4 text-xl font-extrabold text-slate-900">
              Learning path
            </h2>
            <JourneyMap chapters={chapters} levelComplete={levelComplete} />
          </section>

          {/* Practise and revise — everything that used to be under Practice */}
          <section id="practise" className="flex scroll-mt-6 flex-col gap-5" aria-labelledby="practise-heading">
            <div>
              <h2 id="practise-heading" className="text-xl font-extrabold text-slate-900">
                Practise &amp; revise
              </h2>
              <p className="text-sm text-slate-600">Lock in what you&apos;ve learned — revision, daily challenges and real-life money scenarios.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section id="review" className={`${card} flex scroll-mt-6 flex-col p-5 sm:p-6`} aria-labelledby="review-heading">
                <h3 id="review-heading" className="text-lg font-extrabold text-slate-900">
                  Review &amp; revise
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Questions you missed come back after 1, 3 and 7 days — with a fresh example each time — so they stick.
                </p>
                <p className="mt-4 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                  {due} <span className="font-sans text-base font-semibold text-slate-600">due now</span>
                </p>
                {!due && nextItem && <p className="text-sm text-slate-600">Next one comes back on {formatDay(nextItem.dueDay)}.</p>}
                {!due && !nextItem && <p className="text-sm text-slate-600">Nothing to revise yet — missed quiz questions will show up here.</p>}
                {review && (
                  <Link href={`/lessons/${review.lesson.slug}`} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-800 hover:bg-amber-100">
                    <span className="font-semibold">Review {review.area.label}:</span> you&apos;ve got {review.area.quizAccuracy}% right so far — retake “
                    {review.lesson.title}”.
                  </Link>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {due > 0 && (
                    <Link href="/revision" className={primaryButton}>
                      Start revision
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href="/profile#mastery-heading" className={softButton}>
                    Topic mastery
                  </Link>
                </div>
              </section>

              <section id="daily" className={`${card} flex scroll-mt-6 flex-col p-5 sm:p-6`} aria-labelledby="daily-heading">
                <h3 id="daily-heading" className="text-lg font-extrabold text-slate-900">
                  Today
                </h3>
                <ul className="mt-3 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <li>
                    <Link href="/question" className="flex items-center gap-3 p-3 hover:bg-slate-50">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">Question of the Day</span>
                        <span className="block text-sm text-slate-600">
                          {question?.answer ? `Answered · +${question.answer.xpAwarded} XP` : `About 1 minute · +${QUESTION_OF_THE_DAY_XP} XP`}
                        </span>
                      </span>
                      {question?.answer ? <CheckIcon className="h-5 w-5 text-emerald-700" /> : <ChevronRightIcon className="h-5 w-5 text-slate-400" />}
                    </Link>
                  </li>
                  <li>
                    <Link href="/challenge" className="flex items-center gap-3 p-3 hover:bg-slate-50">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">Daily Challenge: {challenge.title}</span>
                        <span className="block text-sm text-slate-600">
                          {challengeRun ? `Done · +${challengeRun.xpAwarded} XP` : `A few minutes · +${DAILY_CHALLENGE_XP} XP`}
                        </span>
                      </span>
                      {challengeRun ? <CheckIcon className="h-5 w-5 text-emerald-700" /> : <ChevronRightIcon className="h-5 w-5 text-slate-400" />}
                    </Link>
                  </li>
                </ul>
                <div className="mt-5" aria-labelledby="missions-heading">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 id="missions-heading" className="text-sm font-bold text-slate-900">
                      Today&apos;s missions
                    </h4>
                    <span className="text-xs font-semibold text-slate-600">
                      {missions.missions.filter((m) => m.done).length}/{missions.missions.length} done
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                    {missions.missions.map((mission) => (
                      <li key={mission.id} className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${mission.done ? "bg-emerald-700 text-white" : "border-2 border-slate-300"}`}
                        >
                          {mission.done && <CheckIcon className="h-3 w-3" />}
                          <span className="sr-only">{mission.done ? "Done:" : "To do:"}</span>
                        </span>
                        <Link href={mission.href} className="min-w-0 flex-1 text-slate-800 hover:text-brand-700">
                          {mission.title}
                          {mission.target > 1 && !mission.done ? ` (${mission.progress}/${mission.target})` : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    {missions.bonusClaimed ? (
                      <p className="text-sm font-semibold text-emerald-800">+{MISSION_BONUS_XP} XP bonus claimed — new missions tomorrow.</p>
                    ) : missions.allDone ? (
                      <ClaimBonusButton xp={MISSION_BONUS_XP} />
                    ) : (
                      <p className="text-sm text-slate-600">
                        Finish all three for a <span className="font-semibold text-amber-800">+{MISSION_BONUS_XP} XP bonus</span>.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section id="scenarios" className="flex scroll-mt-6 flex-col gap-3" aria-labelledby="scenarios-heading">
              <div>
                <h3 id="scenarios-heading" className="text-lg font-extrabold text-slate-900">
                  Money scenarios
                </h3>
                <p className="text-sm text-slate-600">
                  Real-life decisions with consequences. Each opens with its lesson&apos;s level · +{SCENARIO_XP} XP the first time
                  · numbers are illustrative.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      <span aria-hidden className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${levelLocked || rewardLocked ? "bg-slate-100 grayscale" : area.chipBg}`}>
                        {scenario.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className={levelLocked || rewardLocked ? "text-slate-600" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {scenario.minutes} min
                          </span>
                        </span>
                        <span className="mt-0.5 block font-bold text-slate-900">{scenario.title}</span>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold">
                          {levelLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <LockIcon className="h-3.5 w-3.5" /> Opens with Level {level?.number}
                            </span>
                          ) : rewardLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <LockIcon className="h-3.5 w-3.5" /> Unlock for {reward!.cost} XP in Rewards
                            </span>
                          ) : score !== undefined ? (
                            <span className="text-emerald-800">Done · best score {score}/{maxScore(scenario)}</span>
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
                        <div className={`${card} flex h-full items-start gap-3 bg-slate-50 p-4`}>{body}</div>
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
