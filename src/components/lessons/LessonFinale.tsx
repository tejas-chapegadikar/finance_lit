"use client";

import { useState } from "react";
import { ChoiceQuestion, type ChoiceAnswer, type ChoiceResult } from "@/components/ui/ChoiceQuestion";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { card, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";
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

      <section className="flex flex-col gap-4 rounded-2xl border-2 border-brand-200 bg-white p-6 sm:flex-row sm:items-center" aria-labelledby="quiz-heading">
        <div className="flex-1">
          <h2 id="quiz-heading" className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              {quizStep}
            </span>
            Ready for the quiz?
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            5 quick questions. Get one wrong and the AI Coach gives you a hint.
          </p>
          <p className="mt-1 text-sm text-slate-700">
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
          <p className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            Answer “What would you do?” to unlock the quiz
          </p>
        )}
      </section>
    </>
  );
}
