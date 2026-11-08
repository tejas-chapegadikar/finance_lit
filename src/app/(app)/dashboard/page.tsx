import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { streakStatus } from "@/lib/streak";
import { avatarName, readAvatar } from "@/lib/avatar";
import { dayNumber, istDay } from "@/lib/ist-date";
import { NO_LESSONS_MESSAGE } from "@/lib/constants";
import { getMoneyMonth, getMoneyTrends } from "@/lib/money";
import { rupees } from "@/lib/money/categories";
import { moneyRoast } from "@/lib/avatar/roast";
import { getPortfolio } from "@/lib/invest/portfolio";
import type { Expression } from "@/components/avatar/Avatar";
import { AvatarHub, type HubBlock } from "@/components/dashboard/AvatarHub";
import { CountUp } from "@/components/ui/CountUp";
import { card } from "@/components/ui/button-styles";
import { FlameIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard | StockStreak" };

/** "Good morning" etc. by the time in India; late at night, just "Hey". */
function greetingFor(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(now),
  );
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hey";
}

// The avatar's opening line, one per day.
const GREETINGS: { expression: Expression; text: string }[] = [
  {
    expression: "welcoming",
    text: "So, what are we fixing today? Pick a block. Any block.",
  },
  {
    expression: "happy",
    text: "One small money move today. That's all I'm asking. For now.",
  },
  {
    expression: "thinking",
    text: "Wallet check: still alive. Let's keep it that way.",
  },
  { expression: "excited", text: "Learn one thing, save one rupee. Deal?" },
  {
    expression: "proud",
    text: "Your future self called. They said thanks in advance.",
  },
];

const INVEST_FOUNDATIONS = ["compound-interest", "stocks-mutual-funds-fds", "sip-starting-early"];

const signedPct = (fraction: number) => `${fraction >= 0 ? "+" : "−"}${Math.abs(fraction * 100).toFixed(1)}%`;

// The dashboard is the avatar's home: a greeting, your avatar in the middle
// (it talks, roasts your real spending, follows your pointer) and the three
// pillars around it, Money Management, Money IQ and InvestSmart, each with
// one real number. Details live on each pillar's page.
export default async function DashboardPage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, money, trends, portfolio] = await Promise.all([
    getProgress(user.id),
    getMoneyMonth(user.id),
    getMoneyTrends(user.id, today),
    getPortfolio(user.id),
  ]);

  const name = getDisplayName(user);
  const buddy = avatarName(user);
  const streak = streakStatus(user, today);
  const roast = moneyRoast({
    month: money,
    weekly: trends.weekly,
    name: buddy,
  });

  // Money Management: this month, from what you've logged.
  const left = money.totalBudget !== null ? money.totalBudget - money.spent : null;
  const moneyBlock: HubBlock = {
    id: "money",
    href: "/money",
    title: "Money Management",
    kicker: `${money.label} · from what you've logged`,
    headline: money.entries.length === 0 ? "Nothing logged yet" : `${rupees(money.spent)} spent`,
    detail:
      money.entries.length === 0
        ? "Log your first spend. It takes ten seconds."
        : left === null
          ? `${rupees(money.income)} came in this month. Set a budget to see what's left.`
          : left >= 0
            ? `${rupees(left)} left of your ${rupees(money.totalBudget!)} budget.`
            : `${rupees(-left)} over your ${rupees(money.totalBudget!)} budget.`,
    progress: money.totalBudget
      ? {
          value: Math.min(money.spent, money.totalBudget),
          max: money.totalBudget,
          label: "Budget used",
        }
      : undefined,
    cta: money.entries.length === 0 ? "Log a spend" : "See where it went",
  };

  // Money IQ: the four levels, in order.
  const { currentLevel, completedCount, totalLessons } = progress;
  const nextLesson = progress.lessons.find((l) => !l.locked && l.status !== "completed") ?? null;
  const iqBlock: HubBlock = {
    id: "iq",
    href: "/lessons",
    title: "Money IQ",
    kicker: `${completedCount} of ${totalLessons} lessons done`,
    headline: currentLevel ? `Level ${currentLevel.chapter.number}: ${currentLevel.chapter.title}` : "Every level complete!",
    detail: nextLesson ? `Next up: ${nextLesson.title}` : "You've finished the path. Revision keeps it fresh.",
    progress: {
      value: completedCount,
      max: totalLessons,
      label: "Money IQ progress",
    },
    cta: nextLesson ? (nextLesson.status === "in-progress" ? "Carry on" : "Start the next lesson") : "Open Money IQ",
  };

  // InvestSmart: the virtual portfolio and the lessons.
  const investLessons = [...progress.lessons.filter((l) => INVEST_FOUNDATIONS.includes(l.slug)), ...progress.invest];
  const investDone = investLessons.filter((l) => l.status === "completed").length;
  const untouched = portfolio.holdings.length === 0 && portfolio.month === 0;
  const investBlock: HubBlock = {
    id: "invest",
    href: "/invest",
    title: "InvestSmart",
    kicker: `Virtual money · ${investDone} of ${investLessons.length} lessons done`,
    headline: untouched ? `${rupees(portfolio.total)} of virtual money, waiting` : `Portfolio: ${rupees(Math.round(portfolio.total))}`,
    detail: untouched
      ? "Try investing without risking a real rupee."
      : `${signedPct(portfolio.sinceStart)} since you started · month ${portfolio.month} of the simulation`,
    cta: untouched ? "Make your first virtual investment" : "Check your portfolio",
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10">
      <header className="flex animate-fade-up flex-col items-center gap-3 text-center">
        <h1 className="text-[1.9rem] leading-tight text-slate-900 sm:text-4xl">
          {greetingFor(new Date())}, {name}!
        </h1>
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:ring-brand-300"
          >
            <FlameIcon className={`h-4 w-4 text-orange-500 ${streak.doneToday ? "animate-flicker" : ""}`} />
            {streak.streak} {streak.streak === 1 ? "day" : "days"}
            <span className="sr-only">streak</span>
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:ring-brand-300"
          >
            <StarIcon className="h-4 w-4 text-orange-500" />
            <CountUp value={user.xpTotal} id="xp-dashboard" /> XP
          </Link>
          <span className="text-slate-500">
            {streak.doneToday ? "Today's counted." : streak.streak ? "Do one thing today to keep your streak." : "Do one thing today to start a streak."}
          </span>
        </p>
      </header>

      {progress.lessons.length === 0 && <p className={`${card} p-6 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>}

      <AvatarHub
        avatar={readAvatar(user.avatar)}
        name={buddy}
        greeting={GREETINGS[dayNumber(today) % GREETINGS.length]}
        roast={{ expression: roast.expression, lines: roast.lines }}
        blocks={[moneyBlock, iqBlock, investBlock]}
      />
    </div>
  );
}
