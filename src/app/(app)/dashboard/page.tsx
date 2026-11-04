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
import { countDueRevision } from "@/lib/revision";
import { streakStatus } from "@/lib/streak";
import { BADGES } from "@/lib/badges";
import { rankFor } from "@/lib/ranks";
import { readAvatar } from "@/lib/avatar";
import { dayNumber, istDay } from "@/lib/ist-date";
import { NO_LESSONS_MESSAGE } from "@/lib/constants";
import { budgetAlerts, getMoneyMonth, getMoneyWeek } from "@/lib/money";
import { getAllChallengeProgress, HABIT_CHALLENGE } from "@/lib/challenges";
import { findPersonality } from "@/lib/personality";
import { getWeeklyLeague } from "@/lib/league";
import { recommend } from "@/lib/recommendations";
import { Avatar } from "@/components/avatar/Avatar";
import { TodayPanel } from "@/components/dashboard/TodayPanel";
import { ForYouLine, HabitCard, InvestCard, LeagueLine, MoneyCard, MoneyIQCard, RecommendedNext, WeekSummary } from "@/components/dashboard/PillarCards";
import { Callout, StatStrip, type Stat } from "@/components/ui/PageHeader";
import { CountUp } from "@/components/ui/CountUp";
import { card } from "@/components/ui/button-styles";
import { BookIcon, FlameIcon, SparklesIcon, StarIcon, TrendingUpIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

/** "Good morning" etc. by the time in India; late at night, just "Hey". */
function greetingFor(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(now));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hey";
}

// Your avatar's line of the day under the greeting.
const GREETINGS = [
  "Ready to make smarter money moves today?",
  "One small money move today — that's all we need.",
  "Wallet check: still alive. Let's keep it that way.",
  "Let's learn one thing and save one rupee today.",
  "Your future self called. They said hi.",
];

const INVEST_FOUNDATIONS = ["compound-interest", "stocks-mutual-funds-fds", "sip-starting-early"];

