// Onboarding choices. Kept free of Prisma imports so client components can
// use them; values mirror the LearnerStage / LearningGoal enums.

export const LEARNER_STAGES = [
  { value: "FIRST_YEAR", label: "First year" },
  { value: "SECOND_YEAR", label: "Second year" },
  { value: "THIRD_YEAR", label: "Third year" },
  { value: "FINAL_YEAR", label: "Final year" },
  { value: "GRADUATE_WORKING", label: "Graduate / Working" },
] as const;

export const LEARNING_GOALS = [
  { value: "MANAGING_MONEY", label: "Managing money", icon: "💰" },
  { value: "CREDIT", label: "Understanding credit", icon: "💳" },
  { value: "AVOIDING_SCAMS", label: "Avoiding financial scams", icon: "🛡️" },
  { value: "SALARY_TAXES", label: "Understanding salary and taxes", icon: "🧾" },
  { value: "INVESTING", label: "Learning investing basics", icon: "📈" },
  { value: "EVERYTHING", label: "Everything", icon: "🚀" },
] as const;

export type LearnerStageValue = (typeof LEARNER_STAGES)[number]["value"];
export type LearningGoalValue = (typeof LEARNING_GOALS)[number]["value"];

export const STAGE_VALUES = LEARNER_STAGES.map((s) => s.value) as [LearnerStageValue, ...LearnerStageValue[]];
export const GOAL_VALUES = LEARNING_GOALS.map((g) => g.value) as [LearningGoalValue, ...LearningGoalValue[]];

export function stageLabel(stage: string | null): string | null {
  return LEARNER_STAGES.find((s) => s.value === stage)?.label ?? null;
}
