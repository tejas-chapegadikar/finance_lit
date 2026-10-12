import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { heroSurface, lightButton, primaryButton, secondaryButton, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CHAPTERS } from "@/lib/journey";

// Marketing copy is static on purpose: the landing page shouldn't wait on (or
// break with) the database.

const TOPICS = [
  { icon: "💰", title: "Budgeting and saving", text: "Make your allowance, stipend or salary last the whole month." },
  { icon: "🏦", title: "Banking and digital payments", text: "Pick the right account and use UPI without the risks." },
  { icon: "🚨", title: "Financial scams", text: "Spot fake UPI requests, job offers and \"digital arrest\" calls." },
  { icon: "💳", title: "Credit cards and CIBIL scores", text: "Use credit without debt traps, and build a strong score." },
  { icon: "🧾", title: "First salary and income tax", text: "Read your payslip: CTC, in-hand pay, TDS and tax regimes." },
  { icon: "📈", title: "Investing fundamentals", text: "Stocks, mutual funds and FDs — and how risk and return work." },
  { icon: "🌱", title: "SIPs and insurance", text: "Why starting early matters, and why protection comes first." },
];

const STEPS = [
  { icon: "📖", title: "Learn", text: "Short written lessons with real ₹ examples." },
  { icon: "🤔", title: "Practise", text: "Make decisions in real-life money scenarios and see what happens." },
  { icon: "✍️", title: "Take a Quiz", text: "Five quick questions at the end of every lesson." },
  { icon: "💡", title: "Get Feedback", text: "Miss one and the AI Coach gives a hint, lets you retry, then checks you've got it." },
  { icon: "🔁", title: "Revise", text: "Missed ideas come back after 1, 3 and 7 days, so they stick." },
  { icon: "🎁", title: "Earn & Unlock", text: "Earn XP for real learning, keep a streak, and dress up your avatar." },
];

const DIFFERENCES = [
  {
    icon: "📍",
    title: "From first stipend to first salary",
    text: "One journey built around the money moments you'll actually face — ₹, UPI, CIBIL, payslips, taxes and SIPs.",
  },
  {
    icon: "🎮",
    title: "Real decisions, not just reading",
    text: "Manage a ₹15,000 stipend, handle a credit-card bill, spot a fake UPI request and read your first payslip.",
  },
  {
    icon: "🤖",
    title: "An AI Coach that teaches",
    text: "A hint first, then a retry, then a fresh question to check you've really got it — never just the answer.",
  },
  {
    icon: "🧠",
    title: "Revision that makes it stick",
    text: "We track what you've mastered and bring back what you missed, so you remember it when it matters.",
  },
  {
    icon: "🔥",
    title: "A daily habit, without the pressure",
    text: "A fresh question, challenge and three missions every day — and earned streak freezes for the days life gets busy.",
  },
  {
    icon: "🧑‍🎓",
    title: "Your journey, your avatar",
    text: "Climb from Money Rookie to Money Master on a map of your journey, and unlock avatar gear as you learn.",
  },
];

function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm select-none">
      <div className="absolute -top-4 -right-2 z-10 rotate-6 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-amber-800 ring-2 ring-amber-200 shadow-[0_4px_0_0_var(--color-amber-200)]">
        ⭐ +75 XP
      </div>
      <div className="absolute -bottom-5 -left-4 z-10 -rotate-6 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-emerald-800 ring-2 ring-emerald-200 shadow-[0_4px_0_0_var(--color-emerald-200)]">
        🏅 Badge unlocked
      </div>
      <div className="rounded-3xl bg-white p-5 text-slate-900 ring-1 ring-brand-100 shadow-[0_8px_0_0_var(--color-brand-200),0_24px_48px_-16px_rgb(0_74_128/0.35)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl">💳</span>
          <div>
            <p className="text-xs font-bold text-violet-700">Lesson 09 · Credit</p>
            <p className="font-extrabold">Credit Cards 101</p>
            <p className="text-xs font-semibold text-slate-600">6 minutes · +75 XP</p>
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

