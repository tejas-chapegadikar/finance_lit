import Link from "next/link";
import { UserAvatar } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";
import { XPBadge } from "./XPBadge";

/** The top bar on phones and tablets (with the bottom tab bar); desktops get the sidebar instead. */
export function Navbar({ xpTotal, displayName }: { xpTotal: number; displayName: string }) {
  return (
    // Fixed h-14 so sticky elements below it (the lesson progress bar) can sit at top-14.
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="StockStreak home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <XPBadge xpTotal={xpTotal} id="xp-navbar" />
          <Link
            href="/profile"
            aria-label={`Your profile (${displayName})`}
            className="rounded-full ring-2 ring-transparent transition hover:ring-slate-200"
          >
            <UserAvatar />
          </Link>
        </div>
      </div>
    </header>
  );
}
