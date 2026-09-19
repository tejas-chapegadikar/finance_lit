import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// One-off script: after you've signed up once in the running app, run
//   npm run promote-admin -- you@example.com
// to grant that account the ADMIN role so /admin/lessons becomes accessible.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run promote-admin -- you@example.com");
    process.exit(1);
  }

  const user = await db.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Promoted ${user.email} to ADMIN`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
