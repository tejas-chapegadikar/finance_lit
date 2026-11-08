import { db } from "../db";
import { istDay } from "../ist-date";
import { CHALLENGES, HABIT_CHALLENGE, SAVING_CHALLENGES, findChallenge, type Challenge } from "./content";

export { CHALLENGES, HABIT_CHALLENGE, SAVING_CHALLENGES, findChallenge };
export type { Challenge, ChallengeStep } from "./content";

// Progress through a challenge. Steps go in order, one per IST day: finish
// today's and the next one opens tomorrow. Missing days costs nothing, the
// next step simply waits for you.

export type ChallengeProgress = {
  challenge: Challenge;
  enrolled: boolean;
  /** Steps done so far. */
  done: number;
  completed: boolean;
  /** A step was already done today, so the next one opens tomorrow. */
  doneToday: boolean;
  /** The next step's number (1 = first), or null when finished. */
  nextStep: number | null;
  checkIns: { stepNumber: number; day: string; choice: number | null }[];
};

type EnrollmentRow = {
  challengeId: string;
  completedAt: Date | null;
  checkIns: { stepNumber: number; day: string; choice: number | null }[];
};

function toProgress(challenge: Challenge, enrollment: EnrollmentRow | undefined, today: string): ChallengeProgress {
  const checkIns = [...(enrollment?.checkIns ?? [])].sort((a, b) => a.stepNumber - b.stepNumber);
  const done = checkIns.length;
  const completed = !!enrollment?.completedAt || done >= challenge.steps.length;
  return {
    challenge,
    enrolled: !!enrollment,
    done,
    completed,
    doneToday: checkIns.some((c) => c.day === today),
    nextStep: completed ? null : done + 1,
    checkIns,
  };
}

const enrollmentSelect = {
  challengeId: true,
  completedAt: true,
  checkIns: { select: { stepNumber: true, day: true, choice: true } },
} as const;

export async function getChallengeProgress(userId: string, challenge: Challenge, today = istDay()): Promise<ChallengeProgress> {
  const enrollment = await db.challengeEnrollment.findUnique({
    where: { userId_challengeId: { userId, challengeId: challenge.id } },
    select: enrollmentSelect,
  });
  return toProgress(challenge, enrollment ?? undefined, today);
}

/** Every challenge's progress for this student, in catalogue order. */
export async function getAllChallengeProgress(userId: string, today = istDay()): Promise<ChallengeProgress[]> {
  const enrollments = await db.challengeEnrollment.findMany({ where: { userId }, select: enrollmentSelect });
  return CHALLENGES.map((c) => toProgress(c, enrollments.find((e) => e.challengeId === c.id), today));
}
