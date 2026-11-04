import { db } from "../db";
import type { Progress } from "../progress";
import { rankFor } from "../ranks";
import { AVATAR_ITEMS } from "../avatar";
import { queueAvatarEvents, type AvatarEventInput } from "./events";

/**
 * After a quiz is completed: what changed, as avatar reactions. Compares the
 * student's progress before and after, so a level, rank or unlock is only
 * celebrated when this attempt actually caused it.
 */
export async function reactToQuiz(
  userId: string,
  attempt: { id: string; lessonId: string; firstTry: number; total: number; firstCompletion: boolean },
  before: Progress,
  after: Progress,
) {
  const events: AvatarEventInput[] = [];
  const all = (p: Progress) => [...p.lessons, ...p.invest];
  const lesson = all(after).find((l) => l.id === attempt.lessonId);
  if (!lesson) return;
  const isInvest = after.invest.some((l) => l.id === lesson.id);

  if (attempt.firstTry === attempt.total) {
    events.push({ kind: "lesson-perfect", key: `lesson:${attempt.id}`, data: { title: lesson.title } });
  } else {
    events.push({ kind: isInvest ? "invest-lesson" : "lesson-complete", key: `lesson:${attempt.id}`, data: { title: lesson.title, score: attempt.firstTry } });
  }

  if (attempt.firstCompletion) {
    // Levels that this attempt completed.
    after.levels.forEach((level, i) => {
      if (level.status === "completed" && before.levels[i]?.status !== "completed") {
        const next = after.levels[i + 1];
        events.push({ kind: "level-up", key: `level:${level.chapter.number}`, data: { level: level.chapter.number, next: next ? `Level ${next.chapter.number}: ${next.chapter.title}` : undefined } });
      }
    });
    if (after.levelComplete && !before.levelComplete) events.push({ kind: "path-complete", key: "path-complete" });
    const investDone = (p: Progress) => p.invest.length > 0 && p.invest.every((l) => l.status === "completed");
    if (investDone(after) && !investDone(before)) events.push({ kind: "invest-complete", key: "invest-complete" });

    const rankBefore = rankFor(before.completedCount, before.overall, before.totalLessons).current;
    const rankAfter = rankFor(after.completedCount, after.overall, after.totalLessons).current;
    if (rankAfter.id !== rankBefore.id) events.push({ kind: "rank-up", key: `rank:${rankAfter.id}`, data: { rank: rankAfter.name } });

    const doneBefore = all(before).filter((l) => l.status === "completed").length;
    const doneAfter = all(after).filter((l) => l.status === "completed").length;
    for (const item of AVATAR_ITEMS) {
      if (item.unlock.type === "lessons" && doneBefore < item.unlock.count && doneAfter >= item.unlock.count) {
        events.push({ kind: "item-unlocked", key: `unlock:${item.id}`, data: { item: item.name } });
      }
    }
  }
  await queueAvatarEvents(db, userId, events);
}
