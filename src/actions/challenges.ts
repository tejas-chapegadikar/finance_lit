"use server";

import { revalidatePath } from "next/cache";
import { SLOW_DB_TRANSACTION, db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth";
import { istDay } from "@/lib/ist-date";
import { isAllowed, moneyRatelimit } from "@/lib/ratelimit";
import { awardXp, lockUser, xpKeys } from "@/lib/xp";
import { recordStreakDay } from "@/lib/streak";
import { awardMoneyBadges } from "@/lib/badges";
import { findChallenge, getChallengeProgress } from "@/lib/challenges";

// Practice challenges: join, do today's step, and (once finished) start
// again. Steps go in order, one per IST day. Each step's XP is paid once
// ever, so restarting a challenge is for practice, not for points.

type Fail = { status: "not-found" | "slow-down" };

function refresh(challengeId: string) {
  revalidatePath(`/practice/challenges/${challengeId}`);
  revalidatePath("/practice");
  revalidatePath("/dashboard");
}

export async function joinChallenge(challengeId: string): Promise<{ status: "joined" } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const challenge = findChallenge(String(challengeId));
  if (!challenge) return { status: "not-found" };
  await db.challengeEnrollment.createMany({ data: [{ userId: user.id, challengeId: challenge.id }], skipDuplicates: true });
  refresh(challenge.id);
  return { status: "joined" };
}

export type StepResult =
  | { status: "done"; stepNumber: number; xpAwarded: number; finished: boolean; correct?: number; explanation?: string }
  | { status: "not-joined" | "come-back-tomorrow" | "finished" | "needs-checkin" | "invalid" }
  | Fail;

export async function completeChallengeStep(challengeId: string, choice?: number): Promise<StepResult> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const challenge = findChallenge(String(challengeId));
  if (!challenge) return { status: "not-found" };
  const day = istDay();

  const progress = await getChallengeProgress(user.id, challenge, day);
  if (!progress.enrolled) return { status: "not-joined" };
  if (progress.nextStep === null) return { status: "finished" };
  if (progress.doneToday) return { status: "come-back-tomorrow" };

  const stepNumber = progress.nextStep;
  const step = challenge.steps[stepNumber - 1];
  if (step.kind === "quiz") {
    if (!Number.isInteger(choice) || choice! < 0 || choice! >= (step.quiz?.options.length ?? 0)) return { status: "invalid" };
  }
  if (step.kind === "log") {
    const checkedIn = await db.moneyCheckIn.count({ where: { userId: user.id, day } });
    if (!checkedIn) return { status: "needs-checkin" };
  }

  const result = await db.$transaction(async (tx) => {
    await lockUser(tx, user.id);
    const enrollment = await tx.challengeEnrollment.findUniqueOrThrow({
      where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
      select: { id: true },
    });
    // The unique indexes (one step per day, each step once) settle double-taps.
    const { count } = await tx.challengeCheckIn.createMany({
      data: [{ enrollmentId: enrollment.id, userId: user.id, stepNumber, day, choice: step.kind === "quiz" ? choice! : null }],
      skipDuplicates: true,
    });
    if (count === 0) return { status: "come-back-tomorrow" as const };

    let xpAwarded = await awardXp(tx, {
      userId: user.id,
      amount: challenge.stepXp,
      type: "PRACTICE_CHALLENGE",
      idempotencyKey: xpKeys.challengeStep(user.id, challenge.id, stepNumber),
      description: `${challenge.title} · step ${stepNumber}`,
    });
    const finished = stepNumber === challenge.steps.length;
    if (finished) {
      await tx.challengeEnrollment.update({ where: { id: enrollment.id }, data: { completedAt: new Date() } });
      xpAwarded += await awardXp(tx, {
        userId: user.id,
        amount: challenge.finishXp,
        type: "PRACTICE_CHALLENGE",
        idempotencyKey: xpKeys.challengeDone(user.id, challenge.id),
        description: `Finished: ${challenge.title}`,
      });
      await awardMoneyBadges(tx, user.id);
    }
    await recordStreakDay(tx, user.id);
    return { status: "done" as const, stepNumber, xpAwarded, finished };
  }, SLOW_DB_TRANSACTION);

  refresh(challenge.id);
  if (result.status === "done" && step.quiz) return { ...result, correct: step.quiz.correct, explanation: step.quiz.explanation };
  return result;
}

/** Starts a finished challenge over — for practice; steps already paid don't pay again. */
export async function restartChallenge(challengeId: string): Promise<{ status: "restarted" | "not-finished" } | Fail> {
  const user = await requireOnboardedUser();
  if (!(await isAllowed(moneyRatelimit, user.id))) return { status: "slow-down" };
  const challenge = findChallenge(String(challengeId));
  if (!challenge) return { status: "not-found" };
  const enrollment = await db.challengeEnrollment.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
    select: { id: true, completedAt: true },
  });
  if (!enrollment?.completedAt) return { status: "not-finished" };
  await db.$transaction([
    db.challengeCheckIn.deleteMany({ where: { enrollmentId: enrollment.id } }),
    db.challengeEnrollment.update({ where: { id: enrollment.id }, data: { completedAt: null, startedAt: new Date() } }),
  ]);
  refresh(challenge.id);
  return { status: "restarted" };
}
