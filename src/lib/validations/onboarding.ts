import { z } from "zod";
import { collegeNameSchema, displayNameSchema, stageSchema } from "./profile";

// First login asks for three things only: your name (required, shown on your
// profile), your college and your year (both optional). Same rules as Settings.
export const onboardingSchema = z.object({
  name: displayNameSchema,
  collegeName: collegeNameSchema,
  stage: stageSchema,
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
