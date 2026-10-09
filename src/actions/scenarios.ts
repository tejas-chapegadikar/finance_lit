"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { isAllowed, practiceRatelimit } from "@/lib/ratelimit";
import { rewardForScenario } from "@/lib/rewards";
import {
  SCENARIO_XP,
  evaluateRun,
  evaluateStep,
  getScenario,
  scoreLabel,
  type ScenarioDef,
  type StepAnswer,
  type StepResult,
} from "@/lib/scenarios";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

async function openScenario(userId: string, slug: string): Promise<ScenarioDef> {
  const scenario = getScenario(slug);
  if (!scenario) throw new Error("Scenario not found");
  if (scenario.bonus) {
    const reward = rewardForScenario(slug);
    const unlocked = reward && (await db.rewardUnlock.count({ where: { userId, rewardId: reward.id } }));
    if (!unlocked) throw new Error("Unlock this scenario in the Rewards Store first");
  }
  return scenario;
}

export type StepCheck = ({ status: "checked" } & StepResult) | { status: "slow-down" };

/** Feedback for one step, worked out on the server so the browser never holds the answers. */
export async function checkScenarioStep(slug: string, stepIndex: number, answer: StepAnswer): Promise<StepCheck> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(practiceRatelimit, user.id))) return { status: "slow-down" };
  const scenario = await openScenario(user.id, slug);
  const step = scenario.steps[stepIndex];
  if (!step) throw new Error("Step not found");
  return { status: "checked", ...evaluateStep(step, answer) };
}

export type ScenarioCompletion =
  | { status: "completed"; score: number; maxScore: number; label: string; xpAwarded: number; firstTime: boolean }
  | { status: "slow-down" };

/** Re-scores the whole run on the server and saves it. +50 XP the first time only. */
export async function completeScenario(slug: string, answers: StepAnswer[]): Promise<ScenarioCompletion> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(practiceRatelimit, user.id))) return { status: "slow-down" };
  const scenario = await openScenario(user.id, slug);
  const { score, maxScore } = evaluateRun(scenario, answers);

  const { xpAwarded, firstTime } = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const earlier = await tx.scenarioRun.count({ where: { userId: user.id, scenarioSlug: slug } });
    await tx.scenarioRun.create({
      data: { userId: user.id, scenarioSlug: slug, score, maxScore, answers: answers as object[] },
    });
    const awarded =
      earlier === 0
        ? await awardXp(tx, {
            userId: user.id,
            amount: SCENARIO_XP,
            type: "SCENARIO_COMPLETION",
            idempotencyKey: xpKeys.scenarioComplete(user.id, slug),
            description: `Scenario: "${scenario.title}"`,
          })
        : 0;
    await recordStreakDay(tx, user.id);
    return { xpAwarded: awarded, firstTime: earlier === 0 };
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  return { status: "completed", score, maxScore, label: scoreLabel(score, maxScore), xpAwarded, firstTime };
}
