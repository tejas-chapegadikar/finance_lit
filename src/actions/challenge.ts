"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { getChallengeForUser } from "@/lib/challenge";
import { DAILY_CHALLENGE_XP } from "@/lib/constants";
import { istDay } from "@/lib/ist-date";
import { readChoiceOptions } from "@/lib/lesson-content";
import { challengeRatelimit, isAllowed } from "@/lib/ratelimit";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

export type ChallengeResult =
  | { status: "answered"; isCorrect: boolean; correctIndex: number; explanation: string; xpAwarded: number }
  | { status: "new-day" }
  | { status: "slow-down" };

/**
 * Answers today's Daily Money Challenge: +25 XP for answering (right or
 * wrong), once per student per IST day. Everything is checked here — the
 * browser only says which option was picked.
 */
export async function answerDailyChallenge(challengeId: string, optionIndex: number): Promise<ChallengeResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(challengeRatelimit, user.id))) {
    return { status: "slow-down" };
  }

  const day = istDay();
  const existing = await db.challengeAnswer.findUnique({
    where: { userId_day: { userId: user.id, day } },
    include: { challenge: true },
  });
  if (existing) {
    return resultFor(existing.challenge, existing.optionIndex, existing.xpAwarded);
  }

  const challenge = await getChallengeForUser(user.id, day);
  if (!challenge || challenge.id !== challengeId) {
    // The page was opened before midnight IST and today's challenge is a new one.
    return { status: "new-day" };
  }
  const options = readChoiceOptions(challenge.options);
  if (!Number.isInteger(optionIndex) || !options[optionIndex] || !options.some((o) => o.isCorrect)) {
    throw new Error("Option not found");
  }

  try {
    await db.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      // The (userId, day) unique index makes a second answer today fail here.
      await tx.challengeAnswer.create({
        data: {
          userId: user.id,
          challengeId: challenge.id,
          day,
          optionIndex,
          isCorrect: options[optionIndex].isCorrect,
          xpAwarded: DAILY_CHALLENGE_XP,
        },
      });
      await awardXp(tx, {
        userId: user.id,
        amount: DAILY_CHALLENGE_XP,
        type: "DAILY_CHALLENGE",
        idempotencyKey: xpKeys.dailyChallenge(user.id, day),
        description: "Today's Money Challenge",
      });
      await recordStreakDay(tx, user.id);
    }, SLOW_DB_TRANSACTION);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const answer = await db.challengeAnswer.findUniqueOrThrow({
        where: { userId_day: { userId: user.id, day } },
        include: { challenge: true },
      });
      return resultFor(answer.challenge, answer.optionIndex, answer.xpAwarded);
    }
    throw err;
  }

  // The shared layout shows XP, so refresh it too.
  revalidatePath("/", "layout");
  return resultFor(challenge, optionIndex, DAILY_CHALLENGE_XP);
}

function resultFor(
  challenge: { options: Prisma.JsonValue; explanation: string },
  optionIndex: number,
  xpAwarded: number,
): ChallengeResult {
  const options = readChoiceOptions(challenge.options);
  return {
    status: "answered",
    isCorrect: options[optionIndex]?.isCorrect ?? false,
    correctIndex: options.findIndex((o) => o.isCorrect),
    explanation: challenge.explanation,
    xpAwarded,
  };
}
