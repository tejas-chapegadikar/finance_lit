import { db } from "./db";
import { istDay, istDayStart } from "./ist-date";
import { seededPick } from "./seeded";
import { xpKeys } from "./xp";
import { HABIT_CHALLENGE } from "./challenges/content";

// Daily missions: three small, always-achievable goals a day — one from each
// pillar: learn something, answer or practise something, and do something
// with your own money. Which variants a student gets rotates daily (picked
// from their id and the date), and progress is counted from what they
// actually did today, so nothing extra is stored.

export type MissionId =
  | "lesson"
  | "habit-step"
  | "answer-3"
  | "correct-3"
  | "question"
  | "scenario"
  | "challenge"
  | "money-checkin"
  | "save";

type MissionDef = { id: MissionId; title: string; detail: string; target: number; href: string };

const LESSON: MissionDef = { id: "lesson", title: "Complete a lesson quiz", detail: "A new lesson or a retake", target: 1, href: "/lessons" };
const HABIT_STEP: MissionDef = {
  id: "habit-step",
  title: "Do today's habit-challenge step",
  detail: "One small step of your 30 days",
  target: 1,
  href: `/practice/challenges/${HABIT_CHALLENGE.id}`,
};

const ANSWER: MissionDef[] = [
  { id: "answer-3", title: "Answer 3 questions", detail: "Quizzes, revision or the daily question", target: 3, href: "/practice#today" },
  { id: "correct-3", title: "Get 3 answers right", detail: "Quizzes, revision or the daily question", target: 3, href: "/practice#today" },
  { id: "question", title: "Answer the Reality Check", detail: "About 1 minute", target: 1, href: "/question" },
  { id: "scenario", title: "Play a money scenario", detail: "Replays count too", target: 1, href: "/practice#scenarios" },
  { id: "challenge", title: "Finish the Daily Challenge", detail: "A few quick questions", target: 1, href: "/challenge" },
];

const MONEY_CHECKIN: MissionDef = {
  id: "money-checkin",
  title: "Check in on your money",
  detail: "Log today's spends, or mark a no-spend day",
  target: 1,
  href: "/money",
};
const SAVE: MissionDef = { id: "save", title: "Add to a savings goal", detail: "Any amount counts", target: 1, href: "/money#goals" };

export type Mission = MissionDef & { progress: number; done: boolean };

export type DailyMissions = { day: string; missions: Mission[]; allDone: boolean; bonusClaimed: boolean };

/** Today's three missions for this student, with progress. */
export async function getDailyMissions(userId: string, day = istDay()): Promise<DailyMissions> {
  const since = istDayStart(day);
  const today = { gte: since };

  const [habit, goals] = await Promise.all([
    db.challengeEnrollment.findUnique({
      where: { userId_challengeId: { userId, challengeId: HABIT_CHALLENGE.id } },
      select: { completedAt: true },
    }),
    db.savingsGoal.count({ where: { userId, completedAt: null } }),
  ]);
  const inHabit = !!habit && !habit.completedAt;

  // Slot 1: learn — a lesson, or (on some days) the habit challenge's step.
  // Slot 2: answer or practise. Slot 3: your own money.
  const learn = inHabit ? seededPick([LESSON, HABIT_STEP], `learn:${userId}:${day}`) : LESSON;
  const practise = seededPick(ANSWER, `answer:${userId}:${day}`);
  const money = goals > 0 ? seededPick([MONEY_CHECKIN, SAVE], `money:${userId}:${day}`) : MONEY_CHECKIN;
  const picked = [learn, practise, money];

  const [lessons, quizAnswers, quizCorrect, revision, revisionCorrect, question, scenarios, challenge, bonus, checkIn, deposits, habitStep] =
    await Promise.all([
      db.quizAttempt.count({ where: { userId, status: "COMPLETED", completedAt: today } }),
      // A question counts once, however many tries it took.
      db.quizAnswer.count({ where: { attempt: { userId }, answeredAt: today, tryNumber: 1 } }),
      db.quizAnswer.count({ where: { attempt: { userId }, answeredAt: today, isCorrect: true } }),
      db.revisionAnswer.count({ where: { userId, answeredAt: today } }),
      db.revisionAnswer.count({ where: { userId, answeredAt: today, isCorrect: true } }),
      db.dailyQuestionAnswer.findUnique({ where: { userId_day: { userId, day } }, select: { isCorrect: true } }),
      db.scenarioRun.count({ where: { userId, completedAt: today } }),
      db.dailyChallengeRun.findUnique({ where: { userId_day: { userId, day } }, select: { id: true } }),
      db.xPTransaction.findUnique({ where: { idempotencyKey: xpKeys.missionBonus(userId, day) }, select: { id: true } }),
      db.moneyCheckIn.findUnique({ where: { userId_day: { userId, day } }, select: { id: true } }),
      db.savingsDeposit.count({ where: { userId, day, amount: { gt: 0 } } }),
      db.challengeCheckIn.count({ where: { userId, day, enrollment: { challengeId: HABIT_CHALLENGE.id } } }),
    ]);

  const progressOf: Record<MissionId, number> = {
    lesson: lessons,
    "habit-step": habitStep,
    "answer-3": quizAnswers + revision + (question ? 1 : 0),
    "correct-3": quizCorrect + revisionCorrect + (question?.isCorrect ? 1 : 0),
    question: question ? 1 : 0,
    scenario: scenarios,
    challenge: challenge ? 1 : 0,
    "money-checkin": checkIn ? 1 : 0,
    save: deposits,
  };

  const missions = picked.map((def) => {
    const progress = Math.min(progressOf[def.id], def.target);
    return { ...def, progress, done: progress >= def.target };
  });
  return { day, missions, allDone: missions.every((m) => m.done), bonusClaimed: !!bonus };
}
