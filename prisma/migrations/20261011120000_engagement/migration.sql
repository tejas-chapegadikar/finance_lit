-- Engagement release: the streak calendar and streak freezes, the Question of
-- the Day (renamed from the single-question "Daily Challenge"), the new
-- multi-step Daily Challenge, daily-mission bonuses, avatars and AI Coach
-- follow-up questions.

-- XP types: the old single-question challenge becomes the Question of the
-- Day; DAILY_CHALLENGE now means the new multi-step Daily Challenge.
ALTER TYPE "XPTransactionType" RENAME VALUE 'DAILY_CHALLENGE' TO 'QUESTION_OF_THE_DAY';
ALTER TYPE "XPTransactionType" ADD VALUE 'DAILY_CHALLENGE';
ALTER TYPE "XPTransactionType" ADD VALUE 'MISSION_BONUS';

-- Question of the Day rewards get their own key prefix, freeing
-- "daily-challenge:" for the new Daily Challenge.
UPDATE "XPTransaction"
SET "idempotencyKey" = 'question-of-the-day:' || substring("idempotencyKey" from 17)
WHERE "idempotencyKey" LIKE 'daily-challenge:%';
UPDATE "XPTransaction" SET "description" = 'Question of the Day' WHERE "description" = 'Today''s Money Challenge';

-- The Question of the Day tables, renamed (rows kept) from DailyChallenge / ChallengeAnswer.
ALTER TABLE "DailyChallenge" RENAME TO "DailyQuestion";
ALTER TABLE "DailyQuestion" RENAME CONSTRAINT "DailyChallenge_pkey" TO "DailyQuestion_pkey";
ALTER TABLE "ChallengeAnswer" RENAME TO "DailyQuestionAnswer";
ALTER TABLE "DailyQuestionAnswer" RENAME COLUMN "challengeId" TO "questionId";
ALTER TABLE "DailyQuestionAnswer" RENAME CONSTRAINT "ChallengeAnswer_pkey" TO "DailyQuestionAnswer_pkey";
ALTER TABLE "DailyQuestionAnswer" RENAME CONSTRAINT "ChallengeAnswer_userId_fkey" TO "DailyQuestionAnswer_userId_fkey";
ALTER TABLE "DailyQuestionAnswer" RENAME CONSTRAINT "ChallengeAnswer_challengeId_fkey" TO "DailyQuestionAnswer_questionId_fkey";
ALTER INDEX "ChallengeAnswer_userId_day_key" RENAME TO "DailyQuestionAnswer_userId_day_key";

-- Streak freezes (everyone starts with one) and the avatar. The old unused
-- freeze columns go.
ALTER TABLE "User" DROP COLUMN "streakFreezesAvailable",
DROP COLUMN "streakFreezesResetAt",
ADD COLUMN     "avatar" JSONB,
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "DailyChallengeRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "challengeKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallengeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "frozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachFollowUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeRun_userId_day_key" ON "DailyChallengeRun"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityDay_userId_day_key" ON "ActivityDay"("userId", "day");

-- CreateIndex
CREATE INDEX "CoachFollowUp_attemptId_questionId_idx" ON "CoachFollowUp"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "DailyChallengeRun" ADD CONSTRAINT "DailyChallengeRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityDay" ADD CONSTRAINT "ActivityDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachFollowUp" ADD CONSTRAINT "CoachFollowUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachFollowUp" ADD CONSTRAINT "CoachFollowUp_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachFollowUp" ADD CONSTRAINT "CoachFollowUp_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill the streak calendar from the activity recorded so far (IST days).
INSERT INTO "ActivityDay" ("id", "userId", "day")
SELECT 'bf' || md5("userId" || "day"), "userId", "day"
FROM (
    SELECT "userId", to_char("completedAt" + interval '330 minutes', 'YYYY-MM-DD') AS "day"
    FROM "QuizAttempt" WHERE "status" = 'COMPLETED' AND "completedAt" IS NOT NULL
    UNION
    SELECT "userId", "day" FROM "DailyQuestionAnswer"
    UNION
    SELECT "userId", to_char("answeredAt" + interval '330 minutes', 'YYYY-MM-DD')
    FROM "RevisionAnswer" WHERE "context" = 'REVIEW'
    UNION
    SELECT "userId", to_char("completedAt" + interval '330 minutes', 'YYYY-MM-DD') FROM "ScenarioRun"
) AS "days"
ON CONFLICT ("userId", "day") DO NOTHING;
