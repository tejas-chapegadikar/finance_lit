import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getTodaysChallenge } from "@/lib/challenge";
import { displayStreak } from "@/lib/streak";
import { istHour } from "@/lib/ist-date";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { DAILY_CHALLENGE_XP, LEVEL_1_NAME, NO_CHALLENGE_MESSAGE, NO_LESSONS_MESSAGE } from "@/lib/constants";
import { ReadinessRing } from "@/components/dashboard/ReadinessRing";
import { card, heroSurface, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

function greeting() {
  const hour = istHour();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const [progress, today] = await Promise.all([getProgress(user.id), getTodaysChallenge(user.id)]);
  const { next, brushUp, overall, areas, completedCount, totalLessons, levelComplete } = progress;
  const streak = displayStreak(user);
  const levelPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const name = getDisplayName(user);

  const stats = [
    { icon: "🔥", label: "Streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
    { icon: "⭐", label: "XP", value: user.xpTotal.toLocaleString("en-IN") },
    { icon: "📚", label: "Lessons", value: `${completedCount}/${totalLessons}` },
    { icon: "🎯", label: "Readiness", value: `${overall}/100` },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top: greeting, readiness, level progress */}
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/5" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/5" />
        <p className="relative text-sm font-semibold">{greeting()}</p>
        <h1 className="relative truncate text-2xl font-extrabold sm:text-3xl">Hey {name} 👋</h1>

        <div className="relative mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <ReadinessRing score={overall} tone="dark" size="sm" />
            <div>
              <p className="text-xs font-bold tracking-wider uppercase">Financial Readiness</p>
              <p className="mt-1 text-sm">How ready you are for real money decisions.</p>
            </div>
          </div>

          <div className="flex-1 rounded-2xl bg-brand-900/30 p-4 ring-1 ring-white/15">
            <p className="text-xs font-bold tracking-wider uppercase">Level 1 — {LEVEL_1_NAME}</p>
            <p className="mt-1 text-sm font-semibold">
              {completedCount} / {totalLessons} lessons completed
            </p>
            <div
              role="progressbar"
              aria-label="Level 1 progress"
              aria-valuemin={0}
              aria-valuemax={totalLessons}
              aria-valuenow={completedCount}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25"
            >
              <div className="h-full rounded-full bg-orange-300" style={{ width: `${levelPercent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">
          {/* Continue learning */}
          {next ? (
            <section className={`${card} p-5 sm:p-6`} aria-labelledby="continue-heading">
              <p id="continue-heading" className="text-xs font-bold tracking-wider text-brand-700 uppercase">
                {next.isRetake ? "Practice next" : completedCount === 0 ? "Start learning" : "Continue learning"}
              </p>
              <div className="mt-3 flex items-start gap-4">
                <span
                  aria-hidden
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${READINESS_AREA_META[next.lesson.area].chipBg}`}
                >
                  {next.lesson.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${READINESS_AREA_META[next.lesson.area].labelText}`}>
                    Lesson {String(next.lesson.number).padStart(2, "0")} · {READINESS_AREA_META[next.lesson.area].label}
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900">{next.lesson.title}</h2>
                  <p className="mt-0.5 text-sm text-slate-600">{next.lesson.description}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    {next.lesson.estimatedMinutes} min •{" "}
                    {next.isRetake ? "retakes raise your readiness" : `+${next.lesson.xpReward} XP`}
                  </p>
                </div>
              </div>
              {next.isRetake && <p className="mt-3 text-sm text-slate-600">{next.reason}</p>}
              <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} mt-5 w-full sm:w-auto`}>
                {next.isRetake ? "Practice again" : completedCount === 0 ? "Start" : "Continue"}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>
          ) : levelComplete ? (
            <section className={`${card} p-6 text-center`}>
              <span aria-hidden className="text-5xl">
                🏆
              </span>
              <p className="mt-2 text-xs font-bold tracking-wider text-brand-700 uppercase">Level 1 complete</p>
              <h2 className="text-xl font-extrabold text-slate-900">Financial Foundations Graduate</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
                You finished all {totalLessons} lessons. Level 2 is on its way — we&apos;re building it from your
                feedback.
              </p>
            </section>
          ) : (
            <p className={`${card} p-6 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
          )}

          {/* Daily Money Challenge */}
          <section
            className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 ring-1 ring-orange-200 sm:p-6"
            aria-labelledby="challenge-heading"
          >
            <div className="flex items-center justify-between gap-3">
              <p id="challenge-heading" className="text-xs font-bold tracking-wider text-orange-700 uppercase">
                ⚡ Today&apos;s Money Challenge
              </p>
              {today && !today.answer && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
                  +{DAILY_CHALLENGE_XP} XP
                </span>
              )}
            </div>
            {today ? (
              <>
                <p className="mt-2 line-clamp-3 font-semibold text-slate-900">{today.challenge.prompt}</p>
                {today.answer ? (
                  <p className="mt-4 text-sm font-bold text-emerald-800">
                    ✅ Done for today · +{today.answer.xpAwarded} XP earned. A new challenge arrives tomorrow.
                  </p>
                ) : (
                  <Link href="/challenge" className={`${primaryButton} mt-4 w-full sm:w-auto`}>
                    Take challenge
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </>
            ) : (
              <p className="mt-2 font-semibold text-slate-700">{NO_CHALLENGE_MESSAGE}</p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Your stats */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="mb-3 text-lg font-extrabold text-slate-900">
              Your stats
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <li key={stat.label} className={`${card} p-4`}>
                  <span aria-hidden className="text-2xl">
                    {stat.icon}
                  </span>
                  <p className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-600">{stat.label}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Readiness breakdown */}
          <section className={`${card} p-5 sm:p-6`} aria-labelledby="breakdown-heading">
            <h2 id="breakdown-heading" className="text-lg font-extrabold text-slate-900">
              Readiness breakdown
            </h2>
            <ul className="mt-4 flex flex-col gap-3.5">
              {areas.map((area) => (
                <li key={area.area}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">
                      <span aria-hidden>{area.icon}</span> {area.label}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">{area.score}%</span>
                  </div>
                  <div
                    role="meter"
                    aria-label={`${area.label} readiness`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={area.score}
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-100"
                  >
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${area.score}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            {brushUp && (
              <Link
                href={`/lessons/${brushUp.slug}`}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-100"
              >
                <span aria-hidden>💡</span>
                <span className="flex-1">
                  Brush up: retake {brushUp.title} ({brushUp.score}/100) to lift your{" "}
                  {READINESS_AREA_META[brushUp.area].label} score
                </span>
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            )}
            <p className="mt-4 text-xs text-slate-600">
              Built from your quiz results and your answers to each lesson&apos;s &ldquo;What would you do?&rdquo;
              scenario.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
