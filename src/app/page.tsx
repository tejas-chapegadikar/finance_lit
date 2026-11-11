import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { CHAPTERS } from "@/lib/journey";
import { lightButton, primaryButton, secondaryButton, spotlight } from "@/components/ui/button-styles";
import { ArrowRightIcon, BookIcon, CheckIcon, FlameIcon, ShieldIcon, SparklesIcon, StarIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";
import { LevelIllustration } from "@/components/ui/illustrations";
import { Logo } from "@/components/ui/Logo";
import { Parallax, Reveal } from "@/components/ui/Reveal";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { HeroAvatar } from "@/components/landing/HeroAvatar";
import { RoastMarquee, RoastMeter } from "@/components/landing/RoastMeter";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Marketing copy is static on purpose: the landing page shouldn't wait on (or
// break with) the database. Every number on this page is an example, and
// labelled as one.

type Glyph = (p: { className?: string }) => React.ReactNode;

const PILLARS: {
  id: string;
  Icon: Glyph;
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  tone: string;
  say: { expression: Expression; text: string };
}[] = [
  {
    id: "money",
    Icon: WalletIcon,
    eyebrow: "Money Management",
    title: "Find out where your money keeps running off to",
    text: "Log what comes in and what goes out, set budgets, and watch your week and month on clear charts, then hear what your avatar thinks about it.",
    points: [
      "Income, expenses and balance at a glance",
      "Budgets per category, with a heads-up before you overshoot",
      "Weekly and monthly spending charts",
      "Roasts and praise worked out from your real numbers",
    ],
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    say: {
      expression: "shocked",
      text: "Food is 60% of your budget. Are you secretly running a restaurant?",
    },
  },
  {
    id: "iq",
    Icon: BookIcon,
    eyebrow: "Money IQ",
    title: "The stuff you pretend you already know",
    text: "Short lessons in four levels on budgeting, UPI safety, credit and CIBIL, payslips and tax. Each comes with a quiz, real-life scenarios and revision that brings back what you missed.",
    points: [
      "Five-minute lessons with real ₹ examples",
      "An AI Coach that hints before it tells",
      "Real-life scenarios: rent, credit-card bills, scam calls",
      "Revision after 1, 3 and 7 days so it sticks",
    ],
    tone: "bg-brand-50 text-brand-700 ring-brand-100",
    say: {
      expression: "proud",
      text: "Let's see if your financial knowledge is better than your attendance.",
    },
  },
  {
    id: "invest",
    Icon: TrendingUpIcon,
    eyebrow: "InvestSmart",
    title: "Lose pretend money before you lose real money",
    text: "Start with ₹1,00,000 of virtual money. Spread it across FDs, gold, index funds or a single risky stock, fast-forward months or years, and see what risk really feels like.",
    points: [
      "Virtual ₹1,00,000, zero real risk",
      "Fast-forward 1 month to 5 years",
      "See how diversifying changes the ride",
      "Lessons on SIPs, index funds and compounding. No stock tips, ever",
    ],
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
    say: {
      expression: "excited",
      text: "First investment? Proud of you. Now please don't check it every five minutes.",
    },
  },
];

const HELPS: { Icon: Glyph; title: string; text: string }[] = [
  {
    Icon: WalletIcon,
    title: "Stop the month-end panic",
    text: "See your spending early enough to change it, not after the money's gone.",
  },
  {
    Icon: ShieldIcon,
    title: "Dodge scams and debt traps",
    text: "Fake UPI requests, 'digital arrest' calls, minimum-due traps: you'll spot them.",
  },
  {
    Icon: TrendingUpIcon,
    title: "Start investing with confidence",
    text: "Understand risk, compounding and SIPs before you put in a real rupee.",
  },
  {
    Icon: FlameIcon,
    title: "Make it a habit",
    text: "A streak, XP and an avatar that notices when you do well, and when you don't.",
  },
];

/** An example of the Money Management screen (illustrative numbers). */
function MoneyMock() {
  const rows = [
    { label: "Food", pct: 60, color: "#2a78d6" },
    { label: "Travel", pct: 18, color: "#1baf7a" },
    { label: "Shopping", pct: 14, color: "#eb6834" },
    { label: "Other", pct: 8, color: "#6250d6" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["In", "₹15,000"],
          ["Out", "₹9,800"],
          ["Left", "₹5,200"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-slate-50 px-2 py-3">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="font-display text-lg font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 text-sm">
            <span className="w-20 text-slate-600">{r.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
            </span>
            <span className="w-10 text-right font-semibold text-slate-800 tabular-nums">{r.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** An example of the Money IQ path. */
function IqMock() {
  return (
    <ol className="flex flex-col gap-2.5">
      {CHAPTERS.map((c, i) => (
        <li key={c.id} className={`flex items-center gap-3 rounded-2xl p-3 ${i === 1 ? "bg-brand-50 ring-1 ring-brand-200" : "bg-slate-50"}`}>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-emerald-700 text-white" : i === 1 ? "bg-brand-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
          >
            {i === 0 ? <CheckIcon className="h-4 w-4" /> : c.number}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900">
              Level {c.number}: {c.title}
            </span>
            <span className="block truncate text-xs text-slate-500">{c.stage}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** An example of the virtual portfolio (illustrative path). */
function InvestMock() {
  const pts = [100, 101, 99.5, 103, 102, 106, 104.5, 109, 108, 112, 115, 113, 118];
  const max = 120;
  const min = 96;
  const d = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * 300).toFixed(1)},${(((max - v) / (max - min)) * 110 + 5).toFixed(1)}`)
    .join(" ");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Virtual portfolio · example</p>
          <p className="font-display text-2xl font-bold text-slate-900">₹1,18,000</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">+18% in 12 virtual months</span>
      </div>
      <svg viewBox="0 0 300 120" className="h-28 w-full" aria-hidden>
        <path d={`${d} L300,120 L0,120 Z`} fill="rgb(42 120 214 / 0.1)" />
        <path d={d} fill="none" stroke="#2a78d6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        {["Index fund 50%", "FD 30%", "Gold 20%"].map((t) => (
          <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

const MOCKS: Record<string, () => React.ReactNode> = {
  money: MoneyMock,
  iq: IqMock,
  invest: InvestMock,
};

function FloatChip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute inline-flex animate-float items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-slate-800 shadow-[0_10px_24px_-12px_rgb(28_26_38/0.35)] ring-1 ring-slate-200 ${className}`}
    >
      {children}
    </span>
  );
}

export default async function HomePage() {
  if (await getAuthUser()) {
    redirect("/dashboard");
  }

  return (
    <>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col overflow-x-clip">
        {/* Hero */}
        <section className="relative border-b border-slate-200">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)",
              backgroundSize: "24px 24px",
            }}
          />
          <header className="page-wrap relative flex items-center justify-between gap-3 py-5 lg:py-7">
            <Logo />
            <nav aria-label="Account" className="flex items-center gap-2">
              <Link href="/sign-in" className={`${secondaryButton} px-4 py-2 whitespace-nowrap sm:px-5`}>
                Log in
              </Link>
              <Link href="/sign-up" className={`${primaryButton} px-5 py-2 whitespace-nowrap max-sm:hidden`}>
                Sign up free
              </Link>
            </nav>
          </header>

          <div className="page-wrap relative grid items-center gap-12 pt-8 pb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:pt-14 lg:pb-28 xl:gap-24">
            <div className="flex animate-fade-up flex-col items-start gap-6">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[0.8125rem] font-medium text-slate-700 ring-1 ring-slate-200">
                <SparklesIcon className="h-3.5 w-3.5 text-brand-600" />
                For college students and first-job professionals in India
              </p>
              <h1 className="text-[clamp(2.6rem,1.2rem+4.4vw,6.5rem)] leading-[1.02] text-slate-900">
                {["Learn", "money", "before", "money", "teaches", "you"].map((word, i) => (
                  <span key={word + i} className="word-rise" style={{ animationDelay: `${i * 70}ms` }}>
                    {word}&nbsp;
                  </span>
                ))}
                <span className="word-rise bg-[linear-gradient(transparent_62%,var(--color-brand-200)_62%)]" style={{ animationDelay: "480ms" }}>
                  the hard way.
                </span>
              </h1>
              <p className="max-w-xl text-[clamp(1.05rem,0.95rem+0.3vw,1.3rem)] leading-relaxed text-slate-600">
                You can split a food bill in four seconds, but you can&apos;t explain what a credit score is. Rupli fixes that, in simple words, with an avatar
                who will not be nice about it.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/sign-up" className={`${primaryButton} group px-8 py-4 text-base`}>
                  Get started, it&apos;s free
                  <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </Link>
                <Link href="/sign-in" className={`${secondaryButton} px-8 py-4 text-base`}>
                  Log in
                </Link>
              </div>
              <p className="text-sm text-slate-500">
                Free · Sign in with Google ·{" "}
                <a href="#features" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
                  See what&apos;s inside
                </a>
              </p>
            </div>

            <div className="relative animate-fade-up [animation-delay:120ms]">
              <Parallax speed={-0.06} className="pointer-events-none absolute inset-0">
                <div aria-hidden className="relative h-full w-full">
                  <FloatChip className="top-[22%] left-0 sm:left-2">
                    <StarIcon className="h-3.5 w-3.5 text-orange-500" /> +75 XP
                  </FloatChip>
                  <FloatChip className="top-[44%] right-0 [animation-delay:1.1s] sm:right-2">
                    <WalletIcon className="h-3.5 w-3.5 text-emerald-600" /> ₹2,340 saved
                  </FloatChip>
                  <FloatChip className="bottom-[16%] -left-2 [animation-delay:0.6s] sm:left-[4%]">
                    <FlameIcon className="h-3.5 w-3.5 text-orange-500" /> 7-day streak
                  </FloatChip>
                  <FloatChip className="right-[6%] bottom-[4%] [animation-delay:1.7s]">
                    <TrendingUpIcon className="h-3.5 w-3.5 text-sky-600" /> Virtual +1.2%
                  </FloatChip>
                </div>
              </Parallax>
              <HeroAvatar />
            </div>
          </div>
        </section>

        <RoastMarquee />

        <RoastMeter />

        {/* The three pillars */}
        <section id="features" className="page-wrap scroll-mt-4 py-20 sm:py-28" aria-labelledby="features-heading">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-[0.8125rem] font-medium text-slate-500">Harsh, but someone had to say it</p>
            <h2 id="features-heading" className="mt-2 text-[clamp(1.9rem,1.1rem+2.2vw,3.5rem)] leading-tight text-slate-900">
              You&apos;re worse at money than you think.
            </h2>
            <p className="mt-3 text-[0.9375rem] lg:text-base leading-relaxed text-slate-600">
              Everything a student needs to get good with money, and an avatar that reacts to every move you make.
            </p>
          </Reveal>

          <div className="mt-16 flex flex-col gap-20 sm:gap-28">
            {PILLARS.map((p, i) => {
              const Mock = MOCKS[p.id];
              return (
                <div key={p.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-28">
                  <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.8125rem] font-semibold ring-1 ${p.tone}`}>
                      <p.Icon className="h-4 w-4" />
                      {p.eyebrow}
                    </span>
                    <h3 className="mt-4 text-[clamp(1.75rem,1.15rem+1.5vw,2.75rem)] leading-tight text-slate-900">{p.title}</h3>
                    <p className="mt-3 text-[0.9375rem] lg:text-base leading-relaxed text-slate-600">{p.text}</p>
                    <ul className="mt-6 flex flex-col gap-2.5">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-[0.9375rem] lg:text-base text-slate-700">
                          <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckIcon className="h-3 w-3" />
                          </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={120} className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="relative">
                      <div
                        aria-hidden
                        className="rounded-[2rem] bg-white p-5 shadow-[0_24px_60px_-30px_rgb(15_31_24/0.45)] ring-1 ring-slate-200 transition duration-500 hover:-translate-y-1 hover:rotate-[-0.5deg] sm:p-7"
                      >
                        <p className="mb-4 text-xs font-medium text-slate-500">Example</p>
                        <Mock />
                      </div>
                      <div className="relative z-10 -mt-8 ml-auto flex w-[min(100%,22rem)] items-end gap-2 sm:-mr-4">
                        <p className="mb-6 flex-1 rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-snug font-medium text-white shadow-lg">
                          {p.say.text}
                        </p>
                        <Avatar
                          config={DEFAULT_AVATAR}
                          expression={p.say.expression}
                          crop="head"
                          className="h-20 w-auto shrink-0 animate-bob"
                          label="The Rupli avatar"
                        />
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it helps */}
        <section className="border-y border-slate-200 bg-white py-20 sm:py-28" aria-labelledby="helps-heading">
          <div className="page-wrap">
            <Reveal className="max-w-3xl">
              <p className="text-[0.8125rem] font-medium text-slate-500">How Rupli helps</p>
              <h2 id="helps-heading" className="mt-2 text-[clamp(1.9rem,1.1rem+2.2vw,3.5rem)] leading-tight text-slate-900">
                Your first stipend, salary and credit card are coming. Be ready.
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HELPS.map(({ Icon, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 90}>
                  <div className="group h-full rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_40px_-22px_rgb(15_31_24/0.4)]">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-slate-200 transition group-hover:scale-110 group-hover:rotate-[-6deg]"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg leading-snug text-slate-900">{title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] lg:text-base text-slate-600">{text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* The journey */}
        <section className="page-wrap py-20 sm:py-28" aria-labelledby="journey-heading">
          <Reveal className="max-w-3xl">
            <p className="text-[0.8125rem] font-medium text-slate-500">Your Money IQ journey</p>
            <h2 id="journey-heading" className="mt-2 text-[clamp(1.9rem,1.1rem+2.2vw,3.5rem)] leading-tight text-slate-900">
              From your first stipend to your first salary
            </h2>
            <p className="mt-3 text-[0.9375rem] lg:text-base leading-relaxed text-slate-600">
              Four levels. Each one unlocks the next, so every step builds on the last.
            </p>
          </Reveal>
          <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span aria-hidden className="absolute top-14 right-[12%] left-[12%] hidden border-t-2 border-dashed border-slate-200 lg:block" />
            {CHAPTERS.map((chapter, i) => (
              <Reveal as="li" key={chapter.id} delay={i * 100} className="relative flex flex-col items-start">
                <LevelIllustration level={chapter.number} className="h-28 w-auto transition duration-500 hover:-translate-y-1" />
                <p className="mt-4 font-display text-sm font-semibold text-brand-600">Level {String(chapter.number).padStart(2, "0")}</p>
                <h3 className="mt-0.5 text-2xl leading-tight text-slate-900">{chapter.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{chapter.stage}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Final call to action */}
        <section className="page-wrap pb-20 sm:pb-28">
          <Reveal>
            <div
              className={`${spotlight} flex flex-col items-center gap-8 px-6 py-14 text-center sm:px-12 md:flex-row md:justify-center md:gap-14 md:text-left lg:py-20`}
            >
              <span className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_184_31/0.5),transparent_62%)]" />
              <Avatar
                config={DEFAULT_AVATAR}
                expression="celebrating"
                className="h-44 w-auto shrink-0 animate-bob sm:h-52"
                label="The Rupli avatar, celebrating"
              />
              <div className="min-w-0">
                <h2 className="max-w-3xl text-[clamp(2.1rem,1.3rem+2.4vw,3.75rem)] leading-tight text-white">Your wallet can&apos;t take much more of this</h2>
                <p className="mt-3 max-w-xl text-lg text-white/70">Free to start. Takes two minutes. You&apos;ve wasted longer on worse.</p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
                  <Link href="/sign-up" className={`${lightButton} group px-8 py-4 text-base`}>
                    Get started, it&apos;s free
                    <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/sign-in" className="rounded-xl px-4 py-2 font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">
                    I already have an account
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
