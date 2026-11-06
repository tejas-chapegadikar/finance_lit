import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as AuthUser } from "@supabase/supabase-js";
import { db } from "./db";
import { supabaseServer } from "./supabase/server";

// Who's signed in. Login is Supabase Auth (Google, or a 6-digit code sent to
// your email); the StockStreak account — profile, XP, lessons, money — is a
// User row in our database, linked by `authId` (the Supabase user id).

/** The signed-in Supabase user (verified with Supabase, not just read from a cookie), or null. */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
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
 * Finds or creates the StockStreak account for a Supabase user. An account
 * that already has the same *verified* email — e.g. one made before the move
 * from Clerk to Supabase — is linked instead, so its progress is kept. The
 * same email through Google or an email code is the same Supabase user, so
 * it's the same account on every device.
 */
async function linkOrCreateUser(auth: AuthUser) {
  const email = auth.email?.toLowerCase();
  if (!email) return null;
  const verified = !!auth.email_confirmed_at;
  const meta = auth.user_metadata ?? {};
  const name = (typeof meta.full_name === "string" && meta.full_name) || (typeof meta.name === "string" && meta.name) || null;
  const fields = { email, emailVerified: verified, phone: auth.phone || null, phoneVerified: !!auth.phone_confirmed_at };

  const sameEmail = await db.user.findUnique({ where: { email } });
  if (sameEmail) {
    if (!verified) return null;
    return db.user.update({ where: { id: sameEmail.id }, data: { authId: auth.id, ...fields, name: sameEmail.name ?? name } });
  }
  return db.user.upsert({ where: { authId: auth.id }, create: { authId: auth.id, ...fields, name }, update: fields });
}

/** Ensures a signed-in session AND a matching StockStreak account (created on the first sign-in). */
export async function requireAppUser() {
  const { userId: authId, user: auth } = await requireSession();
  const user = (await getUserByAuthId(authId)) ?? (await linkOrCreateUser(auth));
  if (!user) {
    throw new Error("We couldn't set up your StockStreak account. Please sign in with a verified email address.");
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
