-- Students can pick several learning goals. Additive: the old column stays.
ALTER TABLE "User" ADD COLUMN "goals" "LearningGoal"[] DEFAULT ARRAY[]::"LearningGoal"[];

UPDATE "User" SET "goals" = CASE
  WHEN "goal" = 'EVERYTHING' THEN ARRAY['MANAGING_MONEY', 'CREDIT', 'AVOIDING_SCAMS', 'SALARY_TAXES', 'INVESTING']::"LearningGoal"[]
  WHEN "goal" IS NOT NULL THEN ARRAY["goal"]
  ELSE ARRAY[]::"LearningGoal"[]
END;
