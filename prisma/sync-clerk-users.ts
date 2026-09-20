import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// One-off local-dev helper: manually syncs existing Clerk users into our
// Postgres User table. Only needed because Clerk's webhook (which normally
// does this automatically on user.created/user.updated) can't reach
// localhost without a tunnel (ngrok, etc). Once a tunnel is set up, new
// sign-ups sync automatically and this script becomes unnecessary — it's
// safe to rerun any time (upserts by clerkId) if it's ever needed again.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  const { data: users } = await clerkClient.users.getUserList({ limit: 100 });
  console.log(`Found ${users.length} Clerk user(s).`);

  for (const user of users) {
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    const primaryPhone = user.phoneNumbers.find(
      (p) => p.id === user.primaryPhoneNumberId,
    );

    if (!primaryEmail) {
      console.error(`Clerk user ${user.id} has no primary email; skipping sync`);
      continue;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

    await db.user.upsert({
      where: { clerkId: user.id },
      create: {
        clerkId: user.id,
        email: primaryEmail.emailAddress,
        emailVerified: primaryEmail.verification?.status === "verified",
        phone: primaryPhone?.phoneNumber ?? null,
        phoneVerified: primaryPhone?.verification?.status === "verified",
        name,
      },
      update: {
        email: primaryEmail.emailAddress,
        emailVerified: primaryEmail.verification?.status === "verified",
        phone: primaryPhone?.phoneNumber ?? null,
        phoneVerified: primaryPhone?.verification?.status === "verified",
        name,
      },
    });
    console.log(`Synced: ${primaryEmail.emailAddress} (${user.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
