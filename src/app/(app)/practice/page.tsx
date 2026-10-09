import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodaysChallenge } from "@/lib/challenge";
import { countDueRevision } from "@/lib/revision";
import { REWARDS } from "@/lib/rewards";
import { SCENARIOS, SCENARIO_XP, maxScore } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { DAILY_CHALLENGE_XP } from "@/lib/constants";
import { card, heroChip, heroSurface, primaryButton, softButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Practice — StockStreak" };

export default async function PracticePage() {
  const user = await requireOnboardedUser();
  const [today, due, runs, unlocks, nextItem] = await Promise.all([
    getTodaysChallenge(user.id),
    countDueRevision(user.id),
    db.scenarioRun.groupBy({ by: ["scenarioSlug"], where: { userId: user.id }, _max: { score: true } }),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    db.revisionItem.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { dueDay: "asc" },
      select: { dueDay: true },
    }),
  ]);
  const best = new Map(runs.map((r) => [r.scenarioSlug, r._max.score ?? 0]));
  const unlocked = new Set(unlocks.map((u) => u.rewardId));

  return (
    <div className="flex flex-col gap-6">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-14 -bottom-24 h-64 w-64 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>Practice</span>
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold">Practise real money decisions</h1>
        <p className="relative mt-3 flex flex-wrap gap-2">
          <span className={heroChip}>{today?.answer ? "✅ Today's challenge done" : "⚡ Today's challenge waiting"}</span>
          <span className={heroChip}>
            {due ? `🔁 ${due} revision ${due === 1 ? "question" : "questions"} due` : "🔁 No revision due"}
          </span>
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={`${card} flex flex-col p-5 sm:p-6`} aria-labelledby="today-challenge">
          <h2 id="today-challenge" className="text-lg font-extrabold text-slate-900">
            ⚡ Today&apos;s Challenge
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            One fresh money decision a day — picked from what you&apos;ve been learning. +{DAILY_CHALLENGE_XP} XP.
          </p>
          {today && <p className="mt-3 line-clamp-3 font-semibold text-slate-900">“{today.challenge.prompt}”</p>}
          <div className="mt-auto pt-5">
            <Link href="/challenge" className={today?.answer ? softButton : primaryButton}>
              {today?.answer ? "See today's answer" : "Take Today's Challenge"}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className={`${card} flex flex-col p-5 sm:p-6`} aria-labelledby="revision-heading">
          <h2 id="revision-heading" className="text-lg font-extrabold text-slate-900">
            🔁 Revision
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Questions you missed come back after 1, 3 and 7 days — with a fresh example each time — so they stick.
          </p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 tabular-nums">
            {due} <span className="text-base font-bold text-slate-600">due now</span>
          </p>
          {!due && nextItem && (
            <p className="text-sm text-slate-600">
              Next one comes back on{" "}
              {new Date(`${nextItem.dueDay}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" })}.
            </p>
          )}
          <div className="mt-auto pt-5">
            {due ? (
              <Link href="/revision" className={primaryButton}>
                Start revision
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/profile#mastery-heading" className={softButton}>
                See your topic mastery
              </Link>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="scenarios-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="scenarios-heading" className="text-lg font-extrabold text-slate-900">
            Money scenarios
          </h2>
          <p className="text-sm text-slate-600">
            Make decisions in real-life situations and see the consequences. +{SCENARIO_XP} XP the first time you finish
            each one. Numbers are illustrative.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((scenario) => {
            const reward = scenario.bonus ? REWARDS.find((r) => r.scenarioSlug === scenario.slug) : undefined;
            const locked = !!reward && !unlocked.has(reward.id);
            const area = READINESS_AREA_META[scenario.area];
            const score = best.get(scenario.slug);
            const body = (
              <>
                <span aria-hidden className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${locked ? "bg-slate-100 grayscale" : area.chipBg}`}>
                  {scenario.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className={locked ? "text-slate-600" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {scenario.minutes} min
                    </span>
                  </span>
                  <span className="mt-0.5 block font-extrabold text-slate-900">{scenario.title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{scenario.summary}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold">
                    {locked ? (
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <LockIcon className="h-3.5 w-3.5" /> Unlock for {reward!.cost} XP in Rewards
                      </span>
                    ) : score !== undefined ? (
                      <span className="text-emerald-800">
                        ✓ Done · best score {score}/{maxScore(scenario)}
                      </span>
                    ) : (
                      <span className="text-orange-700">Start → +{SCENARIO_XP} XP</span>
                    )}
                  </span>
                </span>
              </>
            );
            return (
              <li key={scenario.slug}>
                <Link
                  href={locked ? "/rewards" : `/practice/${scenario.slug}`}
                  className={`${tile} flex h-full gap-4 p-4 transition hover:-translate-y-0.5 ${locked ? "bg-slate-50" : ""}`}
                >
                  {body}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
