import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          <Link href="/admin/lessons" className="text-lg font-bold">
            StockStreak Admin
          </Link>
          <Link href="/lessons" className="text-sm text-neutral-300 hover:text-white">
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
