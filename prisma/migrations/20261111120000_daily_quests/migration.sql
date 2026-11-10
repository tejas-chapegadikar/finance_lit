-- Daily quests. Additive: no existing data changes.
ALTER TYPE "XPTransactionType" ADD VALUE 'DAILY_QUEST';

CREATE TABLE "DailyQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "quest" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyQuest_userId_day_quest_key" ON "DailyQuest"("userId", "day", "quest");

ALTER TABLE "DailyQuest" ADD CONSTRAINT "DailyQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
