import { z } from "zod";
import { QUESTIONS_PER_QUIZ } from "../constants";
import { READINESS_AREA_VALUES } from "../readiness-areas";
import { choiceOptionsSchema, questionSchema } from "./question";

export const keyTermSchema = z.object({
  term: z.string().trim().min(1, "Term is required"),
  definition: z.string().trim().min(1, "Definition is required"),
});

// Mirrors the V1 lesson structure: header → hook → learn → important terms
// → real-life example → "What would you do?" scenario → quiz.
export const lessonSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated, e.g. budgeting-basics"),
  title: z.string().trim().min(1, "Title is required"),
  icon: z.string().trim().min(1, "Pick an emoji icon").max(16, "Use a single emoji"),
  area: z.enum(READINESS_AREA_VALUES, "Pick the category this lesson builds"),
  description: z.string().trim().min(1, "Description is required").max(200, "Keep it under 200 characters"),
  hook: z.string().trim().min(1, "Write the hook — a relatable situation to start with"),
  contentMarkdown: z.string().trim().min(1, "Lesson content is required"),
  keyTerms: z.array(keyTermSchema).min(1, "Add at least one important term").max(10, "Keep it to 10 terms or fewer"),
  example: z.string().trim().min(1, "Add a real-life Indian example"),
  scenarioPrompt: z.string().trim().min(1, "Write the scenario"),
  scenarioOptions: choiceOptionsSchema,
  scenarioExplanation: z.string().trim().min(1, "Explain the right choice"),
  estimatedMinutes: z.number().int().positive(),
  xpReward: z.number().int().min(1).max(500),
  isPublished: z.boolean(),
  order: z.number().int(),
  questions: z
    .array(questionSchema)
    .length(QUESTIONS_PER_QUIZ, `A lesson needs exactly ${QUESTIONS_PER_QUIZ} questions`),
});

export type LessonInput = z.infer<typeof lessonSchema>;
