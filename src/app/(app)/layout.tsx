import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { DISCLAIMER_SHORT, LEGAL_LINKS } from "@/lib/site";
import { findReward } from "@/lib/rewards";
import { avatarName, readAvatar } from "@/lib/avatar";
import { getPendingAvatarEvents } from "@/lib/avatar/events";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MotionToggle } from "@/components/ui/Motion";
import { BuddyHost } from "@/components/buddy/BuddyHost";
import { db } from "@/lib/db";
import { levelFor } from "@/lib/levels";
import { streakStatus } from "@/lib/streak";
import { nicknameOf } from "@/lib/user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const navProps = { xpTotal: user.xpTotal, displayName: getDisplayName(user) };
  const title = findReward(user.title)?.name ?? null;
  const avatar = readAvatar(user.avatar);
  const [pending, seenTips] = await Promise.all([
    getPendingAvatarEvents(user.id),
    db.seenTip.findMany({ where: { userId: user.id }, select: { tipId: true } }),
  ]);

  const level = levelFor(user.xpTotal);
  const streak = streakStatus(user).streak;
  // Numbers the buddy can mention in its comments (a streak of 0 isn't worth mentioning).
  const buddyFacts = {
    name: nicknameOf(user),
    xp: user.xpTotal.toLocaleString("en-IN"),
    level: level.level,
    toNext: level.toNext,
    ...(streak > 1 ? { streak } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col lg:pl-64">
      <Sidebar {...navProps} title={title} avatar={avatar} />
      <Navbar {...navProps} avatar={avatar} />
      {/* Bottom padding below desktop keeps content clear of the fixed tab bar. */}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-12">
        {children}
        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <p>{DISCLAIMER_SHORT}</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-6 items-center font-medium text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
            <MotionToggle />
          </nav>
        </footer>
      </main>
      <MobileTabBar />
      <BuddyHost
        avatar={avatar}
        seen={seenTips.map((t) => t.tipId)}
        tipsOn={user.avatarReactions}
        events={pending}
        name={avatarName(user)}
        facts={buddyFacts}
      />
    </div>
  );
}
