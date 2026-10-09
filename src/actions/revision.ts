"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { istDay } from "@/lib/ist-date";
import { readChoiceOptions } from "@/lib/lesson-content";
import { isAllowed, practiceRatelimit } from "@/lib/ratelimit";
import { REVISION_XP, nextSchedule, revisionQuestion, whenDue } from "@/lib/revision";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

export type RevisionResult =
  | {
      status: "answered";
      isCorrect: boolean;
      correctIndex: number;
      explanation: string;
      note: string;
      xpAwarded: number;
    }
  | { status: "slow-down" };

/**
 * Answers one due revision question. Correct moves it along the 1 → 3 → 7
 * day schedule (or retires it); wrong brings it back tomorrow. +5 XP for
 * showing up, once each time an item comes due.
 */
export async function answerRevision(itemId: string, optionIndex: number): Promise<RevisionResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(practiceRatelimit, user.id))) {
    return { status: "slow-down" };
  }

  const today = istDay();
  const item = await db.revisionItem.findUnique({
    where: { id: itemId },
    include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
  });
  if (!item || item.userId !== user.id) throw new Error("Revision item not found");

  const question = revisionQuestion(item.question);
  const options = readChoiceOptions(question.options);
  const correctIndex = options.findIndex((o) => o.isCorrect);
  if (!Number.isInteger(optionIndex) || !options[optionIndex] || correctIndex === -1) throw new Error("Option not found");

  const isCorrect = options[optionIndex].isCorrect;
  const next = nextSchedule(item, isCorrect, today);
  const note = !isCorrect
    ? "Not quite — this one comes back tomorrow."
    : next.status === "DONE"
      ? "That's locked in — this one is retained! 🎉"
      : `Correct — you'll see it once more ${whenDue(next.stage)}.`;

  // Not due (or already answered in another tab): show the result, change nothing.
  if (item.status !== "ACTIVE" || item.dueDay > today) {
    return { status: "answered", isCorrect, correctIndex, explanation: question.explanation, note, xpAwarded: 0 };
  }

  const xpAwarded = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    // Only the request that moves the item on gets to record and reward it.
    const { count } = await tx.revisionItem.updateMany({
      where: { id: item.id, status: "ACTIVE", stage: item.stage, dueDay: item.dueDay },
      data: next,
    });
    if (count === 0) return 0;
    await tx.revisionAnswer.create({
      data: { itemId: item.id, userId: user.id, context: "REVIEW", stage: item.stage, optionIndex, isCorrect },
    });
    const awarded = await awardXp(tx, {
      userId: user.id,
      amount: REVISION_XP,
      type: "REVISION",
      idempotencyKey: xpKeys.revision(item.id, item.stage, item.dueDay),
      description: "Revision practice",
    });
    await recordStreakDay(tx, user.id);
    return awarded;
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  return { status: "answered", isCorrect, correctIndex, explanation: question.explanation, note, xpAwarded };
}
