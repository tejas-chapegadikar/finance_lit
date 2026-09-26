import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard — StockStreak" };

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const recentTransactions = await db.xPTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20">
        <div>
          <h1 className="text-xl font-extrabold">
            Welcome back{user.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-violet-100">Keep the momentum going.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-orange-300">
            {user.xpTotal.toLocaleString()}
          </p>
          <p className="text-xs font-medium text-violet-200">Total XP</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold text-neutral-900">Recent activity</h2>
        {recentTransactions.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-neutral-500 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
            No activity yet — head to{" "}
            <Link href="/lessons" className="font-medium text-violet-600 underline">
              Lessons
            </Link>{" "}
            to earn your first XP.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5"
              >
                <span className="font-medium text-neutral-800">
                  {tx.description ?? tx.type}
                </span>
                <span
                  className={`font-bold ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
