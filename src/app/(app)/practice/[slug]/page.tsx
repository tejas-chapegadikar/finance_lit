import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bonusScenarioOpen, rewardForScenario } from "@/lib/rewards";
import { lessonAccess } from "@/lib/progress";
import { chapterOf } from "@/lib/journey";
import { SCENARIO_XP, getScenario, publicScenario } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { ScenarioPlayer } from "@/components/practice/ScenarioPlayer";
import { PageHeader, MetaRow } from "@/components/ui/PageHeader";
import { IconTile, ScenarioIcon } from "@/components/ui/topic-icons";
import { card, primaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

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
  const [owned, runs, access] = await Promise.all([
    reward ? db.rewardUnlock.count({ where: { userId: user.id, rewardId: reward.id } }) : Promise.resolve(0),
    db.scenarioRun.count({ where: { userId: user.id, scenarioSlug: slug } }),
    lessonAccess(user.id),
  ]);
  const unlocked = bonusScenarioOpen(slug, user.xpTotal, owned > 0);
  const area = READINESS_AREA_META[scenario.area];
  // A scenario opens with the level of the lesson it practises.
  const level = scenario.lessonSlug ? chapterOf(scenario.lessonSlug) : undefined;
  const levelLocked = !!scenario.lessonSlug && !access.unlocked.some((lesson) => lesson.slug === scenario.lessonSlug);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/lessons#scenarios" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Money IQ
      </Link>

      <PageHeader
        icon={
          <IconTile area={scenario.area} size="lg">
            <ScenarioIcon slug={scenario.slug} area={scenario.area} />
          </IconTile>
        }
        eyebrow={scenario.bonus ? "Bonus scenario" : `Scenario · ${area.label}`} title={scenario.title}>
        <MetaRow
          items={[
            <>
              <ClockIcon className="h-4 w-4" />
              {scenario.minutes} minutes
            </>,
            `${scenario.steps.length} decisions`,
            runs ? (
              `Played ${runs} ${runs === 1 ? "time" : "times"}`
            ) : (
              <span key="xp" className="font-semibold text-orange-700">
                +{SCENARIO_XP} XP first time
              </span>
            ),
          ]}
        />
      </PageHeader>

      {levelLocked ? (
        <section className={`${card} p-8 text-center`}>
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LockIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900">Opens with Level {level?.number}</h2>
          <p className="mx-auto mt-1 max-w-sm text-slate-600">
            This scenario practises a lesson in Level {level?.number} — {level?.title}. Finish Level {(level?.number ?? 2) - 1} to
            unlock it.
          </p>
          <Link href="/lessons" className={`${primaryButton} mt-5`}>
            Back to your learning path
          </Link>
        </section>
      ) : unlocked ? (
        <ScenarioPlayer scenario={publicScenario(scenario)} xpReward={SCENARIO_XP} firstRun={runs === 0} />
      ) : (
        <section className={`${card} p-8 text-center`}>
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LockIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900">This bonus scenario is locked</h2>
          <p className="mx-auto mt-1 max-w-sm text-slate-600">
            It opens once you&apos;ve earned {reward?.cost} XP in total — you have {user.xpTotal}. Lessons and money check-ins are the quickest way.
          </p>
          <Link href="/lessons" className={`${primaryButton} mt-5`}>
            Back to Money IQ
          </Link>
        </section>
      )}
    </div>
  );
}
