"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { isAllowed, accountRatelimit } from "@/lib/ratelimit";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";
import { PERSONALITY_XP, scorePersonality, type PersonalityId } from "@/lib/personality";

export type PersonalityResult = { status: "saved"; id: PersonalityId; xpAwarded: number } | { status: "invalid" | "slow-down" };

/** Scores the Money Personality Quiz on the server and saves the result (retakes replace it). */
export async function savePersonality(answers: number[]): Promise<PersonalityResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(accountRatelimit, user.id))) return { status: "slow-down" };
  const id = Array.isArray(answers) ? scorePersonality(answers.map(Number)) : null;
  if (!id) return { status: "invalid" };

  const xpAwarded = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    await tx.user.update({ where: { id: user.id }, data: { moneyPersonality: id, personalityAt: new Date() } });
    return awardXp(tx, {
      userId: user.id,
      amount: PERSONALITY_XP,
      type: "PERSONALITY_QUIZ",
      idempotencyKey: xpKeys.personalityQuiz(user.id),
      description: "Took the Money Personality Quiz",
    });
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  return { status: "saved", id, xpAwarded };
}
