export const QUESTIONS_PER_QUIZ = 5;
// A wrong pick earns a Coach hint and another try; after this many tries
// the answer is revealed with its explanation.
export const MAX_TRIES_PER_QUESTION = 3;

export const DAILY_CHALLENGE_XP = 25;
// Awarded once, the first time a student has completed every Level 1 lesson.
export const LEVEL_COMPLETION_XP = 200;

export const LEVEL_1_NAME = "Financial Foundations";
// Shown as "coming soon" until its curriculum is ready.
export const LEVEL_2_NAME = "Real-World Money";

// User-facing copy for empty and error states.
export const NO_LESSONS_MESSAGE = "Lessons are being prepared. Please check back soon!";
export const NO_CHALLENGE_MESSAGE = "Today's challenge is being prepared. Please check back soon!";
export const COACH_UNAVAILABLE_MESSAGE =
  "Your AI Coach is temporarily unavailable. You can still use the lesson hint and explanation to continue learning.";
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const SLOW_DOWN_MESSAGE = "You're going a little fast — wait a moment and try again.";
