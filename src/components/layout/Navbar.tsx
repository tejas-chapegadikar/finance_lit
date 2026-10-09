import Link from "next/link";
import { UserAvatar } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";
import { DesktopNav } from "./DesktopNav";
import { XPBadge } from "./XPBadge";

/** The top bar on phones and tablets; desktops get the sidebar instead. */
export function Navbar({ xpTotal, displayName }: { xpTotal: number; displayName: string }) {
  return (
    // Fixed h-14 so sticky elements below it (the lesson progress bar) can sit at top-14.
    <header className="sticky top-0 z-30 border-b border-slate-900/5 bg-white/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="StockStreak home" className="shrink-0">
          <Logo />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <XPBadge xpTotal={xpTotal} />
          <Link
            href="/profile"
            aria-label={`Your profile (${displayName})`}
            className="rounded-full ring-2 ring-transparent transition hover:ring-brand-200"
          >
            <UserAvatar />
          </Link>
        </div>
      </div>
    </header>
  );
}
