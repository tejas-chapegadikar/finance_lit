import { MAX_TRIES_PER_QUESTION } from "./constants";

type Try = { questionId: string; tryNumber: number; isCorrect: boolean };

export type QuestionOutcome = "first-try" | "with-coach" | "revealed";

/** How one question ended in one attempt, or null while the student is still trying. */
export function questionOutcome(tries: Try[]): QuestionOutcome | null {
  const correct = tries.find((t) => t.isCorrect);
  if (correct) {
    return correct.tryNumber === 1 ? "first-try" : "with-coach";
  }
  return tries.length >= MAX_TRIES_PER_QUESTION ? "revealed" : null;
}

// Mastery credit per question: solving it after Coach hints still shows
// learning, so it counts half; a revealed answer counts nothing.
const CREDIT: Record<QuestionOutcome, number> = {
  "first-try": 1,
  "with-coach": 0.5,
  revealed: 0,
};

export function summarizeAttempt(answers: Try[], totalQuestions: number) {
  const triesByQuestion = new Map<string, Try[]>();
  for (const answer of answers) {
    const tries = triesByQuestion.get(answer.questionId) ?? [];
    tries.push(answer);
    triesByQuestion.set(answer.questionId, tries);
  }

  const counts: Record<QuestionOutcome, number> = { "first-try": 0, "with-coach": 0, revealed: 0 };
  let credit = 0;
  for (const tries of triesByQuestion.values()) {
    const outcome = questionOutcome(tries);
    if (outcome) {
      counts[outcome] += 1;
      credit += CREDIT[outcome];
    }
  }

  return {
    firstTry: counts["first-try"],
    withCoach: counts["with-coach"],
    revealed: counts.revealed,
    resolved: counts["first-try"] + counts["with-coach"] + counts.revealed,
    mastery: totalQuestions > 0 ? Math.round((100 * credit) / totalQuestions) : 0,
  };
}
