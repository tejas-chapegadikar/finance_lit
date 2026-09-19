import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";

/** Ensures a signed-in Clerk session, redirecting to /sign-in otherwise. */
export async function requireSession() {
  return auth.protect({ unauthenticatedUrl: "/sign-in" });
}

/**
 * Ensures a signed-in session AND a matching Prisma User row.
 * The User row is created by the Clerk `user.created` webhook, so on the
 * rare chance a request lands before that webhook has been processed,
 * this sends the user back to sign-in rather than crashing.
 */
export async function requireAppUser() {
  const { userId: clerkId } = await requireSession();

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

/** Ensures the signed-in user is an onboarded STUDENT/ADMIN with a college set. */
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
