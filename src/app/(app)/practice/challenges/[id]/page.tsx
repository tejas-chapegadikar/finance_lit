import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay } from "@/lib/ist-date";
import { findChallenge, getChallengeProgress } from "@/lib/challenges";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { ChallengeIcon } from "@/components/practice/ChallengeIcon";
import { ChallengeStepCard, JoinChallengeButton, RestartChallengeButton } from "@/components/practice/ChallengeStepCard";
import { ArrowLeftIcon, CheckIcon, LockIcon, StarIcon } from "@/components/ui/icons";
import { TrophyIllustration } from "@/components/ui/illustrations";

export async function generateMetadata(props: PageProps<"/practice/challenges/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `${findChallenge(id)?.title ?? "Challenge"} — StockStreak` };
}

export default async function ChallengePage(props: PageProps<"/practice/challenges/[id]">) {
  const user = await requireOnboardedUser();
  const { id } = await props.params;
  const challenge = findChallenge(id);
  if (!challenge) notFound();
  const today = istDay();

  const [progress, checkIn] = await Promise.all([
    getChallengeProgress(user.id, challenge, today),
    db.moneyCheckIn.count({ where: { userId: user.id, day: today } }),
  ]);
  const total = challenge.steps.length;
  const step = progress.nextStep ? challenge.steps[progress.nextStep - 1] : null;
  const doneSteps = new Set(progress.checkIns.map((c) => c.stepNumber));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <Link href="/practice#challenges" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Challenges
      </Link>
      <PageHeader
        icon={<ChallengeIcon icon={challenge.icon} size="lg" />}
        eyebrow={challenge.kind === "habit" ? `Practice · ${total}-day habit` : `Practice · Saving challenge · ${total} days`}
        title={challenge.title}
        description={challenge.summary}
        aside={
          progress.enrolled ? (
            <div className="flex items-center gap-3">
              <ProgressRing value={progress.done} max={total} label={`${challenge.title} progress`} />
              <p className="text-sm text-slate-600">
                <span className="block font-semibold text-slate-900 tabular-nums">
                  {progress.done} of {total} days done
                </span>
                {progress.completed ? "Finished!" : "One step a day"}
              </p>
            </div>
          ) : undefined
        }
      />

      {!progress.enrolled ? (
        <section className="flex flex-col gap-4 rounded-2xl bg-peach-100/70 p-6 sm:p-8">
          <p className="font-display text-2xl leading-snug text-slate-900">{challenge.tagline}</p>
          <p className="text-sm text-slate-700">
            One small step a day. Miss a day? No penalty — the next step just waits for you. Each step pays +{challenge.stepXp} XP, and finishing pays +
            {challenge.finishXp} XP.
          </p>
          <JoinChallengeButton challengeId={challenge.id} />
        </section>
      ) : progress.completed ? (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
          <TrophyIllustration won className="h-24 w-24 animate-pop" />
          <h2 className="text-2xl text-slate-900">You finished {challenge.title}</h2>
          <p className="max-w-md text-sm text-slate-700">That&apos;s a habit now, not a one-off. Keep the parts that worked — and maybe try another challenge.</p>
          {challenge.kind === "saving" && <RestartChallengeButton challengeId={challenge.id} />}
        </section>
      ) : progress.doneToday ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
            <CheckIcon className="h-5 w-5" /> Today&apos;s step is done
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Step {progress.nextStep} opens tomorrow. No rush — if you miss a day, it simply waits for you.
          </p>
        </section>
      ) : (
        step && <ChallengeStepCard challengeId={challenge.id} stepNumber={progress.nextStep!} step={step} checkedInToday={checkIn > 0} />
      )}

      <section aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-xl text-slate-900">
          All {total} steps
        </h2>
        <ol className="mt-4 flex flex-col">
          {challenge.steps.map((s, i) => {
            const n = i + 1;
            const phase = challenge.phases?.find((p) => p.from === n);
            const isDone = doneSteps.has(n);
            const isNext = progress.enrolled && n === progress.nextStep;
            return (
              <li key={n}>
                {phase && (
                  <div className="mt-6 mb-2 first:mt-0">
                    <p className="text-[13px] font-semibold text-slate-700">{phase.title}</p>
                    <p className="text-xs text-slate-500">{phase.goal}</p>
                  </div>
                )}
                <div className={`flex items-center gap-3 border-b border-slate-200 py-3 ${isNext ? "font-semibold" : ""}`}>
                  <span
                    aria-hidden
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm tabular-nums ${
                      isDone ? "bg-emerald-500 text-white" : isNext ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckIcon className="h-4 w-4" /> : n}
                  </span>
                  <span className={`min-w-0 flex-1 text-sm ${isDone ? "text-slate-500" : "text-slate-900"}`}>{s.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">Done</span>
                    ) : isNext ? (
                      progress.doneToday ? "Tomorrow" : "Today"
                    ) : (
                      <LockIcon className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="sr-only">{isDone ? "done" : isNext ? "next" : "upcoming"}</span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <StarIcon className="h-3.5 w-3.5 text-orange-500" /> +{challenge.stepXp} XP a step · +{challenge.finishXp} XP for finishing · paid once, even if you do it again
        </p>
      </section>
    </div>
  );
}
