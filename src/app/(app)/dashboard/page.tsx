import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { COMPLETION_POINTS, QUIZ_POINTS, getProgress } from "@/lib/progress";
import { getTodaysQuestion } from "@/lib/daily-question";
import { dailyChallengeInfo } from "@/lib/daily-challenge";
import { getDailyMissions } from "@/lib/missions";
import { getTodaysWins, getWeeklySummary, nextBadge } from "@/lib/activity";
import { MAX_STREAK_FREEZES, getActivityDays, nextStreakMilestone, streakStatus } from "@/lib/streak";
import { BADGES, getBadges } from "@/lib/badges";
import { rankFor } from "@/lib/ranks";
import { nextReward, spendableXp } from "@/lib/rewards";
import { readAvatar } from "@/lib/avatar";
import { istDay, shiftDay } from "@/lib/ist-date";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import {
  DAILY_CHALLENGE_XP,
  LEVEL_1_NAME,
  LEVEL_2_NAME,
  MISSION_BONUS_XP,
  NO_LESSONS_MESSAGE,
  NO_QUESTION_MESSAGE,
  QUESTION_OF_THE_DAY_XP,
} from "@/lib/constants";
import { ReadinessRing } from "@/components/dashboard/ReadinessRing";
import { ClaimBonusButton } from "@/components/dashboard/ClaimBonusButton";
import { StreakWeek } from "@/components/streak/StreakCalendar";
import { Avatar } from "@/components/avatar/Avatar";
import { card, heroChip, heroSurface, primaryButton, softButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ChevronRightIcon, ClockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

type ForYou = { icon: string; text: string; href: string };

export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, question, challengeRun, earnedBadges, due, firstDue, missions, week, unlocks, weekMarks, wins] =
    await Promise.all([
      getProgress(user.id),
      getTodaysQuestion(user.id),
      db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { xpAwarded: true } }),
      db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
      db.revisionItem.count({ where: { userId: user.id, status: "ACTIVE", dueDay: { lte: today } } }),
      db.revisionItem.findFirst({
        where: { userId: user.id, status: "ACTIVE", dueDay: { lte: today } },
        orderBy: { dueDay: "asc" },
        select: { lesson: { select: { title: true } } },
      }),
      getDailyMissions(user.id, today),
      getWeeklySummary(user.id, today),
      db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
      getActivityDays(db, user.id, shiftDay(today, -6), today),
      getTodaysWins(user.id, today),
    ]);

  const { next, overall, areas, completedCount, totalLessons, levelComplete, lessons, review } = progress;
  const name = getDisplayName(user);
  const isNew = lessons.every((lesson) => lesson.status === "not-started");
  const streak = streakStatus(user, today);
  const milestone = nextStreakMilestone(streak.streak);
  const rank = rankFor(completedCount, overall, totalLessons);
  const balance = spendableXp(user);
  const reward = nextReward(new Set(unlocks.map((u) => u.rewardId)));
  // Badges whose progress is known without extra queries.
  const badges = getBadges(
    { lessons, perfectQuizzes: 0, longestStreak: user.longestStreak, coreScenarios: 0, retained: 0 },
    earnedBadges,
  );
  const badgeSoon = nextBadge(badges, ["lessons", "area", "level", "streak"]);
  const badgesToday = BADGES.filter((badge) =>
    earnedBadges.some((b) => b.badgeId === badge.id && istDay(b.earnedAt) === today),
  );
  const challenge = dailyChallengeInfo(today);
  const avatar = readAvatar(user.avatar);
  const levelPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const greeting = isNew
    ? `Your first lesson takes about ${next?.lesson.estimatedMinutes ?? 5} minutes.`
    : streak.doneToday
      ? `🔥 ${streak.streak}-day streak — today's done!`
      : streak.freezesNeeded > 0
        ? `🧊 You missed a day — a streak freeze keeps your ${streak.streak}-day streak when you learn today.`
        : streak.needsToday
          ? `🔥 Your streak is at ${streak.streak} ${streak.streak === 1 ? "day" : "days"} — one activity today keeps it going.`
          : levelComplete
            ? "Level 1 done — keep sharp with today's question and challenge."
            : "Small steps add up — one activity today starts a streak.";

  // "For you today": real next steps from the student's own data.
  const forYou: ForYou[] = [];
  if (firstDue) forYou.push({ icon: "🔁", text: `Let's revisit the ${firstDue.lesson.title} question you missed.`, href: "/revision" });
  if (review) {
    forYou.push({
      icon: "💡",
      text: `Review ${review.area.label}: you've got ${review.area.quizAccuracy}% right so far — a retake of “${review.lesson.title}” will help.`,
      href: `/lessons/${review.lesson.slug}`,
    });
  }
  if (next && !next.isRetake) {
    forYou.push({
      icon: "📚",
      text: `Your next lesson, ${next.lesson.title}, takes about ${next.lesson.estimatedMinutes} minutes.`,
      href: `/lessons/${next.lesson.slug}`,
    });
  }
  if (reward) {
    forYou.push({
      icon: "🎁",
      text: balance >= reward.cost ? `You can unlock ${reward.name} now.` : `Your next reward, ${reward.name}, is ${reward.cost - balance} XP away.`,
      href: "/rewards",
    });
  }
  if (rank.toNext) forYou.push({ icon: rank.next?.icon ?? "🏅", text: `${rank.toNext}.`, href: "/lessons" });
  if (badgeSoon) {
    forYou.push({ icon: badgeSoon.icon, text: `${badgeSoon.name} badge: ${badgeSoon.ruleText.toLowerCase()} (${badgeSoon.done}/${badgeSoon.required}).`, href: "/profile#badges-heading" });
  }

  const quickStats = [
    { label: "Day streak", value: String(streak.streak), icon: "🔥", href: "/profile#streak", style: "ring-orange-200 shadow-[0_4px_0_0_var(--color-orange-200)]" },
    { label: "Total XP", value: user.xpTotal.toLocaleString("en-IN"), icon: "⭐", href: "/rewards", style: "ring-amber-200 shadow-[0_4px_0_0_var(--color-amber-200)]" },
    { label: "Readiness", value: `${overall}/100`, icon: "🎯", href: "#readiness", style: "ring-brand-200 shadow-[0_4px_0_0_var(--color-brand-200)]" },
  ];
  const hasWins = wins.milestones.length > 0 || wins.frozenDays > 0 || badgesToday.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome + quick stats */}
      <div>
        <header className={`${heroSurface} relative overflow-hidden px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20`}>
          <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-28 h-72 w-72 rounded-full bg-white/5" />
          <div aria-hidden className="pointer-events-none absolute right-24 -bottom-16 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <Link
              href="/profile/avatar"
              aria-label="Edit your avatar"
              className="flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-white shadow-[0_4px_0_0_var(--color-brand-800)] transition hover:-translate-y-0.5"
            >
              <Avatar config={avatar} crop="head" className="h-16 w-16" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-balance sm:text-3xl">
                Hey, {name}! {isNew ? "Welcome to StockStreak." : "Welcome back."} <span aria-hidden>👋</span>
              </h1>
              <p className="mt-2">
                <span className={`${heroChip} max-w-full whitespace-normal`}>{greeting}</span>
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

      {hasWins && (
        <section aria-labelledby="wins-heading" className="rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 p-5 ring-2 ring-amber-200">
          <h2 id="wins-heading" className="font-extrabold text-slate-900">
            🎉 Today&apos;s wins
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm font-semibold text-slate-800">
            {wins.milestones.map((m) => (
              <li key={m.description}>
                🔥 {m.description} — +{m.xp} XP
              </li>
            ))}
            {badgesToday.map((badge) => (
              <li key={badge.id}>
                <span aria-hidden>{badge.icon}</span> New badge: {badge.name}
              </li>
            ))}
            {wins.frozenDays > 0 && (
              <li>
                🧊 A streak freeze covered {wins.frozenDays === 1 ? "the day you missed" : `the ${wins.frozenDays} days you missed`} — your
                streak is safe.
              </li>
            )}
          </ul>
        </section>
      )}

      {user.avatar === null && (
        <Link href="/profile/avatar" className={`${tile} flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}>
          <span aria-hidden className="text-3xl">
            🎨
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-slate-900">Create your avatar</span>
            <span className="block text-sm text-slate-600">Pick your look — more outfits unlock as you learn.</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-700" />
        </Link>
      )}

      {/* Today's missions + streak */}
      <div className="grid gap-5 lg:grid-cols-5">
        <section className={`${card} p-5 sm:p-6 lg:col-span-3`} aria-labelledby="missions-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="missions-heading" className="text-lg font-extrabold text-slate-900">
              Today&apos;s missions
            </h2>
            <span className="text-sm font-bold text-slate-600">
              {missions.missions.filter((m) => m.done).length}/{missions.missions.length} done
            </span>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {missions.missions.map((mission) => (
              <li key={mission.id}>
                <Link
                  href={mission.href}
                  className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition hover:-translate-y-0.5 ${
                    mission.done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-200 shadow-[0_3px_0_0_var(--color-slate-200)]"
                  }`}
                >
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl ring-1 ring-slate-200">
                    {mission.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">{mission.title}</span>
                    <span className="block text-sm text-slate-600">
                      {mission.target > 1 ? `${mission.progress}/${mission.target} · ` : ""}
                      {mission.detail}
                    </span>
                    {mission.target > 1 && !mission.done && (
                      <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(mission.progress / mission.target) * 100}%` }} />
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      mission.done ? "bg-emerald-700 text-white" : "ring-2 ring-slate-300"
                    }`}
                  >
                    {mission.done && <CheckIcon className="h-4 w-4" />}
                    <span className="sr-only">{mission.done ? "Done" : "Not done yet"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-200">
            {missions.bonusClaimed ? (
              <p className="text-sm font-bold text-emerald-800">✅ All missions done — +{MISSION_BONUS_XP} XP bonus claimed. New missions tomorrow!</p>
            ) : missions.allDone ? (
              <ClaimBonusButton xp={MISSION_BONUS_XP} />
            ) : (
              <p className="text-sm font-semibold text-slate-800">
                ⭐ Finish all three for a <span className="font-extrabold text-orange-800">+{MISSION_BONUS_XP} XP bonus</span>.
              </p>
            )}
          </div>
        </section>

        <section id="streak-card" className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-2`} aria-labelledby="streak-heading">
          <div className="flex items-center gap-3">
            <span aria-hidden className={`text-4xl ${streak.streak ? "" : "opacity-40 grayscale"}`}>
              🔥
            </span>
            <div>
              <h2 id="streak-heading" className="text-lg font-extrabold text-slate-900">
                {streak.streak ? `${streak.streak}-day learning streak` : "Start a streak today"}
              </h2>
              <p className="text-sm text-slate-600">
                {streak.doneToday ? "Today counts — see you tomorrow!" : "Any lesson, scenario, revision or daily question counts."}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <StreakWeek marks={weekMarks} today={today} />
          </div>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 px-3 py-2 ring-1 ring-brand-100">
              <span className="font-semibold text-slate-700">🧊 Streak freezes</span>
              <span className="font-extrabold text-slate-900 tabular-nums">
                {user.streakFreezes}/{MAX_STREAK_FREEZES}
              </span>
            </li>
            {milestone && (
              <li className="rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
                <span className="font-semibold text-slate-800">
                  {milestone.days - streak.streak} more {milestone.days - streak.streak === 1 ? "day" : "days"} to your {milestone.days}-day milestone:{" "}
                  <span className="font-extrabold text-orange-800">+{milestone.xp} XP</span>
                </span>
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs text-slate-600">
            A freeze covers a missed day automatically. You earn one every 7 days of streak — never by paying.
          </p>
          <Link href="/profile#streak" className="mt-auto pt-3 text-sm font-bold text-brand-700 hover:underline">
            See your streak calendar →
          </Link>
        </section>
      </div>

      {/* Continue learning + the two daily activities */}
      <div className="grid gap-5 lg:grid-cols-5">
        {next ? (
          <section className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-3`} aria-labelledby="continue-heading">
            <div className="flex items-center justify-between gap-3">
              <p id="continue-heading" className="text-lg font-extrabold text-slate-900">
                {next.isRetake ? "Practice next" : isNew ? "Start learning" : "Continue learning"}
              </p>
              <Link href="/lessons" className="inline-flex items-center gap-0.5 text-sm font-bold text-brand-700 hover:underline">
                Journey map
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

        <div className="flex flex-col gap-4 lg:col-span-2">
          <section className={`${card} flex flex-1 flex-col p-5`} aria-labelledby="question-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="question-heading" className="font-extrabold text-slate-900">
                ❓ Question of the Day
              </h2>
              {question && !question.answer && (
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
                  +{QUESTION_OF_THE_DAY_XP} XP
                </span>
              )}
            </div>
            {question ? (
              <>
                <p className="mt-2 line-clamp-3 text-sm text-slate-700">“{question.question.prompt}”</p>
                <div className="mt-auto pt-3">
                  {question.answer ? (
                    <p className="text-sm font-bold text-emerald-800">
                      ✅ Answered · +{question.answer.xpAwarded} XP.{" "}
                      <Link href="/question" className="underline underline-offset-2">
                        See the explanation
                      </Link>
                    </p>
                  ) : (
                    <Link href="/question" className={`${primaryButton} w-full`}>
                      Answer it — about 1 minute
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-700">{NO_QUESTION_MESSAGE}</p>
            )}
          </section>

          <section className={`${card} flex flex-1 flex-col p-5`} aria-labelledby="daily-challenge-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="daily-challenge-heading" className="font-extrabold text-slate-900">
                ⚡ Daily Challenge
              </h2>
              {!challengeRun && (
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
                  +{DAILY_CHALLENGE_XP} XP
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-700">
              <span aria-hidden>{challenge.icon}</span> Today: <span className="font-bold text-slate-900">{challenge.title}</span>
            </p>
            <div className="mt-auto pt-3">
              {challengeRun ? (
                <p className="text-sm font-bold text-emerald-800">
                  ✅ Done today · +{challengeRun.xpAwarded} XP.{" "}
                  <Link href="/challenge" className="underline underline-offset-2">
                    See your result
                  </Link>
                </p>
              ) : (
                <Link href="/challenge" className={`${softButton} w-full`}>
                  Take the challenge
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* For you today + this week */}
      <div className="grid gap-5 lg:grid-cols-5">
        <section className={`${card} p-5 sm:p-6 lg:col-span-3`} aria-labelledby="for-you-heading">
          <h2 id="for-you-heading" className="text-lg font-extrabold text-slate-900">
            For you today
          </h2>
          {forYou.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">You&apos;re all caught up. 🎉</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {forYou.slice(0, 4).map((item) => (
                <li key={item.text}>
                  <Link href={item.href} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 transition hover:bg-brand-50 hover:ring-brand-200">
                    <span aria-hidden className="text-xl">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{item.text}</span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {due > 0 && (
            <p className="mt-3 text-xs font-semibold text-slate-600">
              {due} revision {due === 1 ? "question is" : "questions are"} due today.
            </p>
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
              { label: "Daily question & challenge", value: String(week.daily) },
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

      {/* Your progress */}
      <section aria-labelledby="progress-heading" className="flex flex-col gap-4">
        <h2 id="progress-heading" className="text-lg font-extrabold text-slate-900">
          Your progress
        </h2>

        <div className="grid gap-5 lg:grid-cols-5">
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

          <div className={`${card} flex flex-col p-5 sm:p-6 lg:col-span-2`}>
            <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Your rank</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900">
              <span aria-hidden>{rank.current.icon}</span> {rank.current.name}
            </h3>
            {rank.toNext && <p className="mt-1 text-sm text-slate-700">{rank.toNext}.</p>}
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Level 1 — {LEVEL_1_NAME}: {completedCount}/{totalLessons} lessons
            </p>
            <div
              role="progressbar"
              aria-label="Level 1 progress"
              aria-valuemin={0}
              aria-valuemax={totalLessons}
              aria-valuenow={completedCount}
              className="mt-2 h-3 overflow-hidden rounded-full bg-brand-100"
            >
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${levelPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/profile#badges-heading"
                className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 shadow-[0_3px_0_0_var(--color-amber-200)] transition hover:-translate-y-0.5"
              >
                <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                  <span aria-hidden>🏅</span> {earnedBadges.length}/{BADGES.length}
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
                Open the journey map
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
