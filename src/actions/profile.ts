"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations/profile";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfile(_prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireOnboardedUser();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    stage: formData.get("stage") ?? "",
    collegeName: formData.get("collegeName") ?? "",
    goal: formData.get("goal") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      stage: parsed.data.stage,
      collegeName: parsed.data.collegeName,
      goal: parsed.data.goal,
    },
  });

  // The navbar (in the shared app layout) shows the name too.
  revalidatePath("/", "layout");
  return { success: true };
}
