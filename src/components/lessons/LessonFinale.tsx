"use client";

import { useState } from "react";
import { ChoiceQuestion, type ChoiceAnswer, type ChoiceResult } from "@/components/ui/ChoiceQuestion";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { lightButton, spotlight } from "@/components/ui/button-styles";
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
        <section className="border-t border-slate-200 pt-8" aria-labelledby="scenario-heading">
          <StepLabel id="scenario-heading" step={scenarioStep} title="What would you do?" />
          <div className="mt-5">
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

      <section className={`${spotlight} flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8`} aria-labelledby="quiz-heading">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.45),transparent_62%)]"
        />
        <div className="flex-1">
          <StepLabel id="quiz-heading" step={quizStep} title="Ready for the quiz?" tone="dark" />
          <p className="mt-3 text-sm text-white/75">
            5 quick questions. Get one wrong and the AI Coach gives you a hint.
          </p>
          <p className="mt-1 text-sm text-white/75">
            {alreadyCompleted
              ? "You've completed this lesson. A retake can raise your readiness score."
              : `Finish all 5 questions to complete this lesson and earn +${xpReward} XP.`}
          </p>
        </div>
        {scenarioDone ? (
          <form action={startQuiz} className="shrink-0">
            <SubmitButton pendingLabel="Starting…" className={`${lightButton} w-full py-3.5 text-base sm:w-auto`}>
              {alreadyCompleted ? "Retake quiz" : "Start Quiz"}
              <ArrowRightIcon className="h-4 w-4" />
            </SubmitButton>
          </form>
        ) : (
          <p className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white/85">
            Answer “What would you do?” to unlock the quiz
          </p>
        )}
      </section>
    </>
  );
}
