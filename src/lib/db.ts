import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 dropped the Rust query engine binary — the schema's datasource
// no longer carries a `url`, and PrismaClient needs an explicit driver
// adapter instead. Connection config for the CLI/migrations lives in
// prisma.config.ts; this is the runtime equivalent for the app itself.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
