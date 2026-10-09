"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

/** The inline links in the tablet top bar (phones use the tab bar, desktops the sidebar). */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
      {NAV_ITEMS.map(({ href, shortLabel }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
              active
                ? "bg-brand-600 text-white shadow-[0_3px_0_0_var(--color-brand-800)]"
                : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
