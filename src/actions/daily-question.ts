"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { getQuestionForUser } from "@/lib/daily-question";
import { QUESTION_OF_THE_DAY_XP } from "@/lib/constants";
import { istDay } from "@/lib/ist-date";
import { readChoiceOptions } from "@/lib/lesson-content";
import { challengeRatelimit, isAllowed } from "@/lib/ratelimit";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

export type QuestionResult =
  | { status: "answered"; isCorrect: boolean; correctIndex: number; explanation: string; xpAwarded: number }
  | { status: "new-day" }
  | { status: "slow-down" };

/**
 * Answers today's Question of the Day: +10 XP for answering (right or
 * wrong), once per student per IST day. Everything is checked here — the
 * browser only says which option was picked.
 */
export async function answerQuestionOfTheDay(questionId: string, optionIndex: number): Promise<QuestionResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(challengeRatelimit, user.id))) {
    return { status: "slow-down" };
  }

  const day = istDay();
  const existing = await db.dailyQuestionAnswer.findUnique({
    where: { userId_day: { userId: user.id, day } },
    include: { question: true },
  });
  if (existing) {
    return resultFor(existing.question, existing.optionIndex, existing.xpAwarded);
  }

  const question = await getQuestionForUser(user.id, day);
  if (!question || question.id !== questionId) {
    // The page was opened before midnight IST and today's question is a new one.
    return { status: "new-day" };
  }
  const options = readChoiceOptions(question.options);
  if (!Number.isInteger(optionIndex) || !options[optionIndex] || !options.some((o) => o.isCorrect)) {
    throw new Error("Option not found");
  }

  try {
    await db.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      // The (userId, day) unique index makes a second answer today fail here.
      await tx.dailyQuestionAnswer.create({
        data: {
          userId: user.id,
          questionId: question.id,
          day,
          optionIndex,
          isCorrect: options[optionIndex].isCorrect,
          xpAwarded: QUESTION_OF_THE_DAY_XP,
        },
      });
      await awardXp(tx, {
        userId: user.id,
        amount: QUESTION_OF_THE_DAY_XP,
        type: "QUESTION_OF_THE_DAY",
        idempotencyKey: xpKeys.questionOfTheDay(user.id, day),
        description: "Daily Money Reality Check",
      });
      await recordStreakDay(tx, user.id);
    }, SLOW_DB_TRANSACTION);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const answer = await db.dailyQuestionAnswer.findUniqueOrThrow({
        where: { userId_day: { userId: user.id, day } },
        include: { question: true },
      });
      return resultFor(answer.question, answer.optionIndex, answer.xpAwarded);
    }
    throw err;
  }

  // The shared layout shows XP, so refresh it too.
  revalidatePath("/", "layout");
  return resultFor(question, optionIndex, QUESTION_OF_THE_DAY_XP);
}

function resultFor(
  question: { options: Prisma.JsonValue; explanation: string },
  optionIndex: number,
  xpAwarded: number,
): QuestionResult {
  const options = readChoiceOptions(question.options);
  return {
    status: "answered",
    isCorrect: options[optionIndex]?.isCorrect ?? false,
    correctIndex: options.findIndex((o) => o.isCorrect),
    explanation: question.explanation,
    xpAwarded,
  };
}
