import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { MASTERY_META, countDueRevision, getMastery } from "@/lib/revision";
import { chapterOf, focusFor, type LevelStatus } from "@/lib/journey";
import { RANKS, rankFor } from "@/lib/ranks";
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
import { card, heroChip, heroSurface, primaryButton, softButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Learn — StockStreak" };

// Stars on the map, from the best quiz: 90%+ three, 60%+ two, otherwise one.
const starsFor = (score: number | null) => (score === null ? 0 : score >= 90 ? 3 : score >= 60 ? 2 : 1);

const STATUS_TEXT: Record<LevelStatus, string> = {
  completed: "✓ Completed",
  current: "You're here",
  available: "Open",
  locked: "Locked",
};

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

  const { lessons, levels, currentLevel, completedCount, totalLessons, levelComplete, next, overall, review } = progress;
  const focus = focusFor(user.stage, user.goal);
  const rank = rankFor(completedCount, overall, totalLessons);
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
    <div className="flex flex-col gap-6">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>From your first stipend to your first salary</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold">{PATH_NAME}</h1>
        <p className="relative mt-2">
          <span className={heroChip}>
            {levelComplete
              ? `🏆 All ${levels.length} levels complete`
              : currentLevel
                ? `Level ${currentLevel.chapter.number} of ${levels.length} · ${currentLevel.chapter.title}`
                : `${completedCount}/${totalLessons} lessons completed`}
          </span>
        </p>
        <div
          role="progressbar"
          aria-label={`${PATH_NAME} progress`}
          aria-valuemin={0}
          aria-valuemax={totalLessons}
          aria-valuenow={completedCount}
          aria-valuetext={`${completedCount} of ${totalLessons} lessons completed`}
          className="relative mt-4 h-3 overflow-hidden rounded-full bg-brand-900/30"
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
        </div>
        <nav aria-label="On this page" className="relative mt-5 flex flex-wrap gap-2">
          {[
            { href: "#path", label: "🗺️ Learning path" },
            { href: "#review", label: "🔁 Review & revise" },
            { href: "#daily", label: "⚡ Daily challenges" },
            { href: "#scenarios", label: "🎮 Money scenarios" },
          ].map((link) => (
            <a key={link.href} href={link.href} className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/25 hover:bg-white/25">
              {link.label}
            </a>
          ))}
        </nav>
      </section>

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <>
          {/* A. Continue learning */}
          {upNext ? (
            <section id="continue" className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`} aria-labelledby="continue-heading">
              <span aria-hidden className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl ${READINESS_AREA_META[upNext.area].chipBg}`}>
                {upNext.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">
                  {upNext.status === "in-progress" ? "Continue learning" : "Up next"} · Level {upNext.level}
                </p>
                <h2 id="continue-heading" className="text-xl font-extrabold text-slate-900">
                  {upNext.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">{next?.reason}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" /> {upNext.estimatedMinutes} min
                  </span>
                  <span className="text-amber-800">⭐ +{upNext.xpReward} XP</span>
                </p>
              </div>
              <Link href={`/lessons/${upNext.slug}`} className={`${primaryButton} shrink-0 py-3.5 text-base`}>
                {upNext.status === "in-progress" ? "Continue Learning" : "Start Learning"}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </section>
          ) : levelComplete ? (
            <section id="continue" className={`${card} p-5 text-center sm:p-6`}>
              <p className="text-3xl" aria-hidden>
                🏆
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">You&apos;ve finished all {levels.length} levels</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                Keep it sharp: revise what you missed, take today&apos;s challenge, or retake a lesson to raise your stars.
              </p>
            </section>
          ) : null}

          {/* B. Learning path */}
          <section id="path" className="scroll-mt-6" aria-labelledby="path-heading">
            <h2 id="path-heading" className="mb-3 text-lg font-extrabold text-slate-900">
              Learning path
            </h2>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
              <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:order-2" aria-label="Your levels and rank">
                <section className={`${card} p-5`} aria-labelledby="levels-heading">
                  <h3 id="levels-heading" className="font-extrabold text-slate-900">
                    Levels
                  </h3>
                  <p className="text-xs text-slate-600">Each level opens when you finish the one before it.</p>
                  <ol className="mt-3 flex flex-col gap-2">
                    {levels.map((level) => (
                      <li
                        key={level.chapter.id}
                        className={`flex items-center gap-3 rounded-xl p-2.5 ring-1 ${
                          level.status === "current"
                            ? "bg-brand-50 ring-brand-200"
                            : level.status === "locked"
                              ? "bg-slate-50 ring-slate-200"
                              : "bg-white ring-slate-200"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                            level.status === "completed" ? "bg-emerald-100" : level.status === "locked" ? "bg-slate-200 text-slate-500" : "bg-white ring-1 ring-brand-200"
                          }`}
                        >
                          {level.status === "completed" ? <CheckIcon className="h-5 w-5 text-emerald-800" /> : level.status === "locked" ? <LockIcon className="h-4 w-4" /> : level.chapter.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-extrabold text-slate-900">
                            Level {level.chapter.number} — {level.chapter.title}
                          </span>
                          <span className="block text-xs text-slate-600">
                            {level.status === "locked"
                              ? `Finish Level ${level.chapter.number - 1} to unlock`
                              : `${STATUS_TEXT[level.status]} · ${level.completed}/${level.slugs.length} lessons`}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className={`${card} p-5`} aria-labelledby="rank-heading">
                  <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Your rank</p>
                  <h3 id="rank-heading" className="mt-1 text-lg font-extrabold text-slate-900">
                    <span aria-hidden>{rank.current.icon}</span> {rank.current.name}
                  </h3>
                  {rank.next ? (
                    <p className="mt-1 text-sm text-slate-700">{rank.toNext}.</p>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-emerald-800">The top rank — you&apos;ve mastered {PATH_NAME}. 👑</p>
                  )}
                  <ol className="mt-3 flex justify-between" aria-label="All ranks">
                    {RANKS.map((r, i) => {
                      const reached = i <= RANKS.findIndex((x) => x.id === rank.current.id);
                      return (
                        <li key={r.id} title={r.name} className="flex flex-col items-center">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${reached ? "bg-brand-100 ring-2 ring-brand-400" : "bg-slate-100 opacity-60 grayscale"}`}>
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
                  <a href="#up-next" className={`${softButton} w-full`}>
                    Show my next stop on the map
                  </a>
                )}
              </aside>

              <JourneyMap chapters={chapters} levelComplete={levelComplete} />
            </div>
          </section>

          {/* C + D. Practise and revise — everything that used to be under Practice */}
          <section id="practise" className="flex scroll-mt-6 flex-col gap-5" aria-labelledby="practise-heading">
            <div>
              <h2 id="practise-heading" className="text-lg font-extrabold text-slate-900">
                Practise &amp; revise
              </h2>
              <p className="text-sm text-slate-600">Lock in what you&apos;ve learned — revision, daily challenges and real-life money scenarios.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section id="review" className={`${card} flex scroll-mt-6 flex-col p-5 sm:p-6`} aria-labelledby="review-heading">
                <h3 id="review-heading" className="text-lg font-extrabold text-slate-900">
                  🔁 Review &amp; revise
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Questions you missed come back after 1, 3 and 7 days — with a fresh example each time — so they stick.
                </p>
                <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums">
                  {due} <span className="text-base font-bold text-slate-600">due now</span>
                </p>
                {!due && nextItem && <p className="text-sm text-slate-600">Next one comes back on {formatDay(nextItem.dueDay)}.</p>}
                {!due && !nextItem && <p className="text-sm text-slate-600">Nothing to revise yet — missed quiz questions will show up here.</p>}
                {review && (
                  <Link href={`/lessons/${review.lesson.slug}`} className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-slate-800 ring-1 ring-amber-200 hover:bg-amber-100">
                    💡 Review {review.area.label}: you&apos;ve got {review.area.quizAccuracy}% right so far — retake “{review.lesson.title}”.
                  </Link>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
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
                  ⚡ Today
                </h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  <li>
                    <Link href="/question" className={`${tile} flex items-center gap-3 p-3 transition hover:-translate-y-0.5`}>
                      <span aria-hidden className="text-2xl">
                        ❓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-900">Question of the Day</span>
                        <span className="block text-sm text-slate-600">
                          {question?.answer ? `✅ Answered · +${question.answer.xpAwarded} XP` : `About 1 minute · +${QUESTION_OF_THE_DAY_XP} XP`}
                        </span>
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-700" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/challenge" className={`${tile} flex items-center gap-3 p-3 transition hover:-translate-y-0.5`}>
                      <span aria-hidden className="text-2xl">
                        {challenge.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-900">Daily Challenge: {challenge.title}</span>
                        <span className="block text-sm text-slate-600">
                          {challengeRun ? `✅ Done · +${challengeRun.xpAwarded} XP` : `A few minutes · +${DAILY_CHALLENGE_XP} XP`}
                        </span>
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-700" />
                    </Link>
                  </li>
                </ul>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200" aria-labelledby="missions-heading">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 id="missions-heading" className="text-sm font-extrabold text-slate-900">
                      Today&apos;s missions
                    </h4>
                    <span className="text-xs font-bold text-slate-600">
                      {missions.missions.filter((m) => m.done).length}/{missions.missions.length} done
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                    {missions.missions.map((mission) => (
                      <li key={mission.id} className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${mission.done ? "bg-emerald-700 text-white" : "ring-2 ring-slate-300"}`}
                        >
                          {mission.done && <CheckIcon className="h-3 w-3" />}
                          <span className="sr-only">{mission.done ? "Done:" : "To do:"}</span>
                        </span>
                        <Link href={mission.href} className="min-w-0 flex-1 font-semibold text-slate-800 hover:text-brand-700">
                          {mission.title}
                          {mission.target > 1 && !mission.done ? ` (${mission.progress}/${mission.target})` : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    {missions.bonusClaimed ? (
                      <p className="text-sm font-bold text-emerald-800">✅ +{MISSION_BONUS_XP} XP bonus claimed — new missions tomorrow.</p>
                    ) : missions.allDone ? (
                      <ClaimBonusButton xp={MISSION_BONUS_XP} />
                    ) : (
                      <p className="text-sm text-slate-700">
                        Finish all three for a <span className="font-extrabold text-amber-800">+{MISSION_BONUS_XP} XP bonus</span>.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section id="scenarios" className="flex scroll-mt-6 flex-col gap-3" aria-labelledby="scenarios-heading">
              <div>
                <h3 id="scenarios-heading" className="text-lg font-extrabold text-slate-900">
                  🎮 Money scenarios
                </h3>
                <p className="text-sm text-slate-600">
                  Real-life decisions with consequences. Each opens with its lesson&apos;s level · +{SCENARIO_XP} XP the first time
                  · numbers are illustrative.
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      <span aria-hidden className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${levelLocked || rewardLocked ? "bg-slate-100 grayscale" : area.chipBg}`}>
                        {scenario.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
                          <span className={levelLocked || rewardLocked ? "text-slate-600" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {scenario.minutes} min
                          </span>
                        </span>
                        <span className="mt-0.5 block font-extrabold text-slate-900">{scenario.title}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold">
                          {levelLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              <LockIcon className="h-3.5 w-3.5" /> Opens with Level {level?.number}
                            </span>
                          ) : rewardLocked ? (
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              <LockIcon className="h-3.5 w-3.5" /> Unlock for {reward!.cost} XP in Rewards
                            </span>
                          ) : score !== undefined ? (
                            <span className="text-emerald-800">✓ Done · best score {score}/{maxScore(scenario)}</span>
                          ) : (
                            <span className="text-brand-700">Play → +{SCENARIO_XP} XP</span>
                          )}
                        </span>
                      </span>
                    </>
                  );
                  return (
                    <li key={scenario.slug}>
                      {levelLocked ? (
                        <div className={`${tile} flex h-full items-start gap-3 p-4 opacity-80`}>{body}</div>
                      ) : (
                        <Link href={rewardLocked ? "/rewards" : `/practice/${scenario.slug}`} className={`${tile} flex h-full items-start gap-3 p-4 transition hover:-translate-y-0.5`}>
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
