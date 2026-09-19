import { z } from "zod";
import { OPTIONS_PER_QUESTION } from "../constants";

export const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

export const questionSchema = z
  .object({
    prompt: z.string().min(1, "Question is required"),
    explanation: z.string().min(1, "Explanation is required"),
    options: z
      .array(optionSchema)
      .length(OPTIONS_PER_QUESTION, `Each question needs exactly ${OPTIONS_PER_QUESTION} options`),
  })
  .refine((q) => q.options.filter((o) => o.isCorrect).length === 1, {
    message: "Exactly one option must be marked correct",
    path: ["options"],
  });

export type QuestionInput = z.infer<typeof questionSchema>;
