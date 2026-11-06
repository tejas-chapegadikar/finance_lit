import Link from "next/link";
import { db } from "@/lib/db";
import type { LessonProgress } from "@/lib/progress";
import { countDueRevision } from "@/lib/revision";
import { chapterOf } from "@/lib/journey";
import { SCENARIOS, SCENARIO_XP, maxScore } from "@/lib/scenarios";
import { bonusScenarioOpen, rewardForScenario } from "@/lib/rewards";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { IconTile, ScenarioIcon } from "@/components/ui/topic-icons";
import { primaryButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon, RefreshIcon } from "@/components/ui/icons";

/**
 * Money IQ's practice: spaced revision of what you missed, and money
 * scenarios where your decisions play out. (These lived on the retired
 * Challenges page; the data and rules are unchanged.)
 */
export async function PractiseSection({ userId, xpTotal, lessons }: { userId: string; xpTotal: number; lessons: LessonProgress[] }) {
  const [due, runs, owned] = await Promise.all([
    countDueRevision(userId),
    db.scenarioRun.groupBy({ by: ["scenarioSlug"], where: { userId }, _max: { score: true } }),
    db.rewardUnlock.findMany({ where: { userId }, select: { rewardId: true } }),
  ]);
  const best = new Map(runs.map((r) => [r.scenarioSlug, r._max.score ?? 0]));
  const ownedIds = new Set(owned.map((o) => o.rewardId));

  return (
    <section id="practise" className="scroll-mt-20" aria-labelledby="practise-heading">
      <h2 id="practise-heading" className="text-2xl text-slate-900 sm:text-3xl">
        Practise
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">Bring back what you missed, then make real-life money decisions and see how they play out.</p>

      <Link href="/revision" className={`${tile} group mt-5 flex items-center gap-4 p-5`}>
        <IconTile area="BANKING" size="lg">
          <RefreshIcon />
        </IconTile>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-slate-900">Revision</span>
          <span className="text-sm text-slate-600">
            {due > 0 ? `${due} ${due === 1 ? "question" : "questions"} due — missed ideas come back after 1, 3 and 7 days.` : "Nothing due right now. Missed quiz questions come back here."}
          </span>
        </span>
        {due > 0 ? (
          <span className={`${primaryButton} shrink-0 px-4 py-2`}>Revise</span>
        ) : (
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
        )}
      </Link>

      <h3 id="scenarios" className="mt-8 scroll-mt-20 text-lg text-slate-900">
        Money scenarios
      </h3>
      <p className="mt-0.5 text-sm text-slate-600">+{SCENARIO_XP} XP the first time · numbers are illustrative.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => {
          const lesson = lessons.find((l) => l.slug === scenario.lessonSlug);
          const levelLocked = !!lesson?.locked;
          const reward = scenario.bonus ? rewardForScenario(scenario.slug) : undefined;
          const xpLocked = !!reward && !bonusScenarioOpen(scenario.slug, xpTotal, ownedIds.has(reward.id));
          const level = scenario.lessonSlug ? chapterOf(scenario.lessonSlug) : undefined;
          const score = best.get(scenario.slug);
          const area = READINESS_AREA_META[scenario.area];
          const locked = levelLocked || xpLocked;
          const body = (
            <>
              <IconTile area={scenario.area} muted={locked}>
                <ScenarioIcon slug={scenario.slug} area={scenario.area} />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className={locked ? "text-slate-500" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {scenario.minutes} min
                  </span>
                </span>
                <span className={`mt-1 block leading-snug font-semibold ${locked ? "text-slate-600" : "text-slate-900"}`}>{scenario.title}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                  {levelLocked ? (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <LockIcon className="h-3.5 w-3.5" /> Opens with Level {level?.number}
                    </span>
                  ) : xpLocked ? (
                    <span className="inline-flex items-center gap-1 text-orange-700">
                      <LockIcon className="h-3.5 w-3.5" /> Opens at {reward!.cost} XP
                    </span>
                  ) : score !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" /> Done · best score {score}/{maxScore(scenario)}
                    </span>
                  ) : (
                    <span className="text-brand-700">Play · +{SCENARIO_XP} XP</span>
                  )}
                </span>
              </span>
            </>
          );
          return (
            <li key={scenario.slug}>
              {locked ? (
                <div className="flex h-full items-start gap-3 rounded-2xl border border-dashed border-slate-300 p-4">{body}</div>
              ) : (
                <Link href={`/practice/${scenario.slug}`} className={`${tile} flex h-full items-start gap-3 p-4`}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
