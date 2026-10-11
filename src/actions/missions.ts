"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { MISSION_BONUS_XP } from "@/lib/constants";
import { getDailyMissions } from "@/lib/missions";
import { isAllowed, rewardRatelimit } from "@/lib/ratelimit";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";

export type MissionBonusResult = { status: "claimed" | "already" | "not-yet" | "slow-down"; xpAwarded: number };

/**
 * Pays the daily-missions bonus. The server re-counts today's missions
 * itself; the idempotency key means it pays at most once a day.
 */
export async function claimMissionBonus(): Promise<MissionBonusResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(rewardRatelimit, user.id))) return { status: "slow-down", xpAwarded: 0 };

  const { day, allDone, bonusClaimed } = await getDailyMissions(user.id);
  if (bonusClaimed) return { status: "already", xpAwarded: 0 };
  if (!allDone) return { status: "not-yet", xpAwarded: 0 };

  const xpAwarded = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    return awardXp(tx, {
      userId: user.id,
      amount: MISSION_BONUS_XP,
      type: "MISSION_BONUS",
      idempotencyKey: xpKeys.missionBonus(user.id, day),
      description: "All 3 daily missions done",
    });
  }, SLOW_DB_TRANSACTION);

  revalidatePath("/", "layout");
  return { status: xpAwarded > 0 ? "claimed" : "already", xpAwarded };
}
