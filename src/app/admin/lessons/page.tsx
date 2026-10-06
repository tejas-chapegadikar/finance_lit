import Link from "next/link";
import { db } from "@/lib/db";
import { READINESS_AREA_META } from "@/lib/readiness-areas";

export default async function AdminLessonsPage() {
  const lessons = await db.lesson.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link
          href="/admin/lessons/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New lesson
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/admin/lessons/${lesson.id}/edit`}
            className="flex items-center justify-between rounded-md border border-neutral-200 p-3 text-sm hover:border-neutral-400"
          >
            <div>
              <p className="font-medium">{lesson.title}</p>
              <p className="text-neutral-500">
                {lesson.topic} • {READINESS_AREA_META[lesson.area].label} •{" "}
                {lesson._count.questions} questions
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                lesson.isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {lesson.isPublished ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {lessons.length === 0 && <p className="text-sm text-neutral-500">No lessons yet.</p>}
      </div>
    </div>
  );
}
