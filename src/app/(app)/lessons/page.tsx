import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBestMasteryByLesson } from "@/lib/readiness";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "@/lib/readiness-areas";
import { LessonCard } from "@/components/lessons/LessonCard";

export const metadata: Metadata = { title: "Lessons — StockStreak" };

export default async function LessonsPage() {
  const user = await requireOnboardedUser();

  const [lessons, masteryByLesson] = await Promise.all([
    db.lesson.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    }),
    getBestMasteryByLesson(user.id),
  ]);
  const completedCount = lessons.filter((lesson) => masteryByLesson.has(lesson.id)).length;

  const groups = READINESS_AREA_VALUES.map((area) => ({
    area,
    meta: READINESS_AREA_META[area],
    lessons: lessons.filter((lesson) => lesson.area === area),
  })).filter((group) => group.lessons.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20">
        <p className="text-xs font-bold tracking-wider text-violet-100 uppercase">
          Level 1 · Financial Foundations
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">Lessons</h1>
        <p className="mt-1 text-violet-100">
          Watch, read, quiz, earn XP. {completedCount} of {lessons.length} complete.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-500">No lessons published yet — check back soon.</p>
      ) : (
        groups.map(({ area, meta, lessons: groupLessons }) => {
          const done = groupLessons.filter((lesson) => masteryByLesson.has(lesson.id)).length;
          return (
            <section key={area} aria-labelledby={`group-${area}`} className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${meta.chipBg}`}
                  >
                    {meta.icon}
                  </span>
                  <div>
                    <h2 id={`group-${area}`} className="text-lg font-bold text-neutral-900">
                      {meta.group}
                    </h2>
                    <p className={`text-xs font-semibold ${meta.labelText}`}>
                      Builds your {meta.label} score
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-neutral-500">
                  {done} of {groupLessons.length} done
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {groupLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} mastery={masteryByLesson.get(lesson.id)} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
