-- Retention release: revision schedule, interactive scenarios, the XP Rewards Store,
-- daily reminders and content-trust fields (sources, review date, tax year).
-- CreateEnum
CREATE TYPE "RevisionKind" AS ENUM ('MISTAKE', 'CHECK');
-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('ACTIVE', 'DONE');
-- CreateEnum
CREATE TYPE "RevisionContext" AS ENUM ('COACH_CHECK', 'REVIEW');
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "XPTransactionType" ADD VALUE 'SCENARIO_COMPLETION';
ALTER TYPE "XPTransactionType" ADD VALUE 'REVISION';
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "appliesTo" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "sources" JSONB NOT NULL DEFAULT '[]';
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "practiceExplanation" TEXT,
ADD COLUMN     "practiceOptions" JSONB,
ADD COLUMN     "practicePrompt" TEXT;
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderHour" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "reminderLastSentDay" TEXT,
ADD COLUMN     "theme" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "xpSpent" INTEGER NOT NULL DEFAULT 0;
-- CreateTable
CREATE TABLE "RevisionItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "kind" "RevisionKind" NOT NULL,
    "stage" INTEGER NOT NULL DEFAULT 0,
    "dueDay" TEXT NOT NULL,
    "status" "RevisionStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RevisionItem_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "RevisionAnswer" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "context" "RevisionContext" NOT NULL,
    "stage" INTEGER NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "quizAttemptId" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RevisionAnswer_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioSlug" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "RewardUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "costXp" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardUnlock_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "RevisionItem_userId_status_dueDay_idx" ON "RevisionItem"("userId", "status", "dueDay");
-- CreateIndex
CREATE UNIQUE INDEX "RevisionItem_userId_questionId_key" ON "RevisionItem"("userId", "questionId");
-- CreateIndex
CREATE INDEX "RevisionAnswer_userId_answeredAt_idx" ON "RevisionAnswer"("userId", "answeredAt");
-- CreateIndex
CREATE UNIQUE INDEX "RevisionAnswer_quizAttemptId_itemId_key" ON "RevisionAnswer"("quizAttemptId", "itemId");
-- CreateIndex
CREATE INDEX "ScenarioRun_userId_scenarioSlug_idx" ON "ScenarioRun"("userId", "scenarioSlug");
-- CreateIndex
CREATE UNIQUE INDEX "RewardUnlock_userId_rewardId_key" ON "RewardUnlock"("userId", "rewardId");
-- AddForeignKey
ALTER TABLE "RevisionItem" ADD CONSTRAINT "RevisionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RevisionItem" ADD CONSTRAINT "RevisionItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RevisionItem" ADD CONSTRAINT "RevisionItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RevisionAnswer" ADD CONSTRAINT "RevisionAnswer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RevisionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RevisionAnswer" ADD CONSTRAINT "RevisionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ScenarioRun" ADD CONSTRAINT "ScenarioRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RewardUnlock" ADD CONSTRAINT "RewardUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
