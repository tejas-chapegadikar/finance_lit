import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getTodaysQuestion } from "@/lib/daily-question";
import { dailyChallengeInfo } from "@/lib/daily-challenge";
import { getTodaysWins } from "@/lib/activity";
import { getDailyMissions } from "@/lib/missions";
import { streakStatus } from "@/lib/streak";
import { BADGES } from "@/lib/badges";
import { rankFor } from "@/lib/ranks";
import { nextReward, spendableXp } from "@/lib/rewards";
import { readAvatar } from "@/lib/avatar";
import { istDay } from "@/lib/ist-date";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { LEVEL_COMPLETION_XP, NO_LESSONS_MESSAGE, PATH_NAME } from "@/lib/constants";
import { Avatar } from "@/components/avatar/Avatar";
import { TodayPanel } from "@/components/dashboard/TodayPanel";
import { Callout, StatStrip, type Stat } from "@/components/ui/PageHeader";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar, StepBar } from "@/components/ui/ProgressBar";
import { LevelIllustration, TrophyIllustration } from "@/components/ui/illustrations";
import { card, lightButton, primaryButton, spotlight, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, BookIcon, CheckIcon, ClockIcon, FlameIcon, LockIcon, SparklesIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

/** "Good morning" etc. by the time in India; late at night, just "Hey". */
function greetingFor(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(now));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hey";
}

