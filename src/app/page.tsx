import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/lessons");
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-white px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"
      />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-700 uppercase">
          <span aria-hidden>⚡</span>
          Gamified financial literacy
        </span>

        <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Get{" "}
          <span className="text-violet-600 underline decoration-orange-400 decoration-4 underline-offset-4">
            smarter with money
          </span>{" "}
          before you graduate
        </h1>

        <p className="max-w-md text-neutral-600">
          Learn money management through short lessons and quizzes. Build a
          streak, earn XP, and get good with money before you graduate.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white shadow-md shadow-neutral-900/20 transition hover:bg-neutral-800"
          >
            Get started free
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border-2 border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            Sign in
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {["100% free", "No credit card", "12 lessons ready"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              <span aria-hidden>✓</span>
              {item}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-neutral-500">
          <span>
            <span className="font-extrabold text-neutral-900">12</span> lessons
          </span>
          <span>
            <span className="font-extrabold text-neutral-900">60+</span> quiz
            questions
          </span>
          <span>
            <span className="font-extrabold text-neutral-900">6</span> partner
            colleges
          </span>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-8 hidden -rotate-6 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-neutral-900/10 ring-1 ring-neutral-900/5 lg:flex"
      >
        <span className="text-lg">✅</span>
        <div className="text-left">
          <p className="text-xs font-bold text-neutral-900">Quiz complete</p>
          <p className="text-xs font-bold text-orange-500">+75 XP earned</p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 bottom-1/4 hidden rotate-6 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-neutral-900/10 ring-1 ring-neutral-900/5 lg:flex"
      >
        <span className="text-lg">🏅</span>
        <div className="text-left">
          <p className="text-xs font-bold text-neutral-900">Badge unlocked</p>
          <p className="text-xs text-neutral-500">Budgeting Basics</p>
        </div>
      </div>
    </main>
  );
}
