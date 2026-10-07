import { z } from "zod";
import { OPTIONS_PER_QUESTION } from "../constants";
import { READINESS_AREA_VALUES } from "../readiness-areas";
import { choiceOptionsSchema } from "./question";

export const challengeSchema = z.object({
  prompt: z.string().trim().min(1, "Write the challenge"),
  area: z.enum(READINESS_AREA_VALUES, "Pick a category"),
  options: choiceOptionsSchema,
  explanation: z.string().trim().min(1, "Explain the right answer"),
  isPublished: z.boolean(),
  order: z.number().int(),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;

export function emptyChallenge(order: number): ChallengeInput {
  return {
    prompt: "",
    area: "BUDGETING",
    options: Array.from({ length: OPTIONS_PER_QUESTION }, () => ({ text: "", isCorrect: false })),
    explanation: "",
    isPublished: true,
    order,
  };
}
