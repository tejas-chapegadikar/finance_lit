import { db } from "./db";
import { istDay, istDayStart } from "./ist-date";
import { seededPick } from "./seeded";
import { xpKeys } from "./xp";

// Daily missions: three small, always-achievable goals a day — learn
// something, answer some questions, practise. Which variants a student gets
// rotates daily (picked from their id and the date), and progress is counted
// from what they actually did today, so nothing extra is stored.

export type MissionId = "lesson" | "answer-3" | "correct-3" | "question" | "scenario" | "challenge";

type MissionDef = { id: MissionId; icon: string; title: string; detail: string; target: number; href: string };

const LEARN: MissionDef[] = [
  { id: "lesson", icon: "📚", title: "Complete a lesson quiz", detail: "A new lesson or a retake", target: 1, href: "/lessons" },
];

const ANSWER: MissionDef[] = [
  { id: "answer-3", icon: "✍️", title: "Answer 3 questions", detail: "Quizzes, revision or the daily question", target: 3, href: "/lessons#daily" },
  { id: "correct-3", icon: "🎯", title: "Get 3 answers right", detail: "Quizzes, revision or the daily question", target: 3, href: "/lessons#daily" },
  { id: "question", icon: "❓", title: "Answer the Question of the Day", detail: "About 1 minute", target: 1, href: "/question" },
];

const PRACTISE: MissionDef[] = [
  { id: "scenario", icon: "🎮", title: "Play a money scenario", detail: "Replays count too", target: 1, href: "/lessons#scenarios" },
  { id: "challenge", icon: "⚡", title: "Finish the Daily Challenge", detail: "A few quick questions", target: 1, href: "/challenge" },
];

export type Mission = MissionDef & { progress: number; done: boolean };

export type DailyMissions = { day: string; missions: Mission[]; allDone: boolean; bonusClaimed: boolean };

/** Today's three missions for this student, with progress. */
export async function getDailyMissions(userId: string, day = istDay()): Promise<DailyMissions> {
  const picked = [LEARN[0], seededPick(ANSWER, `answer:${userId}:${day}`), seededPick(PRACTISE, `practise:${userId}:${day}`)];
  const since = istDayStart(day);
  const today = { gte: since };

  const [lessons, quizAnswers, quizCorrect, revision, revisionCorrect, question, scenarios, challenge, bonus] =
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
    ]);

  const progressOf: Record<MissionId, number> = {
    lesson: lessons,
    "answer-3": quizAnswers + revision + (question ? 1 : 0),
    "correct-3": quizCorrect + revisionCorrect + (question?.isCorrect ? 1 : 0),
    question: question ? 1 : 0,
    scenario: scenarios,
    challenge: challenge ? 1 : 0,
  };

  const missions = picked.map((def) => {
    const progress = Math.min(progressOf[def.id], def.target);
    return { ...def, progress, done: progress >= def.target };
  });
  return { day, missions, allDone: missions.every((m) => m.done), bonusClaimed: !!bonus };
}
