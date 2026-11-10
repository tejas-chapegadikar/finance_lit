"use server";

import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONSENT_VERSION } from "@/lib/site";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

/** Records that the signed-in person is 18+ and agrees to the current terms. */
export async function acceptTerms(agreed: boolean) {
  const user = await requireAppUser();
  if (agreed !== true) return { error: "Tick the box to continue." };
  await db.user.update({ where: { id: user.id }, data: { consentAt: new Date(), consentVersion: CONSENT_VERSION } });
  redirect("/dashboard");
}

/**
 * "No thanks": signs out. If the account was created a moment ago by this
 * sign-in (never agreed, no setup, no XP), it is deleted too, so we don't
 * keep data about someone who didn't agree. Older accounts are never touched.
 */
export async function declineTerms() {
  const user = await requireAppUser();
  const brandNew = !user.consentAt && !user.onboardingCompletedAt && user.xpTotal === 0;
  if (brandNew) {
    await db.$transaction([
      db.xPTransaction.deleteMany({ where: { userId: user.id } }),
      db.quizAttempt.deleteMany({ where: { userId: user.id } }),
      db.user.delete({ where: { id: user.id } }),
    ]);
    if (user.authId) {
      try {
        await supabaseAdmin().auth.admin.deleteUser(user.authId);
      } catch (error) {
        console.error("[consent] login not removed for", user.authId, error);
      }
    }
  }
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
