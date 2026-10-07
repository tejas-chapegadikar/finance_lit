import { z } from "zod";
import { collegeNameSchema, displayNameSchema, goalSchema, stageSchema } from "./profile";

export const onboardingSchema = z.object({
  displayName: displayNameSchema,
  stage: stageSchema,
  collegeName: collegeNameSchema,
  goal: goalSchema,
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
