"use client";

import { useState } from "react";
import Link from "next/link";
import { checkScenarioStep, completeScenario, type ScenarioCompletion } from "@/actions/scenarios";
import type { PublicScenario } from "@/lib/scenarios";
import { Markdown } from "@/components/ui/Markdown";
import { Medal } from "@/components/ui/Medal";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";
import { ScenarioExhibit } from "./ScenarioExhibit";
import { StepRunner } from "./StepRunner";

type Completed = Extract<ScenarioCompletion, { status: "completed" }>;

/** Plays an interactive scenario: each step is checked on the server, then the run is saved. */
export function ScenarioPlayer({ scenario, xpReward, firstRun }: { scenario: PublicScenario; xpReward: number; firstRun: boolean }) {
  const [completion, setCompletion] = useState<Completed | null>(null);
  // Bumped to start a fresh run.
  const [run, setRun] = useState(0);

  if (completion) {
    return (
      <section className={`${card} flex flex-col items-center p-6 text-center sm:p-8`} aria-labelledby="scenario-done">
        <span className="motion-safe:animate-pop">
          <Medal icon={scenario.icon} earned={completion.score > 0} />
        </span>
        <h2 id="scenario-done" className="mt-3 text-2xl font-extrabold text-slate-900">
          {completion.label}
        </h2>
        <p className="mt-1 text-slate-700">
          You scored <span className="font-extrabold text-slate-900">{completion.score}/{completion.maxScore}</span> on “{scenario.title}”.
        </p>
        {completion.xpAwarded > 0 ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900">
            <StarIcon className="h-4 w-4 text-amber-600" /> +{completion.xpAwarded} XP for your first run
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-slate-600">Replays don&apos;t earn XP — but they&apos;re great practice.</p>
        )}
        {completion.newBadges.map((badge) => (
          <p key={badge.id} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900">
            <span aria-hidden>{badge.icon}</span> New badge: {badge.name}
          </p>
        ))}
        <div className="mt-5 w-full rounded-2xl bg-brand-50 p-4 text-left ring-1 ring-brand-100">
          <p className="text-sm font-semibold text-brand-700">Takeaway</p>
          <p className="mt-1 font-semibold text-slate-900">{scenario.takeaway}</p>
        </div>
        <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link href="/lessons#scenarios" className={primaryButton}>
            Back to Learn
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setCompletion(null);
              setRun(run + 1);
            }}
            className={secondaryButton}
          >
            Try it again
          </button>
          {scenario.lessonSlug && (
            <Link href={`/lessons/${scenario.lessonSlug}`} className={secondaryButton}>
              Revisit the lesson
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className={`${card} flex flex-col gap-4 p-5 sm:p-6`}>
        <Markdown variant="plain">{scenario.intro}</Markdown>
        <ScenarioExhibit exhibit={scenario.exhibit} />
      </section>
      <StepRunner
        key={run}
        steps={scenario.steps}
        stepNoun="Decision"
        xpNote={firstRun && run === 0 ? `+${xpReward} XP when you finish` : undefined}
        check={(stepIndex, answer) => checkScenarioStep(scenario.slug, stepIndex, answer)}
        finish={async (answers) => {
          const result = await completeScenario(scenario.slug, answers);
          if (result.status === "slow-down") return "slow-down";
          setCompletion(result);
          return "done";
        }}
      />
    </div>
  );
}
