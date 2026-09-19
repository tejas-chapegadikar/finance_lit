import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/lessons");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white">
      <span className="text-5xl" aria-hidden>
        ⚡
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight">
        Stock<span className="text-orange-300">Streak</span>
      </h1>
      <p className="max-w-md text-violet-100">
        Learn money management through short lessons and quizzes. Build a
        streak, earn XP, and get good with money before you graduate.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-up"
          className="rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-900/20 hover:brightness-110"
        >
          Get started
        </Link>
        <Link
          href="/sign-in"
          className="rounded-full border-2 border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