// The dashboard answers "where am I, and what should I do next?": level, XP
// and streak up top, then the next lesson (the main thing), today's
// activities with their XP, the next achievement and progress per level.
// Details live on Learn, Rewards and Profile.
export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, question, challengeRun, challenge, unlocks, todaysWins, badgesToday, missions] = await Promise.all([
    getProgress(user.id),
    getTodaysQuestion(user.id),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { xpAwarded: true } }),
    dailyChallengeInfo(user.id, today),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    getTodaysWins(user.id, today),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    getDailyMissions(user.id, today),
  ]);

  const { next, levels, currentLevel, completedCount, totalLessons, levelComplete, overall } = progress;
  const name = getDisplayName(user);
  const greeting = greetingFor(new Date());
  const streak = streakStatus(user, today);
  const rank = rankFor(completedCount, overall, totalLessons);
  const balance = spendableXp(user);
  const reward = nextReward(new Set(unlocks.map((u) => u.rewardId)));
  const avatar = readAvatar(user.avatar);
  const newBadges = BADGES.filter((badge) => badgesToday.some((b) => b.badgeId === badge.id && istDay(b.earnedAt) === today));
  // Today's wins, shown as one short line under the welcome.
  const wins = [
    ...todaysWins.milestones.map((m) => `${m.description} (+${m.xp} XP)`),
    ...newBadges.map((badge) => `new badge: ${badge.name}`),
    ...(todaysWins.frozenDays > 0 ? ["a streak freeze kept your streak safe"] : []),
  ];

  const streakMessage = !streak.streak
    ? "Start your streak today — finish a lesson or answer the Question of the Day."
    : streak.doneToday
      ? `${streak.streak}-day streak! You've learned today — come back tomorrow to keep it going.`
      : `${streak.streak}-day streak — learn something today to keep it going.${
          streak.freezesNeeded ? " A streak freeze will cover the day you missed." : ""
        }`;

  // One next milestone: the next level to unlock, else the next reward.
  const levelIndex = currentLevel ? levels.indexOf(currentLevel) : -1;
  const nextLevel = levelIndex >= 0 ? levels[levelIndex + 1] : undefined;
  const lessonsLeft = currentLevel ? currentLevel.slugs.length - currentLevel.completed : 0;
  const rankUp = rank.next && rank.next.lessons === completedCount + lessonsLeft ? rank.next : null;
  const milestone = currentLevel
    ? {
        title: nextLevel ? `Unlock Level ${nextLevel.chapter.number}: ${nextLevel.chapter.title}` : `Finish ${PATH_NAME}`,
        text: `Complete ${lessonsLeft} more ${lessonsLeft === 1 ? "lesson" : "lessons"} in Level ${currentLevel.chapter.number}${
          nextLevel ? "" : ` for +${LEVEL_COMPLETION_XP} XP`
        }${rankUp ? ` and become a ${rankUp.name}` : ""}.`,
        done: currentLevel.completed,
        total: currentLevel.slugs.length,
        unit: "lessons",
        href: "/lessons#path",
      }
    : reward
      ? {
          title: `Next reward: ${reward.name}`,
          text: balance >= reward.cost ? "You have enough XP to unlock it now." : `Earn ${reward.cost - balance} more XP to unlock it.`,
          done: Math.min(balance, reward.cost),
          total: reward.cost,
          unit: "XP",
          href: "/rewards",
        }
      : null;

  const levelNumber = currentLevel?.chapter.number ?? levels.length;
  const nextLevelOfLesson = next ? levels.find((l) => l.slugs.includes(next.lesson.slug)) : undefined;
  const stats: Stat[] = [
    { label: "Streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, icon: <FlameIcon /> },
    { label: "XP", value: <CountUp value={user.xpTotal} id="xp-dashboard" />, icon: <StarIcon />, tone: "text-orange-600" },
    { label: "Level", value: `${levelNumber}/${levels.length}`, icon: <TrophyIcon /> },
    { label: "Lessons", value: `${completedCount}/${totalLessons}`, icon: <BookIcon /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:gap-12">
      {/* A. Greeting, then the numbers that matter */}
      <header className="flex animate-fade-up flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href="/profile/avatar"
              aria-label="Edit your avatar"
              className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-full bg-peach-100 ring-1 ring-slate-200 transition hover:ring-slate-300 sm:h-16 sm:w-16"
            >
              <Avatar config={avatar} crop="head" className="h-14 w-14 sm:h-16 sm:w-16" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-[1.9rem] leading-tight text-slate-900 sm:text-4xl">
                {greeting}, {name}!
              </h1>
              <p className="mt-0.5 text-sm text-slate-600">
                {currentLevel
                  ? `Level ${currentLevel.chapter.number} of ${levels.length} · ${currentLevel.chapter.title} · ${rank.current.name}`
                  : `${rank.current.name} · Build better money habits, one lesson at a time.`}
              </p>
            </div>
          </div>
          <div className="sm:max-w-xs">
            <Callout
              href="/profile#streak"
              badge={
                <>
                  <FlameIcon className={`h-4 w-4 ${streak.doneToday ? "animate-flicker" : ""}`} />
                  {streak.streak}
                </>
              }
            >
              {streakMessage}
            </Callout>
          </div>
        </div>
        <StatStrip label="Your stats" stats={stats} />
      </header>

      {wins.length > 0 && (
        <p role="status" className="flex animate-fade-up items-start gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-950 ring-1 ring-orange-100">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 animate-pop text-orange-500" />
          <span>
            <span className="font-semibold">Today:</span> {wins.join(" · ")}
          </span>
        </p>
      )}

      {/* B. Up next — the one dark, colourful thing on the page */}
      {next ? (
        <section className={`${spotlight} animate-fade-up p-6 sm:p-9`} aria-labelledby="continue-heading" style={{ animationDelay: "80ms" }}>
          <span
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-48 -left-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(242_128_28/0.16),transparent_65%)]"
          />
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-white/60">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-white/85">
                  {next.isRetake
                    ? "Strengthen a topic"
                    : next.lesson.status === "in-progress"
                      ? `Continue learning · Level ${next.lesson.level}`
                      : `Next lesson · Level ${next.lesson.level}`}
                </span>
                <span>
                  Lesson {String(next.lesson.number).padStart(2, "0")} · {READINESS_AREA_META[next.lesson.area].label}
                </span>
              </p>
              <h2 id="continue-heading" className="mt-3 text-[2rem] leading-[1.05] text-white sm:text-[2.6rem]">
                {next.lesson.title}
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">{next.isRetake ? next.reason : next.lesson.description}</p>
              {!next.isRetake && <p className="mt-1.5 text-sm text-white/50">{next.reason}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  About {next.lesson.estimatedMinutes} minutes
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-orange-300">
                  <StarIcon className="h-4 w-4" />
                  {next.isRetake ? "Retakes raise your readiness (no XP)" : `+${next.lesson.xpReward} XP when you finish`}
                </span>
                {next.lesson.status === "in-progress" && !next.isRetake && <span className="font-semibold text-brand-200">Started</span>}
              </div>
              {nextLevelOfLesson && (
                <div className="mt-5 max-w-xs">
                  <StepBar
                    done={nextLevelOfLesson.completed}
                    total={nextLevelOfLesson.slugs.length}
                    current={!next.isRetake}
                    onDark
                    label={`Level ${nextLevelOfLesson.chapter.number} progress`}
                  />
                  <p className="mt-1.5 text-xs text-white/50">
                    Level {nextLevelOfLesson.chapter.number} · {nextLevelOfLesson.completed} of {nextLevelOfLesson.slugs.length} lessons done
                  </p>
                </div>
              )}
              <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} group mt-7 w-full px-7 py-3.5 text-base sm:w-auto`}>
                {next.isRetake ? "Review this lesson" : next.lesson.status === "in-progress" ? "Continue Learning" : "Start Learning"}
                <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
            <LevelIllustration level={next.lesson.level} className="mx-auto hidden h-48 w-auto animate-float md:block lg:h-56" />
          </div>
        </section>
      ) : levelComplete ? (
        <section className={`${spotlight} p-8 text-center sm:p-10`} aria-labelledby="continue-heading">
          <TrophyIllustration won className="mx-auto h-28 w-auto animate-pop" />
          <h2 id="continue-heading" className="mt-4 text-3xl text-white">
            You&apos;ve finished all {levels.length} levels of {PATH_NAME}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/70">Keep it fresh: revise what you missed and take today&apos;s challenge.</p>
          <Link href="/lessons#review" className={`${lightButton} mt-6`}>
            Review &amp; revise
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <p className={`${card} p-6 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      )}

      {/* C. Today's activities */}
      <TodayPanel
        questionXp={question?.answer ? question.answer.xpAwarded : null}
        questionPrompt={question?.question.prompt}
        challengeTitle={challenge.title}
        challengeXp={challengeRun ? challengeRun.xpAwarded : null}
        missions={missions}
      />

      {/* D. Progress through the four levels, and the next achievement */}
      <section aria-labelledby="progress-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="progress-heading" className="text-2xl text-slate-900">
            Your progress
          </h2>
          <Link href="/lessons#path" className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            See the map
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
          <ol className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-slate-200 pt-5 sm:grid-cols-2">
            {levels.map((level) => {
              const isCurrent = level === currentLevel;
              return (
                <li key={level.chapter.id} className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    {level.status === "completed" ? (
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    ) : level.status === "locked" ? (
                      <LockIcon className="h-3.5 w-3.5" />
                    ) : null}
                    Level {level.chapter.number}
                    {isCurrent && <span className="rounded-full bg-brand-50 px-2 py-px text-[11px] font-semibold text-brand-700">You&apos;re here</span>}
                  </p>
                  <p className={`mt-0.5 flex items-baseline justify-between gap-2 text-[15px] font-semibold ${level.status === "locked" ? "text-slate-500" : "text-slate-900"}`}>
                    <span className="truncate">{level.chapter.title}</span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 tabular-nums">
                      {level.completed}/{level.slugs.length}
                      <span className="sr-only"> lessons done</span>
                    </span>
                  </p>
                  <StepBar
                    done={level.completed}
                    total={level.slugs.length}
                    current={isCurrent}
                    label={`Level ${level.chapter.number} progress`}
                    className="mt-2"
                  />
                </li>
              );
            })}
          </ol>

          {milestone && (
            <Link href={milestone.href} className={`${tile} group flex flex-col p-5`} aria-labelledby="milestone-heading">
              <span className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <TrophyIcon className="h-4 w-4" />
                </span>
                Next achievement
              </span>
              <h3 id="milestone-heading" className="mt-3 text-lg leading-snug text-slate-900">
                {milestone.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{milestone.text}</p>
              <div className="mt-auto pt-4">
                <ProgressBar
                  value={milestone.done}
                  max={milestone.total}
                  label={milestone.title}
                  tone={milestone.unit === "XP" ? "bg-orange-400" : "bg-emerald-500"}
                />
                <p className="mt-1.5 text-xs font-semibold text-slate-600 tabular-nums">
                  {milestone.done}/{milestone.total} {milestone.unit}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
