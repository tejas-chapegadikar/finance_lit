import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
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
 * Ensures a signed-in session AND a matching Prisma User row.
 * The User row is created by the Clerk `user.created` webhook, so on the
 * rare chance a request lands before that webhook has been processed,
 * this sends the user back to sign-in rather than crashing.
 */
export async function requireAppUser() {
  const { userId: clerkId } = await requireSession();

  const user = await getUserByClerkId(clerkId);
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

/** Ensures the signed-in user is an onboarded STUDENT/ADMIN. */
export async function requireOnboardedUser() {
  const user = await requireAppUser();
  if (!user.onboardingCompletedAt) {
    redirect("/onboarding");
  }
  return user;
}

/** Ensures the signed-in user has the ADMIN role; 404s otherwise. */
export async function requireAdmin() {
  const user = await requireAppUser();
  if (user.role !== "ADMIN") {
    notFound();
  }
  return user;
}
