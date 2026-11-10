"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAppUser } from "@/lib/auth";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

/** Signs out on this device: Supabase clears the session cookies. */
export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Deletes your own account for good: your Rupli data, then your login
 * in Supabase. Only ever the signed-in student's own account.
 */
export async function deleteAccount(confirmation: string): Promise<{ status: "wrong-confirmation" }> {
  const user = await requireAppUser();
  if (confirmation !== "DELETE") return { status: "wrong-confirmation" };
  // XP history and quiz attempts don't cascade from User; everything else does.
  await db.$transaction([
    db.xPTransaction.deleteMany({ where: { userId: user.id } }),
    db.quizAttempt.deleteMany({ where: { userId: user.id } }),
    db.user.delete({ where: { id: user.id } }),
  ]);
  // The data above is already gone. If the login can't be removed too (the
  // server key is missing or Supabase is down), still finish and log it.
  if (user.authId) {
    try {
      await supabaseAdmin().auth.admin.deleteUser(user.authId);
    } catch (error) {
      console.error("[account] login not removed for", user.authId, error);
    }
  }
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
