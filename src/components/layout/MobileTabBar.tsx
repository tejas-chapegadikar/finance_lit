"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-slate-900/5 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_rgb(15_23_42/0.25)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex max-w-md justify-around px-2 pt-1">
        {NAV_ITEMS.map(({ href, shortLabel, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-bold ${
                  active ? "text-brand-700" : "text-slate-600"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    active ? "bg-brand-500 text-white shadow-[0_3px_0_0_var(--color-brand-700)]" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
