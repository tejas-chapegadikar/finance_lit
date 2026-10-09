"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";
import { NAV_ITEMS, isActive } from "./nav-items";
import { XPBadge } from "./XPBadge";

/** Desktop navigation: the four destinations, XP and the student's profile. */
export function Sidebar({ xpTotal, displayName, title }: { xpTotal: number; displayName: string; title: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-900/5 bg-white lg:flex">
      <Link href="/dashboard" aria-label="StockStreak home" className="px-7 pt-6 pb-8">
        <Logo />
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map(({ href, label, Icon, also }) => {
          const active = isActive(pathname, href, also);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-brand-600 text-white shadow-[0_4px_0_0_var(--color-brand-800)]"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-slate-100 p-4">
        <div className="px-2">
          <XPBadge xpTotal={xpTotal} />
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-100"
          aria-label={`Your profile (${displayName})`}
        >
          <UserAvatar />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">{displayName}</span>
            {title && <span className="block truncate text-xs font-semibold text-brand-700">{title}</span>}
          </span>
        </Link>
      </div>
    </aside>
  );
}
