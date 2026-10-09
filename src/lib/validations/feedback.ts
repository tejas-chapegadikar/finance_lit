import { z } from "zod";

export const FEEDBACK_COMMENT_MAX = 500;

export const lessonFeedbackSchema = z.object({
  helpful: z.boolean("Tell us whether the lesson was useful"),
  comment: z
    .string()
    .trim()
    .max(FEEDBACK_COMMENT_MAX, `Keep it under ${FEEDBACK_COMMENT_MAX} characters`)
    .transform((comment) => (comment === "" ? null : comment)),
});
