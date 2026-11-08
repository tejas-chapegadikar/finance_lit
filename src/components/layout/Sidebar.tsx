"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { Logo } from "@/components/ui/Logo";
import { NAV_ITEMS, isActive } from "./nav-items";
import { XPBadge } from "./XPBadge";
import { SettingsIcon } from "@/components/ui/icons";

/** Desktop navigation: the pillars and other destinations, Settings, XP and you, as your avatar. */
export function Sidebar({
  xpTotal,
  displayName,
  title,
  avatar,
}: {
  xpTotal: number;
  displayName: string;
  title: string | null;
  avatar: AvatarConfig;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
      <Link href="/dashboard" aria-label="StockStreak home" className="px-7 pt-7 pb-9">
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
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition ${
                active
                  ? "bg-white font-semibold text-slate-900 shadow-[0_1px_2px_rgb(30_28_26/0.06)] ring-1 ring-slate-200"
                  : "font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition ${active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={`mt-auto mb-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition ${
            pathname.startsWith("/settings") ? "bg-white font-semibold text-slate-900 ring-1 ring-slate-200" : "font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900"
          }`}
        >
          <SettingsIcon className="h-5 w-5 shrink-0 text-slate-400" />
          Settings
        </Link>
      </nav>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4">
        <div className="px-1">
          <XPBadge xpTotal={xpTotal} id="xp-sidebar" />
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white"
          aria-label={`Your profile (${displayName})`}
        >
          <span className="flex h-10 w-10 shrink-0 items-end justify-center overflow-hidden rounded-full bg-brand-50 ring-1 ring-slate-200">
            <Avatar config={avatar} crop="head" className="h-10 w-10" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{displayName}</span>
            {title && <span className="block truncate text-xs text-slate-500">{title}</span>}
          </span>
        </Link>
      </div>
    </aside>
  );
}
