import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { DISCLAIMER_SHORT, LEGAL_LINKS } from "@/lib/site";
import { findReward } from "@/lib/rewards";
import { avatarName, readAvatar } from "@/lib/avatar";
import { getPendingAvatarEvents, queueAvatarEvent } from "@/lib/avatar/events";
import { db } from "@/lib/db";
import { daysBetween, istDay } from "@/lib/ist-date";
import { AvatarBuddy } from "@/components/avatar/AvatarBuddy";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboardedUser();
  const navProps = { xpTotal: user.xpTotal, displayName: getDisplayName(user) };
  const title = findReward(user.title)?.name ?? null;
  const avatar = readAvatar(user.avatar);
  // The avatar reacts to what you do: unseen events, newest state on every navigation.
  // Once a day the avatar says hello — or welcome back, after a few days away.
  const today = istDay();
  const away = user.streakLastDay ? daysBetween(user.streakLastDay, today) : 0;
  if (user.avatarReactions) {
    await queueAvatarEvent(db, user.id, away >= 3 ? "welcome-back" : "greeting", `${away >= 3 ? "welcome-back" : "greeting"}:${today}`);
  }
  const pending = user.avatarReactions ? await getPendingAvatarEvents(user.id) : [];

  return (
    <div className="flex min-h-screen flex-col lg:pl-64">
      <Sidebar {...navProps} title={title} avatar={avatar} />
      <Navbar {...navProps} avatar={avatar} />
      {/* Bottom padding below desktop keeps content clear of the fixed tab bar. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-12">
        {children}
        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <p>{DISCLAIMER_SHORT}</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </main>
      <MobileTabBar />
      <AvatarBuddy events={pending} avatar={avatar} name={avatarName(user)} enabled={user.avatarReactions} />
    </div>
  );
}
