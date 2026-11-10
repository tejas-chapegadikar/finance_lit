"use server";

import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONSENT_VERSION } from "@/lib/site";

/** Records that the signed-in person is 18+ and agrees to the current terms. */
export async function acceptTerms(agreed: boolean) {
  const user = await requireAppUser();
  if (agreed !== true) return { error: "Tick the box to continue." };
  await db.user.update({ where: { id: user.id }, data: { consentAt: new Date(), consentVersion: CONSENT_VERSION } });
  redirect("/dashboard");
}
