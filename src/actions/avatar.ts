"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { AVATAR_SLOTS, findAvatarItem, isAvatarItemUnlocked, readAvatar, type AvatarConfig } from "@/lib/avatar";
import { getAvatarUnlocks } from "@/lib/avatar-unlocks";

export type SaveAvatarResult = { status: "saved" } | { status: "locked"; itemName: string };

/** Saves the whole avatar — only with items that exist, fit their slot and are unlocked. */
export async function saveAvatar(config: AvatarConfig): Promise<SaveAvatarResult> {
  const user = await requireOnboardedUser();
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
  const item = findAvatarItem(itemId);
  if (!item) throw new Error("Invalid avatar item");
  if (!isAvatarItemUnlocked(item, await getAvatarUnlocks(user.id))) throw new Error("Unlock it first");
  const avatar = { ...readAvatar(user.avatar), [item.slot]: item.id };
  await db.user.update({ where: { id: user.id }, data: { avatar } });
  revalidatePath("/", "layout");
}
