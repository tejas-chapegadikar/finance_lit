-- CreateEnum
CREATE TYPE "LearnerStage" AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FINAL_YEAR', 'GRADUATE_WORKING');

-- CreateEnum
CREATE TYPE "LearningGoal" AS ENUM ('MANAGING_MONEY', 'INVESTING', 'AVOIDING_SCAMS', 'SALARY_TAXES', 'EVERYTHING');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterEnum
ALTER TYPE "XPTransactionType" ADD VALUE 'DAILY_CHALLENGE';
ALTER TYPE "XPTransactionType" ADD VALUE 'LEVEL_COMPLETION';

-- AlterTable: V1 lesson structure. Icons are carried over from the old topic
-- before it's dropped; videos are removed from V1 entirely.
ALTER TABLE "Lesson"
ADD COLUMN "icon" TEXT NOT NULL DEFAULT '📘',
ADD COLUMN "hook" TEXT NOT NULL DEFAULT '',
ADD COLUMN "keyTerms" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "example" TEXT NOT NULL DEFAULT '',
ADD COLUMN "scenarioPrompt" TEXT NOT NULL DEFAULT '',
ADD COLUMN "scenarioOptions" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "scenarioExplanation" TEXT NOT NULL DEFAULT '';

UPDATE "Lesson" SET "icon" = CASE "topic"
  WHEN 'Budgeting' THEN '💰'
  WHEN 'Saving' THEN '🐷'
  WHEN 'Digital Payments' THEN '📱'
  WHEN 'Banking' THEN '🏦'
  WHEN 'Credit' THEN '💳'
  WHEN 'Taxes' THEN '🧾'
  WHEN 'Investing' THEN '📈'
  WHEN 'Insurance' THEN '🛡️'
  WHEN 'Scam Awareness' THEN '🚨'
  ELSE '📘'
END;

ALTER TABLE "Lesson" DROP COLUMN "topic", DROP COLUMN "videoUrl";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "hint" TEXT;

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN "readinessAfter" INTEGER,
ADD COLUMN "readinessBefore" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "goal" "LearningGoal",
ADD COLUMN "stage" "LearnerStage",
ADD COLUMN "streakLastDay" TEXT;

-- CreateTable
CREATE TABLE "ScenarioAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "area" "ReadinessArea" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioAnswer_userId_lessonId_key" ON "ScenarioAnswer"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeAnswer_userId_day_key" ON "ChallengeAnswer"("userId", "day");

-- AddForeignKey
ALTER TABLE "ScenarioAnswer" ADD CONSTRAINT "ScenarioAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioAnswer" ADD CONSTRAINT "ScenarioAnswer_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
