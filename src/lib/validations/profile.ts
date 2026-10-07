import { z } from "zod";
import { GOAL_VALUES, STAGE_VALUES } from "../learner-profile";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Your name must be at least 2 characters")
  .max(40, "Your name must be 40 characters or fewer");

export const stageSchema = z.enum(STAGE_VALUES, "Pick where you are right now");

export const goalSchema = z.enum(GOAL_VALUES, "Pick what you want to get better at");

// College is optional and free text — students type their own college name.
export const collegeNameSchema = z
  .string()
  .trim()
  .max(200, "College name is too long")
  .transform((name) => (name === "" ? null : name));

export const profileSchema = z.object({
  displayName: displayNameSchema,
  stage: stageSchema,
  collegeName: collegeNameSchema,
});

export type ProfileInput = z.input<typeof profileSchema>;
