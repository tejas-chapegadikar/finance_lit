import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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
            className="hidden max-w-32 truncate text-sm font-semibold text-white hover:text-orange-200 sm:inline"
          >
            {displayName}
          </Link>
          <Link
            href="/account"
            className="text-sm font-semibold text-white hover:text-orange-200 sm:hidden"
          >
            Account
          </Link>
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
