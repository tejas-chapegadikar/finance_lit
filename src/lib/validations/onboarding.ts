import { z } from "zod";
import { collegeNameSchema, displayNameSchema, goalsSchema, stageSchema } from "./profile";

export const onboardingSchema = z.object({
  displayName: displayNameSchema,
  stage: stageSchema,
  collegeName: collegeNameSchema,
  goals: goalsSchema,
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
