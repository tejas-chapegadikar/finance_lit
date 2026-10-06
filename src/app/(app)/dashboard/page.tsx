import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { getReadiness } from "@/lib/readiness";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { getTopicIcon } from "@/lib/topic-style";
import { ReadinessRing } from "@/components/dashboard/ReadinessRing";
import { LevelJourney } from "@/components/dashboard/LevelJourney";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

// Our students are in India, and the server (Vercel) runs on UTC.
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const card = "rounded-3xl bg-white p-6 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5";

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [readiness, recentTransactions] = await Promise.all([
    getReadiness(user.id),
    db.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const { next, overall, areas, completedCount, totalLessons } = readiness;
  const nextArea = next ? READINESS_AREA_META[next.lesson.area] : null;
  const levelProgress = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const graduated = totalLessons > 0 && completedCount === totalLessons;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20">
        <p className="text-sm font-semibold text-violet-100">{greeting()}</p>
        <h1 className="truncate text-2xl font-extrabold">{getDisplayName(user)} 👋</h1>

        {next && nextArea ? (
          <div className="mt-5 rounded-2xl bg-white p-4 text-neutral-900 shadow-md shadow-violet-950/20">
            <p className="text-xs font-bold tracking-wider text-violet-700 uppercase">
              {next.isRetake ? "Practice next" : "Your next step"}
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span
                aria-hidden
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${nextArea.chipBg}`}
              >
                {getTopicIcon(next.lesson.topic)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${nextArea.labelText}`}>{nextArea.group}</p>
                <h2 className="font-bold">{next.lesson.title}</h2>
                <p className="text-sm text-neutral-600">{next.reason}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500">
                  {next.lesson.estimatedMinutes} min ·{" "}
                  {next.isRetake ? "retakes raise your score" : `+${next.lesson.xpReward} XP`}
                </p>
              </div>
            </div>
            <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} mt-4 w-full`}>
              {next.isRetake ? "Practice again" : "Start lesson"}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <p className="font-bold">🎓 Level 1 complete!</p>
            <p className="text-sm text-violet-100">
              You&apos;ve mastered every Financial Foundations lesson. More levels are on the way.
            </p>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold text-neutral-900">Financial Readiness</h2>
        <p className="text-sm text-neutral-500">How ready you are for real money decisions, area by area.</p>

        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ReadinessRing score={overall} />
          <ul className="flex w-full flex-1 flex-col gap-3.5">
            {areas.map((area) => (
              <li key={area.area}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold text-neutral-700">
                    <span aria-hidden>{area.icon}</span> {area.label}
                  </span>
                  <span className="font-bold text-neutral-900 tabular-nums">{area.score}</span>
                </div>
                <div
                  role="meter"
                  aria-label={`${area.label} readiness`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={area.score}
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-violet-100"
                >
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${area.score}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-xs text-neutral-500">
          Built from your quiz results. First-try answers count fully, answers you get with the
          Coach&apos;s help count half. Retake any quiz to raise a score.
        </p>
      </section>

      <section className={card}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-orange-700 uppercase">Level 1 · Learn</p>
            <h2 className="text-lg font-bold text-neutral-900">Financial Foundations</h2>
          </div>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
            ⚡ {user.xpTotal.toLocaleString("en-IN")} XP
          </span>
        </div>

        {graduated && (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            🎓 Foundation Graduate — you&apos;ve completed every Level 1 lesson.
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-neutral-700">Lessons complete</span>
          <span className="font-bold text-neutral-900">
            {completedCount} of {totalLessons}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Level 1 progress"
          aria-valuemin={0}
          aria-valuemax={totalLessons}
          aria-valuenow={completedCount}
          className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-orange-100"
        >
          <div className="h-full rounded-full bg-orange-600" style={{ width: `${levelProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {graduated
            ? "Level 2 · Real-World Money is on the way."
            : "Finish every lesson's quiz to graduate as a Foundation Graduate."}
        </p>

        <h3 className="mt-6 mb-2 text-sm font-bold text-neutral-900">Your journey</h3>
        <LevelJourney graduated={graduated} />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Recent activity</h2>
          <Link href="/lessons" className="text-sm font-semibold text-violet-700 hover:underline">
            All lessons
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-500 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
            No activity yet. Complete your first quiz to earn XP.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5"
              >
                <span className="font-medium text-neutral-800">{tx.description ?? tx.type}</span>
                <span className={`shrink-0 font-bold ${tx.amount >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
