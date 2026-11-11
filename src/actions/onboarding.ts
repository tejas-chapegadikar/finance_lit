"use server";

import { DEFAULT_AVATAR } from "@/lib/avatar";
import { requireAppUser } from "@/lib/auth";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { recordStreakDay } from "@/lib/streak";
import { awardXp, lockUser } from "@/lib/xp";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";

export type OnboardingResult = { status: "done"; xp: number } | { status: "invalid"; message: string };

/** Saves your name (required), college and year (optional), pays the welcome XP once and starts the streak. */
export async function finishOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const user = await requireAppUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Please check your answers" };
  const { name, collegeName, stage } = parsed.data;

  const xp = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: { onboardingCompletedAt: true, avatar: true } });
    // A double submit must not pay twice.
    if (fresh.onboardingCompletedAt) return 0;
    await tx.user.update({
      where: { id: user.id },
      data: { onboardingCompletedAt: new Date(), displayName: name, collegeName, stage, ...(fresh.avatar ? {} : { avatar: DEFAULT_AVATAR }) },
    });
    const awarded = await awardXp(tx, {
      userId: user.id,
      amount: 20,
      type: "SIGNUP_BONUS",
      idempotencyKey: `onboarding:${user.id}`,
      description: "Finished setup",
    });
    await recordStreakDay(tx, user.id);
    return awarded;
  }, SLOW_DB_TRANSACTION);
  return { status: "done", xp };
}
