import Link from "next/link";
import { UserAvatar } from "@clerk/nextjs";
import { XPBadge } from "./XPBadge";

export function Navbar({
  xpTotal,
  displayName,
  isAdmin,
}: {
  xpTotal: number;
  displayName: string;
  isAdmin: boolean;
}) {
  return (
    <header className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-900/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 p-4">
        <Link href="/lessons" className="text-lg font-extrabold tracking-tight text-white">
          Stock<span className="text-orange-300">Streak</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-violet-100 hover:text-white sm:inline"
          >
            Dashboard
          </Link>
          <Link
            href="/lessons"
            className="hidden text-sm font-medium text-violet-100 hover:text-white sm:inline"
          >
            Lessons
          </Link>
          {isAdmin && (
            <Link
              href="/admin/lessons"
              className="hidden text-sm font-medium text-violet-100 hover:text-white sm:inline"
            >
              Admin
            </Link>
          )}
          <XPBadge xpTotal={xpTotal} />
          <Link
            href="/account"
            aria-label="Your account"
            className="flex items-center gap-2 rounded-full p-0.5 text-white ring-2 ring-transparent transition hover:ring-white/40 sm:pl-3"
          >
            <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">
              {displayName}
            </span>
            <UserAvatar />
          </Link>
        </nav>
      </div>
    </header>
  );
}
