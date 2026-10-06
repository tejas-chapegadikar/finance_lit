-- CreateEnum
CREATE TYPE "ReadinessArea" AS ENUM ('BUDGETING', 'DIGITAL_SAFETY', 'BANKING', 'CREDIT', 'TAX', 'INVESTING');

-- AlterTable: add Lesson.area empty first, backfill existing lessons from the
-- blueprint's curriculum groups (Foundation -> Budgeting, Money Safety ->
-- Digital Safety, First Salary -> Tax, Growing Money -> Investing), then
-- require it.
ALTER TABLE "Lesson" ADD COLUMN "area" "ReadinessArea";

UPDATE "Lesson" SET "area" = (CASE
  WHEN "slug" = 'compound-interest' THEN 'BUDGETING'
  WHEN "topic" IN ('Budgeting', 'Saving') THEN 'BUDGETING'
  WHEN "topic" IN ('Digital Payments', 'Scam Awareness') THEN 'DIGITAL_SAFETY'
  WHEN "topic" = 'Banking' THEN 'BANKING'
  WHEN "topic" = 'Credit' THEN 'CREDIT'
  WHEN "topic" = 'Taxes' THEN 'TAX'
  ELSE 'INVESTING'
END)::"ReadinessArea";

ALTER TABLE "Lesson" ALTER COLUMN "area" SET NOT NULL;

-- AlterTable: multiple tries per question (Coach hint between tries)
DROP INDEX "QuizAnswer_attemptId_questionId_key";
ALTER TABLE "QuizAnswer" ADD COLUMN "tryNumber" INTEGER NOT NULL DEFAULT 1;
CREATE UNIQUE INDEX "QuizAnswer_attemptId_questionId_tryNumber_key" ON "QuizAnswer"("attemptId", "questionId", "tryNumber");

-- AlterTable: mastery for already-completed attempts = first-try accuracy
ALTER TABLE "QuizAttempt" ADD COLUMN "mastery" INTEGER;
UPDATE "QuizAttempt"
SET "mastery" = ROUND("score" * 100.0 / NULLIF("totalQuestions", 0))
WHERE "status" = 'COMPLETED';

-- CreateTable
CREATE TABLE "CoachHint" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "wrongOptionIds" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachHint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachHint_questionId_wrongOptionIds_key" ON "CoachHint"("questionId", "wrongOptionIds");

-- AddForeignKey
ALTER TABLE "CoachHint" ADD CONSTRAINT "CoachHint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
