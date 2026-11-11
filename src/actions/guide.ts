"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAppUser, requireOnboardedUser } from "@/lib/auth";
import { accountRatelimit, isAllowed } from "@/lib/ratelimit";

const tipIds = z
  .array(
    z
      .string()
      .regex(/^[a-z]+:[a-z-]+$/)
      .max(40),
  )
  .max(10);

/** Remembers one-time tips this student has seen, so they never repeat. */
export async function markTipsSeen(ids: string[]): Promise<void> {
  const user = await requireAppUser();
  const parsed = tipIds.safeParse(ids);
  if (!parsed.success) return;
  await db.seenTip.createMany({ data: parsed.data.map((tipId) => ({ userId: user.id, tipId })), skipDuplicates: true });
}

/** Settings: how hard the avatar roasts. */
export async function setRoastLevel(level: string): Promise<{ status: "saved" | "invalid" | "slow-down" }> {
  const user = await requireOnboardedUser();
  const parsed = z.enum(["mild", "spicy", "savage"]).safeParse(level);
  if (!parsed.success) return { status: "invalid" };
  if (!(await isAllowed(accountRatelimit, user.id))) return { status: "slow-down" };
  await db.user.update({ where: { id: user.id }, data: { roastLevel: parsed.data } });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { status: "saved" };
}
