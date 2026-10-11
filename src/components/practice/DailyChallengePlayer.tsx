"use client";

import { useState } from "react";
import { checkDailyChallengeStep, completeDailyChallenge, type DailyChallengeCompletion } from "@/actions/daily-challenge";
import type { PublicStep } from "@/lib/scenarios";
import { StepRunner } from "./StepRunner";
import { DailyChallengeResult } from "./DailyChallengeResult";

type Completed = Extract<DailyChallengeCompletion, { status: "completed" }>;

/** Today's Daily Challenge: each step checked on the server, then saved once. */
export function DailyChallengePlayer({
  day,
  steps,
  icon,
  takeaway,
  xpReward,
}: {
  day: string;
  steps: PublicStep[];
  icon: string;
  takeaway: string;
  xpReward: number;
}) {
  const [completion, setCompletion] = useState<Completed | null>(null);

  if (completion) {
    return (
      <DailyChallengeResult
        icon={icon}
        label={completion.label}
        score={completion.score}
        maxScore={completion.maxScore}
        xpAwarded={completion.xpAwarded}
        takeaway={takeaway}
      />
    );
  }

  return (
    <StepRunner
      steps={steps}
      stepNoun="Question"
      xpNote={`+${xpReward} XP when you finish`}
      check={(stepIndex, answer) => checkDailyChallengeStep(day, stepIndex, answer)}
      finish={async (answers) => {
        const result = await completeDailyChallenge(day, answers);
        if (result.status !== "completed") return result.status;
        setCompletion(result);
        return "done";
      }}
    />
  );
}
