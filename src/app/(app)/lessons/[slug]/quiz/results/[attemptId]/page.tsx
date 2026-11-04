import type { Metadata } from "next";
import { Avatar } from "@/components/avatar/Avatar";
import { avatarName, readAvatar } from "@/lib/avatar";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome, summarizeAttempt, type QuestionOutcome } from "@/lib/quiz-outcome";
import { getProgress } from "@/lib/progress";
import { BADGES } from "@/lib/badges";
import { readKeyTerms } from "@/lib/lesson-content";
import { PATH_NAME, NEXT_PATH_NAME } from "@/lib/constants";
import { beginQuiz } from "@/actions/quiz";
import { saveLessonFeedback } from "@/actions/feedback";
import { LessonFeedbackForm } from "@/components/lessons/LessonFeedbackForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Medal } from "@/components/ui/Medal";
import { Burst } from "@/components/ui/Burst";
import { LevelIllustration, TrophyIllustration } from "@/components/ui/illustrations";
import { BadgeIcon, IconTile, LessonIcon, ScenarioIcon } from "@/components/ui/topic-icons";
import { card, gameSurface, primaryButton, secondaryButton, tile } from "@/components/ui/button-styles";
import { CORE_SCENARIOS } from "@/lib/scenarios";
import { ArrowRightIcon, CheckIcon, GraduationCapIcon, RefreshIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Lesson complete — StockStreak" };

const OUTCOME_BADGE: Record<QuestionOutcome, { label: string; className: string }> = {
  "first-try": { label: "First try", className: "bg-emerald-50 text-emerald-800" },
  "with-coach": { label: "With the Coach", className: "bg-brand-50 text-brand-800" },
  revealed: { label: "Answer shown", className: "bg-slate-100 text-slate-700" },
};

export default async function LessonCompletePage(props: PageProps<"/lessons/[slug]/quiz/results/[attemptId]">) {
  const user = await requireOnboardedUser();
  const { slug, attemptId } = await props.params;

  const [attempt, progress] = await Promise.all([
    db.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        lesson: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: { options: { orderBy: { order: "asc" } } },
            },
          },
        },
        answers: { orderBy: { tryNumber: "asc" } },
        xpTransactions: { select: { amount: true, type: true } },
        badges: { select: { badgeId: true } },
      },
    }),
    getProgress(user.id),
  ]);

  if (!attempt || attempt.userId !== user.id || attempt.lesson.slug !== slug || attempt.status !== "COMPLETED") {
    notFound();
  }

  const [feedback, earlier] = await Promise.all([
    db.lessonFeedback.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: attempt.lessonId } },
      select: { helpful: true, comment: true },
    }),
    // Earlier completed attempts, to celebrate an improvement.
    db.quizAttempt.aggregate({
      where: { userId: user.id, lessonId: attempt.lessonId, status: "COMPLETED", completedAt: { lt: attempt.completedAt ?? new Date() } },
      _max: { mastery: true },
    }),
  ]);
  const previousBest = earlier._max.mastery;

  const summary = summarizeAttempt(attempt.answers, attempt.totalQuestions);
  const percent = Math.round((summary.firstTry / attempt.totalQuestions) * 100);
  const lessonXp = attempt.xpAwarded ?? 0;
  const levelBonus = attempt.xpTransactions
    .filter((tx) => tx.type === "LEVEL_COMPLETION")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const readinessBefore = attempt.readinessBefore ?? progress.overall;
  const readinessAfter = attempt.readinessAfter ?? progress.overall;
  const keyTerms = readKeyTerms(attempt.lesson.keyTerms);
  const investIndex = progress.invest.findIndex((l) => l.id === attempt.lessonId);
  const lessonNumber = (progress.lessons.find((l) => l.id === attempt.lessonId) ?? progress.invest[investIndex])?.number;

  // Badges are stored with the attempt that unlocked them.
  const unlocked = new Set(attempt.badges.map((b) => b.badgeId));
  const newBadges = BADGES.filter((badge) => unlocked.has(badge.id));
  const levelJustCompleted = levelBonus > 0 || newBadges.some((b) => b.rule.kind === "level");
  const shownBadges = newBadges.filter((b) => b.rule.kind !== "level");

  // After an InvestSmart lesson, the next one on the track (now open); otherwise the path's recommendation.
  const investNext = investIndex >= 0 ? progress.invest.slice(investIndex + 1).find((l) => !l.locked && l.status !== "completed") : undefined;
  const next = investNext
    ? { lesson: investNext, isRetake: false, reason: "Next on the InvestSmart track" }
    : progress.next && progress.next.lesson.id !== attempt.lessonId && investIndex < 0
      ? progress.next
      : null;
  const practiceScenario = CORE_SCENARIOS.find((scenario) => scenario.lessonSlug === slug);
  const retake = beginQuiz.bind(null, attempt.lessonId);

  // Did this attempt finish a level (and so unlock the next one)? It did if it
  // was this lesson's first completion and every other lesson in the level
  // was already done before it.
  const thisLevel = progress.levels.find((level) => level.slugs.includes(slug));
  const firstCompletion = progress.lessons.find((l) => l.id === attempt.lessonId)?.firstCompletedAt?.getTime() === attempt.completedAt?.getTime();
  const levelFinishedNow =
    !!thisLevel &&
    thisLevel.status === "completed" &&
    firstCompletion &&
    progress.lessons
      .filter((l) => thisLevel.slugs.includes(l.slug) && l.id !== attempt.lessonId)
      .every((l) => l.firstCompletedAt && attempt.completedAt && l.firstCompletedAt < attempt.completedAt);
  const unlockedLevel = levelFinishedNow ? progress.levels[progress.levels.indexOf(thisLevel!) + 1] : undefined;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Completing the lesson: the one dark, celebratory card */}
      <header className={`${gameSurface} flex animate-fade-up flex-col items-center px-6 pt-10 pb-6 text-center sm:px-10`}>
        <span
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.5),transparent_62%)]"
        />
        <span className="relative flex animate-pop items-end gap-3">
          {lessonXp > 0 && <Burst />}
          <Avatar config={readAvatar(user.avatar)} expression={lessonXp > 0 ? "celebrating" : "proud"} className="h-28 w-auto animate-hop sm:h-32" label={`${avatarName(user)}'s avatar celebrating`} />
          <Medal icon={levelJustCompleted ? <GraduationCapIcon /> : <LessonIcon slug={slug} area={attempt.lesson.area} />} size="lg" />
        </span>
        <p className="mt-4 text-[13px] font-medium text-white/60">
          {lessonXp > 0
            ? `Lesson ${lessonNumber ? String(lessonNumber).padStart(2, "0") : ""} completed`
            : "Already completed — this retake can raise your readiness"}
        </p>
        <h1 className="mt-1 text-4xl text-white sm:text-5xl">Lesson Complete!</h1>
        <p className="mt-2 text-white/75">{attempt.lesson.title}</p>

        <section className="mt-8 w-full" aria-labelledby="performance-heading">
          <h2 id="performance-heading" className="sr-only">
            Your performance
          </h2>
          <dl className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 text-left">
            <div className="flex flex-col-reverse justify-end gap-1 px-3 py-4 first:pl-0 sm:px-5">
              <dt className="text-xs text-white/55">
                <span className="block font-medium text-white/80">Score</span>
                {percent}% first try
              </dt>
              <dd className="font-display text-2xl font-semibold text-white tabular-nums sm:text-3xl">
                {summary.firstTry}/{attempt.totalQuestions}
              </dd>
            </div>
            <div className="flex flex-col-reverse justify-end gap-1 px-3 py-4 sm:px-5">
              <dt className="text-xs text-white/55">
                <span className="block font-medium text-white/80">XP earned</span>
                {lessonXp ? "first completion" : "retakes earn no XP"}
              </dt>
              <dd className="font-display text-2xl font-semibold text-orange-300 tabular-nums sm:text-3xl">+{lessonXp}</dd>
            </div>
            <div className="flex flex-col-reverse justify-end gap-1 px-3 py-4 sm:px-5">
              <dt className="text-xs text-white/55">
                <span className="block font-medium text-white/80">Readiness</span>
                out of 100
              </dt>
              <dd className="font-display text-2xl font-semibold whitespace-nowrap text-white tabular-nums sm:text-3xl">
                {readinessBefore} → {readinessAfter}
              </dd>
            </div>
          </dl>
          {(summary.withCoach > 0 || (previousBest !== null && (attempt.mastery ?? 0) > previousBest)) && (
            <div className="pt-4 text-center text-sm">
              {summary.withCoach > 0 && <p className="text-white/70">{summary.withCoach} more solved with the Coach&apos;s help.</p>}
              {previousBest !== null && (attempt.mastery ?? 0) > previousBest && (
                <p className="font-semibold text-emerald-300">
                  You improved — quiz accuracy {previousBest}% → {attempt.mastery}%.
                </p>
              )}
            </div>
          )}
        </section>
      </header>

      {levelFinishedNow && !levelJustCompleted && (
        <section className="relative flex animate-fade-up items-center gap-5 overflow-hidden rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-200 sm:p-6">
          {unlockedLevel && <LevelIllustration level={unlockedLevel.chapter.number} className="relative h-24 w-auto shrink-0 animate-pop sm:h-28" />}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-emerald-800">Level {thisLevel!.chapter.number} complete</p>
            <h2 className="mt-0.5 text-2xl leading-tight text-slate-900">
              {unlockedLevel ? `Level ${unlockedLevel.chapter.number} unlocked: ${unlockedLevel.chapter.title}` : "Level complete!"}
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              You finished every lesson in “{thisLevel!.chapter.title}”. The next level is open on your learning path.
            </p>
          </div>
        </section>
      )}

      {levelJustCompleted && (
        <section className="relative flex animate-fade-up flex-col items-center overflow-hidden rounded-3xl bg-orange-50 p-6 text-center ring-1 ring-orange-200 sm:p-8">
          <span className="relative">
            <Burst />
            <TrophyIllustration won className="h-28 w-28 animate-pop" />
          </span>
          <p className="mt-2 text-[13px] font-medium text-orange-800">All 4 levels complete</p>
          <h2 className="mt-0.5 text-3xl text-slate-900">{PATH_NAME} Graduate</h2>
          <p className="mt-2 text-sm text-slate-700">
            {progress.completedCount}/{progress.totalLessons} lessons · {user.xpTotal.toLocaleString("en-IN")} XP · Readiness {progress.overall}/100
          </p>
          {levelBonus > 0 && <p className="mt-2 text-sm font-semibold text-orange-800">+{levelBonus} XP completion bonus</p>}
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-700">
            Next: the {NEXT_PATH_NAME} path is coming soon. Until then, keep your skills sharp with the daily question and challenge.
          </p>
        </section>
      )}

      {shownBadges.length > 0 && (
        <section className="animate-fade-up">
          <h2 className="text-xl text-slate-900">New badge unlocked</h2>
          <ul className="mt-4 flex flex-wrap gap-6">
            {shownBadges.map((badge) => (
              <li key={badge.id} className="flex w-28 flex-col items-center gap-2 text-center">
                <span className="relative animate-pop">
                  <Burst />
                  <Medal icon={<BadgeIcon id={badge.id} />} />
                </span>
                <span className="text-sm font-semibold text-slate-900">{badge.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {keyTerms.length > 0 && (
        <section>
          <h2 className="text-xl text-slate-900">Concepts learned</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {keyTerms.map((term) => (
              <li key={term.term} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800 ring-1 ring-slate-200">
                <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                {term.term}
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.withCoach + summary.revealed > 0 && (
        <section className="flex items-start gap-3 border-y border-slate-200 py-4" aria-labelledby="revision-note">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <RefreshIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 id="revision-note" className="font-sans text-base font-semibold tracking-normal text-slate-900">
              Revision scheduled
            </h2>
            <p className="text-sm text-slate-600">
              The {summary.withCoach + summary.revealed} {summary.withCoach + summary.revealed === 1 ? "question" : "questions"} you missed will come back
              in Revision over the next week, with fresh examples — that&apos;s how it sticks.
            </p>
          </div>
        </section>
      )}

      {next ? (
        <section className={`${card} p-5 sm:p-6`}>
          <p className="text-[13px] font-medium text-brand-700">{next.isRetake ? "Recommended next" : "Next recommended lesson"}</p>
          <div className="mt-3 flex items-center gap-4">
            <IconTile area={next.lesson.area} size="lg">
              <LessonIcon slug={next.lesson.slug} area={next.lesson.area} />
            </IconTile>
            <div className="min-w-0">
              <h2 className="text-xl leading-tight text-slate-900">{next.lesson.title}</h2>
              <p className="mt-0.5 text-sm text-slate-600">{next.isRetake ? next.reason : next.lesson.description}</p>
            </div>
          </div>
          <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} group mt-5 w-full sm:w-auto`}>
            {next.isRetake ? "Review this lesson" : "Continue to Next Lesson"}
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </section>
      ) : null}

      {practiceScenario && (
        <Link href={`/practice/${practiceScenario.slug}`} className={`${tile} flex items-center gap-4 p-4`}>
          <IconTile area={practiceScenario.area}>
            <ScenarioIcon slug={practiceScenario.slug} area={practiceScenario.area} />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-brand-700">Practise it for real</span>
            <span className="block font-semibold text-slate-900">{practiceScenario.title}</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400" />
        </Link>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!next && (
          <Link href="/dashboard" className={primaryButton}>
            Back to dashboard
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
        <form action={retake}>
          <SubmitButton pendingLabel="Starting…" className={`${secondaryButton} w-full sm:w-auto`}>
            Retake quiz
          </SubmitButton>
        </form>
        {next && (
          <Link href="/dashboard" className={secondaryButton}>
            Dashboard
          </Link>
        )}
      </div>

      <section className="border-t border-slate-200 pt-8" aria-labelledby="feedback-heading">
        <h2 id="feedback-heading" className="text-xl text-slate-900">
          Was this lesson clear and useful?
        </h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">Your answer goes straight to the StockStreak team.</p>
        <LessonFeedbackForm
          save={saveLessonFeedback.bind(null, attempt.lessonId)}
          initial={feedback ? { helpful: feedback.helpful, comment: feedback.comment ?? "" } : null}
        />
      </section>

      <section aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-xl text-slate-900">
          Review your answers
        </h2>
        <ol className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
          {attempt.lesson.questions.map((question, i) => {
            const tries = attempt.answers.filter((a) => a.questionId === question.id);
            const outcome = questionOutcome(tries);
            const correct = question.options.find((o) => o.isCorrect);
            const firstPick = question.options.find((o) => o.id === tries[0]?.selectedOptionId);

            return (
              <li key={question.id} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 py-4 text-sm">
                <span aria-hidden className="font-display text-sm font-semibold text-slate-400 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      <span className="sr-only">{i + 1}. </span>
                      {question.prompt}
                    </p>
                    {outcome && (
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${OUTCOME_BADGE[outcome].className}`}>
                        {OUTCOME_BADGE[outcome].label}
                      </span>
                    )}
                  </div>
                  {outcome !== "first-try" && firstPick && (
                    <p className="mt-1.5 text-slate-600">
                      Your first pick: <span className="text-rose-700">{firstPick.text}</span>
                    </p>
                  )}
                  {correct && (
                    <p className="mt-1 text-slate-600">
                      Answer: <span className="font-semibold text-emerald-800">{correct.text}</span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
