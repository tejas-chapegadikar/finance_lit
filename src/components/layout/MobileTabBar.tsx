"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

const TABS = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/lessons", label: "Lessons", Icon: BookIcon },
  { href: "/account", label: "Account", Icon: UserIcon },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-900/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex max-w-md justify-around px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
                  active ? "text-violet-700" : "text-neutral-500"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    active ? "bg-violet-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
