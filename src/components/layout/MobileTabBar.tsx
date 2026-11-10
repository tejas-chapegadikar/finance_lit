"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

/** The bottom tab bar on phones and tablets: big touch targets, violet for where you are. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg justify-around px-2">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ href, shortLabel, Icon, also }) => {
          const active = isActive(pathname, href, also);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition ${
                  active ? "font-semibold text-slate-900" : "font-medium text-slate-500"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition duration-200 ${
                    active ? "bg-brand-500 text-brand-900" : "text-slate-500"
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
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
