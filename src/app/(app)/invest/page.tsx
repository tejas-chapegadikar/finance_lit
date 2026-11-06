import Link from "next/link";
import type { Metadata } from "next";
import { AvatarSays } from "@/components/avatar/AvatarSays";
import { avatarName, readAvatar } from "@/lib/avatar";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress, type LessonProgress } from "@/lib/progress";
import { getPortfolio } from "@/lib/invest/portfolio";
import { VirtualPortfolio } from "@/components/invest/VirtualPortfolio";
import { compoundGrowth, shortRupees } from "@/lib/simulator";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { IconTile, LessonIcon } from "@/components/ui/topic-icons";
import { lightButton, spotlight, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "InvestSmart — StockStreak" };

// InvestSmart: understand investing before investing a rupee. Its first
// three lessons are the investing lessons of the Money IQ path (shown here,
// not duplicated); the InvestSmart track then goes further. Education only —
// no product recommendations, no promised returns.

/** Which of the investing topics each lesson covers. */
const COVERS: Record<string, string[]> = {
  "compound-interest": ["The power of compounding"],
  "stocks-mutual-funds-fds": ["Stocks and shares", "Mutual funds", "Risk vs return"],
  "sip-starting-early": ["SIPs", "Starting early"],
  "inflation-purchasing-power": ["What investing means", "Why it matters", "Inflation and purchasing power"],
  "how-stock-market-works": ["How the stock market works", "Exchanges, SEBI and demat"],
  "index-funds-long-term": ["Index funds", "Long-term investing"],
  "start-investing-checklist": ["How beginners can start"],
};

const FOUNDATIONS = ["compound-interest", "stocks-mutual-funds-fds", "sip-starting-early"];

function LessonRow({ lesson, lockedHint }: { lesson: LessonProgress; lockedHint: string }) {
  const done = lesson.status === "completed";
  const body = (
    <>
      <IconTile area={lesson.area} muted={lesson.locked}>
        <LessonIcon slug={lesson.slug} area={lesson.area} />
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className={`block leading-snug font-semibold ${lesson.locked ? "text-slate-600" : "text-slate-900"}`}>{lesson.title}</span>
        <span className="mt-0.5 block text-sm text-slate-600">{(COVERS[lesson.slug] ?? []).join(" · ")}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold">
          {lesson.locked ? (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <LockIcon className="h-3.5 w-3.5" /> {lockedHint}
            </span>
          ) : done ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckIcon className="h-3.5 w-3.5" /> Completed
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <ClockIcon className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min
              </span>
              <span className="text-orange-700">+{lesson.xpReward} XP</span>
              {lesson.status === "in-progress" && <span className="text-brand-700">Started</span>}
            </>
          )}
        </span>
      </span>
      {!lesson.locked && <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />}
    </>
  );
  return (
    <li>
      {lesson.locked ? (
        <div className="flex items-start gap-4 rounded-2xl border border-dashed border-slate-300 p-4">{body}</div>
      ) : (
        <Link href={`/lessons/${lesson.slug}`} className={`${tile} group flex items-start gap-4 p-4`}>
          {body}
        </Link>
      )}
    </li>
  );
}

export default async function InvestPage() {
  const user = await requireOnboardedUser();
  const [progress, portfolio] = await Promise.all([getProgress(user.id), getPortfolio(user.id)]);
  const foundations = FOUNDATIONS.flatMap((slug) => progress.lessons.filter((l) => l.slug === slug));
  const track = progress.invest;
  const all = [...foundations, ...track];
  const done = all.filter((l) => l.status === "completed").length;
  const example = compoundGrowth({ monthly: 1000, years: 20, annualRatePct: 10 });

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="InvestSmart"
        title="Understand investing before you invest a rupee"
        description="How investing works, why it matters, and how beginners start — then try it with virtual money, without risking a rupee. No stock tips, ever."
        aside={
          <div className="flex items-center gap-3">
            <ProgressRing value={done} max={all.length || 1} label="InvestSmart progress" />
            <p className="text-sm leading-snug text-slate-600">
              <span className="block font-semibold text-slate-900">
                {done} of {all.length} lessons done
              </span>
              Education, not advice
            </p>
          </div>
        }
      />

      {/* The simulator: this page's one spotlight */}
      <VirtualPortfolio portfolio={portfolio} />

      <section className={`${spotlight} p-6 sm:p-9`} aria-labelledby="sim-heading">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgb(235_104_52/0.35),transparent_62%)]"
        />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="text-[13px] font-medium text-white/60">Compounding simulator</p>
            <h2 id="sim-heading" className="mt-2 text-3xl leading-tight text-white sm:text-4xl">
              ₹1,000 a month. 20 years. About {shortRupees(example.value)}?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/75">
              That&apos;s {shortRupees(example.invested)} put in and about {shortRupees(example.growth)} from compounding — at an assumed 10% a year, which
              real markets don&apos;t promise. Change the numbers and see what time does.
            </p>
            <AvatarSays config={readAvatar(user.avatar)} name={avatarName(user)} expression="shocked" tone="dark" size="sm" className="mt-5">
              Wait… money can make more money?!
            </AvatarSays>
          </div>
          <Link href="/invest/simulator" className={`${lightButton} group shrink-0 px-7 py-3.5 text-base`}>
            Open the simulator
            <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="foundations-heading">
          <p className="text-[13px] font-medium text-slate-500">Part of your Money IQ path</p>
          <h2 id="foundations-heading" className="text-2xl text-slate-900">
            The foundations
          </h2>
          <p className="mt-1 text-sm text-slate-600">Compounding, the main types of investment, and SIPs. They open as you move through the Money IQ levels.</p>
          <ul className="mt-5 flex flex-col gap-3">
            {foundations.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} lockedHint={`Opens with Money IQ Level ${lesson.level}`} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="track-heading">
          <p className="text-[13px] font-medium text-slate-500">{track.length} lessons · in order</p>
          <h2 id="track-heading" className="text-2xl text-slate-900">
            The InvestSmart track
          </h2>
          <p className="mt-1 text-sm text-slate-600">Inflation, how the market really works, what index investing costs, and a beginner&apos;s checklist. Each one opens the next.</p>
          <ul className="mt-5 flex flex-col gap-3">
            {track.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} lockedHint="Finish the one before to open it" />
            ))}
          </ul>
        </section>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        InvestSmart teaches how investing works. It never recommends a product, fund or share, and no example here is a prediction: real returns vary, can be
        negative, and are never guaranteed. For personal advice, speak to a SEBI-registered investment adviser.
      </p>
    </div>
  );
}