// The dashboard answers "where am I, and what should I do next?": who you
// are and how you're doing, one recommended next step, the three pillars
// (Money IQ, Money Manager, InvestSmart), today's activities, and this week's
// money. Details live on each pillar's own page.
export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, question, challengeRun, challenge, todaysWins, badgesToday, missions, money, week, goals, challenges, due, league] = await Promise.all([
    getProgress(user.id),
    getTodaysQuestion(user.id),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { xpAwarded: true } }),
    dailyChallengeInfo(user.id, today),
    getTodaysWins(user.id, today),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    getDailyMissions(user.id, today),
    getMoneyMonth(user.id),
    getMoneyWeek(user.id, today),
    db.savingsGoal.findMany({ where: { userId: user.id }, select: { name: true, icon: true, saved: true, target: true, completedAt: true } }),
    getAllChallengeProgress(user.id, today),
    countDueRevision(user.id),
    getWeeklyLeague(user.id, user.leagueOptIn, today),
  ]);
  const personality = findPersonality(user.moneyPersonality);
  const habit = challenges.find((c) => c.challenge.id === HABIT_CHALLENGE.id)!;

  const { levels, currentLevel, completedCount, totalLessons, overall } = progress;
  const name = getDisplayName(user);
  const streak = streakStatus(user, today);
  const rank = rankFor(completedCount, overall, totalLessons);
  const avatar = readAvatar(user.avatar);
  const newBadges = BADGES.filter((badge) => badgesToday.some((b) => b.badgeId === badge.id && istDay(b.earnedAt) === today));
  const wins = [
    ...todaysWins.milestones.map((m) => `${m.description} (+${m.xp} XP)`),
    ...newBadges.map((badge) => `new badge: ${badge.name}`),
    ...(todaysWins.frozenDays > 0 ? ["a streak freeze kept your streak safe"] : []),
  ];

  const investLessons = [...progress.lessons.filter((l) => INVEST_FOUNDATIONS.includes(l.slug)), ...progress.invest];
  const investDone = investLessons.filter((l) => l.status === "completed").length;
  const investNext = investLessons.find((l) => !l.locked && l.status !== "completed")?.title ?? null;

  const activeGoals = goals.filter((g) => !g.completedAt);
  const topGoal = [...activeGoals].sort((a, b) => b.saved / b.target - a.saved / a.target)[0] ?? null;
  const recommendations = recommend({
    progress,
    dueRevision: due,
    money: { income: money.income, spent: money.spent, entries: money.entries.length },
    alerts: budgetAlerts(money),
    goals: { active: activeGoals.length, total: goals.length },
    joinedChallenges: new Set(challenges.filter((c) => c.enrolled).map((c) => c.challenge.id)),
    personality,
  });

  const streakMessage = !streak.streak
    ? "Start your streak today — finish a lesson, answer the Reality Check or check in on your money."
    : streak.doneToday
      ? `${streak.streak}-day streak! Today's counted — see you tomorrow.`
      : `${streak.streak}-day streak — do one thing today to keep it going.${streak.freezesNeeded ? " A streak freeze will cover the day you missed." : ""}`;

  const stats: Stat[] = [
    { label: "Streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, icon: <FlameIcon /> },
    { label: "XP", value: <CountUp value={user.xpTotal} id="xp-dashboard" />, icon: <StarIcon />, tone: "text-orange-600" },
    { label: "Money IQ", value: `${completedCount}/${totalLessons}`, icon: <BookIcon /> },
    { label: "InvestSmart", value: `${investDone}/${investLessons.length}`, icon: <TrendingUpIcon /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 sm:gap-12">
      {/* Who you are and how you're doing */}
      <header className="flex animate-fade-up flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link href="/profile" aria-label="Your profile and avatar" className="flex h-24 w-24 shrink-0 items-end justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,var(--color-brand-100),var(--color-brand-50)_70%)] ring-1 ring-brand-100 transition hover:-translate-y-0.5 sm:h-28 sm:w-28">
              <Avatar config={avatar} expression="welcoming" className="h-[5.5rem] w-auto animate-bob sm:h-[6.5rem]" label={`${name}'s avatar`} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-[1.9rem] leading-tight text-slate-900 sm:text-4xl">
                {greetingFor(new Date())}, {name}!
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                <Link href="/profile" className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-slate-800">
                  {rank.current.name}
                </Link>
                <span>{rank.toNext ?? "Top rank reached."}</span>
              </p>
              <p className="relative mt-3 inline-block rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-[0_8px_20px_-12px_rgb(28_26_38/0.3)] ring-1 ring-slate-200">
                {GREETINGS[dayNumber(today) % GREETINGS.length]}
              </p>
            </div>
          </div>
          <div className="sm:max-w-xs">
            <Callout
              href="/progress#streak"
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
        <ForYouLine personality={personality} />
      </header>

      {wins.length > 0 && (
        <p role="status" className="flex animate-fade-up items-start gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-950 ring-1 ring-orange-100">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 animate-pop text-orange-500" />
          <span>
            <span className="font-semibold">Today:</span> {wins.join(" · ")}
          </span>
        </p>
      )}

      {/* One recommended next step (plus two more) */}
      {progress.lessons.length === 0 ? <p className={`${card} p-6 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p> : <RecommendedNext items={recommendations} />}

      {/* The three pillars */}
      <section aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="text-2xl text-slate-900">
          Learn · Manage · Invest
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <MoneyIQCard levels={levels} currentLevel={currentLevel} completed={completedCount} total={totalLessons} />
          <MoneyCard month={money} />
          <InvestCard done={investDone} total={investLessons.length} nextTitle={investNext} />
        </div>
      </section>

      {/* Today */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
        <TodayPanel
          layout="stack"
          questionXp={question?.answer ? question.answer.xpAwarded : null}
          questionPrompt={question?.question.prompt}
          challengeTitle={challenge.title}
          challengeXp={challengeRun ? challengeRun.xpAwarded : null}
          missions={missions}
        />
        <div className="flex flex-col gap-3">
          <HabitCard habit={habit} />
          <LeagueLine league={league} />
        </div>
      </div>

      {/* This week's money */}
      <WeekSummary week={week} goal={topGoal} />
    </div>
  );
}
