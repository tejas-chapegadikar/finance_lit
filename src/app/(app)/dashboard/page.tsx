import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getTodaysQuestion } from "@/lib/daily-question";
import { dailyChallengeInfo } from "@/lib/daily-challenge";
import { getTodaysWins } from "@/lib/activity";
import { streakStatus } from "@/lib/streak";
import { BADGES } from "@/lib/badges";
import { rankFor } from "@/lib/ranks";
import { nextReward, spendableXp } from "@/lib/rewards";
import { readAvatar } from "@/lib/avatar";
import { istDay } from "@/lib/ist-date";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { DAILY_CHALLENGE_XP, LEVEL_COMPLETION_XP, NO_LESSONS_MESSAGE, PATH_NAME, QUESTION_OF_THE_DAY_XP } from "@/lib/constants";
import { Avatar } from "@/components/avatar/Avatar";
import { card, primaryButton, softButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

// The dashboard answers one question — "what should I do next?" — so it shows
// only: a short welcome, three stats, the next lesson (the main thing), one
// daily activity and one next milestone. Details live on Learn, Rewards and
// Profile.
export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, question, challengeRun, challenge, unlocks, todaysWins, badgesToday] = await Promise.all([
    getProgress(user.id),
    getTodaysQuestion(user.id),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { id: true } }),
    dailyChallengeInfo(user.id, today),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    getTodaysWins(user.id, today),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
  ]);

  const { next, levels, currentLevel, completedCount, totalLessons, levelComplete, overall } = progress;
  const name = getDisplayName(user);
  const streak = streakStatus(user, today);
  const rank = rankFor(completedCount, overall, totalLessons);
  const balance = spendableXp(user);
  const reward = nextReward(new Set(unlocks.map((u) => u.rewardId)));
  const avatar = readAvatar(user.avatar);
  const newBadges = BADGES.filter((badge) => badgesToday.some((b) => b.badgeId === badge.id && istDay(b.earnedAt) === today));
  // Today's wins, as small chips under the welcome.
  const wins = [
    ...todaysWins.milestones.map((m) => `🔥 ${m.description} · +${m.xp} XP`),
    ...newBadges.map((badge) => `${badge.icon} New badge: ${badge.name}`),
    ...(todaysWins.frozenDays > 0 ? ["🧊 A streak freeze kept your streak safe"] : []),
  ];

  const streakText = streak.streak
    ? `🔥 ${streak.streak}-day streak${streak.doneToday ? "" : " — learn today to keep it"}`
    : "🔥 Start your streak today";

  // One daily activity: the quick question first, then the challenge.
  const daily =
    question && !question.answer
      ? {
          title: "Question of the Day",
          text: question.question.prompt,
          meta: `About 1 minute · +${QUESTION_OF_THE_DAY_XP} XP`,
          href: "/question",
          cta: "Answer now",
        }
      : !challengeRun
        ? {
            title: `Daily Challenge: ${challenge.title}`,
            text: "A few quick questions on today's topic — harder in topics you've mastered.",
            meta: `About 3 minutes · +${DAILY_CHALLENGE_XP} XP`,
            href: "/challenge",
            cta: "Start the challenge",
          }
        : null;

  // One next milestone: the next level to unlock, else the next reward.
  const levelIndex = currentLevel ? levels.indexOf(currentLevel) : -1;
  const nextLevel = levelIndex >= 0 ? levels[levelIndex + 1] : undefined;
  const lessonsLeft = currentLevel ? currentLevel.slugs.length - currentLevel.completed : 0;
  const rankUp = rank.next && rank.next.lessons === completedCount + lessonsLeft ? rank.next : null;
  const milestone = currentLevel
    ? {
        icon: nextLevel ? "🔓" : "🏆",
        title: nextLevel ? `Unlock Level ${nextLevel.chapter.number}: ${nextLevel.chapter.title}` : `Finish ${PATH_NAME}`,
        text: `Complete ${lessonsLeft} more ${lessonsLeft === 1 ? "lesson" : "lessons"} in Level ${currentLevel.chapter.number}${
          nextLevel ? "" : ` for +${LEVEL_COMPLETION_XP} XP`
        }${rankUp ? ` and become a ${rankUp.icon} ${rankUp.name}` : ""}.`,
        done: currentLevel.completed,
        total: currentLevel.slugs.length,
        href: "/lessons#path",
      }
    : reward
      ? {
          icon: "🎁",
          title: `Next reward: ${reward.name}`,
          text: balance >= reward.cost ? "You have enough XP to unlock it now." : `Earn ${reward.cost - balance} more XP to unlock it.`,
          done: Math.min(balance, reward.cost),
          total: reward.cost,
          href: "/rewards",
        }
      : null;

  const stats = [
    { label: "Current streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, icon: "🔥", ring: "ring-orange-200" },
    { label: "Total XP", value: user.xpTotal.toLocaleString("en-IN"), icon: "⭐", ring: "ring-amber-200" },
    { label: "Lessons completed", value: `${completedCount}/${totalLessons}`, icon: "📚", ring: "ring-brand-200" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      {/* A. Welcome */}
      <header className="flex flex-wrap items-center gap-4">
        <Link
          href="/profile/avatar"
          aria-label="Edit your avatar"
          className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-brand-100 ring-2 ring-brand-200 transition hover:-translate-y-0.5"
        >
          <Avatar config={avatar} crop="head" className="h-14 w-14" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Hey, {name}!</h1>
          <p className="text-sm text-slate-600">Build better money habits, one lesson at a time.</p>
        </div>
        <Link
          href="/profile#streak"
          className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-extrabold text-orange-800 ring-2 ring-orange-200 hover:bg-orange-100"
        >
          {streakText}
        </Link>
      </header>

      {wins.length > 0 && (
        <p role="status" className="flex flex-wrap gap-2">
          {wins.map((win) => (
            <span key={win} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
              {win}
            </span>
          ))}
        </p>
      )}

      {/* B. Three stats */}
      <dl aria-label="Your stats" className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`flex flex-col-reverse justify-end rounded-2xl bg-white p-3 ring-2 sm:p-4 ${stat.ring}`}>
            <dt className="mt-0.5 text-xs font-semibold text-slate-600">{stat.label}</dt>
            <dd className="flex items-center gap-1.5 text-lg font-extrabold text-slate-900 tabular-nums sm:text-xl">
              <span aria-hidden>{stat.icon}</span>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* C. Continue learning — the main thing to do */}
      {next ? (
        <section
          className="rounded-3xl bg-white p-5 shadow-[0_6px_0_0_var(--color-brand-200)] ring-2 ring-brand-200 sm:p-7"
          aria-labelledby="continue-heading"
        >
          <p className="text-sm font-extrabold text-brand-700">
            {next.isRetake
              ? "Strengthen a topic"
              : next.lesson.status === "in-progress"
                ? `Continue learning · Level ${next.lesson.level}`
                : `Next lesson · Level ${next.lesson.level}`}
          </p>
          <div className="mt-3 flex items-start gap-4">
            <span
              aria-hidden
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl ${READINESS_AREA_META[next.lesson.area].chipBg}`}
            >
              {next.lesson.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="continue-heading" className="text-2xl font-extrabold text-slate-900">
                {next.lesson.title}
              </h2>
              <p className="mt-1 text-slate-700">{next.isRetake ? next.reason : next.lesson.description}</p>
              {!next.isRetake && <p className="mt-1.5 text-sm font-semibold text-brand-700">{next.reason}</p>}
            </div>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <ClockIcon className="h-4 w-4" />
              About {next.lesson.estimatedMinutes} minutes
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">
              <span aria-hidden>⭐</span>
              {next.isRetake ? "Retakes raise your readiness (no XP)" : `+${next.lesson.xpReward} XP when you finish`}
            </li>
            {next.lesson.status === "in-progress" && !next.isRetake && (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-brand-800">Started</li>
            )}
          </ul>
          <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} mt-5 w-full py-4 text-base sm:w-auto sm:px-10`}>
            {next.isRetake ? "Review this lesson" : next.lesson.status === "in-progress" ? "Continue Learning" : "Start Learning"}
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </section>
      ) : levelComplete ? (
        <section className={`${card} p-6 text-center`} aria-labelledby="continue-heading">
          <p aria-hidden className="text-4xl">
            🏆
          </p>
          <h2 id="continue-heading" className="mt-1 text-xl font-extrabold text-slate-900">
            You&apos;ve finished all {levels.length} levels of {PATH_NAME}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">Keep it fresh: revise what you missed and take today&apos;s challenge.</p>
          <Link href="/lessons#review" className={`${primaryButton} mt-4`}>
            Review &amp; revise
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <p className={`${card} p-6 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* D. One daily activity */}
        <section className={`${card} flex flex-col p-5`} aria-labelledby="daily-heading">
          <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Today</p>
          {daily ? (
            <>
              <h2 id="daily-heading" className="mt-1 font-extrabold text-slate-900">
                {daily.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-700">{daily.text}</p>
              <p className="mt-2 text-xs font-bold text-amber-800">{daily.meta}</p>
              <div className="mt-auto pt-4">
                <Link href={daily.href} className={`${softButton} w-full`}>
                  {daily.cta}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 id="daily-heading" className="mt-1 font-extrabold text-slate-900">
                ✅ Daily question and challenge done
              </h2>
              <p className="mt-1 text-sm text-slate-700">New ones arrive at midnight. Want more? Revise or play a money scenario.</p>
              <div className="mt-auto pt-4">
                <Link href="/lessons#practise" className={`${softButton} w-full`}>
                  Practise more
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </section>

        {/* E. One next milestone */}
        {milestone && (
          <Link href={milestone.href} className={`${card} flex flex-col p-5 transition hover:-translate-y-0.5`} aria-labelledby="milestone-heading">
            <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">Next milestone</p>
            <h2 id="milestone-heading" className="mt-1 font-extrabold text-slate-900">
              <span aria-hidden>{milestone.icon}</span> {milestone.title}
            </h2>
            <p className="mt-1 text-sm text-slate-700">{milestone.text}</p>
            <div className="mt-auto pt-4">
              <div
                role="progressbar"
                aria-label={milestone.title}
                aria-valuemin={0}
                aria-valuemax={milestone.total}
                aria-valuenow={milestone.done}
                className="h-2.5 overflow-hidden rounded-full bg-brand-100"
              >
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${(milestone.done / milestone.total) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs font-bold text-slate-600 tabular-nums">
                {milestone.done}/{milestone.total}
                {milestone.icon === "🎁" ? " XP" : " lessons"}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
