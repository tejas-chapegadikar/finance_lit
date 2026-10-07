import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch (err) {
    console.error("Clerk webhook verification failed", err);
    return new NextResponse("Webhook verification failed", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data;

    const primaryEmail = user.email_addresses.find(
      (e) => e.id === user.primary_email_address_id,
    );
    const primaryPhone = user.phone_numbers.find(
      (p) => p.id === user.primary_phone_number_id,
    );

    if (!primaryEmail) {
      // Our schema requires an email per user — Clerk should be configured
      // with email as a required identifier even when phone OTP is also on.
      console.error(`Clerk user ${user.id} has no primary email; skipping sync`);
      return new NextResponse("User has no email address", { status: 400 });
    }

    const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;

    await db.user.upsert({
      where: { clerkId: user.id },
      create: {
        clerkId: user.id,
        email: primaryEmail.email_address,
        emailVerified: primaryEmail.verification?.status === "verified",
        phone: primaryPhone?.phone_number ?? null,
        phoneVerified: primaryPhone?.verification?.status === "verified",
        name,
      },
      update: {
        email: primaryEmail.email_address,
        emailVerified: primaryEmail.verification?.status === "verified",
        phone: primaryPhone?.phone_number ?? null,
        phoneVerified: primaryPhone?.verification?.status === "verified",
        name,
      },
    });
  }

  if (event.type === "user.deleted" && event.data.id) {
    const clerkId = event.data.id;
    // XP history and quiz attempts don't cascade from User, so remove them
    // first; views, scenario and challenge answers cascade with the user.
    await db.$transaction([
      db.xPTransaction.deleteMany({ where: { user: { clerkId } } }),
      db.quizAttempt.deleteMany({ where: { user: { clerkId } } }),
      db.user.deleteMany({ where: { clerkId } }),
    ]);
  }

  return NextResponse.json({ received: true });
}
