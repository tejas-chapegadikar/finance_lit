"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { guardAdminAction } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { challengeSchema, type ChallengeInput } from "@/lib/validations/challenge";

// There's deliberately no delete: answers are tied to the challenge, and
// removing one would let students answer "today" again for more XP.
// Unpublishing takes a challenge out of the rotation instead.

function challengeFields(parsed: ChallengeInput) {
  return {
    prompt: parsed.prompt,
    area: parsed.area,
    options: parsed.options,
    explanation: parsed.explanation,
    isPublished: parsed.isPublished,
    order: parsed.order,
  };
}

function revalidateChallengePages() {
  revalidatePath("/admin/challenges");
  revalidatePath("/challenge");
  revalidatePath("/dashboard");
}

export async function createChallenge(input: ChallengeInput) {
  await guardAdminAction();
  const parsed = challengeSchema.parse(input);
  const challenge = await db.dailyChallenge.create({ data: challengeFields(parsed) });
  revalidateChallengePages();
  redirect(`/admin/challenges/${challenge.id}/edit`);
}

export async function updateChallenge(challengeId: string, input: ChallengeInput) {
  await guardAdminAction();
  const parsed = challengeSchema.parse(input);
  await db.dailyChallenge.update({ where: { id: challengeId }, data: challengeFields(parsed) });
  revalidateChallengePages();
}
