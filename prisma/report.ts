import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// `npm run report` — the launch metrics, read straight from the database.
// Students = everyone who finished onboarding. A "meaningful learning
// action" is a completed lesson quiz, a completed scenario, a Question of the
// Day answer, a Daily Challenge or a revision answer. Days are IST calendar days.

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const IST_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const istDayNumber = (d: Date) => Math.floor((d.getTime() + IST_MS) / DAY_MS);

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "—");
const row = (name: string, value: string, detail: string) =>
  console.log(`${name.padEnd(36)} ${value.padStart(6)}   ${detail}`);

async function main() {
  const students = await db.user.findMany({
    where: { onboardingCompletedAt: { not: null } },
    select: { id: true, createdAt: true, longestStreak: true, avatar: true },
  });
  const ids = students.map((s) => s.id);
  const mine = { userId: { in: ids } };

  const [views, attempts, answers, runs, questions, challenges, revision, unlocks, bonuses, activeDays, followUps, lessons] =
    await Promise.all([
      db.lessonView.findMany({ where: mine, select: { userId: true, lessonId: true } }),
      db.quizAttempt.findMany({ where: mine, select: { userId: true, lessonId: true, status: true, mastery: true, completedAt: true } }),
      db.quizAnswer.findMany({ where: { attempt: mine }, select: { attemptId: true, questionId: true, tryNumber: true, isCorrect: true } }),
      db.scenarioRun.findMany({ where: mine, select: { userId: true, completedAt: true } }),
      db.dailyQuestionAnswer.findMany({ where: mine, select: { userId: true, answeredAt: true } }),
      db.dailyChallengeRun.findMany({ where: mine, select: { userId: true, completedAt: true } }),
      db.revisionAnswer.findMany({ where: mine, select: { userId: true, answeredAt: true, isCorrect: true, context: true, itemId: true } }),
      db.rewardUnlock.findMany({ where: mine, select: { userId: true, rewardId: true } }),
      db.xPTransaction.findMany({ where: { ...mine, type: "MISSION_BONUS" }, select: { userId: true } }),
      db.activityDay.findMany({ where: { ...mine, frozen: false }, select: { userId: true, day: true } }),
      db.coachFollowUp.findMany({ where: mine, select: { userId: true, questionId: true, createdAt: true } }),
      db.lesson.count({ where: { isPublished: true } }),
    ]);
  const completed = attempts.filter((a) => a.status === "COMPLETED");

  // Funnel
  const viewed = new Set(views.map((v) => v.userId));
  const finishedOne = new Set(completed.map((a) => a.userId));
  const startedPairs = new Set([...views, ...attempts].map((x) => `${x.userId}|${x.lessonId}`));
  const completedPairs = new Set(completed.map((a) => `${a.userId}|${a.lessonId}`));
  const lessonsPerStudent = new Map<string, Set<string>>();
  for (const a of completed) lessonsPerStudent.set(a.userId, (lessonsPerStudent.get(a.userId) ?? new Set()).add(a.lessonId));
  const threePlus = [...lessonsPerStudent.values()].filter((s) => s.size >= 3).length;
  const levelOne = [...lessonsPerStudent.values()].filter((s) => lessons > 0 && s.size >= lessons).length;

  // Quiz improvement: first vs best later attempt on the same lesson.
  const byPair = new Map<string, number[]>();
  for (const a of completed.sort((x, y) => x.completedAt!.getTime() - y.completedAt!.getTime())) {
    const key = `${a.userId}|${a.lessonId}`;
    byPair.set(key, [...(byPair.get(key) ?? []), a.mastery ?? 0]);
  }
  const retaken = [...byPair.values()].filter((m) => m.length > 1);
  const improved = retaken.filter((m) => Math.max(...m.slice(1)) > m[0]).length;

  // AI Coach retry success: of questions missed first time, how many were solved before the answer was shown.
  const tries = new Map<string, typeof answers>();
  for (const a of answers) tries.set(`${a.attemptId}|${a.questionId}`, [...(tries.get(`${a.attemptId}|${a.questionId}`) ?? []), a]);
  let coached = 0;
  let recovered = 0;
  for (const list of tries.values()) {
    const first = list.find((t) => t.tryNumber === 1);
    if (!first || first.isCorrect) continue;
    coached++;
    if (list.some((t) => t.isCorrect)) recovered++;
  }

  // Retention: a meaningful action on day 1 after signup, or in days 7–13.
  const actions = new Map<string, number[]>();
  const add = (userId: string, date: Date | null) => {
    if (date) actions.set(userId, [...(actions.get(userId) ?? []), istDayNumber(date)]);
  };
  completed.forEach((a) => add(a.userId, a.completedAt));
  runs.forEach((r) => add(r.userId, r.completedAt));
  questions.forEach((q) => add(q.userId, q.answeredAt));
  challenges.forEach((c) => add(c.userId, c.completedAt));
  revision.filter((r) => r.context === "REVIEW").forEach((r) => add(r.userId, r.answeredAt));
  const today = istDayNumber(new Date());
  const retention = (from: number, to: number) => {
    const eligible = students.filter((s) => today - istDayNumber(s.createdAt) >= to);
    const returned = eligible.filter((s) => {
      const start = istDayNumber(s.createdAt);
      return (actions.get(s.id) ?? []).some((d) => d - start >= from && d - start <= to);
    });
    return { n: returned.length, d: eligible.length };
  };
  const d1 = retention(1, 1);
  const d7 = retention(7, 13);

  const reviews = revision.filter((r) => r.context === "REVIEW");
  const checks = revision.filter((r) => r.context === "COACH_CHECK");
  const recentlyActive = new Set(
    [...actions.entries()].filter(([, days]) => days.some((d) => today - d < 7)).map(([id]) => id),
  );
  const dailyDoers7 = new Set(
    [...questions.map((q) => ({ userId: q.userId, at: q.answeredAt })), ...challenges.map((c) => ({ userId: c.userId, at: c.completedAt }))]
      .filter((x) => today - istDayNumber(x.at) < 7)
      .map((x) => x.userId),
  );
  const redeemers = new Set(unlocks.map((u) => u.userId));
  const avatarItems = unlocks.filter((u) => !u.rewardId.startsWith("title-") && !u.rewardId.startsWith("theme-") && !u.rewardId.startsWith("scenario-"));

  // Streaks: of students who reached a 2-day streak, how many kept going to 3 and to 7.
  const twoPlus = students.filter((s) => s.longestStreak >= 2).length;
  const threePlusStreak = students.filter((s) => s.longestStreak >= 3).length;
  const sevenPlusStreak = students.filter((s) => s.longestStreak >= 7).length;

  // Daily missions: bonus days out of all active days.
  const activeDayCount = activeDays.length;

  // AI Coach follow-ups: how many, on how many distinct questions.
  const followUpQuestions = new Set(followUps.map((f) => `${f.userId}|${f.questionId}`));

  console.log(`\nStockStreak launch metrics — ${students.length} students\n`);
  row("Signup → opened first lesson", pct(viewed.size, students.length), `${viewed.size} of ${students.length}`);
  row("Signup → completed first lesson", pct(finishedOne.size, students.length), `${finishedOne.size} of ${students.length}`);
  row("Lesson completion rate", pct(completedPairs.size, startedPairs.size), `${completedPairs.size} of ${startedPairs.size} started lessons`);
  row("3+ lessons completed", pct(threePlus, students.length), `${threePlus} students`);
  row("All 4 levels completed", pct(levelOne, students.length), `${levelOne} students`);
  row("Quiz improvement on retakes", pct(improved, retaken.length), `${improved} of ${retaken.length} retaken lessons improved`);
  row("Day-1 retention", pct(d1.n, d1.d), `${d1.n} of ${d1.d} came back the day after signing up`);
  row("Day-7 retention (days 7–13)", pct(d7.n, d7.d), `${d7.n} of ${d7.d} came back in their second week`);
  row("Daily mission completion", pct(bonuses.length, activeDayCount), `${bonuses.length} all-missions days of ${activeDayCount} active days`);
  row("Streak continuation (2 → 3 days)", pct(threePlusStreak, twoPlus), `${threePlusStreak} of ${twoPlus} students; ${sevenPlusStreak} reached 7 days`);
  row("Daily question/challenge (7d)", pct(dailyDoers7.size, recentlyActive.size), `${dailyDoers7.size} of ${recentlyActive.size} recently active students`);
  row("Revision accuracy", pct(reviews.filter((r) => r.isCorrect).length, reviews.length), `${reviews.length} revision answers`);
  row("AI Coach retry success", pct(recovered, coached), `${recovered} of ${coached} missed questions solved after a hint`);
  row("Coach check accuracy", pct(checks.filter((r) => r.isCorrect).length, checks.length), `${checks.length} follow-up checks`);
  row("AI Coach follow-ups asked", String(followUps.length), `about ${followUpQuestions.size} questions, by ${new Set(followUps.map((f) => f.userId)).size} students`);
  row("Reward redemption", pct(redeemers.size, students.length), `${unlocks.length} unlocks by ${redeemers.size} students (${avatarItems.length} avatar items)`);
  row("Custom avatars", pct(students.filter((s) => s.avatar !== null).length, students.length), "students who saved an avatar");
  console.log("\nVisitor → signup needs page analytics (e.g. Vercel Web Analytics) once deployed.\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
