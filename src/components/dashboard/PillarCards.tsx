import Link from "next/link";
import type { MoneyMonth, MoneyWeek } from "@/lib/money";
import type { ChallengeProgress } from "@/lib/challenges";
import type { Personality } from "@/lib/personality";
import type { WeeklyLeague } from "@/lib/league";
import type { LevelAccess } from "@/lib/journey";
import type { Recommendation } from "@/lib/recommendations";
import { rupees } from "@/lib/money/categories";
import { ProgressBar, StepBar } from "@/components/ui/ProgressBar";
import { GoalIcon } from "@/components/ui/topic-icons";
import {
  ArrowRightIcon,
  BookIcon,
  CalendarCheckIcon,
  CheckIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/icons";
import { lightButton, spotlight, tile } from "@/components/ui/button-styles";

// The dashboard's building blocks: the three pillars (Money IQ, Money
// Manager, InvestSmart), the 30-day habit, the recommended next step, this
// week's money and the opt-in league. Each pillar has its own accent so they
// read as three distinct places.

const PILLAR = {
  "money-iq": { name: "Money IQ", Icon: BookIcon, tile: "bg-brand-50 text-brand-700", text: "text-brand-700" },
  "money-manager": { name: "Money Manager", Icon: WalletIcon, tile: "bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
  investsmart: { name: "InvestSmart", Icon: TrendingUpIcon, tile: "bg-sky-50 text-sky-700", text: "text-sky-700" },
  daily: { name: "Challenges", Icon: CalendarCheckIcon, tile: "bg-orange-50 text-orange-700", text: "text-orange-700" },
} as const;

function PillarLabel({ pillar, children }: { pillar: keyof typeof PILLAR; children?: React.ReactNode }) {
  const p = PILLAR[pillar];
  return (
    <span className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
        <span aria-hidden className={`flex h-7 w-7 items-center justify-center rounded-lg ${p.tile}`}>
          <p.Icon className="h-4 w-4" />
        </span>
        {p.name}
      </span>
      {children}
    </span>
  );
}

function CardCta({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700">
      {children}
      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </span>
  );
}

/** Money IQ: the four levels as segments, and what unlocks next. */
export function MoneyIQCard({ levels, currentLevel, completed, total }: { levels: LevelAccess[]; currentLevel: LevelAccess | null; completed: number; total: number }) {
  const left = currentLevel ? currentLevel.slugs.length - currentLevel.completed : 0;
  const next = currentLevel ? levels[levels.indexOf(currentLevel) + 1] : undefined;
  return (
    <Link href="/lessons" className={`${tile} group flex flex-col p-5`} aria-labelledby="iq-card-heading">
      <PillarLabel pillar="money-iq">
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {completed}/{total} lessons
        </span>
      </PillarLabel>
      <h3 id="iq-card-heading" className="mt-3 text-lg leading-snug text-slate-900">
        {currentLevel ? `Level ${currentLevel.chapter.number}: ${currentLevel.chapter.title}` : `All ${levels.length} levels complete`}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {currentLevel
          ? next
            ? `${left} more ${left === 1 ? "lesson" : "lessons"} to unlock Level ${next.chapter.number}: ${next.chapter.title}.`
            : `${left} more ${left === 1 ? "lesson" : "lessons"} to finish the path.`
          : "Revise what you missed, or retake a lesson to raise your stars."}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-1.5" role="img" aria-label={levels.map((l) => `Level ${l.chapter.number}: ${l.completed} of ${l.slugs.length}`).join(", ")}>
        {levels.map((l) => (
          <span key={l.chapter.id} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${(l.completed / Math.max(1, l.slugs.length)) * 100}%` }} />
          </span>
        ))}
      </div>
      <CardCta>{currentLevel ? "Continue learning" : "Open Money IQ"}</CardCta>
    </Link>
  );
}

export function MoneyCard({ month }: { month: MoneyMonth }) {
  const left = month.income - month.spent;
  const budgetPct = month.totalBudget ? Math.round((month.spent / month.totalBudget) * 100) : null;
  const hasData = month.income > 0 || month.spent > 0;
  return (
    <Link href="/money" className={`${tile} group flex flex-col p-5`} aria-labelledby="money-card-heading">
      <PillarLabel pillar="money-manager">
        {month.checkedInToday ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CheckIcon className="h-3.5 w-3.5" /> Checked in
          </span>
        ) : (
          <span className="text-xs font-semibold text-orange-700">Check in today</span>
        )}
      </PillarLabel>
      <h3 id="money-card-heading" className="sr-only">
        Your money this month
      </h3>
      {hasData ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-slate-500">Spent this month</dt>
              <dd className="font-display text-2xl font-semibold text-slate-900 tabular-nums">{rupees(month.spent)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Available</dt>
              <dd className={`font-display text-2xl font-semibold tabular-nums ${month.income ? (left < 0 ? "text-rose-700" : "text-emerald-700") : "text-slate-400"}`}>
                {month.income ? rupees(left) : "—"}
              </dd>
            </div>
          </dl>
          {budgetPct !== null && (
            <div className="mt-3">
              <ProgressBar
                value={Math.min(month.spent, month.totalBudget!)}
                max={month.totalBudget!}
                label="Monthly budget used"
                tone={budgetPct > 100 ? "bg-rose-500" : budgetPct >= 80 ? "bg-orange-400" : "bg-emerald-500"}
                size="sm"
              />
              <p className="mt-1 text-xs text-slate-500">{budgetPct}% of budget used</p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Track income, expenses, budgets and savings goals. Add your pocket money or stipend to start.</p>
      )}
      <CardCta>{month.checkedInToday ? "Open Money Manager" : "Log today's money"}</CardCta>
    </Link>
  );
}

/** InvestSmart: lessons done of the investing set, and the simulator. */
export function InvestCard({ done, total, nextTitle }: { done: number; total: number; nextTitle: string | null }) {
  return (
    <Link href="/invest" className={`${tile} group flex flex-col p-5`} aria-labelledby="invest-card-heading">
      <PillarLabel pillar="investsmart">
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {done}/{total} lessons
        </span>
      </PillarLabel>
      <h3 id="invest-card-heading" className="mt-3 text-lg leading-snug text-slate-900">
        {done === 0 ? "Understand investing before you invest" : done === total ? "Investing basics: covered" : `Next: ${nextTitle ?? "keep going"}`}
      </h3>
      <p className="mt-1 text-sm text-slate-600">Inflation, the stock market, SIPs and index funds — plus a compounding simulator to play with.</p>
      <div className="mt-4">
        <ProgressBar value={done} max={Math.max(1, total)} label="InvestSmart progress" tone="bg-sky-500" size="sm" />
      </div>
      <CardCta>{done === 0 ? "Start InvestSmart" : "Open InvestSmart"}</CardCta>
    </Link>
  );
}

export function HabitCard({ habit }: { habit: ChallengeProgress }) {
  const step = habit.nextStep ? habit.challenge.steps[habit.nextStep - 1] : null;
  const phase = habit.nextStep ? [...(habit.challenge.phases ?? [])].reverse().find((p) => p.from <= habit.nextStep!) : undefined;
  return (
    <Link href={`/practice/challenges/${habit.challenge.id}`} className={`${tile} group flex flex-col p-5`} aria-labelledby="practice-card-heading">
      <PillarLabel pillar="daily">
        <span className="text-xs font-semibold text-slate-500 tabular-nums">{habit.enrolled ? `${habit.done}/30 days` : "30 days"}</span>
      </PillarLabel>
      <h3 id="practice-card-heading" className="mt-3 text-lg leading-snug text-slate-900">
        {!habit.enrolled ? "30-day money habit challenge" : habit.completed ? "30 days done. Habit: built." : step ? `Day ${habit.nextStep}: ${step.title}` : ""}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {!habit.enrolled
          ? "One small task a day: spending, then saving, then investing. Missed days are never held against you."
          : habit.completed
            ? "Try a saving challenge next."
            : habit.doneToday
              ? "Today's task is done — the next one opens tomorrow."
              : step?.task}
      </p>
      {habit.enrolled && (
        <div className="mt-4">
          <StepBar done={Math.round((habit.done / 30) * 10)} total={10} label="30-day challenge progress" />
          {phase && <p className="mt-1.5 text-xs text-slate-500">{phase.title}</p>}
        </div>
      )}
      <CardCta>{!habit.enrolled ? "Start the challenge" : habit.doneToday || habit.completed ? "See the challenge" : "Do today's task"}</CardCta>
    </Link>
  );
}

/** The recommended next step — the page's one dark card — plus two smaller ones. */
export function RecommendedNext({ items }: { items: Recommendation[] }) {
  const [first, ...rest] = items;
  if (!first) return null;
  const p = PILLAR[first.pillar];
  return (
    <section aria-labelledby="next-heading" className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className={`${spotlight} flex flex-col p-6 sm:p-8`}>
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgb(42_120_214/0.45),transparent_62%)]"
        />
        <p className="flex items-center gap-2 text-[13px] font-medium text-white/60">
          <SparklesIcon className="h-4 w-4" /> Recommended next · {p.name}
        </p>
        <h2 id="next-heading" className="mt-3 text-[1.75rem] leading-tight text-white sm:text-[2.2rem]">
          {first.title}
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">{first.why}</p>
        <Link href={first.href} className={`${lightButton} group mt-6 w-full self-start px-6 py-3 sm:w-auto`}>
          {first.cta}
          <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
      {rest.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="More suggestions">
          {rest.slice(0, 2).map((r) => {
            const q = PILLAR[r.pillar];
            return (
              <li key={r.id} className="flex-1">
                <Link href={r.href} className={`${tile} group flex h-full items-start gap-3 p-4`}>
                  <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${q.tile}`}>
                    <q.Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`text-xs font-semibold ${q.text}`}>{q.name}</span>
                    <span className="mt-0.5 block leading-snug font-semibold text-slate-900">{r.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-slate-600">{r.why}</span>
                  </span>
                  <ArrowRightIcon className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** This week's money in one line, and the savings goal closest to done. */
export function WeekSummary({ week, goal }: { week: MoneyWeek; goal: { name: string; icon: string; saved: number; target: number } | null }) {
  const diff = week.spent - week.previousSpent;
  return (
    <section aria-labelledby="week-money-heading" className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 id="week-money-heading" className="font-sans text-sm font-semibold tracking-normal text-slate-900">
          Your week in money
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs text-slate-500">Spent (7 days)</dt>
            <dd className="font-display text-xl font-semibold text-slate-900 tabular-nums">{rupees(week.spent)}</dd>
            {week.previousSpent > 0 && (
              <dd className={`text-xs font-medium ${diff > 0 ? "text-orange-700" : "text-emerald-700"}`}>
                {diff === 0 ? "Same as last week" : `${rupees(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than last week`}
              </dd>
            )}
          </div>
          <div>
            <dt className="text-xs text-slate-500">Saved to goals</dt>
            <dd className="font-display text-xl font-semibold text-slate-900 tabular-nums">{rupees(week.saved)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Check-ins</dt>
            <dd className="font-display text-xl font-semibold text-slate-900 tabular-nums">{week.checkIns}/7</dd>
          </div>
        </dl>
      </div>
      <Link href="/money#goals" className={`${tile} group flex flex-col justify-center p-5`}>
        {goal ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <GoalIcon icon={goal.icon} className="h-4 w-4" /> Savings goal
            </span>
            <span className="mt-1 line-clamp-1 font-semibold text-slate-900">{goal.name}</span>
            <div className="mt-2">
              <ProgressBar value={goal.saved} max={goal.target} label={`${goal.name} progress`} size="sm" />
            </div>
            <span className="mt-1.5 text-xs text-slate-600 tabular-nums">
              {rupees(goal.saved)} of {rupees(goal.target)} · {rupees(Math.max(0, goal.target - goal.saved))} to go
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-slate-900">No savings goal yet</span>
            <span className="mt-0.5 text-sm text-slate-600">Name what you&apos;re saving for — even ₹500 counts.</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              Create a goal <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </>
        )}
      </Link>
    </section>
  );
}

/** One personal line under the greeting — from the Money Personality Quiz, or an invite to take it. */
export function ForYouLine({ personality }: { personality: Personality | null }) {
  if (!personality) {
    return (
      <Link href="/personality" className="group flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-800 transition hover:bg-brand-100">
        <SparklesIcon className="h-4 w-4 shrink-0 text-brand-600" />
        <span className="min-w-0 flex-1">
          <span className="font-semibold text-slate-900">What&apos;s your money personality?</span> Six quick questions, one surprisingly accurate result.
        </span>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-700 transition group-hover:translate-x-0.5" />
      </Link>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
      <Link href="/personality" className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 hover:bg-brand-100">
        <SparklesIcon className="h-3.5 w-3.5" /> {personality.name}
      </Link>
      <span>{personality.focus.tip}</span>
      <Link href={personality.focus.tool.href} className="font-semibold text-brand-700 underline-offset-4 hover:underline">
        {personality.focus.tool.label}
      </Link>
    </p>
  );
}

export function LeagueLine({ league }: { league: WeeklyLeague }) {
  if (!league.optedIn) return null;
  return (
    <Link href="/progress#league" className={`${tile} group flex items-center gap-3 p-4`}>
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
        <UsersIcon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-semibold text-slate-900">{league.you ? `#${league.you.rank} in this week's league` : "Weekly league"}</span>
        <span className="text-slate-600">
          {league.you ? `${league.you.xp.toLocaleString("en-IN")} XP this week · ${league.participants} playing` : "Earn XP this week to get on the board."}
        </span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
