import Link from "next/link";
import { db } from "@/lib/db";
import { getChallengeForDay } from "@/lib/challenge";
import { istDay } from "@/lib/ist-date";
import { READINESS_AREA_META } from "@/lib/readiness-areas";

export default async function AdminChallengesPage() {
  const [challenges, today] = await Promise.all([
    db.dailyChallenge.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      include: { _count: { select: { answers: true } } },
    }),
    getChallengeForDay(istDay()),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily challenges</h1>
          <p className="text-sm text-slate-600">
            Everyone gets the same challenge each day (IST), rotating through the published ones in order.
          </p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          New challenge
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={`/admin/challenges/${challenge.id}/edit`}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-300"
          >
            <span aria-hidden className="text-xl">
              {READINESS_AREA_META[challenge.area].icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-semibold text-slate-900">{challenge.prompt}</p>
              <p className="text-slate-600">
                Order {challenge.order} • {READINESS_AREA_META[challenge.area].label} • {challenge._count.answers}{" "}
                answers
              </p>
            </div>
            {today?.id === challenge.id && (
              <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
                Today
              </span>
            )}
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                challenge.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {challenge.isPublished ? "Published" : "Hidden"}
            </span>
          </Link>
        ))}
        {challenges.length === 0 && <p className="text-sm text-slate-600">No challenges yet.</p>}
      </div>
    </div>
  );
}
