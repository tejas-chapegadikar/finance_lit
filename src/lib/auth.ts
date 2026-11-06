import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";

/** Ensures a signed-in Clerk session, redirecting to /sign-in otherwise. */
export async function requireSession() {
  return auth.protect({ unauthenticatedUrl: "/sign-in" });
}

// A layout and the page it wraps both call requireAppUser()/
// requireOnboardedUser() on the same request (the layout to guard the
// route, the page to read user data) — react's cache() dedupes that down
// to a single DB round trip per request instead of one per call site.
const getUserByClerkId = cache((clerkId: string) => db.user.findUnique({ where: { clerkId } }));

/**
 * Creates the app's User row for a signed-in Clerk user, the same way the
 * Clerk `user.created` webhook does. Used when a request arrives before the
 * webhook (or where no webhook is configured yet, e.g. a fresh deployment).
 * A row that already has the same *verified* email — e.g. after moving from
 * Clerk's development to production keys, which gives everyone a new Clerk
 * id — is reconnected instead, so no one loses their progress.
 */
async function createUserFromClerk(clerkId: string) {
  const clerk = await currentUser();
  if (!clerk || clerk.id !== clerkId) return null;
  const email = clerk.emailAddresses.find((e) => e.id === clerk.primaryEmailAddressId);
  if (!email) return null;
  const phone = clerk.phoneNumbers.find((p) => p.id === clerk.primaryPhoneNumberId);
  const verified = email.verification?.status === "verified";
  const fields = {
    email: email.emailAddress,
    emailVerified: verified,
    phone: phone?.phoneNumber ?? null,
    phoneVerified: phone?.verification?.status === "verified",
    name: [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") || null,
  };
  const sameEmail = await db.user.findUnique({ where: { email: fields.email } });
  if (sameEmail) {
    if (!verified) return null;
    return db.user.update({ where: { id: sameEmail.id }, data: { clerkId, ...fields } });
  }
  return db.user.upsert({ where: { clerkId }, create: { clerkId, ...fields }, update: fields });
}

/**
 * Ensures a signed-in session AND a matching Prisma User row. The row is
 * normally created by the Clerk webhook; if it isn't there yet, it's created
 * now. (Sending the student back to sign-in instead caused an endless
 * sign-in → home → dashboard loop when the webhook hadn't run.)
 */
export async function requireAppUser() {
  const { userId: clerkId } = await requireSession();

  const user = (await getUserByClerkId(clerkId)) ?? (await createUserFromClerk(clerkId));
  if (!user) {
    // No email on the Clerk account (or an unverified one clashing with an
    // existing account): show an error rather than looping through sign-in.
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
