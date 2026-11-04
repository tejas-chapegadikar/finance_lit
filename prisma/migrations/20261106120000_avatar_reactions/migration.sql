-- The talking avatar: a per-student on/off switch for reactions, and one row
-- per real event (unique per student) so no reaction is ever shown twice.
-- Additive only.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarReactions" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "AvatarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shownAt" TIMESTAMP(3),

    CONSTRAINT "AvatarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvatarEvent_userId_shownAt_idx" ON "AvatarEvent"("userId", "shownAt");

-- CreateIndex
CREATE UNIQUE INDEX "AvatarEvent_userId_key_key" ON "AvatarEvent"("userId", "key");

-- AddForeignKey
ALTER TABLE "AvatarEvent" ADD CONSTRAINT "AvatarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

