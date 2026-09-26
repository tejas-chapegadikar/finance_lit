-- AlterTable: add the new free-text column first
ALTER TABLE "User" ADD COLUMN "collegeName" TEXT;

-- Backfill collegeName from the existing College relation before it's dropped
UPDATE "User" u
SET "collegeName" = c."name"
FROM "College" c
WHERE u."collegeId" = c."id";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_collegeId_fkey";

-- AlterTable: drop the old FK column
ALTER TABLE "User" DROP COLUMN "collegeId";

-- DropTable
DROP TABLE "College";
