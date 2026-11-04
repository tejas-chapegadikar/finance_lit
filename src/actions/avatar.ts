"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { AVATAR_SLOTS, findAvatarItem, isAvatarItemUnlocked, readAvatar, type AvatarConfig } from "@/lib/avatar";
import { getAvatarUnlocks } from "@/lib/avatar-unlocks";
import { accountRatelimit, isAllowed } from "@/lib/ratelimit";
import { queueAvatarEvent } from "@/lib/avatar/events";

export type SaveAvatarResult = { status: "saved" } | { status: "locked"; itemName: string } | { status: "slow-down" };

/** Saves the whole avatar — only with items that exist, fit their slot and are unlocked. */
export async function saveAvatar(config: AvatarConfig): Promise<SaveAvatarResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(accountRatelimit, user.id))) return { status: "slow-down" };
  const unlocks = await getAvatarUnlocks(user.id);
  const clean: Partial<AvatarConfig> = {};
  for (const { slot } of AVATAR_SLOTS) {
    const item = findAvatarItem(String(config?.[slot] ?? ""));
    if (!item || item.slot !== slot) throw new Error("Invalid avatar item");
    if (!isAvatarItemUnlocked(item, unlocks)) return { status: "locked", itemName: item.name };
    clean[slot] = item.id;
  }
  await db.user.update({ where: { id: user.id }, data: { avatar: clean } });
  revalidatePath("/", "layout");
  return { status: "saved" };
}

/** Puts one unlocked item on the avatar (from the Rewards Store). */
export async function wearAvatarItem(itemId: string): Promise<void> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(accountRatelimit, user.id))) throw new Error("Too many requests");
  const item = findAvatarItem(itemId);
  if (!item) throw new Error("Invalid avatar item");
  if (!isAvatarItemUnlocked(item, await getAvatarUnlocks(user.id))) throw new Error("Unlock it first");
  const avatar = { ...readAvatar(user.avatar), [item.slot]: item.id };
  await db.user.update({ where: { id: user.id }, data: { avatar } });
  revalidatePath("/", "layout");
}

/**
 * Marks your own reactions as shown — ids from anyone else's account simply
 * match nothing. Called by the pop-up manager when it shows (or skips) them.
 */
export async function markAvatarEventsShown(ids: string[]): Promise<void> {
  const user = await requireOnboardedUser();
  const clean = (Array.isArray(ids) ? ids : []).filter((id) => typeof id === "string").slice(0, 50);
  if (clean.length === 0) return;
  await db.avatarEvent.updateMany({ where: { userId: user.id, id: { in: clean }, shownAt: null }, data: { shownAt: new Date() } });
}

/** Turns the avatar's pop-up reactions on or off (Settings). */
export async function setAvatarReactions(on: boolean): Promise<void> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(accountRatelimit, user.id))) throw new Error("Too many requests");
  await db.user.update({ where: { id: user.id }, data: { avatarReactions: on === true } });
  if (!on) await db.avatarEvent.updateMany({ where: { userId: user.id, shownAt: null }, data: { shownAt: new Date() } });
  revalidatePath("/", "layout");
}

/**
 * The compounding simulator's "aha" moment: the first time a student's own
 * numbers grow past ₹1 crore, or they've explored for a while. Once ever.
 */
export async function recordSimulatorMoment(): Promise<void> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(accountRatelimit, user.id))) return;
  await queueAvatarEvent(db, user.id, "simulator", "simulator-aha");
  revalidatePath("/", "layout");
}
