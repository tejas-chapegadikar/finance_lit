import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getBadges } from "@/lib/badges";
import { stageLabel } from "@/lib/learner-profile";
import { LEGAL_LINKS } from "@/lib/site";
import { LEVEL_1_NAME } from "@/lib/constants";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AccountActions } from "@/components/account/AccountActions";
import { Medal } from "@/components/ui/Medal";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card, heroChip, heroSurface, primaryButton } from "@/components/ui/button-styles";
import { AlertIcon, ArrowRightIcon, DocumentIcon, InfoIcon, LockIcon, MailIcon } from "@/components/ui/icons";

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
  const [progress, earnedBadges, xpHistory] = await Promise.all([
    getProgress(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    db.xPTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, amount: true, description: true, createdAt: true },
    }),
  ]);
  const badges = getBadges(progress.lessons, earnedBadges);
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const displayName = getDisplayName(user);
  const subtitle = [stageLabel(user.stage), user.collegeName].filter(Boolean).join(" · ");
  const memberSince = user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const overallProgress = progress.totalLessons
    ? Math.round((progress.completedCount / progress.totalLessons) * 100)
    : 0;

  const stats = [
    { label: "Total XP", value: user.xpTotal.toLocaleString("en-IN") },
    { label: "Lessons completed", value: `${progress.completedCount}/${progress.totalLessons}` },
    { label: "Overall progress", value: `${overallProgress}%` },
    { label: "Current level", value: "Level 1" },
    { label: "Financial Readiness", value: `${progress.overall}/100` },
    { label: "Badges earned", value: `${earnedCount}/${badges.length}` },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl font-extrabold text-brand-700 uppercase shadow-[0_4px_0_0_var(--color-brand-800)]">
            {displayName.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{displayName}</h1>
            <p className="mt-1.5 flex flex-wrap gap-1.5">
              <span className={heroChip}>
                Level 1 · {LEVEL_1_NAME}
                {progress.levelComplete && " · 🎓 Graduate"}
              </span>
              {subtitle && <span className={heroChip}>{subtitle}</span>}
            </p>
          </div>
        </div>

        <h2 className="sr-only">Learning statistics</h2>
        <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            // Label first for screen readers; shown under the number.
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/15"
            >
              <dt className="mt-0.5 text-xs font-semibold">{stat.label}</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {progress.completedCount === 0 && progress.next && (
        <section className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}>
          <span aria-hidden className="text-4xl">
            🌱
          </span>
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
                    ? "bg-amber-50 ring-amber-200 shadow-[0_4px_0_0_var(--color-amber-200)]"
                    : "bg-slate-50 ring-slate-200 shadow-[0_4px_0_0_var(--color-slate-200)]"
                }`}
              >
                <Medal icon={badge.icon} earned={earned} />
                <p className={`mt-2 text-sm font-bold ${earned ? "text-slate-900" : "text-slate-600"}`}>{badge.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">{badge.rule}</p>
                <p className={`mt-1.5 text-xs font-bold ${earned ? "text-emerald-800" : "text-slate-600"}`}>
                  {badge.earnedAt
                    ? `✓ Earned ${formatDate(badge.earnedAt)}`
                    : `🔒 ${badge.done}/${badge.required} done`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="xp-heading">
        <h2 id="xp-heading" className="text-lg font-extrabold text-slate-900">
          Recent XP
        </h2>
        {xpHistory.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No XP yet. Complete a lesson for your first +75 XP, or answer Today&apos;s Challenge for +25.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {xpHistory.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-200"
                >
                  ⭐
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">{tx.description ?? "XP"}</span>
                  <span className="text-xs text-slate-600">{formatDate(tx.createdAt)}</span>
                </span>
                <span className="shrink-0 font-extrabold text-orange-700 tabular-nums">+{tx.amount} XP</span>
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
