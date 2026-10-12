import type { Metadata } from "next";
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
import { card, primaryButton, secondaryButton, tile } from "@/components/ui/button-styles";
import { CORE_SCENARIOS } from "@/lib/scenarios";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Lesson complete — StockStreak" };

const OUTCOME_BADGE: Record<QuestionOutcome, { label: string; className: string }> = {
  "first-try": { label: "First try", className: "bg-emerald-100 text-emerald-800" },
  "with-coach": { label: "With the Coach", className: "bg-brand-100 text-brand-800" },
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
  const lessonNumber = progress.lessons.find((l) => l.id === attempt.lessonId)?.number;

  // Badges are stored with the attempt that unlocked them.
  const unlocked = new Set(attempt.badges.map((b) => b.badgeId));
  const newBadges = BADGES.filter((badge) => unlocked.has(badge.id));
  const levelJustCompleted = levelBonus > 0 || newBadges.some((b) => b.rule.kind === "level");
  const shownBadges = newBadges.filter((b) => b.rule.kind !== "level");

  const next = progress.next && progress.next.lesson.id !== attempt.lessonId ? progress.next : null;
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
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {/* Completing the lesson */}
      <header className="flex flex-col items-center text-center">
        <span className="motion-safe:animate-pop">
          <Medal icon={levelJustCompleted ? "🎓" : "⭐"} />
        </span>
        <p className="mt-3 text-sm font-semibold text-brand-700">
          {lessonXp > 0
            ? `Lesson ${lessonNumber ? String(lessonNumber).padStart(2, "0") : ""} completed`
            : "Already completed — this retake can raise your readiness"}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">Lesson Complete!</h1>
        <p className="mt-1 text-slate-600">{attempt.lesson.title}</p>
      </header>

      {levelFinishedNow && !levelJustCompleted && (
        <section className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-sm font-semibold text-brand-700">Level {thisLevel!.chapter.number} complete</p>
          <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">
            {unlockedLevel ? `Level ${unlockedLevel.chapter.number} unlocked: ${unlockedLevel.chapter.title}` : "Level complete!"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-700">
            You finished every lesson in “{thisLevel!.chapter.title}”. The next level is open on your learning path.
          </p>
        </section>
      )}

      {levelJustCompleted && (
        <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center">
          <p className="text-sm font-semibold text-amber-900">All 4 levels complete</p>
          <h2 className="mt-0.5 text-xl font-extrabold text-slate-900">{PATH_NAME} Graduate</h2>
          <p className="mt-2 text-sm text-slate-700">
            {progress.completedCount}/{progress.totalLessons} lessons · {user.xpTotal.toLocaleString("en-IN")} XP · Readiness{" "}
            {progress.overall}/100
          </p>
          {levelBonus > 0 && <p className="mt-2 text-sm font-semibold text-amber-900">+{levelBonus} XP completion bonus</p>}
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-700">
            Next: the {NEXT_PATH_NAME} path is coming soon. Until then, keep your skills sharp with the daily question and
            challenge.
          </p>
        </section>
      )}

      <section className={card} aria-labelledby="performance-heading">
        <h2 id="performance-heading" className="sr-only">
          Your performance
        </h2>
        <dl className="grid grid-cols-3 divide-x divide-slate-200">
          <div className="flex flex-col-reverse justify-end p-4">
            <dt className="text-xs text-slate-600">
              <span className="block font-semibold text-slate-800">Score</span>
              {percent}% first try
            </dt>
            <dd className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
              {summary.firstTry}/{attempt.totalQuestions}
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end p-4">
            <dt className="text-xs text-slate-600">
              <span className="block font-semibold text-slate-800">XP earned</span>
              {lessonXp ? "first completion" : "retakes earn no XP"}
            </dt>
            <dd className="font-display text-2xl font-extrabold text-amber-700 tabular-nums">+{lessonXp}</dd>
          </div>
          <div className="flex flex-col-reverse justify-end p-4">
            <dt className="text-xs text-slate-600">
              <span className="block font-semibold text-slate-800">Readiness</span>
              out of 100
            </dt>
            <dd className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
              {readinessBefore} → {readinessAfter}
            </dd>
          </div>
        </dl>
        {(summary.withCoach > 0 || (previousBest !== null && (attempt.mastery ?? 0) > previousBest)) && (
          <div className="border-t border-slate-200 px-4 py-3 text-center text-sm">
            {summary.withCoach > 0 && <p className="text-slate-700">{summary.withCoach} more solved with the Coach&apos;s help.</p>}
            {previousBest !== null && (attempt.mastery ?? 0) > previousBest && (
              <p className="font-semibold text-emerald-800">
                You improved — quiz accuracy {previousBest}% → {attempt.mastery}%.
              </p>
            )}
          </div>
        )}
      </section>

      {shownBadges.length > 0 && (
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-slate-900">New badge unlocked</h2>
          <ul className="mt-4 flex flex-wrap gap-4">
            {shownBadges
              .map((badge) => (
                <li key={badge.id} className="flex w-28 flex-col items-center gap-2 text-center">
                  <span className="motion-safe:animate-pop">
                    <Medal icon={badge.icon} />
                  </span>
                  <span className="text-sm font-bold text-slate-900">{badge.name}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {keyTerms.length > 0 && (
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-slate-900">Concepts learned</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {keyTerms.map((term) => (
              <li key={term.term} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-800">
                ✓ {term.term}
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.withCoach + summary.revealed > 0 && (
        <section className={`${card} flex items-start gap-4 p-5 sm:p-6`} aria-labelledby="revision-note">
          <div>
            <h2 id="revision-note" className="font-extrabold text-slate-900">
              Revision scheduled
            </h2>
            <p className="text-sm text-slate-600">
              The {summary.withCoach + summary.revealed}{" "}
              {summary.withCoach + summary.revealed === 1 ? "question" : "questions"} you missed will come back in
              Revision over the next week, with fresh examples — that&apos;s how it sticks.
            </p>
          </div>
        </section>
      )}

      {practiceScenario && (
        <Link
          href={`/practice/${practiceScenario.slug}`}
          className={`${tile} flex items-center gap-4 p-4`}
        >
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
            {practiceScenario.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-brand-700">Practise it for real</span>
            <span className="block font-extrabold text-slate-900">{practiceScenario.title}</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-700" />
        </Link>
      )}

      {next ? (
        <section className={`${card} p-5 sm:p-6`}>
          <p className="text-sm font-semibold text-brand-700">
            {next.isRetake ? "Recommended next" : "Next recommended lesson"}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
              {next.lesson.icon}
            </span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900">{next.lesson.title}</h2>
              <p className="text-sm text-slate-600">{next.isRetake ? next.reason : next.lesson.description}</p>
            </div>
          </div>
          <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} mt-5 w-full sm:w-auto`}>
            {next.isRetake ? "Review this lesson" : "Continue to Next Lesson"}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

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

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="feedback-heading">
        <h2 id="feedback-heading" className="text-lg font-extrabold text-slate-900">
          Was this lesson clear and useful?
        </h2>
        <p className="mb-4 text-sm text-slate-600">Your answer goes straight to the StockStreak team.</p>
        <LessonFeedbackForm
          save={saveLessonFeedback.bind(null, attempt.lessonId)}
          initial={feedback ? { helpful: feedback.helpful, comment: feedback.comment ?? "" } : null}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-slate-900">Review your answers</h2>
        {attempt.lesson.questions.map((question, i) => {
          const tries = attempt.answers.filter((a) => a.questionId === question.id);
          const outcome = questionOutcome(tries);
          const correct = question.options.find((o) => o.isCorrect);
          const firstPick = question.options.find((o) => o.id === tries[0]?.selectedOptionId);

          return (
            <div key={question.id} className={`${card} p-4 text-sm`}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900">
                  {i + 1}. {question.prompt}
                </p>
                {outcome && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${OUTCOME_BADGE[outcome].className}`}
                  >
                    {OUTCOME_BADGE[outcome].label}
                  </span>
                )}
              </div>
              {outcome !== "first-try" && firstPick && (
                <p className="mt-2 text-slate-600">
                  Your first pick: <span className="text-rose-700">{firstPick.text}</span>
                </p>
              )}
              {correct && (
                <p className="mt-1 text-slate-600">
                  Answer: <span className="font-semibold text-emerald-800">{correct.text}</span>
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
