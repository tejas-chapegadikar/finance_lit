import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { lightButton, primaryButton, secondaryButton, spotlight } from "@/components/ui/button-styles";
import {
  ArrowRightIcon,
  BankIcon,
  BookIcon,
  CardIcon,
  CompassIcon,
  FlagIcon,
  FlameIcon,
  GiftIcon,
  HourglassIcon,
  PencilIcon,
  ReceiptIcon,
  RefreshIcon,
  ShieldAlertIcon,
  ShirtIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  WalletIcon,
} from "@/components/ui/icons";
import { IconTile } from "@/components/ui/topic-icons";
import { LevelIllustration } from "@/components/ui/illustrations";
import { Logo } from "@/components/ui/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CHAPTERS } from "@/lib/journey";
import type { ReadinessAreaValue } from "@/lib/readiness-areas";

// Marketing copy is static on purpose: the landing page shouldn't wait on (or
// break with) the database.

type Glyph = (p: { className?: string }) => React.ReactNode;

const TOPICS: { Icon: Glyph; area: ReadinessAreaValue; title: string; text: string }[] = [
  { Icon: WalletIcon, area: "BUDGETING", title: "Budgeting and saving", text: "Make your allowance, stipend or salary last the whole month." },
  { Icon: BankIcon, area: "BANKING", title: "Banking and digital payments", text: "Pick the right account and use UPI without the risks." },
  { Icon: ShieldAlertIcon, area: "DIGITAL_SAFETY", title: "Financial scams", text: "Spot fake UPI requests, job offers and \"digital arrest\" calls." },
  { Icon: CardIcon, area: "CREDIT", title: "Credit cards and CIBIL scores", text: "Use credit without debt traps, and build a strong score." },
  { Icon: ReceiptIcon, area: "TAX", title: "First salary and income tax", text: "Read your payslip: CTC, in-hand pay, TDS and tax regimes." },
  { Icon: TrendingUpIcon, area: "INVESTING", title: "Investing fundamentals", text: "Stocks, mutual funds and FDs — and how risk and return work." },
  { Icon: HourglassIcon, area: "INVESTING", title: "SIPs and insurance", text: "Why starting early matters, and why protection comes first." },
];

const STEPS: { Icon: Glyph; title: string; text: string }[] = [
  { Icon: BookIcon, title: "Learn", text: "Short written lessons with real ₹ examples." },
  { Icon: CompassIcon, title: "Practise", text: "Make decisions in real-life money scenarios and see what happens." },
  { Icon: PencilIcon, title: "Take a Quiz", text: "Five quick questions at the end of every lesson." },
  { Icon: SparklesIcon, title: "Get Feedback", text: "Miss one and the AI Coach gives a hint, lets you retry, then checks you've got it." },
  { Icon: RefreshIcon, title: "Revise", text: "Missed ideas come back after 1, 3 and 7 days, so they stick." },
  { Icon: GiftIcon, title: "Earn & Unlock", text: "Earn XP for real learning, keep a streak, and dress up your avatar." },
];

const DIFFERENCES: { Icon: Glyph; title: string; text: string }[] = [
  {
    Icon: FlagIcon,
    title: "From first stipend to first salary",
    text: "One journey built around the money moments you'll actually face — ₹, UPI, CIBIL, payslips, taxes and SIPs.",
  },
  {
    Icon: CompassIcon,
    title: "Real decisions, not just reading",
    text: "Manage a ₹15,000 stipend, handle a credit-card bill, spot a fake UPI request and read your first payslip.",
  },
  {
    Icon: RefreshIcon,
    title: "Revision that makes it stick",
    text: "We track what you've mastered and bring back what you missed, so you remember it when it matters.",
  },
  {
    Icon: FlameIcon,
    title: "A daily habit, without the pressure",
    text: "A fresh question, challenge and three missions every day — and earned streak freezes for the days life gets busy.",
  },
  {
    Icon: ShirtIcon,
    title: "Your journey, your avatar",
    text: "Climb from Money Rookie to Money Master on a map of your journey, and unlock avatar gear as you learn.",
  },
];

