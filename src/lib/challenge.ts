import { db } from "./db";
import { dayNumber, istDay } from "./ist-date";

/**
 * The challenge everyone gets on `day`: the published pool is walked in
 * order, one challenge per IST day, wrapping around at the end.
 */
export async function getChallengeForDay(day: string) {
  const where = { isPublished: true };
  const count = await db.dailyChallenge.count({ where });
  if (count === 0) return null;
  return db.dailyChallenge.findFirst({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    skip: dayNumber(day) % count,
  });
}

/** Today's challenge for this student, plus their answer if they've already taken it. */
export async function getTodaysChallenge(userId: string) {
  const day = istDay();
  const answer = await db.challengeAnswer.findUnique({
    where: { userId_day: { userId, day } },
    include: { challenge: true },
  });
  if (answer) {
    // Show what they actually answered, even if the pool changed since.
    return { day, challenge: answer.challenge, answer };
  }
  const challenge = await getChallengeForDay(day);
  return challenge ? { day, challenge, answer: null } : null;
}
