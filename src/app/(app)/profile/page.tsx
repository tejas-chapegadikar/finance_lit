import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { getBadges, loadBadgeStats } from "@/lib/badges";
import { istDay } from "@/lib/ist-date";
import { FREEZE_EVERY_DAYS, MAX_STREAK_FREEZES, getActivityDays, nextStreakMilestone, streakStatus } from "@/lib/streak";
import { levelFor } from "@/lib/levels";
import { avatarName, readAvatar } from "@/lib/avatar";
import { findPersonality } from "@/lib/personality";
import { monthLabel, monthOf, monthBounds } from "@/lib/money";
import { Avatar } from "@/components/avatar/Avatar";
import { StreakCalendar } from "@/components/profile/StreakCalendar";
import { Medal } from "@/components/ui/Medal";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgeIcon } from "@/components/ui/topic-icons";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card } from "@/components/ui/button-styles";
import { FlameIcon, PaletteIcon, SettingsIcon, SnowflakeIcon, SparklesIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Me | Rupli" };

const SHOWN_BADGES = 6;

export default async function MePage() {
  const user = await requireOnboardedUser();
  const today = istDay();
  const month = monthOf(today);
  const { first, last } = monthBounds(month);
  const [progress, earnedBadges, activity] = await Promise.all([
    getProgress(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    getActivityDays(db, user.id, first, last),
  ]);
  const badgeStats = await loadBadgeStats(db, user.id, progress.lessons);
  const badges = getBadges(badgeStats, earnedBadges).sort((a, b) => Number(!!b.earnedAt) - Number(!!a.earnedAt));
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const name = avatarName(user);
  const streak = streakStatus(user, today);
  const level = levelFor(user.xpTotal);
  const milestone = nextStreakMilestone(streak.streak);
  const personality = findPersonality(user.moneyPersonality);

  const badgeTile = (badge: (typeof badges)[number]) => (
    <li key={badge.id} className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 p-3 text-center">
      <span className={badge.earnedAt ? "" : "opacity-60 grayscale"}>
        <Medal icon={<BadgeIcon id={badge.id} />} earned={!!badge.earnedAt} />
      </span>
      <p className="text-xs font-semibold text-slate-900">{badge.name}</p>
      {!badge.earnedAt && <p className="text-[11px] leading-tight text-slate-600">{badge.ruleText}</p>}
    </li>
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header className={`${card} flex items-center gap-4 p-4`}>
        <Link href="/profile/avatar" aria-label="Open Avatar Studio" className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-full bg-brand-100">
          <Avatar config={readAvatar(user.avatar)} crop="head" className="h-20 w-20" label={`${name}'s avatar`} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl leading-tight text-slate-900">{name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold text-brand-900">Level {level.level}</span>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-orange-500" />
              <CountUp value={user.xpTotal} id="xp-profile" /> XP
            </span>
          </p>
          <div className="mt-2">
            <ProgressBar value={level.into} max={level.span} label={`Level ${level.level} progress`} size="sm" tone="bg-brand-500" />
            <p className="mt-1 text-xs font-medium text-slate-600">{level.toNext} XP to Level {level.level + 1}</p>
          </div>
        </div>
      </header>

      <section id="streak" aria-labelledby="streak-heading" className={`${card} scroll-mt-20 p-4`}>
        <h2 id="streak-heading" className="text-lg text-slate-900">
          Streak
        </h2>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Current", value: streak.streak, Icon: FlameIcon, tone: "text-orange-500" },
            { label: "Best", value: Math.max(user.longestStreak, streak.streak), Icon: TrophyIcon, tone: "text-amber-600" },
            { label: "Freezes", value: `${user.streakFreezes}/${MAX_STREAK_FREEZES}`, Icon: SnowflakeIcon, tone: "text-sky-600" },
          ].map(({ label, value, Icon, tone }) => (
            <div key={label} className="flex flex-col-reverse items-center rounded-2xl bg-slate-50 p-3">
              <dt className="text-xs font-medium text-slate-600">{label}</dt>
              <dd className="inline-flex items-center gap-1 font-display text-xl font-bold text-slate-900 tabular-nums">
                <Icon className={`h-4 w-4 ${tone}`} />
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-slate-700">
          {milestone ? (
            <>
              Next milestone: <span className="font-semibold">{milestone.days} days</span> for <span className="font-semibold text-orange-700">+{milestone.xp} XP</span>.
            </>
          ) : (
            "Every milestone cleared. Now you're just showing off."
          )}
        </p>
        <p className="mt-1 text-xs text-slate-600">Finish any daily quest to count the day. You earn 1 freeze every {FREEZE_EVERY_DAYS} days (max {MAX_STREAK_FREEZES}), and it&apos;s used automatically if you miss a day.</p>
        <div className="mt-3">
          <StreakCalendar month={month} today={today} days={activity} label={monthLabel(month)} />
        </div>
      </section>

      <section aria-labelledby="badges-heading" className={`${card} p-4`}>
        <div className="flex items-baseline justify-between">
          <h2 id="badges-heading" className="text-lg text-slate-900">
            Badges
          </h2>
          <span className="text-xs font-medium text-slate-600 tabular-nums">
            {earnedCount} of {badges.length}
          </span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2">{badges.slice(0, SHOWN_BADGES).map(badgeTile)}</ul>
        {badges.length > SHOWN_BADGES && (
          <details className="mt-2">
            <summary className="min-h-10 cursor-pointer py-2 text-sm font-semibold text-brand-700">See all {badges.length} badges</summary>
            <ul className="mt-1 grid grid-cols-3 gap-2">{badges.slice(SHOWN_BADGES).map(badgeTile)}</ul>
          </details>
        )}
      </section>

      <ul className={menuListClass} aria-label="More">
        {[
          { href: "/profile/avatar", label: "Avatar Studio", icon: <PaletteIcon /> },
          { href: "/personality", label: personality ? `Money personality: ${personality.name}` : "Take the Money personality quiz", icon: <SparklesIcon /> },
          { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
        ].map((row) => (
          <li key={row.href}>
            <Link href={row.href} className={menuRowClass}>
              <MenuRowContent icon={row.icon} label={row.label} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