/** A glimpse of the real app: the dashboard's "Up next" card, a Coach hint and the day's streak. */
function HeroPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none lg:mr-0">
      <div className={`${spotlight} p-6 sm:p-7`}>
        <span className="pointer-events-none absolute -top-28 -right-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/85">Next lesson · Level 3</p>
            <p className="mt-3 font-display text-3xl leading-tight font-semibold">Credit Cards 101</p>
            <p className="mt-2 text-sm text-white/70">Your bank gives you a ₹1,00,000 limit. Does that mean you have ₹1,00,000 to spend?</p>
          </div>
          <LevelIllustration level={3} className="h-24 w-auto shrink-0 animate-float" />
        </div>
        <div className="mt-5 flex gap-1">
          <span className="h-1.5 flex-1 rounded-full bg-emerald-400" />
          <span className="h-1.5 flex-1 rounded-full bg-brand-400" />
          <span className="h-1.5 flex-1 rounded-full bg-white/15" />
        </div>
        <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold">
          Start Learning <ArrowRightIcon className="h-4 w-4" />
        </p>
      </div>

      <div className="relative z-10 -mt-6 ml-6 flex gap-3 rounded-2xl rounded-tl-md bg-white p-4 shadow-[0_18px_40px_-24px_rgb(30_28_26/0.45)] ring-1 ring-slate-200 sm:ml-12">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-brand-300">
          <SparklesIcon className="h-4 w-4" />
        </span>
        <p className="text-xs leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">AI Coach</span> — Think about what the bank is limiting: the amount you must spend, or the
          amount you&apos;re allowed to borrow?
        </p>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
          <FlameIcon className="h-3.5 w-3.5 text-orange-500" /> 7-day streak
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
          <StarIcon className="h-3.5 w-3.5 text-orange-500" /> +75 XP
        </span>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text, id, align = "left" }: { eyebrow: string; title: string; text?: string; id?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[13px] font-medium text-slate-500">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl leading-tight text-slate-900 sm:text-[2.75rem]">
        {title}
      </h2>
      {text && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{text}</p>}
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
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{ backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)", backgroundSize: "24px 24px" }}
          />
          <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
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

          <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-16 lg:pb-28">
            <div className="flex animate-fade-up flex-col items-start gap-6">
              <p className="inline-flex rounded-full bg-white px-3 py-1 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200">
                For college students and first-job professionals in India
              </p>
              <h1 className="text-[2.75rem] leading-[1.02] text-slate-900 sm:text-6xl lg:text-7xl">
                Learn money before money teaches you{" "}
                <span className="bg-[linear-gradient(transparent_62%,var(--color-brand-200)_62%)]">the hard way.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                Practical money skills for college students and first-job professionals — from your first ₹15,000 stipend to your first
                payslip. Learn, practise real decisions, and actually remember it.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/sign-up" className={`${primaryButton} group px-8 py-4 text-base`}>
                  Get started — it&apos;s free
                  <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </Link>
                <Link href="/sign-in" className={`${secondaryButton} px-8 py-4 text-base`}>
                  Log in
                </Link>
              </div>
              <p className="text-sm text-slate-500">
                Your first lesson takes about 5 minutes ·{" "}
                <a href="#how-it-works" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
                  See how it works
                </a>
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* Why StockStreak? */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="why-heading">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <SectionIntro
                id="why-heading"
                eyebrow="Why StockStreak?"
                title="The money skills nobody teaches you in college"
                text="Your first stipend, salary, credit card and tax form are coming. Here's what you'll be ready for:"
              />
            </div>
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {TOPICS.map(({ Icon, area, title, text }) => (
                <li key={title} className="flex items-start gap-4 py-5">
                  <IconTile area={area}>
                    <Icon />
                  </IconTile>
                  <div>
                    <h3 className="text-xl leading-snug text-slate-900">{title}</h3>
                    <p className="mt-1 text-[15px] text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The journey */}
        <section className="border-y border-slate-200 bg-white px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="journey-heading">
          <div className="mx-auto max-w-6xl">
            <SectionIntro
              id="journey-heading"
              eyebrow="Your journey"
              title="From your first stipend to your first salary"
              text="12 short lessons in four levels. Each level unlocks the next, so every step builds on the last."
            />
            <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <span aria-hidden className="absolute top-14 right-[12%] left-[12%] hidden border-t-2 border-dashed border-slate-200 lg:block" />
              {CHAPTERS.map((chapter) => (
                <li key={chapter.id} className="relative flex flex-col items-start">
                  <LevelIllustration level={chapter.number} className="h-28 w-auto" />
                  <p className="mt-4 font-display text-sm font-semibold text-brand-600">Level {String(chapter.number).padStart(2, "0")}</p>
                  <h3 className="mt-0.5 text-2xl leading-tight text-slate-900">{chapter.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{chapter.stage}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-4 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="how-heading">
          <SectionIntro id="how-heading" eyebrow="How it works" title="Six steps that make it stick" />
          <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ Icon, title, text }, i) => (
              <li key={title} className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-semibold text-slate-300 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">Step {i + 1}</p>
                <h3 className="mt-0.5 text-xl text-slate-900">{title}</h3>
                <p className="mt-1 text-[15px] text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What makes StockStreak different? */}
        <section className="border-t border-slate-200 bg-white px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="different-heading">
          <div className="mx-auto max-w-6xl">
            <SectionIntro id="different-heading" eyebrow="What makes StockStreak different?" title="Learning that feels like real life" />
            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
              <div className={`${spotlight} flex flex-col gap-10 self-start p-7 sm:p-9`}>
                <span className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.45),transparent_62%)]" />
                <div>
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-brand-300">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-3xl leading-tight text-white">An AI Coach that teaches</h3>
                  <p className="mt-2 max-w-sm text-white/70">
                    A hint first, then a retry, then a fresh question to check you&apos;ve really got it — never just the answer.
                  </p>
                </div>
                <div aria-hidden className="flex flex-col gap-2 text-sm">
                  <p className="self-end rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 font-medium">Why was my first answer wrong?</p>
                  <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/10 px-3.5 py-2 text-white/85">
                    A limit is the most you <em>can</em> borrow — not money you have. Spend ₹40,000 of a ₹50,000 limit and you owe it back.
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-slate-200 border-y border-slate-200">
                {DIFFERENCES.map(({ Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-4 py-5">
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg leading-snug text-slate-900">{title}</h3>
                      <p className="mt-1 text-[15px] text-slate-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className={`${spotlight} mx-auto max-w-5xl px-6 py-16 text-center sm:px-12`}>
            <span className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]" />
            <h2 className="mx-auto max-w-2xl text-4xl leading-tight text-white sm:text-5xl">Start your financial-learning journey today</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              12 lessons, 4 money scenarios, a daily challenge and smart revision — free to start.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className={`${lightButton} group px-8 py-4 text-base`}>
                Get started — it&apos;s free
                <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/sign-in" className="rounded-xl px-4 py-2 font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline">
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
