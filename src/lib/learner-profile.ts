// Onboarding choices. Kept free of Prisma imports so client components can
// use them; values mirror the LearnerStage / LearningGoal enums.

export const LEARNER_STAGES = [
  { value: "FIRST_YEAR", label: "1st Year" },
  { value: "SECOND_YEAR", label: "2nd Year" },
  { value: "THIRD_YEAR", label: "3rd Year" },
  { value: "FINAL_YEAR", label: "Final Year" },
  { value: "GRADUATE_WORKING", label: "Graduate / Working" },
] as const;

export const LEARNING_GOALS = [
  { value: "MANAGING_MONEY", label: "Managing money", icon: "💰" },
  { value: "INVESTING", label: "Understanding investing", icon: "📈" },
  { value: "AVOIDING_SCAMS", label: "Avoiding scams", icon: "🛡️" },
  { value: "SALARY_TAXES", label: "Understanding salary & taxes", icon: "🧾" },
  { value: "EVERYTHING", label: "Everything", icon: "🚀" },
] as const;

export type LearnerStageValue = (typeof LEARNER_STAGES)[number]["value"];
export type LearningGoalValue = (typeof LEARNING_GOALS)[number]["value"];

export const STAGE_VALUES = LEARNER_STAGES.map((s) => s.value) as [LearnerStageValue, ...LearnerStageValue[]];
export const GOAL_VALUES = LEARNING_GOALS.map((g) => g.value) as [LearningGoalValue, ...LearningGoalValue[]];

export function stageLabel(stage: string | null): string | null {
  return LEARNER_STAGES.find((s) => s.value === stage)?.label ?? null;
}
