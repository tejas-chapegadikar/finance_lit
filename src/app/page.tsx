import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, SparklesIcon, XIcon } from "@/components/ui/icons";
import { ReadinessRing } from "@/components/dashboard/ReadinessRing";
import { READINESS_AREA_META, type ReadinessAreaValue } from "@/lib/readiness-areas";
import { LEVELS } from "@/lib/levels";

// Marketing copy is static on purpose: the landing page shouldn't wait on (or
// break with) the database. Keep it in step with the seeded Level 1 lessons.
const CURRICULUM: { area: ReadinessAreaValue; lessons: string[] }[] = [
  { area: "BUDGETING", lessons: ["Budgeting Basics", "Compound Interest", "Saving vs. Spending Psychology"] },
  { area: "DIGITAL_SAFETY", lessons: ["UPI & Digital Payments Safety", "Common Financial Scams in India"] },
  { area: "BANKING", lessons: ["Bank Accounts & Savings Instruments"] },
  { area: "CREDIT", lessons: ["Understanding Credit Score (CIBIL)", "Credit Cards 101"] },
  { area: "TAX", lessons: ["Income Tax Basics for First Salary"] },
  {
    area: "INVESTING",
    lessons: ["Investing Basics: Stocks vs. Mutual Funds vs. FDs", "SIP & the Power of Starting Early", "Insurance Basics"],
  },
];

// Example only — averages to the blueprint's "61/100".
const EXAMPLE_READINESS: Record<ReadinessAreaValue, number> = {
  BUDGETING: 78,
  DIGITAL_SAFETY: 85,
  BANKING: 64,
  CREDIT: 52,
  TAX: 40,
  INVESTING: 47,
};

const PROBLEMS = [
  {
    icon: "📲",
    title: "Learning from reels",
    text: "Money advice comes from random YouTube videos, Instagram finfluencers and friends — inconsistent at best, biased at worst.",
  },
  {
    icon: "💸",
    title: "Costly first mistakes",
    text: "Paying only the credit-card minimum, falling for a UPI scam or comparing jobs on CTC alone can set you back for years.",
  },
  {
    icon: "🧾",
    title: "Nobody teaches the basics",
    text: "Budgets, CIBIL scores, tax regimes and SIPs rarely make it into college — but they hit you the day your first stipend arrives.",
  },
];

const STEPS = [
  {
    icon: "🎬",
    title: "Learn in minutes",
    text: "A short animated video and a plain-language lesson, with ₹ examples from real student life.",
  },
  {
    icon: "✍️",
    title: "Test yourself",
    text: "Five quick questions per lesson, with instant feedback on every answer.",
  },
  {
    icon: "✨",
    title: "Get coached, not told",
    text: "Pick a wrong answer and the AI Coach gives you a hint and asks you to rethink — so you learn the why.",
  },
  {
    icon: "📊",
    title: "See your readiness grow",
    text: "Earn XP, build your Financial Readiness Score and always know what to learn next.",
  },
];

