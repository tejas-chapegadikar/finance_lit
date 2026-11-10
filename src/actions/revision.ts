"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { istDay } from "@/lib/ist-date";
import { readChoiceOptions } from "@/lib/lesson-content";
import { isAllowed, practiceRatelimit } from "@/lib/ratelimit";
import { REVISION_XP, nextSchedule, revisionQuestion, whenDue } from "@/lib/revision";
import { completeQuest } from "@/lib/quests";
import { awardRevisionBadges, findBadge } from "@/lib/badges";
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
    ? "Wrong again. This one comes back tomorrow, and it remembers you."
    : next.status === "DONE"
      ? "That's locked in. This one is retained! 🎉"
      : `Correct. You'll see it once more ${whenDue(next.stage)}.`;

  // Not due (or already answered in another tab): show the result, change nothing.
  if (item.status !== "ACTIVE" || item.dueDay > today) {
    return { status: "answered", isCorrect, correctIndex, explanation: question.explanation, note, xpAwarded: 0 };
  }

  const { xpAwarded, badgeIds } = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    // Only the request that moves the item on gets to record and reward it.
    const { count } = await tx.revisionItem.updateMany({
      where: { id: item.id, status: "ACTIVE", stage: item.stage, dueDay: item.dueDay },
      data: next,
    });
    if (count === 0) return { xpAwarded: 0, badgeIds: [] };
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
    const badgeIds = next.status === "DONE" ? await awardRevisionBadges(tx, user.id) : [];
    await completeQuest(tx, user.id, "learn");
    return { xpAwarded: awarded, badgeIds };
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  const badgeNote = badgeIds
    .map((id) => findBadge(id))
    .filter((badge) => badge !== undefined)
    .map((badge) => ` New badge: ${badge.icon} ${badge.name}!`)
    .join("");
  return { status: "answered", isCorrect, correctIndex, explanation: question.explanation, note: note + badgeNote, xpAwarded };
}
