import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { streakStatus } from "@/lib/streak";
import { levelFor } from "@/lib/levels";
import { QUESTS, ALL_QUESTS_BONUS, getDoneQuests, type QuestId } from "@/lib/quests";
import { avatarName, readAvatar } from "@/lib/avatar";
import { istDay, shiftDay } from "@/lib/ist-date";
import { getMoneyMonth, getMoneyTrends } from "@/lib/money";
import { rupees } from "@/lib/money/categories";
import { moneyRoast } from "@/lib/avatar/roast";
import { getPendingAvatarEvents } from "@/lib/avatar/events";
import { REACTIONS, isCelebration } from "@/lib/avatar/reactions";
import { QuickAddButton, QuickAddSheet } from "@/components/money/QuickAddSheet";
import { TodayTip } from "@/components/today/TodayTip";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { card, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, FlameIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Today | Rupli" };

function greetingFor(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(now));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hey";
}

const smallAction = "inline-flex min-h-10 shrink-0 items-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700";

export default async function TodayPage(props: PageProps<"/dashboard">) {
  const user = await requireOnboardedUser();
  const today = istDay();
  const params = await props.searchParams;

  const [progress, money, trends, doneQuests, events] = await Promise.all([
    getProgress(user.id),
    getMoneyMonth(user.id),
    getMoneyTrends(user.id, today),
    getDoneQuests(user.id, today),
    user.avatarReactions ? getPendingAvatarEvents(user.id) : Promise.resolve([]),
  ]);

  const name = getDisplayName(user);
  const buddy = avatarName(user);
  const streak = streakStatus(user, today);
  const level = levelFor(user.xpTotal);

  // The next thing to learn: Money IQ first, then the InvestSmart units.
  const nextLesson =
    (progress.next && !progress.next.isRetake ? progress.next.lesson : null) ?? progress.invest.find((l) => !l.locked && l.status !== "completed") ?? null;
  const continueHref = nextLesson ? `/lessons/${nextLesson.slug}` : "/revision";

  const questAction: Record<QuestId, React.ReactNode> = {
    log: <QuickAddButton className={smallAction}>Log it</QuickAddButton>,
    learn: (
      <Link href={continueHref} className={smallAction}>
        Learn
      </Link>
    ),
    check: (
      <Link href="/money" className={smallAction}>
        Check
      </Link>
    ),
  };

  const left = money.totalBudget !== null ? money.totalBudget - money.spent : money.income - money.spent;
  const hasMoney = money.entries.length > 0 || money.totalBudget !== null;

  const roast = moneyRoast({ month: money, weekly: trends.weekly, name: buddy });
  const event = events.find((e) => !isCelebration(e.kind));
  const tip = user.avatarReactions
    ? event
      ? { text: REACTIONS[event.kind].lines[0](buddy, event.data), expression: REACTIONS[event.kind].expression, eventId: event.id }
      : { text: roast.lines[0], expression: roast.expression, eventId: undefined }
    : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header className="flex animate-fade-up flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 text-2xl leading-tight text-slate-900">
            {greetingFor(new Date())}, {name}
          </h1>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Link href="/profile#streak" className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-3 ring-1 ring-slate-200">
              <FlameIcon className={`h-4 w-4 text-orange-500 ${streak.doneToday ? "animate-flicker" : ""}`} />
              {streak.streak}
              <span className="sr-only">day streak</span>
            </Link>
            <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-3 ring-1 ring-slate-200">
              <StarIcon className="h-4 w-4 text-orange-500" />
              <CountUp value={user.xpTotal} id="xp-today" /> XP
            </span>
          </div>
        </div>
        <div>
          <ProgressBar value={level.into} max={level.span} label={`Level ${level.level} progress`} size="sm" tone="bg-brand-500" />
          <p className="mt-1 text-xs font-medium text-slate-600">
            Level {level.level} · {level.toNext} XP to Level {level.level + 1}
          </p>
        </div>
      </header>

      <section aria-labelledby="quests-heading" className={`${card} p-4`}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="quests-heading" className="text-lg text-slate-900">
            Daily quests
          </h2>
          <p className="text-xs font-medium text-slate-600">
            {doneQuests.size}/{QUESTS.length} · all 3 = +{ALL_QUESTS_BONUS} XP
          </p>
        </div>
        <ul className="mt-2 divide-y divide-slate-100">
          {QUESTS.map((quest) => {
            const done = doneQuests.has(quest.id);
            return (
              <li key={quest.id} className="flex min-h-14 items-center gap-3 py-2">
                <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-700 text-white" : "ring-2 ring-slate-300"}`}>
                  {done && <CheckIcon className="h-4 w-4 animate-check" />}
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug font-semibold text-slate-900">
                  {quest.title}
                  <span className="block text-xs font-medium text-orange-700">+{quest.xp} XP</span>
                </span>
                {done ? <span className="text-sm font-semibold text-emerald-800">Done</span> : questAction[quest.id]}
              </li>
            );
          })}
        </ul>
      </section>

      <Link href={continueHref} className={`${primaryButton} group w-full justify-between px-5 py-4 text-base`}>
        <span className="min-w-0 truncate">{nextLesson ? `Continue: ${nextLesson.title}` : "Everything done. Time to revise"}</span>
        <ArrowRightIcon className="h-5 w-5 shrink-0" />
      </Link>

      <Link href="/money" className={`${card} block p-4`}>
        {hasMoney ? (
          <>
            <p className="font-display text-xl font-bold text-slate-900">
              {left >= 0 ? `${rupees(left)} left this month` : `${rupees(-left)} over this month`}
            </p>
            {money.totalBudget !== null && (
              <div className="mt-2">
                <ProgressBar
                  value={Math.min(money.spent, money.totalBudget)}
                  max={money.totalBudget}
                  label="Budget used"
                  size="sm"
                  tone={money.spent > money.totalBudget ? "bg-rose-500" : "bg-emerald-500"}
                />
              </div>
            )}
            <p className="mt-2 text-sm font-semibold text-brand-700">Open Money</p>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-bold text-slate-900">No money logged yet</p>
            <p className="mt-1 text-sm font-semibold text-brand-700">Set up Money</p>
          </>
        )}
      </Link>

      {tip && <TodayTip day={today} text={tip.text} expression={tip.expression} eventId={tip.eventId} avatar={readAvatar(user.avatar)} />}

      <QuickAddSheet today={today} minDay={shiftDay(today, -60)} startOpen={params.add === "1"} canNoSpend={!money.checkedInToday && !money.entries.some((e) => e.day === today && e.kind === "EXPENSE")} />
    </div>
  );
}
