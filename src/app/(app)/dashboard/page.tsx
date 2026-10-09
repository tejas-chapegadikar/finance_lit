import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { COMPLETION_POINTS, QUIZ_POINTS, getProgress, type Progress } from "@/lib/progress";
import { getTodaysChallenge } from "@/lib/challenge";
import { countDueRevision } from "@/lib/revision";
import { getWeeklySummary, learnedToday, nextMilestone } from "@/lib/activity";
import { displayStreak } from "@/lib/streak";
import { BADGES } from "@/lib/badges";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import {
  DAILY_CHALLENGE_XP,
  LEVEL_1_NAME,
  LEVEL_2_NAME,
  NO_CHALLENGE_MESSAGE,
  NO_LESSONS_MESSAGE,
} from "@/lib/constants";
import { ReadinessRing } from "@/components/dashboard/ReadinessRing";
import { card, heroChip, heroSurface, primaryButton, softButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ChevronRightIcon, ClockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

type NextStepCard = { icon: string; title: string; text: string; href: string; cta: string };

// "What should I do right now?" — simple rules, in priority order: revision
// that's due (the exact questions they missed), then a review of an area the
// student's quiz answers show they're struggling with, then today's
// challenge, then the next lesson.
function recommendNextStep(progress: Progress, challengeOpen: boolean, due: number): NextStepCard | null {
  const { review, next } = progress;
  if (due > 0) {
    return {
      icon: "🔁",
      title: "Do today's revision",
      text: `${due} ${due === 1 ? "question you missed is" : "questions you missed are"} due — a couple of minutes keeps them fresh.`,
      href: "/revision",
      cta: "Start revision",
    };
  }
  if (review) {
    return {
      icon: "💡",
      title: `Review ${review.area.label}`,
      text: `You've answered ${review.area.quizAccuracy}% of ${review.area.label} questions correctly so far. Retaking “${review.lesson.title}” will help it stick.`,
      href: `/lessons/${review.lesson.slug}`,
      cta: "Review lesson",
    };
  }
  if (challengeOpen) {
    return {
      icon: "⚡",
      title: "Take today's challenge",
      text: `One real-life money decision — about 2 minutes, +${DAILY_CHALLENGE_XP} XP.`,
      href: "/challenge",
      cta: "Take Today's Challenge",
    };
  }
  if (next && !next.isRetake) {
    return {
      icon: "📚",
      title: `Keep going with Lesson ${String(next.lesson.number).padStart(2, "0")}`,
      text: `${next.lesson.title} takes about ${next.lesson.estimatedMinutes} minutes and builds your ${READINESS_AREA_META[next.lesson.area].label} score.`,
      href: `/lessons/${next.lesson.slug}`,
      cta: "Open lesson",
    };
  }
  return null;
}

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [progress, today, earnedBadges, due, didLearn, week, unlocks] = await Promise.all([
    getProgress(user.id),
    getTodaysChallenge(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    countDueRevision(user.id),
    learnedToday(user.id),
    getWeeklySummary(user.id),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
  ]);
  const badgesEarned = earnedBadges.length;
  const streak = displayStreak(user);
  const milestone = nextMilestone(progress.lessons, earnedBadges, user, unlocks.map((u) => u.rewardId));
  const todayPlan = [
    {
      icon: "⚡",
      label: "Today's challenge",
      detail: today?.answer ? "Done" : `+${DAILY_CHALLENGE_XP} XP · about 2 minutes`,
      done: !!today?.answer,
      href: "/challenge",
    },
    {
      icon: "🔁",
      label: "Revision",
      detail: due ? `${due} ${due === 1 ? "question" : "questions"} due` : "Nothing due today",
      done: due === 0,
      href: due ? "/revision" : "/practice",
    },
    {
      icon: "📚",
      label: "Learn something new",
      detail: didLearn ? "Done — a lesson or scenario today" : "A lesson or a money scenario",
      done: didLearn,
      href: progress.next && !progress.next.isRetake ? `/lessons/${progress.next.lesson.slug}` : "/practice",
    },
  ];
  const { next, overall, areas, completedCount, totalLessons, levelComplete, lessons } = progress;
  const name = getDisplayName(user);
  const isNew = lessons.every((lesson) => lesson.status === "not-started");
  const levelPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextStep = recommendNextStep(progress, !!today && !today.answer, due);

  // White cards that overlap the bottom of the header, each with its own colour.
  const quickStats = [
    {
      label: "Total XP",
      value: user.xpTotal.toLocaleString("en-IN"),
      icon: "⭐",
      href: "/profile",
      style: "ring-orange-200 shadow-[0_4px_0_0_var(--color-orange-200)]",
    },
    {
      label: "Lessons",
      value: `${completedCount}/${totalLessons}`,
      icon: "📚",
      href: "/lessons",
      style: "ring-emerald-200 shadow-[0_4px_0_0_var(--color-emerald-200)]",
    },
    {
      label: "Readiness",
      value: `${overall}/100`,
      icon: "🎯",
      href: "#readiness",
      style: "ring-brand-200 shadow-[0_4px_0_0_var(--color-brand-200)]",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome + quick stats */}
      <div>
        <header className={`${heroSurface} relative overflow-hidden px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20`}>
          <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-28 h-72 w-72 rounded-full bg-white/5" />
          <div aria-hidden className="pointer-events-none absolute right-24 -bottom-16 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-brand-700 uppercase shadow-[0_4px_0_0_var(--color-brand-800)]"
            >
              {name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-balance sm:text-3xl">
                Hey, {name}! {isNew ? "Welcome to StockStreak." : "Welcome back."} <span aria-hidden>👋</span>
              </h1>
              <p className="mt-2">
                <span className={heroChip}>
                  {isNew
                    ? "Your first lesson takes about 5 minutes."
                    : levelComplete
                      ? "Level 1 done — keep sharp with today's challenge."
                      : "Small steps add up — keep going!"}
                </span>
              </p>
            </div>
          </div>
        </header>

        <ul aria-label="Your stats" className="relative z-10 -mt-11 grid grid-cols-3 gap-2 px-3 sm:-mt-12 sm:gap-4 sm:px-6">
          {quickStats.map((stat) => (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className={`flex h-full flex-col rounded-2xl bg-white p-3 ring-2 transition hover:-translate-y-0.5 sm:p-4 ${stat.style}`}
              >
                <span className="flex items-center justify-between gap-1 text-xs font-bold text-slate-600">
                  {stat.label}
                  <ChevronRightIcon className="h-4 w-4 shrink-0" />
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 text-lg font-extrabold text-slate-900 tabular-nums sm:text-xl">
                  <span aria-hidden>{stat.icon}</span>
                  {stat.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Continue Learning — the main thing to do */}
        {next ? (
          <section className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-3`} aria-labelledby="continue-heading">
            <div className="flex items-center justify-between gap-3">
              <p id="continue-heading" className="text-lg font-extrabold text-slate-900">
                {next.isRetake ? "Practice next" : isNew ? "Start learning" : "Continue learning"}
              </p>
              <Link href="/lessons" className="inline-flex items-center gap-0.5 text-sm font-bold text-brand-700 hover:underline">
                All lessons
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 flex items-start gap-4 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
              <span
                aria-hidden
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-[0_4px_0_0_rgb(15_23_42/0.08)] ${READINESS_AREA_META[next.lesson.area].chipBg}`}
              >
                {next.lesson.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${READINESS_AREA_META[next.lesson.area].labelText}`}>
                  Lesson {String(next.lesson.number).padStart(2, "0")} · {READINESS_AREA_META[next.lesson.area].label}
                </p>
                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{next.lesson.title}</h2>
                <p className="mt-1 text-sm text-slate-700">{next.isRetake ? next.reason : next.lesson.description}</p>
                {!next.isRetake && (
                  <p className="mt-2 inline-flex items-start gap-1.5 text-sm font-bold text-brand-700">
                    <span aria-hidden>✨</span>
                    {next.reason}
                  </p>
                )}
              </div>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <ClockIcon className="h-4 w-4" />
                Estimated time: {next.lesson.estimatedMinutes} minutes
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-800">
                <span aria-hidden>⭐</span>
                {next.isRetake ? "Retakes don't earn XP" : `Reward: +${next.lesson.xpReward} XP for first completion`}
              </li>
            </ul>
            <div className="mt-auto pt-5">
              <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} w-full py-3.5 text-base`}>
                {next.isRetake ? "Practice again" : isNew ? "Start Learning" : "Continue Learning"}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </section>
        ) : levelComplete ? (
          <section className={`${card} flex flex-col items-center p-6 text-center lg:col-span-3`}>
            <span aria-hidden className="text-5xl">
              🏆
            </span>
            <p className="mt-2 text-xs font-bold tracking-wider text-brand-700 uppercase">Level 1 complete</p>
            <h2 className="text-xl font-extrabold text-slate-900">{LEVEL_1_NAME} Graduate</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
              You finished all {totalLessons} lessons. Level 2 — {LEVEL_2_NAME} is coming soon, and we&apos;re building
              it from your feedback.
            </p>
          </section>
        ) : (
          <p className={`${card} p-6 text-center font-semibold text-slate-700 lg:col-span-3`}>{NO_LESSONS_MESSAGE}</p>
        )}

        {/* Today's Challenge */}
        <section className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-2`} aria-labelledby="challenge-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="challenge-heading" className="text-lg font-extrabold text-slate-900">
              Today&apos;s Challenge
            </h2>
            {today && !today.answer && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
                +{DAILY_CHALLENGE_XP} XP
              </span>
            )}
          </div>
          {today ? (
            <>
              <div className="mt-4 flex flex-col items-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-1 ring-orange-100">
                <span
                  aria-hidden
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-3xl shadow-[0_4px_0_0_var(--color-orange-700)]"
                >
                  ⚡
                </span>
                <p className="mt-3 line-clamp-4 font-semibold text-slate-900">“{today.challenge.prompt}”</p>
              </div>
              <div className="mt-auto pt-5">
                {today.answer ? (
                  <p className="text-center text-sm font-bold text-emerald-800">
                    ✅ Done for today · +{today.answer.xpAwarded} XP earned.{" "}
                    <Link href="/challenge" className="underline underline-offset-2 hover:text-emerald-900">
                      See the explanation
                    </Link>
                  </p>
                ) : (
                  <Link href="/challenge" className={`${primaryButton} w-full py-3.5 text-base`}>
                    Take Today&apos;s Challenge
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 font-semibold text-slate-700">{NO_CHALLENGE_MESSAGE}</p>
          )}
        </section>
      </div>

      {/* Today's habit loop + this week */}
      <div className="grid gap-5 lg:grid-cols-5">
        <section className={`${card} p-5 sm:p-6 lg:col-span-3`} aria-labelledby="today-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="today-heading" className="text-lg font-extrabold text-slate-900">
              Today
            </h2>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-extrabold text-orange-700 ring-2 ring-orange-200">
              🔥 {streak ? `${streak}-day learning streak` : "Start a streak today"}
            </span>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {todayPlan.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition hover:-translate-y-0.5 ${
                    item.done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-200 shadow-[0_3px_0_0_var(--color-slate-200)]"
                  }`}
                >
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl ring-1 ring-slate-200">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">{item.label}</span>
                    <span className="block text-sm text-slate-600">{item.detail}</span>
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      item.done ? "bg-emerald-700 text-white" : "ring-2 ring-slate-300"
                    }`}
                  >
                    {item.done && <CheckIcon className="h-4 w-4" />}
                    <span className="sr-only">{item.done ? "Done" : "Not done yet"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {milestone && (
            <Link
              href={milestone.href}
              className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 transition hover:-translate-y-0.5"
            >
              <span aria-hidden className="text-2xl">
                {milestone.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold tracking-wider text-amber-800 uppercase">Next milestone</span>
                <span className="block font-bold text-slate-900">{milestone.title}</span>
                <span className="block text-sm text-slate-700">{milestone.text}</span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-500" />
            </Link>
          )}
        </section>

        <section className={`${card} p-5 sm:p-6 lg:col-span-2`} aria-labelledby="week-heading">
          <h2 id="week-heading" className="text-lg font-extrabold text-slate-900">
            Your week
          </h2>
          <p className="text-sm text-slate-600">The last 7 days · active on {week.activeDays} of 7</p>
          <dl className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              { label: "Lessons completed", value: String(week.lessonsCompleted) },
              {
                label: "Quiz accuracy",
                value: week.quizAccuracy === null ? "—" : `${week.quizAccuracy}%`,
                note:
                  week.quizAccuracy !== null && week.previousQuizAccuracy !== null
                    ? week.quizAccuracy >= week.previousQuizAccuracy
                      ? `↑ from ${week.previousQuizAccuracy}%`
                      : `↓ from ${week.previousQuizAccuracy}%`
                    : undefined,
              },
              { label: "Revision correct", value: week.revisionTotal ? `${week.revisionCorrect}/${week.revisionTotal}` : "—" },
              { label: "Challenges", value: String(week.challenges) },
              { label: "Scenarios", value: String(week.scenarios) },
              { label: "XP earned", value: `+${week.xpEarned}` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-semibold text-slate-600">
                  {stat.label}
                  {stat.note && <span className="block font-bold text-brand-700">{stat.note}</span>}
                </dt>
                <dd className="text-xl font-extrabold text-slate-900 tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Recommended next step */}
      {nextStep && (
        <section
          className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}
          aria-labelledby="next-step-heading"
        >
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl ring-1 ring-brand-100"
          >
            {nextStep.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p id="next-step-heading" className="text-xs font-bold tracking-wider text-brand-700 uppercase">
              Recommended next step
            </p>
            <p className="font-extrabold text-slate-900">{nextStep.title}</p>
            <p className="mt-0.5 text-sm text-slate-700">{nextStep.text}</p>
          </div>
          <Link href={nextStep.href} className={`${softButton} shrink-0`}>
            {nextStep.cta}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Your progress */}
      <section aria-labelledby="progress-heading" className="flex flex-col gap-4">
        <h2 id="progress-heading" className="text-lg font-extrabold text-slate-900">
          Your progress
        </h2>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Financial Readiness Score */}
          <div id="readiness" className={`${card} scroll-mt-20 p-5 sm:p-6 lg:col-span-3`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <ReadinessRing score={overall} size="sm" />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900">Financial Readiness: {overall}/100</h3>
                <p className="mt-1 text-sm text-slate-600">
                  How much of Level 1 you&apos;ve learned and shown in quizzes. It tracks your learning on
                  StockStreak — it isn&apos;t an assessment of your actual finances.
                </p>
                <details className="mt-2 text-sm text-slate-600">
                  <summary className="cursor-pointer font-bold text-brand-700">How is it calculated?</summary>
                  <p className="mt-2">
                    Every Level 1 lesson counts equally. A completed lesson earns {COMPLETION_POINTS}% of its share for
                    finishing it and up to {QUIZ_POINTS}% for your quiz accuracy on your best attempt (answers you get
                    right after a Coach hint count half). Lessons you haven&apos;t completed count as 0.
                  </p>
                </details>
              </div>
            </div>

            <ul className="mt-6 grid gap-x-6 gap-y-3.5 sm:grid-cols-2" aria-label="Readiness by topic">
              {areas.map((area) => (
                <li key={area.area}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">
                      <span aria-hidden>{area.icon}</span> {area.label}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">{area.score}</span>
                  </div>
                  <div
                    role="meter"
                    aria-label={`${area.label} readiness`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={area.score}
                    className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-brand-100"
                  >
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${area.score}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Level progress, badges */}
          <div className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-2`}>
            <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Current level</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">Level 1 — {LEVEL_1_NAME}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Progress: {completedCount}/{totalLessons} lessons completed
            </p>
            <div
              role="progressbar"
              aria-label="Level 1 progress"
              aria-valuemin={0}
              aria-valuemax={totalLessons}
              aria-valuenow={completedCount}
              className="mt-3 h-3 overflow-hidden rounded-full bg-brand-100"
            >
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${levelPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/profile#badges-heading"
                className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 shadow-[0_3px_0_0_var(--color-amber-200)] transition hover:-translate-y-0.5"
              >
                <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                  <span aria-hidden>🏅</span> {badgesEarned}/{BADGES.length}
                </p>
                <p className="text-xs font-semibold text-slate-600">Badges earned</p>
              </Link>
              <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <p className="text-sm font-extrabold text-slate-700">Level 2 — {LEVEL_2_NAME}</p>
                <p className="text-xs font-semibold text-slate-600">Coming soon</p>
              </div>
            </div>
            <div className="mt-auto pt-5">
              <Link href="/lessons" className={softButton}>
                View all lessons
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
