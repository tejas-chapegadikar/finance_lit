import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const LINKS = [
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/challenges", label: "Daily challenges" },
  { href: "/admin/metrics", label: "Metrics" },
  { href: "/dashboard", label: "Back to app" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 p-4">
          <Link href="/admin/lessons" className="text-lg font-bold">
            StockStreak Admin
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
