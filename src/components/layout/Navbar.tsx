import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { XPBadge } from "./XPBadge";

export function Navbar({
  xpTotal,
  userName,
  isAdmin,
}: {
  xpTotal: number;
  userName: string | null;
  isAdmin: boolean;
}) {
  return (
    <header className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-900/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
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
          <UserButton showName={!!userName} />
        </nav>
      </div>
    </header>
  );
}
