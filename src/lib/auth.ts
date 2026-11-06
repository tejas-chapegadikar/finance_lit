import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as AuthUser } from "@supabase/supabase-js";
import { db } from "./db";
import { supabaseServer } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";

// Who's signed in. Login is Supabase Auth (username + password); the
// StockStreak account — profile, XP, lessons, money — is a
// User row in our database, linked by `authId` (the Supabase user id).

/** The signed-in Supabase user (verified with Supabase, not just read from a cookie), or null. */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  // Without the Supabase keys nobody can be signed in — public pages still work.
  if (!supabaseConfigured()) return null;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
});

/** Ensures a signed-in session, redirecting to /sign-in otherwise. */
export async function requireSession() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");
  return { userId: user.id, user };
}

const getUserByAuthId = cache((authId: string) => db.user.findUnique({ where: { authId } }));

/**
 * Finds or creates the StockStreak account for a Supabase user.
 *
 * An older account with the same email (made before the move from Clerk to
 * Supabase, so not linked yet) is only taken over through Google sign-in:
 * Google has proved the person owns that inbox. An email + password sign-up
 * proves nothing (Supabase may not ask them to confirm the email), so it
 * can't claim someone else's progress — that person is asked to use Google.
 */
async function linkOrCreateUser(auth: AuthUser) {
  const email = auth.email?.toLowerCase();
  if (!email) return null;
  const viaGoogle = (auth.identities ?? []).some((i) => i.provider === "google");
  const meta = auth.user_metadata ?? {};
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.username === "string" && meta.username) ||
    null;
  const fields = { email, emailVerified: viaGoogle, phone: auth.phone || null, phoneVerified: !!auth.phone_confirmed_at };

  const sameEmail = await db.user.findUnique({ where: { email } });
  if (sameEmail) {
    if (sameEmail.authId || !viaGoogle) return "claim" as const;
    return db.user.update({ where: { id: sameEmail.id }, data: { authId: auth.id, ...fields, name: sameEmail.name ?? name } });
  }
  return db.user.upsert({ where: { authId: auth.id }, create: { authId: auth.id, ...fields, name }, update: fields });
}

/** Ensures a signed-in session AND a matching StockStreak account (created on the first sign-in). */
export async function requireAppUser() {
  const { userId: authId, user: auth } = await requireSession();
  const user = (await getUserByAuthId(authId)) ?? (await linkOrCreateUser(auth));
  // This email already belongs to an older account: open it with Google.
  if (user === "claim") redirect("/sign-in?error=claim");
  if (!user) {
    throw new Error("We couldn't set up your StockStreak account. Please sign in with an email address.");
  }
  return user;
}

/** Ensures the signed-in user has finished onboarding. */
export async function requireOnboardedUser() {
  const user = await requireAppUser();
  if (!user.onboardingCompletedAt) {
    redirect("/onboarding");
  }
  return user;
}