const TRUST = [
  { icon: "🎓", title: "Education, not advice", text: "We explain how money works. We never tell you what to buy." },
  { icon: "🚫", title: "Nothing to sell you", text: "No product pushing, no hype, no promised returns." },
  { icon: "🏦", title: "Not a bank or trading app", text: "No wallet, no payments, no trading — just learning." },
  // Not 🇮🇳 — Windows renders flag emojis as the letters "IN".
  { icon: "₹", title: "Built for India", text: "₹, UPI, CIBIL, the old vs new tax regime — the money life you'll actually have." },
];

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold tracking-widest text-violet-700 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-neutral-900 sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-3 text-neutral-600">{lead}</p>}
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
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl"
        />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-700 uppercase">
            <span aria-hidden>⚡</span>
            Financial readiness for young Indians
          </span>

          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance text-neutral-900 sm:text-5xl">
            Learn money before money teaches you{" "}
            <span className="text-violet-600 underline decoration-orange-400 decoration-4 underline-offset-4">
              the hard way
            </span>
          </h1>

          <p className="max-w-lg text-neutral-600">
            Short lessons, quizzes and an AI Coach that get you ready for your first stipend or
            salary — budgeting, UPI safety, credit, tax and investing, made simple.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={primaryButton}>
              Get started free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/sign-in" className={secondaryButton}>
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {["100% free", "No credit card", "AI Coach on every quiz"].map((item) => (
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
              <span className="font-extrabold text-neutral-900">60</span> quiz questions
            </span>
            <span>
              <span className="font-extrabold text-neutral-900">6</span> readiness areas
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
            <p className="text-xs font-bold text-orange-700">+75 XP earned</p>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 bottom-1/4 hidden max-w-60 rotate-6 items-start gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-neutral-900/10 ring-1 ring-neutral-900/5 lg:flex"
        >
          <span className="text-lg">✨</span>
          <div className="text-left">
            <p className="text-xs font-bold text-neutral-900">AI Coach</p>
            <p className="text-xs text-neutral-600">What would happen if your income suddenly stopped?</p>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="bg-violet-50/70 px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="The problem"
          title="Money shows up before money lessons do"
          lead="Young Indians become financially independent before they become financially educated."
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div key={problem.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-violet-900/5">
              <span aria-hidden className="text-3xl">
                {problem.icon}
              </span>
              <h3 className="mt-3 font-bold text-neutral-900">{problem.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{problem.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Learn, test, get coached, progress"
          lead="Every lesson runs the same loop: learn → test → get feedback → understand → try again → earn XP."
        />
        <ol className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-violet-900/10">
              <span className="absolute top-5 right-5 text-xs font-extrabold text-violet-300">0{i + 1}</span>
              <span
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl"
              >
                {step.icon}
              </span>
              <h3 className="mt-4 font-bold text-neutral-900">{step.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Curriculum */}
      <section className="bg-violet-50/70 px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Level 1 · Financial Foundations"
          title="12 lessons that follow your money life"
          lead="From your first budget to your first salary slip — 60 questions across the six areas that make you financially ready."
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM.map(({ area, lessons }) => {
            const meta = READINESS_AREA_META[area];
            return (
              <div key={area} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-violet-900/5">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${meta.chipBg}`}
                  >
                    {meta.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-neutral-900">{meta.group}</h3>
                    <p className={`text-xs font-semibold ${meta.labelText}`}>Builds your {meta.label} score</p>
                  </div>
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {lessons.map((lesson) => (
                    <li key={lesson} className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Coach */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold tracking-widest text-violet-700 uppercase">AI Coach</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-neutral-900 sm:text-4xl">
              Hints, not answers
            </h2>
            <p className="mt-3 text-neutral-600">
              Get a question wrong and the Coach helps you work out why — so you remember the reasoning,
              not just the right option. It&apos;s a tutor for the lesson in front of you, not a chatbot
              and not a financial advisor.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Never gives the answer away straight away",
                "Starts with a gentle hint, then a stronger one",
                "Explains the idea in plain language, with Indian examples",
                "Stays on the lesson you're learning",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm font-medium text-neutral-800">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <figure
            aria-label="Example of the AI Coach after a wrong answer"
            className="rounded-3xl bg-violet-50/70 p-5 ring-1 ring-violet-900/5 sm:p-6"
          >
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white">
              <p className="text-xs font-bold tracking-wider text-violet-100 uppercase">Question 3 of 5</p>
              <p className="mt-1 font-bold">Your first salary just landed. What should come first?</p>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-white px-4 py-3 text-sm font-semibold text-rose-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-xs font-extrabold text-white">
                A
              </span>
              <span className="flex-1">Buy stocks immediately</span>
              <XIcon className="h-4 w-4" />
            </div>
            <div className="mt-3 flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-violet-200">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  AI Coach{" "}
                  <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                    Hint 1 of 2
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  Investing early is smart — but what would happen if your income suddenly stopped next
                  month? Think about what keeps you safe before you take on risk.
                </p>
              </div>
            </div>
            <figcaption className="mt-4 text-center text-xs text-neutral-500">Example hint</figcaption>
          </figure>
        </div>
      </section>

      {/* Financial Readiness Score */}
      <section className="bg-violet-50/70 px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <figure
            aria-label="Example Financial Readiness Score"
            className="order-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-violet-900/5 lg:order-1"
          >
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ReadinessRing score={61} label="Example overall Financial Readiness" />
              <ul className="flex w-full flex-1 flex-col gap-3">
                {Object.entries(EXAMPLE_READINESS).map(([area, score]) => {
                  const meta = READINESS_AREA_META[area as ReadinessAreaValue];
                  return (
                    <li key={area}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold text-neutral-700">
                          <span aria-hidden>{meta.icon}</span> {meta.label}
                        </span>
                        <span className="font-bold text-neutral-900 tabular-nums">{score}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-violet-100">
                        <div className="h-full rounded-full bg-violet-600" style={{ width: `${score}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <figcaption className="mt-4 text-center text-xs text-neutral-500">Example score</figcaption>
          </figure>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold tracking-widest text-violet-700 uppercase">Financial Readiness Score</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-neutral-900 sm:text-4xl">
              Know how ready you really are
            </h2>
            <p className="mt-3 text-neutral-600">
              Not just &ldquo;7 of 12 lessons done&rdquo;. Your score across Budgeting, Digital Safety,
              Banking, Credit, Tax and Investing shows how prepared you are for real money decisions —
              and your dashboard tells you exactly what to learn next.
            </p>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Your journey"
          title="A journey, not just a course"
          lead="Finish Level 1 to graduate as a Foundation Graduate — then keep going, from learning concepts to making real money decisions."
        />
        <ol className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((level) => {
            const available = level.number === 1;
            return (
              <li
                key={level.number}
                className={`rounded-3xl p-6 ring-1 ${
                  available ? "bg-white shadow-md ring-violet-200" : "bg-neutral-50 ring-neutral-900/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                      available ? "bg-violet-600 text-white" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {level.number}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      available ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {available ? "Available now" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-4 text-xs font-bold tracking-wider text-violet-700 uppercase">{level.purpose}</p>
                <h3 className="font-bold text-neutral-900">{level.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">{level.summary}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Trust */}
      <section className="bg-violet-50/70 px-6 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Built on trust"
          title="Education you can trust"
          lead="It's your money. Trust isn't a feature we add later — it's the product."
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-violet-900/5">
              <span
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-extrabold text-violet-700"
              >
                {item.icon}
              </span>
              <h3 className="mt-3 font-bold text-neutral-900">{item.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-12 text-center text-white shadow-xl shadow-violet-900/20 sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Get financially ready before your first big money mistake
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-violet-100">
            Free to start. Your first lesson takes about five minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up" className={primaryButton}>
              Get started free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-neutral-900">
              Stock<span className="text-orange-700">Streak</span>
            </p>
            <p className="text-sm text-neutral-600">Learn money. Make better decisions. Build your future.</p>
          </div>
          <p className="max-w-sm text-xs text-neutral-500">
            For education only — StockStreak doesn&apos;t give personal financial advice or sell financial
            products.
          </p>
        </div>
      </footer>
    </main>
  );
}
