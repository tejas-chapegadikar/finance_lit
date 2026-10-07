import { z } from "zod";
import { OPTIONS_PER_QUESTION } from "../constants";

export const DIFFICULTY_VALUES = ["EASY", "MEDIUM", "HARD"] as const;

export const optionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

/** Four options with exactly one marked correct — quiz questions, scenarios and daily challenges. */
export const choiceOptionsSchema = z
  .array(optionSchema)
  .length(OPTIONS_PER_QUESTION, `Each question needs exactly ${OPTIONS_PER_QUESTION} options`)
  .refine((options) => options.filter((o) => o.isCorrect).length === 1, "Mark exactly one option as correct");

export const questionSchema = z.object({
  prompt: z.string().trim().min(1, "Question is required"),
  explanation: z.string().trim().min(1, "Explanation is required"),
  // Shown when the AI Coach is unavailable, so every question needs one.
  hint: z.string().trim().min(1, "Hint is required — it's shown when the AI Coach is unavailable"),
  difficulty: z.enum(DIFFICULTY_VALUES),
  options: choiceOptionsSchema,
});

export type QuestionInput = z.infer<typeof questionSchema>;
