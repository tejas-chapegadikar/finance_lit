"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { displayNameSchema } from "@/lib/validations/profile";

export type DisplayNameState = { error?: string; success?: boolean };

export async function updateDisplayName(
  _prevState: DisplayNameState,
  formData: FormData,
): Promise<DisplayNameState> {
  const user = await requireOnboardedUser();

  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid display name" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { displayName: parsed.data },
  });

  // The navbar (in the shared app layout) shows the display name too.
  revalidatePath("/", "layout");
  return { success: true };
}
