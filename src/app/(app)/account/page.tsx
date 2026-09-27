import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayName } from "@/lib/user";
import { DisplayNameForm } from "@/components/account/DisplayNameForm";
import { AccountActions } from "@/components/account/AccountActions";

export const metadata: Metadata = { title: "Account — StockStreak" };

export default async function AccountPage() {
  const user = await requireOnboardedUser();

  const [videosWatched, totalLessons] = await Promise.all([
    db.lessonView.count({ where: { userId: user.id } }),
    db.lesson.count({ where: { isPublished: true } }),
  ]);

  const displayName = getDisplayName(user);
  const memberSince = user.createdAt.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const details = [
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone ?? "Not added" },
    { label: "College", value: user.collegeName ?? "Not added" },
    { label: "Member since", value: memberSince },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold uppercase ring-4 ring-white/10">
            {displayName.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{displayName}</h1>
            {user.collegeName && (
              <p className="truncate text-sm text-violet-100">{user.collegeName}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-3xl font-extrabold text-orange-300">
              {user.xpTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-medium text-violet-100">Points earned (XP)</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-3xl font-extrabold">
              {videosWatched}
              <span className="text-lg font-bold text-violet-200"> / {totalLessons}</span>
            </p>
            <p className="text-xs font-medium text-violet-100">Videos watched</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
        <h2 className="text-lg font-bold text-neutral-900">Account details</h2>

        <DisplayNameForm currentDisplayName={displayName} />

        <dl className="divide-y divide-neutral-100">
          {details.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-neutral-500">{item.label}</dt>
              <dd className="truncate text-right font-medium text-neutral-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Sign-in &amp; security</h2>
          <p className="text-sm text-neutral-500">
            Change your email, password, or connected Google account.
          </p>
        </div>
        <AccountActions />
      </section>
    </div>
  );
}
