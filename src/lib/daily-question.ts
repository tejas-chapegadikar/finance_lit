import { db } from "./db";
import { dayNumber, istDay, istDayStart } from "./ist-date";

/**
 * The Question of the Day this student gets on `day`: a fresh one they
 * haven't answered yet, preferring the topic of the lesson they most recently
 * completed — learn about scams on Monday, get a scam question on Tuesday.
 * Only activity from before `day` counts, so the pick stays the same all day.
 * Once they've answered the whole pool, it rotates by date.
 */
export async function getQuestionForUser(userId: string, day: string) {
  const [questions, answered, lastCompleted] = await Promise.all([
    db.dailyQuestion.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    }),
    db.dailyQuestionAnswer.findMany({ where: { userId, day: { lt: day } }, select: { questionId: true } }),
    db.quizAttempt.findFirst({
      where: { userId, status: "COMPLETED", completedAt: { lt: istDayStart(day) } },
      orderBy: { completedAt: "desc" },
      select: { lesson: { select: { area: true } } },
    }),
  ]);
  if (questions.length === 0) return null;

  const done = new Set(answered.map((answer) => answer.questionId));
  const fresh = questions.filter((question) => !done.has(question.id));
  if (fresh.length === 0) return questions[dayNumber(day) % questions.length];

  const area = lastCompleted?.lesson.area;
  return (area && fresh.find((question) => question.area === area)) || fresh[0];
}

/** Today's question for this student, plus their answer if they've already given one. */
export async function getTodaysQuestion(userId: string) {
  const day = istDay();
  const answer = await db.dailyQuestionAnswer.findUnique({
    where: { userId_day: { userId, day } },
    include: { question: true },
  });
  if (answer) {
    // Show what they actually answered, even if the pool changed since.
    return { day, question: answer.question, answer };
  }
  const question = await getQuestionForUser(userId, day);
  return question ? { day, question, answer: null } : null;
}
