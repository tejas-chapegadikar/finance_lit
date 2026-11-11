import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { XPBadge } from "./XPBadge";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { GuideButton } from "@/components/guide/GuideBits";

/** The top bar on phones and tablets (with the bottom tab bar); desktops get the sidebar instead. */
export function Navbar({ xpTotal, displayName, avatar }: { xpTotal: number; displayName: string; avatar: AvatarConfig }) {
  return (
    // Fixed h-14 so sticky elements below it (the lesson progress bar) can sit at top-14.
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="Rupli home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <GuideButton />
          <Link href="/profile" aria-label={`${xpTotal} XP, your profile`} className="rounded-full transition hover:opacity-80">
            <XPBadge xpTotal={xpTotal} id="xp-navbar" />
          </Link>
          <Link
            href="/profile"
            aria-label={`Your profile (${displayName})`}
            className="flex h-9 w-9 items-end justify-center overflow-hidden rounded-full bg-brand-50 ring-1 ring-brand-100 transition hover:ring-brand-300"
          >
            <Avatar config={avatar} crop="head" className="h-9 w-9" />
          </Link>
        </div>
      </div>
    </header>
  );
}
