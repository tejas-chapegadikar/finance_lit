import Link from "next/link";
import { db } from "@/lib/db";
import { READINESS_AREA_META } from "@/lib/readiness-areas";

export default async function AdminLessonsPage() {
  const lessons = await db.lesson.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
          <p className="text-sm text-slate-600">Published lessons unlock for students in this order.</p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          New lesson
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/admin/lessons/${lesson.id}/edit`}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-300"
          >
            <span aria-hidden className="text-2xl">
              {lesson.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{lesson.title}</p>
              <p className="text-slate-600">
                Order {lesson.order} • {READINESS_AREA_META[lesson.area].label} • {lesson._count.questions} questions
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                lesson.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {lesson.isPublished ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {lessons.length === 0 && <p className="text-sm text-slate-600">No lessons yet.</p>}
      </div>
    </div>
  );
}
