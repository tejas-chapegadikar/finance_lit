import type { Difficulty, ReadinessArea } from "@prisma/client";

export type SeedOption = { text: string; isCorrect: boolean };

export type SeedQuestion = {
  prompt: string;
  explanation: string;
  hint: string;
  difficulty: Difficulty;
  options: SeedOption[];
};

export type SeedLesson = {
  slug: string;
  title: string;
  icon: string;
  area: ReadinessArea;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  order: number;
  hook: string;
  learn: string;
  keyTerms: { term: string; definition: string }[];
  example: string;
  scenario: { prompt: string; options: SeedOption[]; explanation: string };
  questions: SeedQuestion[];
};

export type SeedChallenge = {
  key: string;
  area: ReadinessArea;
  prompt: string;
  options: SeedOption[];
  explanation: string;
};

/** choices(1, "a", "b", "c", "d") → options with the 2nd one marked correct. */
export function choices(correctIndex: number, ...texts: string[]): SeedOption[] {
  return texts.map((text, i) => ({ text, isCorrect: i === correctIndex }));
}
