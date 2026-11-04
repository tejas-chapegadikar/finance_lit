import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { getBadges, loadBadgeStats } from "@/lib/badges";
import { istDay } from "@/lib/ist-date";
import { streakStatus } from "@/lib/streak";
import { rankFor } from "@/lib/ranks";
import { AVATAR_ITEMS, AVATAR_SLOTS, avatarName, findAvatarItem, isAvatarItemUnlocked, readAvatar, unlockText } from "@/lib/avatar";
import { getAvatarUnlocks } from "@/lib/avatar-unlocks";
import { stageLabel } from "@/lib/learner-profile";
import { PATH_NAME } from "@/lib/constants";
import { findReward } from "@/lib/rewards";
import { findPersonality } from "@/lib/personality";
import { Avatar } from "@/components/avatar/Avatar";
import { Medal } from "@/components/ui/Medal";
import { CountUp } from "@/components/ui/CountUp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgeIcon } from "@/components/ui/topic-icons";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card, gameSurface, lightButton, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, BookIcon, CalendarCheckIcon, FlameIcon, GiftIcon, LockIcon, SparklesIcon, StarIcon, TagIcon, UserIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Profile — StockStreak" };

const formatDate = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// The profile is your avatar's home: you, as your avatar, with your name,
// rank, streak and XP; what you're wearing and what you've unlocked; and your
// latest achievements. Progress over time lives on /progress, account
// details on /settings.
export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const today = istDay();
  const [progress, earnedBadges, unlocks] = await Promise.all([
    getProgress(user.id),
    db.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true, earnedAt: true } }),
    getAvatarUnlocks(user.id),
  ]);
  const badgeStats = await loadBadgeStats(db, user.id, progress.lessons);
  const badges = getBadges(badgeStats, earnedBadges);
  const earned = badges.filter((b) => b.earnedAt).sort((a, b) => b.earnedAt!.getTime() - a.earnedAt!.getTime());
  const avatar = readAvatar(user.avatar);
  const name = avatarName(user);
  const streak = streakStatus(user, today);
  const rank = rankFor(progress.completedCount, progress.overall, progress.totalLessons);
  const title = findReward(user.title);
  const theme = findReward(user.theme);
  const personality = findPersonality(user.moneyPersonality);
  const subtitle = [stageLabel(user.stage), user.collegeName].filter(Boolean).join(" · ");

  const unlockedItems = AVATAR_ITEMS.filter((item) => isAvatarItemUnlocked(item, unlocks));
  const lockedItems = AVATAR_ITEMS.filter((item) => !isAvatarItemUnlocked(item, unlocks));
  // The next few things to unlock: milestones first (they're free), then the cheapest store items.
  const nextUnlocks = [...lockedItems]
    .sort((a, b) => Number(a.unlock.type === "xp") - Number(b.unlock.type === "xp") || (a.unlock.type === "xp" && b.unlock.type === "xp" ? a.unlock.cost - b.unlock.cost : 0))
    .slice(0, 4);
  const equipped = AVATAR_SLOTS.filter(({ slot }) => slot !== "hairColor" || avatar.hair !== "hair-buzz").map(({ slot, label }) => ({ label, item: findAvatarItem(avatar[slot]) })).filter(
    ({ item }) => item && !["None", "Just you", "Barefoot", "Smooth"].includes(item.name),
  );

  const stats = [
    { label: "XP", value: <CountUp value={user.xpTotal} id="xp-profile" />, Icon: StarIcon, tone: "text-orange-300" },
    { label: "Streak", value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`, Icon: FlameIcon },
    { label: "Lessons", value: `${progress.completedCount}/${progress.totalLessons}`, Icon: BookIcon },
    { label: "Badges", value: `${earned.length}/${badges.length}`, Icon: SparklesIcon },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      {/* You, as your avatar */}
      <section aria-labelledby="profile-name" className={`${gameSurface} animate-fade-up p-6 sm:p-9`}>
        {theme?.gradient && <span aria-hidden className={`absolute inset-x-0 top-0 -z-10 h-40 opacity-50 ${theme.gradient}`} />}
        <span aria-hidden className="pointer-events-none absolute top-6 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(150_130_255/0.45),transparent_65%)] md:left-[28%]" />
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col items-center">
            <Avatar config={avatar} expression="welcoming" className="h-56 w-auto animate-bob sm:h-64" label={`${name}'s avatar`} />
            <Link href="/profile/avatar" className={`${lightButton} mt-3`}>
              Open Avatar Studio
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="min-w-0 text-center md:text-left">
            <p className="text-[13px] font-medium text-white/60">Your avatar is you</p>
            <h1 id="profile-name" className="truncate text-4xl leading-tight text-white sm:text-5xl">
              {name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-white/70 md:justify-start">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">{rank.current.name}</span>
              {title && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-400/20 px-2.5 py-0.5 text-xs font-semibold text-orange-200">
                  <TagIcon className="h-3.5 w-3.5" />
                  {title.name}
                </span>
              )}
              <span>{[progress.levelComplete ? `${PATH_NAME} Graduate` : progress.currentLevel ? `Level ${progress.currentLevel.chapter.number}` : null, subtitle].filter(Boolean).join(" · ")}</span>
            </p>
            {rank.toNext && <p className="mt-1 text-sm text-white/55">{rank.toNext}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ label, value, Icon, tone }) => (
                <div key={label} className="flex min-w-0 flex-col-reverse justify-end gap-1 rounded-2xl bg-white/8 px-3 py-3 ring-1 ring-white/10">
                  <dd className={`truncate font-display text-lg leading-tight font-bold tabular-nums ${tone ?? "text-white"}`}>{value}</dd>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-white/55">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        {/* What you're wearing, and what's next */}
        <section aria-labelledby="wardrobe-heading" className={`${card} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="wardrobe-heading" className="text-xl text-slate-900">
              Your avatar
            </h2>
            <span className="text-sm text-slate-500 tabular-nums">
              {unlockedItems.length} of {AVATAR_ITEMS.length} items unlocked
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={unlockedItems.length} max={AVATAR_ITEMS.length} label="Avatar items unlocked" tone="bg-brand-500" />
          </div>
          <h3 className="mt-5 text-sm font-semibold text-slate-700">Wearing</h3>
          {equipped.length === 0 ? (
            <p className="mt-1 text-sm text-slate-600">Just you — the original. Dress up in Avatar Studio.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {equipped.map(({ label, item }) => (
                <li key={label} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                  {item!.name}
                </li>
              ))}
            </ul>
          )}
          {nextUnlocks.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold text-slate-700">Next to unlock</h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {nextUnlocks.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2 text-sm">
                    <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                      <Avatar config={{ ...avatar, [item.slot]: item.id }} crop={["skin", "eyes", "mouth", "hair", "hairColor", "headwear", "glasses"].includes(item.slot) ? "head" : "full"} className="h-full w-auto" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{item.name}</span>
                      <span className="text-xs text-slate-500">{unlockText(item)}</span>
                    </span>
                    <LockIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link href="/profile/avatar" className={`${primaryButton} mt-5`}>
            Customise in Avatar Studio
          </Link>
        </section>

        {/* Latest achievements */}
        <section aria-labelledby="latest-badges-heading" className={`${card} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="latest-badges-heading" className="text-xl text-slate-900">
              Achievements
            </h2>
            <Link href="/progress#achievements" className="text-sm font-semibold text-brand-700">
              See all
            </Link>
          </div>
          {earned.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No badges yet — finish your first lesson to earn First Steps.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {earned.slice(0, 4).map((badge) => (
                <li key={badge.id} className="flex flex-col items-center rounded-2xl bg-slate-50 p-3 text-center">
                  <Medal icon={<BadgeIcon id={badge.id} />} earned />
                  <p className="mt-2 text-sm font-bold text-slate-900">{badge.name}</p>
                  <p className="text-xs text-slate-500">{formatDate(badge.earnedAt!)}</p>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-8 text-xl text-slate-900">Money personality</h2>
          {personality ? (
            <div className="mt-2">
              <p className="font-display text-lg font-bold text-slate-900">{personality.name}</p>
              <p className="text-sm text-slate-600">{personality.line} · how your habits look right now.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/personality" className={secondaryButton}>
                  See your result
                </Link>
                <Link href="/personality?retake=1" className={secondaryButton}>
                  Retake
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-slate-600">Six quick questions — Impulse Buyer, Weekend Millionaire, Smart Planner…?</p>
              <Link href="/personality" className={`${primaryButton} mt-3`}>
                Take the quiz
              </Link>
            </div>
          )}
        </section>
      </div>

      <ul className={menuListClass} aria-label="More">
        {[
          { href: "/progress", label: "Progress — XP, streak and mastery", icon: <CalendarCheckIcon /> },
          { href: "/rewards", label: "Rewards Store", icon: <GiftIcon /> },
          { href: "/settings", label: "Settings — your details and avatar pop-ups", icon: <UserIcon /> },
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
