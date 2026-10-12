import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getBadges, loadBadgeStats } from "@/lib/badges";
import { istDay, shiftDay } from "@/lib/ist-date";
import { MAX_STREAK_FREEZES, STREAK_MILESTONES, getActivityDays, streakStatus } from "@/lib/streak";
import { rankFor } from "@/lib/ranks";
import { readAvatar } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { StreakCalendar } from "@/components/streak/StreakCalendar";
import { stageLabel } from "@/lib/learner-profile";
import { LEGAL_LINKS } from "@/lib/site";
import { PATH_NAME } from "@/lib/constants";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getMastery, MASTERY_META } from "@/lib/revision";
import { findReward } from "@/lib/rewards";
import { getWeeklySummary } from "@/lib/activity";
import { AccountActions } from "@/components/account/AccountActions";
import { Medal } from "@/components/ui/Medal";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { AlertIcon, ArrowRightIcon, DocumentIcon, GiftIcon, InfoIcon, LockIcon, MailIcon, StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Profile — StockStreak" };

const LEGAL_ICONS: Record<string, React.ReactNode> = {
  "/about": <InfoIcon />,
  "/contact": <MailIcon />,
  "/privacy": <LockIcon />,
  "/terms": <DocumentIcon />,
  "/disclaimer": <AlertIcon />,
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const today = istDay();
  const [progress, earnedBadges, xpHistory, revisionByLesson, calendar, week] = await Promise.all([
    getProgress(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    db.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, amount: true, description: true, createdAt: true },
    }),
    db.revisionAnswer.findMany({
      where: { userId: user.id, context: "REVIEW" },
      select: { isCorrect: true, item: { select: { lessonId: true } } },
    }),
    getActivityDays(db, user.id, shiftDay(today, -41), today),
    getWeeklySummary(user.id, today),
  ]);
  const [badgeStats, mastery] = await Promise.all([
    loadBadgeStats(db, user.id, progress.lessons),
    getMastery(user.id, progress.lessons),
  ]);
  const badges = getBadges(badgeStats, earnedBadges);
  const theme = findReward(user.theme);
  const title = findReward(user.title);
  const avatar = readAvatar(user.avatar);
  const streak = streakStatus(user, today);
  const rank = rankFor(progress.completedCount, progress.overall, progress.totalLessons);
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const displayName = getDisplayName(user);
  const subtitle = [stageLabel(user.stage), user.collegeName].filter(Boolean).join(" · ");
  const memberSince = user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // Accuracy by topic: quiz accuracy (best attempts) and revision answers.
  const topicAccuracy = progress.areas.map((area) => {
    const lessonIds = new Set(progress.lessons.filter((l) => l.area === area.area).map((l) => l.id));
    const answers = revisionByLesson.filter((r) => lessonIds.has(r.item.lessonId));
    return {
      ...area,
      revisionTotal: answers.length,
      revisionPercent: answers.length ? Math.round((100 * answers.filter((a) => a.isCorrect).length) / answers.length) : null,
    };
  });

  const stats = [
    { label: "Total XP", value: user.xpTotal.toLocaleString("en-IN") },
    { label: "Lessons completed", value: `${progress.completedCount}/${progress.totalLessons}` },
    { label: "Learning streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}` },
    { label: "Rank", value: rank.current.name },
    { label: "Financial Readiness", value: `${progress.overall}/100` },
    { label: "Badges earned", value: `${earnedCount}/${badges.length}` },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${card} overflow-hidden`} aria-labelledby="profile-name">
        {/* The cover strip shows a profile theme from the Rewards Store, if one is on. */}
        <div aria-hidden className={`h-24 sm:h-28 ${theme?.gradient ?? "bg-brand-100"}`} />
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <span className="flex h-28 w-24 shrink-0 items-end justify-center overflow-hidden rounded-2xl border-4 border-white bg-brand-50">
              <Avatar config={avatar} className="h-24 w-auto" label={`${displayName}'s avatar`} />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <h1 id="profile-name" className="truncate text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {displayName}
              </h1>
              {title && <p className="font-semibold text-slate-700">{title.name}</p>}
            </div>
            <Link href="/profile/avatar" className={`${secondaryButton} mb-1`}>
              Edit avatar
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {[
              rank.current.name,
              progress.levelComplete
                ? `${PATH_NAME} Graduate`
                : progress.currentLevel
                  ? `Level ${progress.currentLevel.chapter.number} · ${progress.currentLevel.chapter.title}`
                  : PATH_NAME,
              subtitle,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <h2 className="sr-only">Learning statistics</h2>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {stats.map((stat) => (
              // Label first for screen readers; shown under the number.
              <div key={stat.label} className="flex flex-col-reverse justify-end bg-white p-4">
                <dt className="mt-0.5 text-xs font-medium text-slate-600">{stat.label}</dt>
                <dd className="font-display text-xl font-extrabold text-slate-900 tabular-nums sm:text-2xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {progress.completedCount === 0 && progress.next && (
        <section className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}>
          <div className="flex-1">
            <h2 className="font-extrabold text-slate-900">Your journey starts with one lesson</h2>
            <p className="text-sm text-slate-600">
              Complete “{progress.next.lesson.title}” to earn your first {progress.next.lesson.xpReward} XP and start
              building your readiness score.
            </p>
          </div>
          <Link href={`/lessons/${progress.next.lesson.slug}`} className={`${primaryButton} shrink-0`}>
            Start learning
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      )}

      <section id="streak" className={`${card} scroll-mt-20 p-5 sm:p-6`} aria-labelledby="streak-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="streak-heading" className="text-lg font-extrabold text-slate-900">
            Learning streak
          </h2>
          <span className="text-sm font-semibold text-slate-600">Longest: {user.longestStreak} days</span>
        </div>
        <p className="text-sm text-slate-600">
          {streak.streak
            ? `${streak.streak} ${streak.streak === 1 ? "day" : "days"} in a row${streak.doneToday ? " — today counts." : "."}`
            : "Do one lesson, scenario, revision or daily question to start a streak."}{" "}
          {user.streakFreezes} of {MAX_STREAK_FREEZES} streak freezes ready.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <StreakCalendar marks={calendar} today={today} />
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Milestones</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {STREAK_MILESTONES.map((m) => {
                const reached = user.longestStreak >= m.days;
                return (
                  <li key={m.days} className={`flex items-center justify-between rounded-xl px-3 py-1.5 ring-1 ${reached ? "bg-orange-50 ring-orange-200" : "bg-slate-50 ring-slate-200"}`}>
                    <span className="font-semibold text-slate-800">
                      {m.days} days{reached ? " · reached" : ""}
                    </span>
                    <span className="font-extrabold text-amber-800">+{m.xp} XP</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-slate-600">
              🔥 learned · 🧊 covered by a freeze. A freeze covers a missed day automatically; you earn one every 7 days of
              streak (hold up to {MAX_STREAK_FREEZES}). A 7-day streak unlocks the Flame hoodie, 30 days the Crown.
            </p>
          </div>
        </div>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="badges-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="badges-heading" className="text-lg font-extrabold text-slate-900">
            Badges
          </h2>
          <span className="text-sm font-semibold text-slate-600">
            {earnedCount} of {badges.length} earned
          </span>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((badge) => {
            const earned = badge.earnedAt !== null;
            return (
              <li
                key={badge.id}
                className={`flex flex-col items-center rounded-2xl p-4 text-center ring-1 ${
                  earned
                    ? "bg-amber-50 ring-amber-200"
                    : "bg-slate-50 ring-slate-200"
                }`}
              >
                <Medal icon={badge.icon} earned={earned} />
                <p className={`mt-2 text-sm font-bold ${earned ? "text-slate-900" : "text-slate-600"}`}>{badge.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{badge.ruleText}</p>
                <p className={`mt-1.5 text-xs font-bold ${earned ? "text-emerald-800" : "text-slate-600"}`}>
                  {badge.earnedAt
                    ? `✓ Earned ${formatDate(badge.earnedAt)}`
                    : `${badge.done}/${badge.required} done`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${card} scroll-mt-20 p-5 sm:p-6`} aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="text-lg font-extrabold text-slate-900">
          Topic mastery
        </h2>
        <p className="text-sm text-slate-600">
          Based on your quizzes and spaced revision — not on XP. Completing a lesson isn&apos;t proof you remember it;
          getting it right again days later is.
        </p>
        <ul className="mt-4 divide-y divide-slate-100">
          {progress.lessons.map((lesson) => {
            const status = mastery.get(lesson.id) ?? "not-started";
            return (
              <li key={lesson.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span aria-hidden className="text-xl">
                  {lesson.icon}
                </span>
                <Link href={`/lessons/${lesson.slug}`} className="min-w-0 flex-1 font-semibold text-slate-900 hover:text-brand-700">
                  {lesson.title}
                </Link>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${MASTERY_META[status].className}`}>
                  {MASTERY_META[status].label}
                </span>
              </li>
            );
          })}
        </ul>
        <h3 className="mt-5 text-sm font-extrabold text-slate-900">Readiness and accuracy by topic</h3>
        <p className="text-xs text-slate-600">
          Readiness (0–100) tracks how much of each topic you&apos;ve learned and shown in quizzes — it isn&apos;t an
          assessment of your actual finances.
        </p>
        <div className="mt-2 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-bold">Topic</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">Readiness</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">Quiz accuracy</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">Revision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topicAccuracy.map((area) => (
                <tr key={area.area}>
                  <th scope="row" className="px-3 py-2 font-semibold text-slate-800">
                    <span aria-hidden>{area.icon}</span> {area.label}
                  </th>
                  <td className="px-3 py-2 text-right font-bold text-slate-900 tabular-nums">{area.score}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900 tabular-nums">
                    {area.quizAccuracy === null ? "—" : `${area.quizAccuracy}%`}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900 tabular-nums">
                    {area.revisionPercent === null ? "—" : `${area.revisionPercent}% of ${area.revisionTotal}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="mt-3 text-sm text-slate-600">
          <summary className="cursor-pointer font-bold text-brand-700">What do these mean?</summary>
          <ul className="mt-2 flex flex-col gap-1.5">
            {(["needs-revision", "practising", "provisional", "retained"] as const).map((status) => (
              <li key={status}>
                <span className="font-bold text-slate-800">{MASTERY_META[status].label}:</span> {MASTERY_META[status].rule}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="week-heading">
        <h2 id="week-heading" className="text-lg font-extrabold text-slate-900">
          Your week
        </h2>
        <p className="text-sm text-slate-600">The last 7 days · active on {week.activeDays} of 7</p>
        <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
            { label: "Daily question & challenge", value: String(week.daily) },
            { label: "Scenarios", value: String(week.scenarios) },
            { label: "XP earned", value: `+${week.xpEarned}` },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <dt className="text-xs font-semibold text-slate-600">
                {stat.label}
                {stat.note && <span className="block font-bold text-brand-700">{stat.note}</span>}
              </dt>
              <dd className="font-display text-xl font-extrabold text-slate-900 tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="xp-heading">
        <h2 id="xp-heading" className="text-lg font-extrabold text-slate-900">
          Recent XP
        </h2>
        {xpHistory.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No XP yet. Complete a lesson for your first +75 XP, or answer the Question of the Day for +10.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {xpHistory.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100"
                >
                  {tx.amount < 0 ? <GiftIcon className="h-4 w-4 text-slate-600" /> : <StarIcon className="h-4 w-4 text-amber-600" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{tx.description ?? "XP"}</span>
                  <span className="text-xs text-slate-600">{formatDate(tx.createdAt)}</span>
                </span>
                <span className={`shrink-0 font-extrabold tabular-nums ${tx.amount < 0 ? "text-slate-700" : "text-amber-800"}`}>
                  {tx.amount < 0 ? `−${-tx.amount}` : `+${tx.amount}`} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="text-lg font-extrabold text-slate-900">
          Edit profile
        </h2>
        <p className="text-sm text-slate-600">Your name, college, stage and learning goal.</p>
        <div className="mt-4">
          <ProfileForm
            displayName={displayName}
            collegeName={user.collegeName ?? ""}
            stage={user.stage ?? ""}
            goal={user.goal ?? ""}
          />
        </div>
      </section>

      <section className={`${card} flex flex-col gap-4 p-5 sm:p-6`} aria-labelledby="account-heading">
        <div>
          <h2 id="account-heading" className="text-lg font-extrabold text-slate-900">
            Account
          </h2>
          <dl className="mt-3 divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-600">Email</dt>
              <dd className="truncate font-semibold text-slate-900">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-600">Member since</dt>
              <dd className="font-semibold text-slate-900">{memberSince}</dd>
            </div>
          </dl>
        </div>
        <AccountActions />
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="legal-heading">
        <h2 id="legal-heading" className="text-lg font-extrabold text-slate-900">
          Help, privacy &amp; legal
        </h2>
        <ul className={`mt-3 ${menuListClass}`}>
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={menuRowClass}>
                <MenuRowContent icon={LEGAL_ICONS[link.href]} label={link.label} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
