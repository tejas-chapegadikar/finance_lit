import type { Prisma, XPTransactionType } from "@prisma/client";

type AwardXpParams = {
  userId: string;
  amount: number;
  type: XPTransactionType;
  quizAttemptId?: string;
  description?: string;
};

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
