"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { isAllowed, rewardRatelimit } from "@/lib/ratelimit";
import { findReward } from "@/lib/rewards";
import { lockUser, spendXp, xpKeys } from "@/lib/xp";

export type RedeemResult = { status: "unlocked" | "owned" | "not-enough-xp" | "slow-down" };

/**
 * Unlocks a Rewards Store item with XP. Everything is checked here: that it
 * exists, isn't already owned and is affordable. The (user, reward) unique
 * index and the ledger's idempotency key stop a double charge.
 */
export async function redeemReward(rewardId: string): Promise<RedeemResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(rewardRatelimit, user.id))) return { status: "slow-down" };
  const reward = findReward(rewardId);
  if (!reward) throw new Error("Reward not found");

  const status = await db.$transaction(async (tx): Promise<RedeemResult["status"]> => {
    await lockUser(tx, user.id);
    const owned = await tx.rewardUnlock.count({ where: { userId: user.id, rewardId } });
    if (owned) return "owned";
    const paid = await spendXp(tx, {
      userId: user.id,
      cost: reward.cost,
      idempotencyKey: xpKeys.redeem(user.id, rewardId),
      description: `Unlocked: ${reward.name}`,
    });
    if (!paid) return "not-enough-xp";
    await tx.rewardUnlock.create({ data: { userId: user.id, rewardId, costXp: reward.cost } });
    // Wear a first title or theme straight away.
    if (reward.kind === "title" && !user.title) await tx.user.update({ where: { id: user.id }, data: { title: rewardId } });
    if (reward.kind === "theme" && !user.theme) await tx.user.update({ where: { id: user.id }, data: { theme: rewardId } });
    return "unlocked";
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  return { status };
}

/** Wears an unlocked title or theme — or takes it off when rewardId is null. */
export async function equipReward(kind: "title" | "theme", rewardId: string | null): Promise<void> {
  const user = await requireOnboardedUser();
  if (rewardId) {
    const reward = findReward(rewardId);
    if (!reward || reward.kind !== kind) throw new Error("Reward not found");
    const owned = await db.rewardUnlock.count({ where: { userId: user.id, rewardId } });
    if (!owned) throw new Error("Unlock it first");
  }
  await db.user.update({ where: { id: user.id }, data: kind === "title" ? { title: rewardId } : { theme: rewardId } });
  revalidatePath("/", "layout");
}
