import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress } from "@/lib/progress";
import { countDueRevision } from "@/lib/revision";
import { chapterOf } from "@/lib/journey";
import { getTodaysQuestion } from "@/lib/daily-question";
import { dailyChallengeInfo } from "@/lib/daily-challenge";
import { getDailyMissions } from "@/lib/missions";
import { getAllChallengeProgress, HABIT_CHALLENGE } from "@/lib/challenges";
import { findPersonality } from "@/lib/personality";
import { REWARDS } from "@/lib/rewards";
import { SCENARIOS, SCENARIO_XP, maxScore } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { istDay } from "@/lib/ist-date";
import { TodayPanel } from "@/components/dashboard/TodayPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { StepBar } from "@/components/ui/ProgressBar";
import { ChallengeIcon } from "@/components/practice/ChallengeIcon";
import { IconTile, ScenarioIcon } from "@/components/ui/topic-icons";
import { primaryButton, secondaryButton, spotlight, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon, RefreshIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Daily — StockStreak" };

const formatDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "UTC" });

// Practice: real money decisions, minus the real-money consequences — the
// day's question and challenge, the 30-day habit challenge, saving
// challenges, the compound interest simulator, money scenarios and revision.
export default async function PracticePage() {
  const user = await requireOnboardedUser();
  const today = istDay();
  const [progress, question, challengeRun, challenge, missions, due, nextItem, runs, unlocks, challenges] = await Promise.all([
    getProgress(user.id),
    getTodaysQuestion(user.id),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day: today } }, select: { xpAwarded: true } }),
    dailyChallengeInfo(user.id, today),
    getDailyMissions(user.id, today),
    countDueRevision(user.id),
    db.revisionItem.findFirst({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { dueDay: "asc" }, select: { dueDay: true } }),
    db.scenarioRun.groupBy({ by: ["scenarioSlug"], where: { userId: user.id }, _max: { score: true } }),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    getAllChallengeProgress(user.id, today),
  ]);
  const best = new Map(runs.map((r) => [r.scenarioSlug, r._max.score ?? 0]));
  const owned = new Set(unlocks.map((u) => u.rewardId));
  const habit = challenges.find((c) => c.challenge.id === HABIT_CHALLENGE.id)!;
  const saving = challenges.filter((c) => c.challenge.kind === "saving");
  const suggested = findPersonality(user.moneyPersonality)?.focus.challengeId;
  const habitStep = habit.nextStep ? HABIT_CHALLENGE.steps[habit.nextStep - 1] : null;
  const phase = habit.nextStep ? [...(HABIT_CHALLENGE.phases ?? [])].reverse().find((p) => p.from <= habit.nextStep!) : undefined;

  return (
    <div className="flex flex-col gap-14">
      <PageHeader
        eyebrow="Daily"
        title="Small money moves, every day"
        description="Today's Reality Check and challenge, the 30-day habit, saving challenges, scenarios and revision. A few minutes a day — and no punishment for the days life gets in the way."
      />

      {/* The 30-day habit challenge: this page's main focus */}
      <section className={`${spotlight} p-6 sm:p-9`} aria-labelledby="habit-heading">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]"
        />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-xl">
            <p className="text-[13px] font-medium text-white/60">
              {habit.completed ? "Completed" : habit.enrolled ? `${phase?.title ?? "30 days"} · Day ${habit.nextStep} of 30` : "30 days · one small step a day"}
            </p>
            <h2 id="habit-heading" className="mt-2 text-3xl leading-tight text-white sm:text-4xl">
              {HABIT_CHALLENGE.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/75">
              {habit.enrolled && habitStep
                ? habit.doneToday
                  ? `Today's step is done. Tomorrow: “${habitStep.title}”.`
                  : `Today: “${habitStep.title}” — ${habitStep.task}`
                : HABIT_CHALLENGE.summary}
            </p>
            {habit.enrolled && (
              <div className="mt-5 max-w-sm">
                <StepBar done={Math.round((habit.done / 30) * 10)} total={10} label="30-day challenge progress" onDark />
                <p className="mt-1.5 text-xs text-white/55">{habit.done} of 30 days done · missed days are never held against you</p>
              </div>
            )}
          </div>
          <Link href={`/practice/challenges/${HABIT_CHALLENGE.id}`} className={`${primaryButton} group shrink-0 px-7 py-3.5 text-base`}>
            {habit.completed ? "See your 30 days" : !habit.enrolled ? "Start the challenge" : habit.doneToday ? "See the challenge" : "Do today's step"}
            <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <TodayPanel
        id="today"
        questionXp={question?.answer ? question.answer.xpAwarded : null}
        questionPrompt={question?.question.prompt}
        challengeTitle={challenge.title}
        challengeXp={challengeRun ? challengeRun.xpAwarded : null}
        missions={missions}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <section id="challenges" className="scroll-mt-20" aria-labelledby="challenges-heading">
          <h2 id="challenges-heading" className="text-2xl text-slate-900">
            Saving challenges
          </h2>
          <p className="mt-1 text-sm text-slate-600">Short, specific, doable. One check-in a day — no streak shame if life happens.</p>
          <ul className="mt-5 flex flex-col gap-3">
            {saving.map(({ challenge: c, enrolled, done, completed, doneToday }) => (
              <li key={c.id}>
                <Link href={`/practice/challenges/${c.id}`} className={`${tile} flex items-center gap-4 p-4`}>
                  <ChallengeIcon icon={c.icon} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{c.title}</span>
                      {suggested === c.id && !completed && (
                        <span className="rounded-full bg-brand-50 px-2 py-px text-[11px] font-semibold text-brand-700">Suggested for you</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{c.tagline}</span>
                    {enrolled && (
                      <StepBar done={done} total={c.steps.length} current={!completed && !doneToday} label={`${c.title} progress`} className="mt-2.5 max-w-56" />
                    )}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500 tabular-nums">
                    {completed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckIcon className="h-3.5 w-3.5" /> Done
                      </span>
                    ) : enrolled ? (
                      `${done}/${c.steps.length}`
                    ) : (
                      `${c.steps.length} days`
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-6">
          <section id="review" className="scroll-mt-20" aria-labelledby="review-heading">
            <h2 id="review-heading" className="text-xl text-slate-900">
              Review &amp; revise
            </h2>
            <p className="mt-1 text-sm text-slate-600">Questions you missed come back after 1, 3 and 7 days — with a fresh example each time — so they stick.</p>
            <p className="mt-4 flex items-baseline gap-3 border-t border-slate-200 pt-4">
              <span className="font-display text-5xl leading-none font-semibold text-slate-900 tabular-nums">{due}</span>
              <span className="text-[15px] text-slate-600">due now</span>
            </p>
            {!due && nextItem && <p className="mt-2 text-sm text-slate-600">Next one comes back on {formatDay(nextItem.dueDay)}.</p>}
            {!due && !nextItem && <p className="mt-2 text-sm text-slate-600">Nothing to revise yet — missed quiz questions will show up here.</p>}
            {progress.review && (
              <Link href={`/lessons/${progress.review.lesson.slug}`} className={`${tile} mt-4 flex items-start gap-3 p-3.5 text-sm text-slate-700`}>
                <IconTile area={progress.review.lesson.area} size="sm">
                  <RefreshIcon />
                </IconTile>
                <span>
                  <span className="font-semibold text-slate-900">Review {progress.review.area.label}:</span> you&apos;ve got {progress.review.area.quizAccuracy}% right so far —
                  retake “{progress.review.lesson.title}”.
                </span>
              </Link>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {due > 0 && (
                <Link href="/revision" className={primaryButton}>
                  Start revision
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <Link href="/profile#mastery-heading" className={secondaryButton}>
                Topic mastery
              </Link>
            </div>
          </section>
        </section>
      </div>

      <section id="scenarios" className="scroll-mt-20" aria-labelledby="scenarios-heading">
        <div className="max-w-2xl">
          <h2 id="scenarios-heading" className="text-2xl text-slate-900">
            Money scenarios
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Real-life decisions with consequences. Each opens with its lesson&apos;s level · +{SCENARIO_XP} XP the first time · numbers are illustrative.
          </p>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((scenario) => {
            const reward = scenario.bonus ? REWARDS.find((r) => r.scenarioSlug === scenario.slug) : undefined;
            const lesson = progress.lessons.find((l) => l.slug === scenario.lessonSlug);
            const levelLocked = !!lesson?.locked;
            const rewardLocked = !!reward && !owned.has(reward.id);
            const area = READINESS_AREA_META[scenario.area];
            const score = best.get(scenario.slug);
            const level = scenario.lessonSlug ? chapterOf(scenario.lessonSlug) : undefined;
            const body = (
              <>
                <IconTile area={scenario.area} muted={levelLocked || rewardLocked}>
                  <ScenarioIcon slug={scenario.slug} area={scenario.area} />
                </IconTile>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className={levelLocked || rewardLocked ? "text-slate-500" : area.labelText}>{scenario.bonus ? "Bonus" : area.label}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {scenario.minutes} min
                    </span>
                  </span>
                  <span className={`mt-1 block leading-snug font-semibold ${levelLocked ? "text-slate-600" : "text-slate-900"}`}>{scenario.title}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                    {levelLocked ? (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <LockIcon className="h-3.5 w-3.5" /> Opens with Level {level?.number}
                      </span>
                    ) : rewardLocked ? (
                      <span className="inline-flex items-center gap-1 text-orange-700">
                        <LockIcon className="h-3.5 w-3.5" /> Unlock for {reward!.cost} XP in Rewards
                      </span>
                    ) : score !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckIcon className="h-3.5 w-3.5" /> Done · best score {score}/{maxScore(scenario)}
                      </span>
                    ) : (
                      <span className="text-brand-700">Play · +{SCENARIO_XP} XP</span>
                    )}
                  </span>
                </span>
              </>
            );
            return (
              <li key={scenario.slug}>
                {levelLocked ? (
                  <div className="flex h-full items-start gap-3 rounded-2xl border border-dashed border-slate-300 p-4">{body}</div>
                ) : (
                  <Link href={rewardLocked ? "/rewards" : `/practice/${scenario.slug}`} className={`${tile} flex h-full items-start gap-3 p-4`}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
