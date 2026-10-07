"use client";

import { useState } from "react";
import { ChoiceQuestion, type ChoiceAnswer, type ChoiceResult } from "@/components/ui/ChoiceQuestion";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { card, heroSurface, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";
import { StepLabel } from "./StepLabel";

/**
 * The end of a lesson: the "What would you do?" scenario, then the quiz.
 * The quiz button appears once the scenario has been answered.
 */
export function LessonFinale({
  scenario,
  answerScenario,
  initialAnswer,
  startQuiz,
  xpReward,
  alreadyCompleted,
  scenarioStep,
}: {
  scenario: { prompt: string; options: string[] } | null;
  answerScenario: (optionIndex: number) => Promise<ChoiceResult>;
  initialAnswer: ChoiceAnswer | null;
  startQuiz: () => Promise<void>;
  xpReward: number;
  alreadyCompleted: boolean;
  scenarioStep: number;
}) {
  const [scenarioDone, setScenarioDone] = useState(!scenario || initialAnswer !== null);

  return (
    <>
      {scenario && (
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="scenario-heading">
          <StepLabel id="scenario-heading" step={scenarioStep} title="What would you do?" icon="🤔" />
          <div className="mt-4">
            <ChoiceQuestion
              prompt={scenario.prompt}
              options={scenario.options}
              answer={answerScenario}
              initialAnswer={initialAnswer}
              onAnswered={() => setScenarioDone(true)}
            />
          </div>
        </section>
      )}

      <section className={`${heroSurface} flex flex-col gap-4 p-6 sm:flex-row sm:items-center`}>
        <div className="flex-1">
          <p className="text-lg font-extrabold">Ready for the quiz?</p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-white">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0" />5 quick questions. Get one wrong and the AI Coach
            gives you a hint.
          </p>
        </div>
        {scenarioDone ? (
          <form action={startQuiz} className="shrink-0">
            <SubmitButton pendingLabel="Starting…" className={`${primaryButton} w-full sm:w-auto`}>
              {alreadyCompleted ? "Retake quiz" : "Start quiz"}
              {!alreadyCompleted && <span className="rounded-full bg-orange-900/40 px-2 py-0.5">+{xpReward} XP</span>}
              <ArrowRightIcon className="h-4 w-4" />
            </SubmitButton>
          </form>
        ) : (
          <p className="shrink-0 rounded-2xl bg-brand-900/30 px-4 py-3 text-sm font-semibold text-white">
            Answer “What would you do?” to unlock the quiz
          </p>
        )}
      </section>
    </>
  );
}
