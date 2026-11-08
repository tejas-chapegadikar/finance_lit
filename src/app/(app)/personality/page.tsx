import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { findPersonality } from "@/lib/personality";
import { db } from "@/lib/db";
import { PersonalityQuiz } from "@/components/personality/PersonalityQuiz";
import { IconTile, LessonIcon } from "@/components/ui/topic-icons";
import { Burst } from "@/components/ui/Burst";
import { primaryButton, secondaryButton, spotlight, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, AlertIcon, SparklesIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Your money personality | StockStreak" };

// The Money Personality Quiz and its result. A playful starting point that
// shapes suggestions, never a permanent label. Retake it anytime.
export default async function PersonalityPage(props: PageProps<"/personality">) {
  const user = await requireOnboardedUser();
  const params = await props.searchParams;
  const welcome = params.welcome === "1";
  const retake = params.retake === "1";
  const personality = findPersonality(user.moneyPersonality);
  const showQuiz = !personality || retake;

  if (showQuiz) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex animate-fade-up flex-col gap-2">
          <p className="text-[13px] font-medium text-slate-500">{welcome ? "One last thing · about a minute" : "Money Personality Quiz"}</p>
          <h1 className="text-4xl leading-tight text-slate-900 sm:text-5xl">What&apos;s your money personality?</h1>
          <p className="text-[15px] leading-relaxed text-slate-600">
            Six quick questions. We&apos;ll use your answers to suggest where to start, not to judge you. Everyone&apos;s a little bit of everything.
          </p>
        </header>
        <PersonalityQuiz next={welcome ? "/personality?welcome=1" : "/personality"} />
        {welcome ? (
          <Link href="/dashboard" className="self-start text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
            Skip for now, take me to my dashboard
          </Link>
        ) : (
          personality && (
            <Link href="/personality" className="self-start text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
              Keep my current result
            </Link>
          )
        )}
      </div>
    );
  }

  const focus = personality.focus;
  const lesson = await db.lesson.findUnique({ where: { slug: focus.lessonSlug }, select: { slug: true, title: true, area: true } });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <section className={`${spotlight} p-7 text-center sm:p-10`} aria-labelledby="personality-name">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]"
        />
        <span className="relative mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-white/10 text-brand-300">
          <Burst />
          <SparklesIcon className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[13px] font-medium text-white/60">Your money personality</p>
        <h1 id="personality-name" className="mt-1 text-4xl text-white sm:text-5xl">
          {personality.name}
        </h1>
        <p className="mx-auto mt-3 max-w-md font-display text-xl text-orange-200">{personality.line}</p>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">{personality.description}</p>
      </section>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section aria-labelledby="strengths-heading">
          <h2 id="strengths-heading" className="text-xl text-slate-900">
            Your strengths
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {personality.strengths.map((s) => (
              <li key={s} className="flex items-center gap-2 text-[15px] text-slate-800">
                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" /> {s}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="watch-heading">
          <h2 id="watch-heading" className="text-xl text-slate-900">
            Watch out for
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {personality.watchOut.map((s) => (
              <li key={s} className="flex items-center gap-2 text-[15px] text-slate-800">
                <AlertIcon className="h-4 w-4 shrink-0 text-orange-600" /> {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="start-heading">
        <h2 id="start-heading" className="text-2xl text-slate-900">
          Where to start
        </h2>
        <p className="mt-1 border-l-2 border-brand-300 pl-4 text-[15px] text-slate-700">{focus.tip}</p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lesson && (
            <li>
              <Link href={`/lessons/${lesson.slug}`} className={`${tile} flex h-full flex-col gap-3 p-5`}>
                <IconTile area={lesson.area}>
                  <LessonIcon slug={lesson.slug} area={lesson.area} />
                </IconTile>
                <span className="text-[13px] font-medium text-slate-500">Read this lesson</span>
                <span className="font-semibold leading-snug text-slate-900">{lesson.title}</span>
              </Link>
            </li>
          )}
          <li>
            <Link href={focus.tool.href} className={`${tile} flex h-full flex-col gap-3 p-5`}>
              <IconTile area="BUDGETING">
                <SparklesIcon />
              </IconTile>
              <span className="text-[13px] font-medium text-slate-500">Use this tool</span>
              <span className="font-semibold leading-snug text-slate-900">{focus.tool.label}</span>
            </Link>
          </li>
        </ul>
      </section>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">This isn&apos;t a label. It&apos;s a starting point. Habits change, and so can your result.</p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/personality?retake=1" className={secondaryButton}>
            Retake the quiz
          </Link>
          <Link href="/dashboard" className={`${primaryButton} group`}>
            {welcome ? "Go to my dashboard" : "Back to dashboard"}
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
