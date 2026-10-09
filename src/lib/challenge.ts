import { db } from "./db";
import { dayNumber, istDay, istDayStart } from "./ist-date";

/**
 * The challenge this student gets on `day`: a fresh one they haven't answered
 * yet, preferring the topic of the lesson they most recently completed —
 * learn about scams on Monday, get a scam decision on Tuesday. Only activity
 * from before `day` counts, so the pick stays the same all day. Once they've
 * answered the whole pool, it rotates by date.
 */
export async function getChallengeForUser(userId: string, day: string) {
  const [challenges, answered, lastCompleted] = await Promise.all([
    db.dailyChallenge.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    }),
    db.challengeAnswer.findMany({ where: { userId, day: { lt: day } }, select: { challengeId: true } }),
    db.quizAttempt.findFirst({
      where: { userId, status: "COMPLETED", completedAt: { lt: istDayStart(day) } },
      orderBy: { completedAt: "desc" },
      select: { lesson: { select: { area: true } } },
    }),
  ]);
  if (challenges.length === 0) return null;

  const done = new Set(answered.map((answer) => answer.challengeId));
  const fresh = challenges.filter((challenge) => !done.has(challenge.id));
  if (fresh.length === 0) return challenges[dayNumber(day) % challenges.length];

  const area = lastCompleted?.lesson.area;
  return (area && fresh.find((challenge) => challenge.area === area)) || fresh[0];
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
  const challenge = await getChallengeForUser(userId, day);
  return challenge ? { day, challenge, answer: null } : null;
}
