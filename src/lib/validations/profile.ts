import { z } from "zod";
import { GOAL_VALUES, STAGE_VALUES } from "../learner-profile";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Your name must be at least 2 characters")
  .max(40, "Your name must be 40 characters or fewer");

export const stageSchema = z.enum(STAGE_VALUES, "Pick where you are right now");

// What they want to get better at: any number of topics, or none.
export const goalsSchema = z
  .array(z.enum(GOAL_VALUES, "Pick from the list"))
  .max(GOAL_VALUES.length)
  .transform((goals) => [...new Set(goals)]);

// College is optional and free text, students type their own college name.
export const collegeNameSchema = z
  .string()
  .trim()
  .max(200, "College name is too long")
  .transform((name) => (name === "" ? null : name));

export const profileSchema = z.object({
  displayName: displayNameSchema,
  stage: stageSchema,
  collegeName: collegeNameSchema,
  goals: goalsSchema,
});

export type ProfileInput = z.input<typeof profileSchema>;

export const reminderSchema = z.object({
  enabled: z.boolean(),
  hour: z.number().int().min(6, "Pick a time between 6 AM and 10 PM").max(22, "Pick a time between 6 AM and 10 PM"),
});
