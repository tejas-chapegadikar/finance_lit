-- "Understanding credit" joins the onboarding learning goals.
ALTER TYPE "LearningGoal" ADD VALUE 'CREDIT';

-- One key per reward, so a retried request can never pay the same reward twice.
-- Existing rows keep a NULL key (Postgres allows any number of NULLs).
ALTER TABLE "XPTransaction" ADD COLUMN     "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "XPTransaction_idempotencyKey_key" ON "XPTransaction"("idempotencyKey");

-- Earned badges are stored once awarded.
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "quizAttemptId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- "Was this lesson clear and useful?" answers from the completion screen.
CREATE TABLE "LessonFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonFeedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LessonFeedback_userId_lessonId_key" ON "LessonFeedback"("userId", "lessonId");
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