function SectionIntro({ eyebrow, title, text, id }: { eyebrow: string; title: string; text?: string; id?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-widest text-brand-700 uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-3 text-slate-600">{text}</p>}
    </div>
  );
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <main className="flex flex-1 flex-col bg-white">
        {/* Hero — bright, like a game's welcome screen */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
          <div
            aria-hidden
            className="sunburst pointer-events-none absolute top-[55%] left-1/2 h-[110rem] w-[110rem] -translate-x-1/2 -translate-y-1/2 rounded-full lg:left-[72%]"
          />
          <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />

          <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Logo />
            <nav aria-label="Account" className="flex items-center gap-2">
              <Link href="/sign-in" className={`${secondaryButton} px-4 py-2 sm:px-5`}>
                Log in
              </Link>
              <Link href="/sign-up" className={`${primaryButton} hidden px-5 py-2 sm:inline-flex`}>
                Sign up free
              </Link>
            </nav>
          </header>

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-14 lg:pb-28">
            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold tracking-wide text-brand-700 uppercase ring-1 ring-brand-200 shadow-[0_3px_0_0_var(--color-brand-100)]">
                <span aria-hidden>⚡</span>
                From first stipend to first salary
              </span>
              <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-6xl">
                Learn money before money teaches you <span className="text-brand-600">the hard way.</span>
              </h1>
              <p className="max-w-lg text-lg text-slate-700">
                Practical money skills for college students and first-job professionals — from your first ₹15,000
                stipend to your first payslip. Learn, practise real decisions, and actually remember it.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/sign-up" className={`${primaryButton} px-8 py-4 text-base`}>
                  Get started — it&apos;s free
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="/sign-in" className={`${secondaryButton} px-8 py-4 text-base`}>
                  Log in
                </Link>
              </div>
              <p className="text-sm font-semibold text-slate-600">
                Your first lesson takes about 5 minutes ·{" "}
                <a href="#how-it-works" className="text-brand-700 underline-offset-2 hover:underline">
                  See how it works
                </a>
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* Why StockStreak? */}
        <section className="px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="why-heading">
          <SectionIntro
            id="why-heading"
            eyebrow="Why StockStreak?"
            title="The money skills nobody teaches you in college"
            text="Your first stipend, salary, credit card and tax form are coming. Here's what you'll be ready for:"
          />
          {/* Flex rather than grid so the last, shorter row sits centred. */}
          <ul className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-4">
            {TOPICS.map((topic) => (
              <li
                key={topic.title}
                className={`${tile} w-full p-6 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]`}
              >
                <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                  {topic.icon}
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">{topic.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{topic.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* The journey */}
        <section className="bg-background px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="journey-heading">
          <SectionIntro
            id="journey-heading"
            eyebrow="Your journey"
            title="From your first stipend to your first salary"
            text="12 short lessons in four levels. Each level unlocks the next, so every step builds on the last."
          />
          <ol className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((chapter) => (
              <li key={chapter.id} className={`${tile} p-5`}>
                <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                  {chapter.icon}
                </span>
                <p className="mt-4 text-xs font-bold tracking-wider text-brand-700 uppercase">Level {chapter.number}</p>
                <h3 className="font-extrabold text-slate-900">{chapter.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{chapter.stage}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-4 px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="how-heading">
          <SectionIntro
            id="how-heading"
            eyebrow="How it works"
            title="Learn → Practise → Take a Quiz → Get Feedback → Revise → Earn & Unlock"
          />
          <ol className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`${tile} relative p-5`}>
                <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                  {step.icon}
                </span>
                <h3 className="mt-4 font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What makes StockStreak different? */}
        <section className="bg-background px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="different-heading">
          <SectionIntro
            id="different-heading"
            eyebrow="What makes StockStreak different?"
            title="Learning that feels like real life"
          />
          <ul className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENCES.map((item) => (
              <li
                key={item.title}
                className="rounded-3xl bg-brand-50 p-6 ring-1 ring-brand-100 shadow-[0_4px_0_0_var(--color-brand-200)]"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_3px_0_0_var(--color-brand-200)]"
                >
                  {item.icon}
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Final call to action */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className={`${heroSurface} relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12`}>
            <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-white/5" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Start your financial-learning journey today
            </h2>
            {/* 20px bold counts as large text, which the bright gradient supports. */}
            <p className="relative mx-auto mt-3 max-w-xl text-xl font-bold">
              12 lessons, 4 money scenarios, a daily challenge and smart revision — free to start.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className={`${lightButton} px-8 py-4 text-base`}>
                Get started — it&apos;s free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="/sign-in" className="rounded-xl px-4 py-2 font-bold text-white underline-offset-4 hover:underline">
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
