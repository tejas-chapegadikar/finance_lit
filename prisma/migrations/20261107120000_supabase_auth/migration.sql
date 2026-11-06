-- Login moves from Clerk to Supabase Auth. Additive and safe: a new authId
-- (the Supabase user id), and clerkId becomes optional so accounts created
-- with Clerk keep working until they're relinked by verified email.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authId" TEXT,
ALTER COLUMN "clerkId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

