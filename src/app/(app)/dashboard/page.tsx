import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { nicknameOf } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { streakStatus } from "@/lib/streak";
import { QUESTS, ALL_QUESTS_BONUS, getDoneQuests, type QuestId } from "@/lib/quests";
import { readAvatar } from "@/lib/avatar";
import { dayNumber, istDay, istHour } from "@/lib/ist-date";
import { getSpendingVerdict, sayVerdict } from "@/lib/buddy/spending";
import { hubMessage, readRoastLevel } from "@/lib/avatar/hub";
import { HUB_OPTIONS, type HubState } from "@/content/buddy-messages";
import type { Expression } from "@/components/avatar/Avatar";
import { AvatarHub } from "@/components/today/AvatarHub";
import { CountUp } from "@/components/ui/CountUp";
import { CheckIcon, ChevronRightIcon, FlameIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Home | Rupli" };

const FACE: Record<HubState, Expression> = {
  new: "welcoming",
  unfinished: "thinking",
  spent: "shocked",
  noExpense: "confused",
  investIdle: "excited",
  nextLesson: "happy",
  done: "celebrating",
};

// Home is the avatar hub: who you are (tiny), the avatar with one clear
// suggestion, three places to go, and today's quests folded away below.
export default async function HomePage() {
  const user = await requireOnboardedUser();
  const today = istDay();

  const [progress, verdict, doneQuests, portfolio, expensesEver] = await Promise.all([
    getProgress(user.id),
    getSpendingVerdict(db, user.id, today),
    getDoneQuests(user.id, today),
    db.virtualPortfolio.findUnique({ where: { userId: user.id }, select: { id: true } }),
    db.moneyEntry.count({ where: { userId: user.id, kind: "EXPENSE" } }),
  ]);

  const streak = streakStatus(user, today);
  const allLessons = [...progress.lessons, ...progress.invest];
  const unfinished = allLessons.find((l) => l.status === "in-progress" && !l.locked) ?? null;
  const next =
    (progress.next && !progress.next.isRetake ? progress.next.lesson : null) ?? progress.invest.find((l) => !l.locked && l.status !== "completed") ?? null;
  const investTouched = !!portfolio || progress.invest.some((l) => l.status !== "not-started");
  const seed = dayNumber(today) * 24 + istHour();

  const message = hubMessage(
    {
      questsDone: doneQuests.size,
      questsTotal: QUESTS.length,
      isNew: progress.completedCount === 0 && !unfinished && expensesEver === 0 && !investTouched,
      unfinishedLesson: unfinished ? { title: unfinished.title, minutes: unfinished.estimatedMinutes } : null,
      nextLesson: next ? { title: next.title, minutes: next.estimatedMinutes } : null,
      spendingRoast: verdict?.kind === "roast" ? sayVerdict(verdict, user.roastLevel, String(seed)).text : null,
      spentToday: doneQuests.has("log"),
      investTouched,
    },
    readRoastLevel(user.roastLevel),
    seed,
  );

  const learnHref = unfinished ? `/lessons/${unfinished.slug}` : next ? `/lessons/${next.slug}` : "/lessons";
  const questHref: Record<QuestId, string> = { log: "/money?add=1", learn: learnHref, check: "/money" };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="min-w-0 truncate text-xl leading-tight text-slate-900 md:text-2xl">Hey {nicknameOf(user)}</h1>
        <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-900">
          <Link href="/profile#streak" className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-2.5 ring-1 ring-slate-200">
            <FlameIcon className={`h-4 w-4 text-orange-500 ${streak.doneToday ? "animate-flicker" : ""}`} />
            {streak.streak}
            <span className="sr-only">day streak</span>
          </Link>
          <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-2.5 ring-1 ring-slate-200">
            <StarIcon className="h-4 w-4 text-orange-500" />
            <CountUp value={user.xpTotal} id="xp-today" /> XP
          </span>
        </div>
      </header>

      <AvatarHub
        avatar={readAvatar(user.avatar)}
        expression={message.state === "spent" && verdict ? verdict.expression : FACE[message.state]}
        message={message.text}
        highlight={message.highlight}
        options={[
          { id: "learn", href: "/lessons", ...HUB_OPTIONS.learn },
          { id: "money", href: "/money", ...HUB_OPTIONS.money },
          { id: "invest", href: "/invest", ...HUB_OPTIONS.invest },
        ]}
      />

      <details className="group mx-auto w-full max-w-md rounded-2xl bg-white ring-1 ring-slate-200">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
          <span className="flex-1">
            Today&apos;s quests {doneQuests.size}/{QUESTS.length}
            <span className="font-medium text-orange-700"> · +{ALL_QUESTS_BONUS} XP bonus</span>
          </span>
          <ChevronRightIcon className="h-4 w-4 text-slate-500 transition group-open:rotate-90" />
        </summary>
        <ul className="divide-y divide-slate-100 px-4 pb-2">
          {QUESTS.map((quest) => {
            const done = doneQuests.has(quest.id);
            return (
              <li key={quest.id} className="flex min-h-12 items-center gap-3 py-1.5">
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-700 text-white" : "ring-2 ring-slate-300"}`}
                >
                  {done && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-900">
                  {quest.title} <span className="text-xs text-orange-700">+{quest.xp} XP</span>
                </span>
                {done ? (
                  <span className="text-sm font-semibold text-emerald-800">Done</span>
                ) : (
                  <Link
                    href={questHref[quest.id]}
                    aria-label={`Go: ${quest.title}`}
                    className="inline-flex min-h-9 items-center rounded-full bg-brand-600 px-3.5 text-xs font-semibold text-white"
                  >
                    Go
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
