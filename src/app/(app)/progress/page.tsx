import type { Metadata } from "next";
import { AvatarSays } from "@/components/avatar/AvatarSays";
import { avatarName, readAvatar } from "@/lib/avatar";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { getBadges, loadBadgeStats } from "@/lib/badges";
import { istDay, istDayStart, shiftDay } from "@/lib/ist-date";
import { MAX_STREAK_FREEZES, STREAK_MILESTONES, getActivityDays, streakStatus } from "@/lib/streak";
import { getMastery, MASTERY_META } from "@/lib/revision";
import { getWeeklySummary } from "@/lib/activity";
import { getMoneyWeek } from "@/lib/money";
import { rupees } from "@/lib/money/categories";
import { getWeeklyLeague } from "@/lib/league";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { StreakCalendar } from "@/components/streak/StreakCalendar";
import { League } from "@/components/profile/League";
import { XpChart, type XpDay } from "@/components/progress/XpChart";
import { Medal } from "@/components/ui/Medal";
import { PageHeader, StatStrip } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgeIcon, IconTile, LessonIcon } from "@/components/ui/topic-icons";
import { card, gameSurface } from "@/components/ui/button-styles";
import { BookIcon, CheckIcon, FlameIcon, GiftIcon, SparklesIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Progress — StockStreak" };

const formatDate = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const shortDay = (day: string, span: number) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", span <= 7 ? { weekday: "short", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" });

