-- Money Manager v2: the seven spending categories students asked for, and
-- XP for reaching a savings goal. No rows are deleted: entries keep their
-- amounts and dates and only move to the matching new category; budgets
-- that merge into one category are added together.
--
--   rent, bills            → bills           (Bills & rent)
--   mess, eating-out       → food
--   transport              → travel
--   study                  → education
--   fun                    → entertainment
--   shopping               → shopping
--   health, gifts, other   → other           (Others)

-- AlterEnum
ALTER TYPE "XPTransactionType" ADD VALUE 'SAVINGS_GOAL';

-- Entries: move each expense to its new category.
UPDATE "MoneyEntry"
SET "category" = CASE "category"
    WHEN 'rent' THEN 'bills'
    WHEN 'mess' THEN 'food'
    WHEN 'eating-out' THEN 'food'
    WHEN 'transport' THEN 'travel'
    WHEN 'study' THEN 'education'
    WHEN 'fun' THEN 'entertainment'
    WHEN 'health' THEN 'other'
    WHEN 'gifts' THEN 'other'
    ELSE "category"
  END
WHERE "kind" = 'EXPENSE'
  AND "category" IN ('rent', 'mess', 'eating-out', 'transport', 'study', 'fun', 'health', 'gifts');

-- Budgets: categories that merge are summed into one row per month.
CREATE TEMP TABLE "_budget_map" AS
SELECT "userId", "month",
  CASE "category"
    WHEN 'rent' THEN 'bills'
    WHEN 'mess' THEN 'food'
    WHEN 'eating-out' THEN 'food'
    WHEN 'transport' THEN 'travel'
    WHEN 'study' THEN 'education'
    WHEN 'fun' THEN 'entertainment'
    WHEN 'health' THEN 'other'
    WHEN 'gifts' THEN 'other'
    ELSE "category"
  END AS "category",
  SUM("amount")::int AS "amount",
  MIN("id") AS "id"
FROM "MoneyBudget"
GROUP BY 1, 2, 3;

DELETE FROM "MoneyBudget";

INSERT INTO "MoneyBudget" ("id", "userId", "month", "category", "amount", "updatedAt")
SELECT "id", "userId", "month", "category", "amount", CURRENT_TIMESTAMP FROM "_budget_map";

DROP TABLE "_budget_map";
