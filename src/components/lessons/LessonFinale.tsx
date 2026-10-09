"use client";

import { useState } from "react";
import { ChoiceQuestion, type ChoiceAnswer, type ChoiceResult } from "@/components/ui/ChoiceQuestion";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { card, deepSurface, primaryButton } from "@/components/ui/button-styles";
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
  quizStep,
}: {
  scenario: { prompt: string; options: string[] } | null;
  answerScenario: (optionIndex: number) => Promise<ChoiceResult>;
  initialAnswer: ChoiceAnswer | null;
  startQuiz: () => Promise<void>;
  xpReward: number;
  alreadyCompleted: boolean;
  scenarioStep: number;
  quizStep: number;
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

      <section className={`${deepSurface} flex flex-col gap-4 p-6 sm:flex-row sm:items-center`} aria-labelledby="quiz-heading">
        <div className="flex-1">
          <h2 id="quiz-heading" className="flex items-center gap-2.5 text-lg font-extrabold">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-brand-700 shadow-[0_3px_0_0_var(--color-brand-900)]">
              {quizStep}
            </span>
            Ready for the quiz?
          </h2>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-white">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0" />
            5 quick questions. Get one wrong and the AI Coach gives you a hint.
          </p>
          <p className="mt-1 text-sm text-white">
            {alreadyCompleted
              ? "You've completed this lesson — a retake can raise your readiness score."
              : `Finish all 5 questions to complete this lesson and earn +${xpReward} XP.`}
          </p>
        </div>
        {scenarioDone ? (
          <form action={startQuiz} className="shrink-0">
            <SubmitButton pendingLabel="Starting…" className={`${primaryButton} w-full py-3.5 text-base sm:w-auto`}>
              {alreadyCompleted ? "Retake quiz" : "Start Quiz"}
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
