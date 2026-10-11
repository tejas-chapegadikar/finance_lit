import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { DISCLAIMER_SHORT, LEGAL_LINKS } from "@/lib/site";
import { findReward } from "@/lib/rewards";
import { readAvatar } from "@/lib/avatar";
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

  return (
    <div className="flex min-h-screen flex-col lg:pl-64">
      <Sidebar {...navProps} title={title} avatar={readAvatar(user.avatar)} />
      <Navbar {...navProps} />
      {/* Bottom padding below desktop keeps content clear of the fixed tab bar. */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-12">
        {children}
        <footer className="mt-12 flex flex-col items-center gap-2 text-center text-xs text-slate-600">
          <p>{DISCLAIMER_SHORT}</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-semibold hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </main>
      <MobileTabBar />
    </div>
  );
}
