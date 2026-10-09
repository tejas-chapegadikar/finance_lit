import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewardForScenario } from "@/lib/rewards";
import { SCENARIO_XP, getScenario, publicScenario } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { ScenarioPlayer } from "@/components/practice/ScenarioPlayer";
import { card, heroChip, heroSurface, primaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ClockIcon } from "@/components/ui/icons";

export async function generateMetadata(props: PageProps<"/practice/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: `${getScenario(slug)?.title ?? "Scenario"} — StockStreak` };
}

export default async function ScenarioPage(props: PageProps<"/practice/[slug]">) {
  const user = await requireOnboardedUser();
  const { slug } = await props.params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  const reward = scenario.bonus ? rewardForScenario(slug) : undefined;
  const [unlocked, runs] = await Promise.all([
    reward ? db.rewardUnlock.count({ where: { userId: user.id, rewardId: reward.id } }) : Promise.resolve(1),
    db.scenarioRun.count({ where: { userId: user.id, scenarioSlug: slug } }),
  ]);
  const area = READINESS_AREA_META[scenario.area];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/practice" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Practice
      </Link>

      <header className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>{scenario.bonus ? "Bonus scenario" : `Scenario · ${area.label}`}</span>
        </p>
        <div className="relative mt-4 flex items-center gap-4">
          <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-[0_4px_0_0_var(--color-brand-800)]">
            {scenario.icon}
          </span>
          <h1 className="min-w-0 text-2xl leading-tight font-extrabold sm:text-3xl">{scenario.title}</h1>
        </div>
        <ul className="relative mt-4 flex flex-wrap gap-2">
          <li className={heroChip}>
            <ClockIcon className="h-4 w-4" />
            {scenario.minutes} minutes
          </li>
          <li className={heroChip}>{scenario.steps.length} decisions</li>
          <li className={heroChip}>{runs ? `Played ${runs} ${runs === 1 ? "time" : "times"}` : `+${SCENARIO_XP} XP first time`}</li>
        </ul>
      </header>

      {unlocked ? (
        <ScenarioPlayer scenario={publicScenario(scenario)} xpReward={SCENARIO_XP} firstRun={runs === 0} />
      ) : (
        <section className={`${card} p-8 text-center`}>
          <span aria-hidden className="text-4xl">
            🔒
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900">This bonus scenario is locked</h2>
          <p className="mx-auto mt-1 max-w-sm text-slate-600">Unlock it with {reward?.cost} XP in the Rewards Store.</p>
          <Link href="/rewards" className={`${primaryButton} mt-5`}>
            Go to Rewards
          </Link>
        </section>
      )}
    </div>
  );
}
