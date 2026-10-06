import { db } from "./db";
import { questionOutcome } from "./quiz-outcome";

const DAY_MS = 24 * 60 * 60 * 1000;

export type Rate = { numerator: number; denominator: number };

const rate = (numerator: number, denominator: number): Rate => ({ numerator, denominator });

/**
 * The blueprint's "metrics that matter" (§21), computed from what the app
 * stores. Students only — admin accounts are excluded so the founder's own
 * testing doesn't skew the numbers. Loads raw rows and aggregates in memory,
 * which is fine at launch-cohort scale (hundreds of students).
 */
export async function getLaunchMetrics(now = new Date()) {
  const students = { user: { role: "STUDENT" as const } };

  const [users, viewers, attempts, answers] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, createdAt: true, lastActivityDate: true },
    }),
    db.lessonView.findMany({ where: students, select: { userId: true }, distinct: ["userId"] }),
    db.quizAttempt.findMany({
      where: students,
      select: { userId: true, lessonId: true, status: true, mastery: true, completedAt: true },
    }),
    db.quizAnswer.findMany({
      where: { attempt: students },
      select: { attemptId: true, questionId: true, tryNumber: true, isCorrect: true },
    }),
  ]);

  // Funnel
  const viewedLesson = new Set(viewers.map((v) => v.userId));
  const startedQuiz = new Set(attempts.map((a) => a.userId));
  const completedLessons = new Map<string, Set<string>>();
  for (const attempt of attempts) {
    if (attempt.status !== "COMPLETED") continue;
    const lessons = completedLessons.get(attempt.userId) ?? new Set<string>();
    lessons.add(attempt.lessonId);
    completedLessons.set(attempt.userId, lessons);
  }
  const quizAfterLesson = [...viewedLesson].filter((id) => startedQuiz.has(id)).length;
  const threePlus = [...completedLessons.values()].filter((lessons) => lessons.size >= 3).length;

  // AI Coach: every wrong first try gets a hint; did the student try again,
  // and did they get there before the answer was revealed?
  const triesByQuestion = new Map<string, typeof answers>();
  for (const answer of answers) {
    const key = `${answer.attemptId}|${answer.questionId}`;
    const tries = triesByQuestion.get(key) ?? [];
    tries.push(answer);
    triesByQuestion.set(key, tries);
  }
  let coached = 0;
  let retried = 0;
  let recovered = 0;
  let revealed = 0;
  for (const tries of triesByQuestion.values()) {
    const first = tries.find((t) => t.tryNumber === 1);
    if (!first || first.isCorrect) continue;
    coached++;
    if (tries.length >= 2) retried++;
    const outcome = questionOutcome(tries);
    if (outcome === "with-coach") recovered++;
    if (outcome === "revealed") revealed++;
  }

  // Quiz improvement: first vs latest completed attempt of the same lesson.
  const completedByLesson = new Map<string, { mastery: number; completedAt: Date }[]>();
  for (const attempt of attempts) {
    if (attempt.status !== "COMPLETED" || attempt.mastery === null || !attempt.completedAt) continue;
    const key = `${attempt.userId}|${attempt.lessonId}`;
    const list = completedByLesson.get(key) ?? [];
    list.push({ mastery: attempt.mastery, completedAt: attempt.completedAt });
    completedByLesson.set(key, list);
  }
  let retakes = 0;
  let improved = 0;
  let totalDelta = 0;
  for (const list of completedByLesson.values()) {
    if (list.length < 2) continue;
    list.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    const delta = list[list.length - 1].mastery - list[0].mastery;
    retakes++;
    totalDelta += delta;
    if (delta > 0) improved++;
  }

  // Retention: came back at least N days after signing up, among students
  // who signed up at least N days ago.
  const retention = (days: number) => {
    const eligible = users.filter((u) => now.getTime() - u.createdAt.getTime() >= days * DAY_MS);
    const returned = eligible.filter(
      (u) => u.lastActivityDate && u.lastActivityDate.getTime() - u.createdAt.getTime() >= days * DAY_MS,
    );
    return rate(returned.length, eligible.length);
  };

  return {
    signups: users.length,
    funnel: {
      firstLesson: rate(viewedLesson.size, users.length),
      quizAfterLesson: rate(quizAfterLesson, viewedLesson.size),
      threePlusLessons: rate(threePlus, users.length),
    },
    coach: {
      retry: rate(retried, coached),
      recovery: rate(recovered, recovered + revealed),
    },
    improvement: {
      improved: rate(improved, retakes),
      averageDelta: retakes ? Math.round(totalDelta / retakes) : null,
    },
    retention: { day7: retention(7), day30: retention(30) },
  };
}
