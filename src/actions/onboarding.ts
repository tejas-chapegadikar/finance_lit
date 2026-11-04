"use server";

import { redirect } from "next/navigation";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { requireAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingResult = { error: string };

// Typed loosely on purpose: this is a public endpoint, so everything is
// validated here rather than trusted from the browser.
type OnboardingAnswers = { displayName: string; stage: string; collegeName: string; goal: string };

/** Saves the answers and opens the dashboard; only returns when something is wrong. */
export async function completeOnboarding(input: OnboardingAnswers): Promise<OnboardingResult> {
  const user = await requireAppUser();

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      stage: parsed.data.stage,
      collegeName: parsed.data.collegeName,
      goal: parsed.data.goal,
      // Re-onboarding (e.g. a double submit) keeps the original date.
      onboardingCompletedAt: user.onboardingCompletedAt ?? new Date(),
      // Every student gets their own avatar — it carries their name, not a mascot's.
      ...(user.avatar ? {} : { avatar: DEFAULT_AVATAR }),
    },
  });

  // A fresh student goes on to the (skippable) Money Personality Quiz.
  redirect(user.onboardingCompletedAt ? "/dashboard" : "/personality?welcome=1");
}
