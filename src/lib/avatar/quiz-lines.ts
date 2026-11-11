import { QUIZ, pick, seedOf } from "../../content/buddy-messages";

// The buddy's reactions to quiz answers (words in src/content/buddy-messages.ts).
// Picked from a seed (the question's text) so server and browser agree.

export const rightLine = (seed: string) => pick(QUIZ.right, seedOf(seed));
export const wrongLine = (seed: string) => pick(QUIZ.wrong, seedOf(seed));

/** A verdict on a whole quiz, from its accuracy out of 100. */
export function verdictFor(accuracy: number, seed = "") {
  const band = accuracy >= 100 ? QUIZ.verdict.perfect : accuracy >= 80 ? QUIZ.verdict.good : accuracy >= 60 ? QUIZ.verdict.pass : QUIZ.verdict.rough;
  return pick(band, seedOf(seed));
}
