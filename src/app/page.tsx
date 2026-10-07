import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { READINESS_AREA_META, type ReadinessAreaValue } from "@/lib/readiness-areas";

// Marketing copy is static on purpose: the landing page shouldn't wait on (or
// break with) the database.

const HIGHLIGHTS = [
  { icon: "🎯", text: "Learn practical money skills" },
  { icon: "🧠", text: "Understand through real situations" },
  { icon: "🤖", text: "Get help from an AI Coach" },
  { icon: "🏆", text: "Earn XP and level up" },
];

const TOPICS: { area: ReadinessAreaValue; text: string }[] = [
  { area: "BUDGETING", text: "Make your allowance or salary last the whole month." },
  { area: "BANKING", text: "Pick the right account, dodge charges, and use FDs and RDs." },
  { area: "CREDIT", text: "Understand credit cards and build a strong CIBIL score." },
  { area: "TAX", text: "Read your first payslip: CTC, PF, TDS and the new tax regime." },
  { area: "INVESTING", text: "Stocks, mutual funds, SIPs — and why starting early matters." },
  { area: "DIGITAL_SAFETY", text: "Spot UPI frauds, fake job offers and \"digital arrest\" scams." },
];

const STEPS = [
  { icon: "📖", title: "Learn", text: "Short lessons with real ₹ examples." },
  { icon: "🤔", title: "Practice", text: "Decide what you'd do in a real situation." },
  { icon: "✍️", title: "Quiz", text: "Five quick questions per lesson." },
  { icon: "🤖", title: "AI Coach", text: "A wrong answer gets you a hint, not the answer." },
  { icon: "⭐", title: "Earn XP", text: "+75 XP for every lesson you finish." },
  { icon: "🏆", title: "Level Up", text: "Complete Level 1 — Financial Foundations." },
];

function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm select-none">
      <div className="absolute -top-4 -right-2 z-10 rotate-6 rounded-2xl bg-white px-3 py-2 text-sm font-bold text-orange-700 shadow-lg shadow-brand-900/30">
        ⭐ +75 XP
      </div>
      <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl shadow-brand-900/40">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl">💳</span>
          <div>
            <p className="text-xs font-bold text-violet-700">Lesson 09 · Credit</p>
            <p className="font-extrabold">Credit Cards 101</p>
            <p className="text-xs font-semibold text-slate-600">6 min • +75 XP</p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-brand-50 p-3 text-sm font-semibold">
          Your bank gives you a ₹1,00,000 limit. Does that mean you have ₹1,00,000 to spend?
        </p>
        <div className="mt-3 flex gap-2 rounded-2xl p-3 ring-1 ring-brand-200">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <SparklesIcon className="h-4 w-4" />
          </span>
          <p className="text-xs leading-relaxed text-slate-700">
            <span className="font-bold text-slate-900">💡 Coach:</span> Think about what the bank is limiting — the
            amount you must spend, or the amount you&apos;re allowed to borrow?
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">Financial Readiness</span>
          <span className="text-brand-700">42 → 47</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-100">
          <div className="h-full w-[47%] rounded-full bg-brand-600" />
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
        {/* Decorations stay toward the darker bottom-right so white text keeps its contrast. */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-white/5" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo tone="light" />
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm font-bold text-white ring-2 ring-white/40 transition hover:bg-white/10"
          >
            Log in
          </Link>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-16 lg:pb-28">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-900/40 px-4 py-1.5 text-xs font-bold tracking-wide uppercase ring-1 ring-white/20">
              <span aria-hidden>⚡</span>
              Money skills for young India
            </span>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Learn money before money teaches you the hard way.
            </h1>
            <p className="max-w-lg text-lg">
              Master real-world money skills through short lessons, interactive challenges, quizzes and an AI Coach.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/sign-up" className={`${primaryButton} px-8 py-4 text-base`}>
                Start Learning
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <span className="text-sm font-semibold">Free · Your first lesson takes 5 minutes</span>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Highlights */}
      <section className="relative z-10 -mt-10 px-4 sm:px-6">
        <ul className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5"
            >
              <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                {item.icon}
              </span>
              <span className="font-bold text-slate-900">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Why StockStreak? */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-brand-700 uppercase">Why StockStreak?</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
            The money skills nobody teaches you in college
          </h2>
          <p className="mt-3 text-slate-600">
            Six areas that decide how ready you are for your first stipend, salary and big money decision.
          </p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ area, text }) => {
            const meta = READINESS_AREA_META[area];
            return (
              <li key={area} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                <span aria-hidden className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${meta.chipBg}`}>
                  {meta.icon}
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">{meta.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section className="bg-background px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-widest text-brand-700 uppercase">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
            Learn → Practice → Quiz → AI Coach → Earn XP → Level Up
          </h2>
        </div>
        <ol className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
              <span className="absolute top-4 right-4 text-xs font-extrabold text-slate-500">0{i + 1}</span>
              <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                {step.icon}
              </span>
              <h3 className="mt-4 font-extrabold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Final call to action */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-14 text-center text-white shadow-xl shadow-brand-900/20 sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Your first money lesson takes five minutes
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl">
            12 lessons, a Daily Money Challenge and an AI Coach — free to start.
          </p>
          <Link href="/sign-up" className={`${primaryButton} relative mt-8 px-8 py-4 text-base`}>
            Start Your Financial Journey
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo />
            <p className="text-sm text-slate-600">Learn money. Make better decisions. Build your future.</p>
          </div>
          <p className="max-w-sm text-xs text-slate-600">
            For education only — StockStreak doesn&apos;t give personal financial advice or sell financial products.
          </p>
        </div>
      </footer>
    </main>
  );
}
