"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingState = { error?: string };

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await requireAppUser();

  const parsed = onboardingSchema.safeParse({
    collegeId: formData.get("collegeId"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const college = await db.college.findUnique({
    where: { id: parsed.data.collegeId },
  });
  if (!college || !college.isActive) {
    return { error: "Please select a valid college" };
  }

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        collegeId: parsed.data.collegeId,
        phone: parsed.data.phone,
        onboardingCompletedAt: new Date(),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "That phone number is already in use on another account" };
    }
    throw err;
  }

  redirect("/lessons");
}
