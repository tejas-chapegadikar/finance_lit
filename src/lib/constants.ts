export const QUESTIONS_PER_QUIZ = 5;
// A wrong pick earns a Coach hint and another try; after this many tries
// the answer is revealed with its explanation.
export const MAX_TRIES_PER_QUESTION = 3;

// The single Question of the Day — quick, so a small reward.
export const QUESTION_OF_THE_DAY_XP = 10;
// The multi-step Daily Challenge.
export const DAILY_CHALLENGE_XP = 25;
// Finishing all three daily missions.
export const MISSION_BONUS_XP = 30;
// Awarded once, the first time a student has completed every lesson in the
// path (all four levels).
export const LEVEL_COMPLETION_XP = 200;

// The learning path: four levels that open in order (src/lib/journey.ts).
export const PATH_NAME = "Financial Foundations";
// The next path — shown as "coming soon" until its curriculum is ready.
export const NEXT_PATH_NAME = "Real-World Money";

// User-facing copy for empty and error states.
export const NO_LESSONS_MESSAGE = "Lessons are being prepared. Please check back soon!";
export const NO_QUESTION_MESSAGE = "Today's question is being prepared. Please check back soon!";
export const COACH_UNAVAILABLE_MESSAGE =
  "Your AI Coach is temporarily unavailable. You can still use the lesson hint and explanation to continue learning.";
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const SLOW_DOWN_MESSAGE = "You're going a little fast — wait a moment and try again.";
