-- Money Manager (income, expenses, budgets, savings goals, daily money
-- check-ins), practice challenges (the 30-day money habit challenge and
-- saving challenges), the Money Personality Quiz result and the opt-in
-- weekly league. Additive only: no existing table or row changes.

-- CreateEnum
CREATE TYPE "MoneyEntryKind" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "MoneyCheckInKind" AS ENUM ('LOGGED', 'NO_SPEND');

-- AlterEnum


ALTER TYPE "XPTransactionType" ADD VALUE 'MONEY_CHECKIN';
ALTER TYPE "XPTransactionType" ADD VALUE 'PRACTICE_CHALLENGE';
ALTER TYPE "XPTransactionType" ADD VALUE 'PERSONALITY_QUIZ';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leagueOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moneyPersonality" TEXT,
ADD COLUMN     "personalityAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MoneyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "MoneyEntryKind" NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoneyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyBudget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "kind" "MoneyCheckInKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoneyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "targetDay" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsDeposit" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChallengeEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeCheckIn" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "choice" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoneyEntry_userId_day_idx" ON "MoneyEntry"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyBudget_userId_month_category_key" ON "MoneyBudget"("userId", "month", "category");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyCheckIn_userId_day_key" ON "MoneyCheckIn"("userId", "day");

-- CreateIndex
CREATE INDEX "SavingsGoal_userId_idx" ON "SavingsGoal"("userId");

-- CreateIndex
CREATE INDEX "SavingsDeposit_userId_day_idx" ON "SavingsDeposit"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeEnrollment_userId_challengeId_key" ON "ChallengeEnrollment"("userId", "challengeId");

-- CreateIndex
CREATE INDEX "ChallengeCheckIn_userId_day_idx" ON "ChallengeCheckIn"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeCheckIn_enrollmentId_stepNumber_key" ON "ChallengeCheckIn"("enrollmentId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeCheckIn_enrollmentId_day_key" ON "ChallengeCheckIn"("enrollmentId", "day");

-- AddForeignKey
ALTER TABLE "MoneyEntry" ADD CONSTRAINT "MoneyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyBudget" ADD CONSTRAINT "MoneyBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyCheckIn" ADD CONSTRAINT "MoneyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsDeposit" ADD CONSTRAINT "SavingsDeposit_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsDeposit" ADD CONSTRAINT "SavingsDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeEnrollment" ADD CONSTRAINT "ChallengeEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeCheckIn" ADD CONSTRAINT "ChallengeCheckIn_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "ChallengeEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeCheckIn" ADD CONSTRAINT "ChallengeCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

