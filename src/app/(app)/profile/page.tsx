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
import { getMoneyWeek } from "@/lib/money";
import { rupees } from "@/lib/money/categories";
import { getWeeklyLeague } from "@/lib/league";
import { findPersonality } from "@/lib/personality";
import { League } from "@/components/profile/League";
import { AccountActions } from "@/components/account/AccountActions";
import { Medal } from "@/components/ui/Medal";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgeIcon, IconTile, LessonIcon } from "@/components/ui/topic-icons";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import {
  AlertIcon,
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  DocumentIcon,
  FlameIcon,
  GiftIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  TrophyIcon,
} from "@/components/ui/icons";

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
  const [moneyWeek, league] = await Promise.all([getMoneyWeek(user.id, today), getWeeklyLeague(user.id, user.leagueOptIn, today)]);
  const personality = findPersonality(user.moneyPersonality);
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

  const stats: { label: string; value: React.ReactNode; Icon: (p: { className?: string }) => React.ReactNode; tone?: string }[] = [
    { label: "Total XP", value: <CountUp value={user.xpTotal} id="xp-profile" />, Icon: StarIcon, tone: "text-orange-600" },
    { label: "Lessons completed", value: `${progress.completedCount}/${progress.totalLessons}`, Icon: BookIcon },
    { label: "Learning streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, Icon: FlameIcon },
    { label: "Rank", value: rank.current.name, Icon: TrophyIcon },
    { label: "Financial Readiness", value: `${progress.overall}/100`, Icon: ShieldIcon },
    { label: "Badges earned", value: `${earnedCount}/${badges.length}`, Icon: SparklesIcon },
  ];
  const nextMilestone = STREAK_MILESTONES.find((m) => user.longestStreak < m.days);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
      {/* Who you are: theme cover, big avatar, name, title and where you are */}
      <section aria-labelledby="profile-name" className="animate-fade-up">
        {/* The cover shows a profile theme from the Rewards Store, if one is on. */}
        <div
          aria-hidden
          className={`h-32 rounded-3xl sm:h-40 ${theme?.gradient ?? "bg-slate-100"}`}
          style={
            theme?.gradient
              ? undefined
              : { backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)", backgroundSize: "22px 22px" }
          }
        />
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:px-6">
          <span className="-mt-16 flex h-32 w-32 shrink-0 items-end justify-center overflow-hidden rounded-full bg-peach-100 ring-[6px] ring-slate-50 sm:-mt-20 sm:h-40 sm:w-40">
            <Avatar config={avatar} className="h-28 w-auto sm:h-36" label={`${displayName}'s avatar`} />
          </span>
          <div className="min-w-0 flex-1 sm:pb-2">
            <h1 id="profile-name" className="truncate text-3xl leading-tight text-slate-900 sm:text-[2.6rem]">
              {displayName}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
              {title && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
                  <TagIcon className="h-3.5 w-3.5" />
                  {title.name}
                </span>
              )}
              <span>
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
              </span>
            </p>
          </div>
          <div className="flex gap-2 self-start sm:mb-2 sm:self-auto">
            <Link href="/rewards" className={secondaryButton}>
              Rewards
            </Link>
            <Link href="/profile/avatar" className={secondaryButton}>
              Edit avatar
            </Link>
          </div>
        </div>

        <h2 className="sr-only">Learning statistics</h2>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          {stats.map(({ label, value, Icon, tone }) => (
            // Label first for screen readers; shown under the number.
            <div key={label} className="flex min-w-0 flex-col-reverse justify-end gap-1 bg-white px-4 py-4 sm:px-5">
              <dd className={`truncate font-display text-xl leading-tight font-semibold tabular-nums sm:text-2xl ${tone ?? "text-slate-900"}`}>{value}</dd>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-[13px]">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {progress.completedCount === 0 && progress.next && (
        <section className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}>
          <div className="flex-1">
            <h2 className="text-xl text-slate-900">Your journey starts with one lesson</h2>
            <p className="mt-1 text-sm text-slate-600">
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
              : "Do one lesson, scenario, revision or daily question to start a streak."}{" "}
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
                      reached
                        ? "bg-orange-500 text-white"
                        : isNext
                          ? "bg-white text-orange-700 ring-2 ring-orange-400"
                          : "bg-slate-100 text-slate-500"
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
            A freeze covers a missed day automatically; you earn one every 7 days of streak (hold up to {MAX_STREAK_FREEZES}). A 7-day streak
            unlocks the Flame hoodie, 30 days the Crown.
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
              { label: "Daily question & challenge", value: String(week.daily) },
              { label: "Scenarios", value: String(week.scenarios) },
              { label: "XP earned", value: `+${week.xpEarned}` },
              {
                label: "Spent",
                value: rupees(moneyWeek.spent),
                note:
                  moneyWeek.previousSpent > 0
                    ? `${moneyWeek.spent <= moneyWeek.previousSpent ? "↓" : "↑"} from ${rupees(moneyWeek.previousSpent)}`
                    : undefined,
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
            <p className="mt-2 text-sm text-slate-600">
              No XP yet. Complete a lesson for your first +75 XP, or answer the daily Reality Check for +10.
            </p>
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

      {/* Money personality and the weekly league */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
        <section aria-labelledby="personality-heading">
          <h2 id="personality-heading" className="text-2xl text-slate-900">
            Money personality
          </h2>
          {personality ? (
            <div className="mt-3">
              <p className="font-display text-xl text-slate-900">{personality.name}</p>
              <p className="text-sm text-slate-600">{personality.line}</p>
              <p className="mt-2 text-sm text-slate-700">{personality.focus.tip}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/personality" className={secondaryButton}>
                  See your result
                </Link>
                <Link href="/personality?retake=1" className={secondaryButton}>
                  Retake
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-slate-600">Six quick questions to find where to start — Impulse Buyer, Weekend Millionaire, Professional Procrastinator or Secret Saver?</p>
              <Link href="/personality" className={`${primaryButton} mt-4`}>
                Take the quiz
              </Link>
            </div>
          )}
        </section>
        <section id="league" className="scroll-mt-20" aria-labelledby="league-heading">
          <h2 id="league-heading" className="text-2xl text-slate-900">
            Weekly league
          </h2>
          <div className="mt-3">
            <League optedIn={league.optedIn} rows={league.rows} you={league.you} participants={league.participants} endsOn={league.endsOn} />
          </div>
        </section>
      </div>

      {/* Badges */}
      <section aria-labelledby="badges-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="badges-heading" className="text-2xl text-slate-900">
            Badges
          </h2>
          <span className="text-sm text-slate-500">
            {earnedCount} of {badges.length} earned
          </span>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge, i) => {
            const earned = badge.earnedAt !== null;
            return (
              <li
                key={badge.id}
                className={`flex animate-fade-up flex-col items-center rounded-2xl p-4 text-center ${earned ? "border border-slate-200 bg-white" : "border border-dashed border-slate-300"}`}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <Medal icon={<BadgeIcon id={badge.id} />} earned={earned} />
                <p className={`mt-2 text-sm font-bold ${earned ? "text-slate-900" : "text-slate-600"}`}>{badge.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{badge.ruleText}</p>
                {badge.earnedAt ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckIcon className="h-3.5 w-3.5" /> Earned {formatDate(badge.earnedAt)}
                  </p>
                ) : (
                  <div className="mt-2.5 w-full max-w-[9rem]">
                    <ProgressBar value={badge.done} max={badge.required} label={`${badge.name} progress`} tone="bg-orange-400" size="sm" />
                    <p className="mt-1 text-xs font-medium text-slate-500 tabular-nums">
                      {badge.done}/{badge.required} done
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Mastery */}
      <section className="scroll-mt-20" aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="text-2xl text-slate-900">
          Topic mastery
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Based on your quizzes and spaced revision — not on XP. Completing a lesson isn&apos;t proof you remember it; getting it right again days
          later is.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {progress.lessons.map((lesson) => {
              const status = mastery.get(lesson.id) ?? "not-started";
              return (
                <li key={lesson.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <IconTile area={lesson.area} size="sm">
                    <LessonIcon slug={lesson.slug} area={lesson.area} />
                  </IconTile>
                  <Link href={`/lessons/${lesson.slug}`} className="min-w-0 flex-1 font-medium text-slate-900 hover:text-brand-700">
                    {lesson.title}
                  </Link>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${MASTERY_META[status].className}`}>
                    {MASTERY_META[status].label}
                  </span>
                </li>
              );
            })}
          </ul>
          <div>
            <h3 className="text-base text-slate-900">Readiness and accuracy by topic</h3>
            <p className="mt-1 text-xs text-slate-500">
              Readiness (0–100) tracks how much of each topic you&apos;ve learned and shown in quizzes — it isn&apos;t an assessment of your actual
              finances.
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
                      <td className="px-2 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                        {area.quizAccuracy === null ? "—" : `${area.quizAccuracy}%`}
                      </td>
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

      {/* Settings */}
      <div className="grid grid-cols-1 gap-10 border-t border-slate-200 pt-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
        <section aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="text-xl text-slate-900">
            Edit profile
          </h2>
          <p className="mt-1 text-sm text-slate-600">Your name, college, stage and learning goal.</p>
          <div className="mt-4">
            <ProfileForm displayName={displayName} collegeName={user.collegeName ?? ""} stage={user.stage ?? ""} goal={user.goal ?? ""} />
          </div>
        </section>

        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4" aria-labelledby="account-heading">
            <div>
              <h2 id="account-heading" className="text-xl text-slate-900">
                Account
              </h2>
              <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="truncate font-medium text-slate-900">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-slate-500">Member since</dt>
                  <dd className="font-medium text-slate-900">{memberSince}</dd>
                </div>
              </dl>
            </div>
            <AccountActions />
          </section>

          <section aria-labelledby="legal-heading">
            <h2 id="legal-heading" className="text-xl text-slate-900">
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
      </div>
    </div>
  );
}
