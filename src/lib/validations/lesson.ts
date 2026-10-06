import { z } from "zod";
import { QUESTIONS_PER_QUIZ } from "../constants";
import { READINESS_AREA_VALUES } from "../readiness-areas";
import { questionSchema } from "./question";

export const lessonSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated, e.g. budgeting-basics"),
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  area: z.enum(READINESS_AREA_VALUES, "Pick the readiness area this lesson builds"),
  description: z.string().min(1, "Description is required"),
  contentMarkdown: z.string().min(1, "Lesson content is required"),
  // Video is mandatory, not just required-before-publish — every lesson
  // opens with an animated explainer video, per product decision.
  videoUrl: z.url("Enter a valid video URL"),
  estimatedMinutes: z.number().int().positive(),
  xpReward: z.number().int().min(1).max(500),
  isPublished: z.boolean(),
  order: z.number().int(),
  questions: z
    .array(questionSchema)
    .length(QUESTIONS_PER_QUIZ, `A lesson needs exactly ${QUESTIONS_PER_QUIZ} questions`),
});

export type LessonInput = z.infer<typeof lessonSchema>;
