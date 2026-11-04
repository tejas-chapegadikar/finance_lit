"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { queueAvatarEvent } from "@/lib/avatar/events";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { DAILY_CHALLENGE_XP } from "@/lib/constants";
import { getDailyChallenge } from "@/lib/daily-challenge";
import { istDay } from "@/lib/ist-date";
import { isAllowed, practiceRatelimit } from "@/lib/ratelimit";
import { evaluateRun, evaluateStep, scoreLabel, type StepAnswer, type StepCheck } from "@/lib/scenarios";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

/** Feedback for one step of today's Daily Challenge, worked out on the server. */
export async function checkDailyChallengeStep(day: string, stepIndex: number, answer: StepAnswer): Promise<StepCheck> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(practiceRatelimit, user.id))) return { status: "slow-down" };
  // Opened before midnight IST: today's challenge is a different one.
  if (day !== istDay()) return { status: "new-day" };
  const challenge = await getDailyChallenge(user.id, day);
  const step = challenge.steps[stepIndex];
  if (!step) throw new Error("Step not found");
  return { status: "checked", ...evaluateStep(step, answer) };
}

export type DailyChallengeCompletion =
  | { status: "completed"; score: number; maxScore: number; label: string; xpAwarded: number }
  | { status: "slow-down" }
  | { status: "new-day" };

/**
 * Re-scores the whole set on the server and saves it: +25 XP for finishing,
 * whatever the score, once per student per IST day.
 */
export async function completeDailyChallenge(day: string, answers: StepAnswer[]): Promise<DailyChallengeCompletion> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(practiceRatelimit, user.id))) return { status: "slow-down" };
  if (day !== istDay()) return { status: "new-day" };

  const existing = await db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day } } });
  if (existing) return completionOf(existing);

  const challenge = await getDailyChallenge(user.id, day);
  const { score, maxScore } = evaluateRun(challenge, answers);

  try {
    await db.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      // The (userId, day) unique index stops a second run today.
      await tx.dailyChallengeRun.create({
        data: {
          userId: user.id,
          day,
          challengeKey: challenge.key,
          score,
          maxScore,
          answers: answers as object[],
          xpAwarded: DAILY_CHALLENGE_XP,
        },
      });
      await awardXp(tx, {
        userId: user.id,
        amount: DAILY_CHALLENGE_XP,
        type: "DAILY_CHALLENGE",
        idempotencyKey: xpKeys.dailyChallenge(user.id, day),
        description: `Daily Challenge: ${challenge.title}`,
      });
      await queueAvatarEvent(tx, user.id, "daily-challenge", `daily-challenge:${day}`);
      await recordStreakDay(tx, user.id);
    }, SLOW_DB_TRANSACTION);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const run = await db.dailyChallengeRun.findUniqueOrThrow({ where: { userId_day: { userId: user.id, day } } });
      return completionOf(run);
    }
    throw err;
  }

  revalidatePath("/", "layout");
  return { status: "completed", score, maxScore, label: scoreLabel(score, maxScore), xpAwarded: DAILY_CHALLENGE_XP };
}

function completionOf(run: { score: number; maxScore: number; xpAwarded: number }): DailyChallengeCompletion {
  return { status: "completed", score: run.score, maxScore: run.maxScore, label: scoreLabel(run.score, run.maxScore), xpAwarded: run.xpAwarded };
}
