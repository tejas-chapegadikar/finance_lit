import type { Prisma, XPTransactionType } from "@prisma/client";
import { LEVEL_1_NAME, LEVEL_COMPLETION_XP } from "./constants";

type AwardXpParams = {
  userId: string;
  amount: number;
  type: XPTransactionType;
  quizAttemptId?: string;
  description?: string;
};

/**
 * Locks the student's row for the rest of the transaction. Every XP-awarding
 * transaction takes this lock before checking "has this already been
 * awarded?", so two concurrent requests (a double-click, two tabs) can't
 * both see "not yet" and award twice.
 */
export async function lockUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$executeRaw`SELECT 1 FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}

/**
 * Inserts an XPTransaction ledger row and keeps User.xpTotal in sync.
 * Must be called with a transaction client so both writes commit atomically
 * alongside whatever else the caller is doing (e.g. marking a quiz attempt
 * COMPLETED) — a partial write here would desync the cached total from the
 * ledger it's supposed to mirror.
 */
export async function awardXp(tx: Prisma.TransactionClient, params: AwardXpParams) {
  const { userId, amount, type, quizAttemptId, description } = params;

  await tx.xPTransaction.create({
    data: { userId, amount, type, quizAttemptId, description },
  });

  await tx.user.update({
    where: { id: userId },
    data: { xpTotal: { increment: amount } },
  });
}

/**
 * Awards the one-time Level 1 bonus if the student has now finished every
 * published lesson. Returns the XP awarded (0 if not complete or already paid).
 */
export async function awardLevelBonusIfComplete(
  tx: Prisma.TransactionClient,
  userId: string,
  quizAttemptId: string,
): Promise<number> {
  const alreadyAwarded = await tx.xPTransaction.count({ where: { userId, type: "LEVEL_COMPLETION" } });
  if (alreadyAwarded > 0) return 0;

  const publishedCount = await tx.lesson.count({ where: { isPublished: true } });
  const completed = await tx.quizAttempt.findMany({
    where: { userId, status: "COMPLETED", lesson: { isPublished: true } },
    select: { lessonId: true },
    distinct: ["lessonId"],
  });
  if (publishedCount === 0 || completed.length < publishedCount) return 0;

  await awardXp(tx, {
    userId,
    amount: LEVEL_COMPLETION_XP,
    type: "LEVEL_COMPLETION",
    quizAttemptId,
    description: `Level 1 complete — ${LEVEL_1_NAME}`,
  });
  return LEVEL_COMPLETION_XP;
}