// Progress: how you're doing over time — XP by day, your week, the streak,
// achievements, topic mastery and the (opt-in) weekly league.
export default async function ProgressPage(props: PageProps<"/progress">) {
  const user = await requireOnboardedUser();
  const today = istDay();
  const span = (await props.searchParams).range === "30" ? 30 : 7;
  const from = shiftDay(today, -(span - 1));

  const [progress, earnedBadges, xpRows, xpHistory, revisionByLesson, calendar, week, moneyWeek, league] = await Promise.all([
    getProgress(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    db.xPTransaction.findMany({ where: { userId: user.id, amount: { gt: 0 }, createdAt: { gte: istDayStart(from) } }, select: { amount: true, createdAt: true } }),
    db.xPTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, amount: true, description: true, createdAt: true } }),
    db.revisionAnswer.findMany({ where: { userId: user.id, context: "REVIEW" }, select: { isCorrect: true, item: { select: { lessonId: true } } } }),
    getActivityDays(db, user.id, shiftDay(today, -41), today),
    getWeeklySummary(user.id, today),
    getMoneyWeek(user.id, today),
    getWeeklyLeague(user.id, user.leagueOptIn, today),
  ]);
  const [badgeStats, mastery] = await Promise.all([loadBadgeStats(db, user.id, progress.lessons), getMastery(user.id, [...progress.lessons, ...progress.invest])]);
  const badges = getBadges(badgeStats, earnedBadges);
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const streak = streakStatus(user, today);
  const nextMilestone = STREAK_MILESTONES.find((m) => user.longestStreak < m.days);

  const perDay = new Map<string, number>();
  for (const row of xpRows) perDay.set(istDay(row.createdAt), (perDay.get(istDay(row.createdAt)) ?? 0) + row.amount);
  const days: XpDay[] = Array.from({ length: span }, (_, i) => {
    const day = shiftDay(from, i);
    return { day, label: shortDay(day, span), xp: perDay.get(day) ?? 0 };
  });
  const xpInRange = days.reduce((s, d) => s + d.xp, 0);

  const topicAccuracy = progress.areas.map((area) => {
    const lessonIds = new Set(progress.lessons.filter((l) => l.area === area.area).map((l) => l.id));
    const answers = revisionByLesson.filter((r) => lessonIds.has(r.item.lessonId));
    return {
      ...area,
      revisionTotal: answers.length,
      revisionPercent: answers.length ? Math.round((100 * answers.filter((a) => a.isCorrect).length) / answers.length) : null,
    };
  });
  const rangeLink = (n: 7 | 30) =>
    `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${span === n ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
      <PageHeader eyebrow="Progress" title="How you're doing" description="XP, streaks, achievements and what you actually remember — all in one place.">
        <StatStrip
          label="Progress stats"
          stats={[
            { label: "Total XP", value: user.xpTotal.toLocaleString("en-IN"), icon: <StarIcon />, tone: "text-orange-600" },
            { label: "Lessons", value: `${progress.completedCount}/${progress.totalLessons}`, icon: <BookIcon /> },
            { label: "Streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, icon: <FlameIcon /> },
            { label: "Badges", value: `${earnedCount}/${badges.length}`, icon: <SparklesIcon /> },
          ]}
        />
      </PageHeader>

      {/* XP over time */}
      <section aria-labelledby="xp-chart-heading" className={`${card} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="xp-chart-heading" className="font-sans text-sm font-semibold tracking-normal text-slate-600">
              XP earned
            </h2>
            <p className="mt-0.5 font-display text-3xl font-bold text-slate-900 tabular-nums">
              {xpInRange.toLocaleString("en-IN")} <span className="text-base font-semibold text-slate-500">XP</span>
            </p>
          </div>
          <nav aria-label="Range" className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <Link href="/progress" aria-current={span === 7 ? "page" : undefined} className={rangeLink(7)}>
              This week
            </Link>
            <Link href="/progress?range=30" aria-current={span === 30 ? "page" : undefined} className={rangeLink(30)}>
              30 days
            </Link>
          </nav>
        </div>
        <div className="mt-4">
          <XpChart days={days} caption={`XP earned per day, last ${span} days: ${xpInRange} XP in total`} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
        {/* The streak */}
        <section id="streak" className="scroll-mt-20" aria-labelledby="streak-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="streak-heading" className="text-2xl text-slate-900">
              Learning streak
            </h2>
            <span className="text-sm text-slate-500">Longest: {user.longestStreak} days</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {streak.streak
              ? `${streak.streak} ${streak.streak === 1 ? "day" : "days"} in a row${streak.doneToday ? " — today counts." : "."}`
              : "Do one lesson, scenario, revision, Reality Check or money check-in to start a streak."}{" "}
            {user.streakFreezes} of {MAX_STREAK_FREEZES} streak freezes ready.
          </p>
          <div className={`${card} mt-4 p-4 sm:p-5`}>
            <StreakCalendar marks={calendar} today={today} />
          </div>
          <h3 className="mt-6 text-base text-slate-900">Milestones</h3>
          <ol className="mt-3 grid grid-cols-5 gap-1" aria-label="Streak milestones">
            {STREAK_MILESTONES.map((m) => {
              const reached = user.longestStreak >= m.days;
              const isNext = nextMilestone?.days === m.days;
              return (
                <li key={m.days} className="relative flex flex-col items-center text-center">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-semibold tabular-nums ${
                      reached ? "bg-orange-500 text-white" : isNext ? "bg-white text-orange-700 ring-2 ring-orange-400" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {reached ? <CheckIcon className="h-5 w-5" /> : m.days}
                  </span>
                  <span className="mt-1.5 text-xs font-semibold text-slate-800">
                    {m.days} days{reached ? " · reached" : ""}
                  </span>
                  <span className="text-xs font-semibold text-orange-700">+{m.xp} XP</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            A freeze covers a missed day automatically; you earn one every 7 days of streak (hold up to {MAX_STREAK_FREEZES}). Streaks also unlock avatar
            items.
          </p>
        </section>

        {/* The last seven days */}
        <section aria-labelledby="week-heading">
          <h2 id="week-heading" className="text-2xl text-slate-900">
            Your week
          </h2>
          <p className="mt-1 text-sm text-slate-600">The last 7 days · active on {week.activeDays} of 7</p>
          <dl className="mt-4 grid grid-cols-2 border-t border-slate-200">
            {[
              { label: "Lessons completed", value: String(week.lessonsCompleted) },
              {
                label: "Quiz accuracy",
                value: week.quizAccuracy === null ? "—" : `${week.quizAccuracy}%`,
                note:
                  week.quizAccuracy !== null && week.previousQuizAccuracy !== null
                    ? `${week.quizAccuracy >= week.previousQuizAccuracy ? "↑" : "↓"} from ${week.previousQuizAccuracy}%`
                    : undefined,
              },
              { label: "Revision correct", value: week.revisionTotal ? `${week.revisionCorrect}/${week.revisionTotal}` : "—" },
              { label: "Reality Check & challenge", value: String(week.daily) },
              { label: "Scenarios", value: String(week.scenarios) },
              { label: "XP earned", value: `+${week.xpEarned}` },
              {
                label: "Spent",
                value: rupees(moneyWeek.spent),
                note: moneyWeek.previousSpent > 0 ? `${moneyWeek.spent <= moneyWeek.previousSpent ? "↓" : "↑"} from ${rupees(moneyWeek.previousSpent)}` : undefined,
              },
              { label: "Money check-ins", value: `${moneyWeek.checkIns}/7` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end gap-0.5 border-b border-slate-200 py-3 odd:pr-3 even:border-l even:pl-4">
                <dt className="text-xs text-slate-500">
                  {stat.label}
                  {stat.note && <span className="block font-semibold text-emerald-700">{stat.note}</span>}
                </dt>
                <dd className="font-display text-2xl font-semibold text-slate-900 tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <h2 id="xp-heading" className="mt-10 text-xl text-slate-900">
            Recent XP
          </h2>
          {xpHistory.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No XP yet. Complete a lesson for your first +75 XP, or answer the daily Reality Check for +10.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 text-sm" aria-labelledby="xp-heading">
              {xpHistory.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-2.5">
                  <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tx.amount < 0 ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"}`}>
                    {tx.amount < 0 ? <GiftIcon className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">{tx.description ?? "XP"}</span>
                    <span className="text-xs text-slate-500">{formatDate(tx.createdAt)}</span>
                  </span>
                  <span className={`shrink-0 font-semibold tabular-nums ${tx.amount < 0 ? "text-slate-600" : "text-orange-700"}`}>
                    {tx.amount < 0 ? `−${-tx.amount}` : `+${tx.amount}`} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Achievements — the game-style panel */}
      <section id="achievements" aria-labelledby="badges-heading" className={`${gameSurface} scroll-mt-20 p-5 sm:p-8`}>
        <span aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_190_80/0.25),transparent_65%)]" />
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="badges-heading" className="text-2xl text-white">
            Achievements
          </h2>
          <span className="text-sm text-white/60">
            {earnedCount} of {badges.length} earned
          </span>
        </div>
        <AvatarSays config={readAvatar(user.avatar)} name={avatarName(user)} expression={earnedCount ? "proud" : "thinking"} tone="dark" size="sm" className="mt-4">
          {earnedCount === 0
            ? "No badges yet — finish one lesson and the first one is ours."
            : earnedCount === badges.length
              ? "Every badge. Every single one. Legendary."
              : `${earnedCount} down, ${badges.length - earnedCount} to go. Which one's next?`}
        </AvatarSays>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge, i) => {
            const earned = badge.earnedAt !== null;
            return (
              <li
                key={badge.id}
                className={`flex animate-fade-up flex-col items-center rounded-2xl p-4 text-center ${earned ? "bg-white/10 ring-1 ring-white/15" : "border border-dashed border-white/20"}`}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <Medal icon={<BadgeIcon id={badge.id} />} earned={earned} />
                <p className={`mt-2 text-sm font-bold ${earned ? "text-white" : "text-white/70"}`}>{badge.name}</p>
                <p className="mt-0.5 text-xs text-white/55">{badge.ruleText}</p>
                {badge.earnedAt ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                    <CheckIcon className="h-3.5 w-3.5" /> Earned {formatDate(badge.earnedAt)}
                  </p>
                ) : (
                  <div className="mt-2.5 w-full max-w-[9rem]">
                    <ProgressBar value={badge.done} max={badge.required} label={`${badge.name} progress`} tone="bg-orange-400" size="sm" />
                    <p className="mt-1 text-xs font-medium text-white/55 tabular-nums">
                      {badge.done}/{badge.required} done
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* The weekly league */}
      <section id="league" className="scroll-mt-20" aria-labelledby="league-heading">
        <h2 id="league-heading" className="text-2xl text-slate-900">
          Weekly league
        </h2>
        <div className="mt-3">
          <League optedIn={league.optedIn} rows={league.rows} you={league.you} participants={league.participants} endsOn={league.endsOn} />
        </div>
      </section>

      {/* Mastery */}
      <section id="mastery" className="scroll-mt-20" aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="text-2xl text-slate-900">
          Topic mastery
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Based on your quizzes and spaced revision — not on XP. Completing a lesson isn&apos;t proof you remember it; getting it right again days later is.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {[...progress.lessons, ...progress.invest].map((lesson) => {
              const status = mastery.get(lesson.id) ?? "not-started";
              return (
                <li key={lesson.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <IconTile area={lesson.area} size="sm">
                    <LessonIcon slug={lesson.slug} area={lesson.area} />
                  </IconTile>
                  <Link href={`/lessons/${lesson.slug}`} className="min-w-0 flex-1 font-medium text-slate-900 hover:text-brand-700">
                    {lesson.title}
                  </Link>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${MASTERY_META[status].className}`}>{MASTERY_META[status].label}</span>
                </li>
              );
            })}
          </ul>
          <div>
            <h3 className="text-base text-slate-900">Readiness and accuracy by topic</h3>
            <p className="mt-1 text-xs text-slate-500">
              Readiness (0–100) tracks how much of each topic you&apos;ve learned and shown in quizzes — it isn&apos;t an assessment of your actual finances.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th scope="col" className="py-2 pr-2 font-medium">Topic</th>
                    <th scope="col" className="px-2 py-2 text-right font-medium">Readiness</th>
                    <th scope="col" className="px-2 py-2 text-right font-medium">Quiz accuracy</th>
                    <th scope="col" className="py-2 pl-2 text-right font-medium">Revision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topicAccuracy.map((area) => (
                    <tr key={area.area}>
                      <th scope="row" className="py-2.5 pr-2 font-medium text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden className={`h-2 w-2 rounded-full ${READINESS_AREA_META[area.area].dot}`} />
                          {area.label}
                        </span>
                      </th>
                      <td className="px-2 py-2.5 text-right font-semibold text-slate-900 tabular-nums">{area.score}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-slate-900 tabular-nums">{area.quizAccuracy === null ? "—" : `${area.quizAccuracy}%`}</td>
                      <td className="py-2.5 pl-2 text-right font-semibold text-slate-900 tabular-nums">
                        {area.revisionPercent === null ? "—" : `${area.revisionPercent}% of ${area.revisionTotal}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="mt-4 text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold text-brand-700">What do these mean?</summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {(["needs-revision", "practising", "provisional", "retained"] as const).map((status) => (
                  <li key={status}>
                    <span className="font-semibold text-slate-800">{MASTERY_META[status].label}:</span> {MASTERY_META[status].rule}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
