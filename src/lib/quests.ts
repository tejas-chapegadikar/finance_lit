import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { istDay } from "./ist-date";
import { recordStreakDay } from "./streak";
import { awardXp } from "./xp";
import { queueAvatarEvent } from "./avatar/queue";

// Three quests a day, resetting at midnight IST. Finishing any one counts
// the day for the streak; finishing all three pays a bonus.

export const QUESTS = [
  { id: "log", title: "Log 1 expense", xp: 10 },
  { id: "learn", title: "Finish 1 lesson or practice", xp: 20 },
  { id: "check", title: "Check your budget and insights", xp: 5 },
] as const;

export type QuestId = (typeof QUESTS)[number]["id"];
export const ALL_QUESTS_BONUS = 15;

export type QuestResult = { xp: number; bonus: number };

/**
 * Marks today's quest done and pays for it, once. Call inside a transaction
 * that has locked the user (lockUser).
 */
export async function completeQuest(tx: Prisma.TransactionClient, userId: string, quest: QuestId): Promise<QuestResult> {
  const def = QUESTS.find((q) => q.id === quest)!;
  const day = istDay();
  const { count } = await tx.dailyQuest.createMany({ data: [{ userId, day, quest, xp: def.xp }], skipDuplicates: true });
  if (count === 0) return { xp: 0, bonus: 0 };

  const xp = await awardXp(tx, { userId, amount: def.xp, type: "DAILY_QUEST", idempotencyKey: `quest:${userId}:${day}:${quest}`, description: `Daily quest: ${def.title}` });
  await recordStreakDay(tx, userId);

  const done = await tx.dailyQuest.count({ where: { userId, day } });
  let bonus = 0;
  if (done === QUESTS.length) {
    bonus = await awardXp(tx, { userId, amount: ALL_QUESTS_BONUS, type: "MISSION_BONUS", idempotencyKey: `quests-all:${userId}:${day}`, description: "All daily quests done" });
    await queueAvatarEvent(tx, userId, "quests-all", `quests-all:${day}`, { xp: bonus });
  } else {
    await queueAvatarEvent(tx, userId, "quest-done", `quest:${day}:${quest}`, { title: def.title, xp });
  }
  return { xp, bonus };
}

/** Which of today's quests are done. */
export async function getDoneQuests(userId: string, day = istDay()) {
  const rows = await db.dailyQuest.findMany({ where: { userId, day }, select: { quest: true } });
  return new Set(rows.map((r) => r.quest));
}
