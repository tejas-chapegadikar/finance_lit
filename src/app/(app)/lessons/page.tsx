import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LessonCard } from "@/components/lessons/LessonCard";

export default async function LessonsPage() {
  await requireOnboardedUser();

  const lessons = await db.lesson.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20">
        <h1 className="text-2xl font-extrabold">Lessons</h1>
        <p className="mt-1 text-violet-100">Pick a topic, watch, quiz, earn XP.</p>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No lessons published yet — check back soon.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
