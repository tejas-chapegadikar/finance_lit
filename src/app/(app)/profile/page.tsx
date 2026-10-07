import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { getProgress } from "@/lib/progress";
import { getBadges } from "@/lib/badges";
import { displayStreak } from "@/lib/streak";
import { stageLabel } from "@/lib/learner-profile";
import { LEVEL_1_NAME } from "@/lib/constants";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AccountActions } from "@/components/account/AccountActions";
import { card, heroSurface, softButton } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Profile — StockStreak" };

export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const progress = await getProgress(user.id);
  const badges = getBadges(progress.lessons);
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const displayName = getDisplayName(user);
  const streak = displayStreak(user);
  const subtitle = [stageLabel(user.stage), user.collegeName].filter(Boolean).join(" · ");
  const memberSince = user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const stats = [
    { label: "Financial Readiness", value: `${progress.overall}/100` },
    { label: "XP earned", value: user.xpTotal.toLocaleString("en-IN") },
    { label: `of ${progress.totalLessons} lessons completed`, value: String(progress.completedCount) },
    { label: "Day streak", value: `🔥 ${streak}` },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-brand-700 uppercase shadow-md shadow-brand-900/20">
            {displayName.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{displayName}</h1>
            <p className="text-sm font-semibold">
              Level 1 · {LEVEL_1_NAME}
              {progress.levelComplete && " · 🎓 Graduate"}
            </p>
            {subtitle && <p className="truncate text-sm">{subtitle}</p>}
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            // Label first for screen readers; shown under the number.
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end rounded-2xl bg-brand-900/30 p-4 ring-1 ring-white/15"
            >
              <dt className="mt-0.5 text-xs font-semibold">{stat.label}</dt>
              <dd className="text-2xl font-extrabold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
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
                  earned ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-slate-900/5"
                }`}
              >
                <span aria-hidden className={`text-4xl ${earned ? "" : "opacity-40 grayscale"}`}>
                  {badge.icon}
                </span>
                <p className={`mt-2 text-sm font-bold ${earned ? "text-slate-900" : "text-slate-600"}`}>{badge.name}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {earned ? "✓ Earned" : `🔒 ${badge.description}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="text-lg font-extrabold text-slate-900">
          Settings
        </h2>
        <p className="text-sm text-slate-600">Your name, college and stage.</p>
        <div className="mt-4">
          <ProfileForm displayName={displayName} collegeName={user.collegeName ?? ""} stage={user.stage ?? ""} />
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
        {user.role === "ADMIN" && (
          <Link href="/admin/lessons" className={`${softButton} self-start`}>
            Open admin panel
          </Link>
        )}
      </section>
    </div>
  );
}
