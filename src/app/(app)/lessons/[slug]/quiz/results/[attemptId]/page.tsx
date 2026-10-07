import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome, summarizeAttempt, type QuestionOutcome } from "@/lib/quiz-outcome";
import { getProgress } from "@/lib/progress";
import { getBadges } from "@/lib/badges";
import { readKeyTerms } from "@/lib/lesson-content";
import { LEVEL_1_NAME } from "@/lib/constants";
import { beginQuiz } from "@/actions/quiz";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { card, heroSurface, primaryButton, secondaryButton } from "@/components/ui/button-styles";
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
      },
    }),
    getProgress(user.id),
  ]);

  if (!attempt || attempt.userId !== user.id || attempt.lesson.slug !== slug || attempt.status !== "COMPLETED") {
    notFound();
  }

  const summary = summarizeAttempt(attempt.answers, attempt.totalQuestions);
  const percent = Math.round((summary.firstTry / attempt.totalQuestions) * 100);
  const lessonXp = attempt.xpAwarded ?? 0;
  const levelBonus = attempt.xpTransactions
    .filter((tx) => tx.type === "LEVEL_COMPLETION")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const readinessBefore = attempt.readinessBefore ?? progress.overall;
  const readinessAfter = attempt.readinessAfter ?? progress.overall;
  const keyTerms = readKeyTerms(attempt.lesson.keyTerms);

  // A badge was unlocked by this attempt if it was earned at the moment this
  // attempt completed (badges are earned when their last lesson is first finished).
  const completedAt = attempt.completedAt?.getTime();
  const newBadges = getBadges(progress.lessons).filter((b) => b.earnedAt && b.earnedAt.getTime() === completedAt);
  const levelJustCompleted = newBadges.some((b) => b.area === null);

  const next = progress.next && progress.next.lesson.id !== attempt.lessonId ? progress.next : null;
  const retake = beginQuiz.bind(null, attempt.lessonId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {levelJustCompleted && (
        <section className="rounded-3xl bg-gradient-to-br from-amber-300 via-orange-300 to-orange-400 p-6 text-center shadow-lg shadow-orange-900/20">
          <span aria-hidden className="text-5xl">
            🎓
          </span>
          <p className="mt-2 text-xs font-extrabold tracking-[0.2em] text-slate-900 uppercase">Level 1 complete</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">🏆 {LEVEL_1_NAME} Graduate</h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-bold text-slate-900">
            <li className="rounded-full bg-white/70 px-3 py-1">
              {progress.completedCount}/{progress.totalLessons} lessons
            </li>
            <li className="rounded-full bg-white/70 px-3 py-1">{user.xpTotal.toLocaleString("en-IN")} XP</li>
            <li className="rounded-full bg-white/70 px-3 py-1">Readiness {progress.overall}/100</li>
          </ul>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            +{levelBonus} XP level bonus · Level 2 is coming soon
          </p>
        </section>
      )}

      <section className={`${heroSurface} relative overflow-hidden p-6 text-center sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
        <span aria-hidden className="relative text-5xl">
          🎉
        </span>
        <h1 className="relative mt-2 text-3xl font-extrabold">Lesson Complete!</h1>
        <p className="relative mt-1 font-semibold">
          <span aria-hidden>{attempt.lesson.icon}</span> {attempt.lesson.title}
        </p>

        <dl className="relative mt-6 grid grid-cols-3 gap-2 text-left sm:gap-3">
          <div className="rounded-2xl bg-brand-900/30 p-3 ring-1 ring-white/15">
            <dt className="text-xs font-bold tracking-wider uppercase">Score</dt>
            <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">
              {summary.firstTry}/{attempt.totalQuestions}
            </dd>
            <dd className="text-xs font-semibold">{percent}% correct</dd>
          </div>
          <div className="rounded-2xl bg-brand-900/30 p-3 ring-1 ring-white/15">
            <dt className="text-xs font-bold tracking-wider uppercase">XP</dt>
            <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">⭐ +{lessonXp}</dd>
            <dd className="text-xs font-semibold">{lessonXp ? "for this lesson" : "retakes earn no XP"}</dd>
          </div>
          <div className="rounded-2xl bg-brand-900/30 p-3 ring-1 ring-white/15">
            <dt className="text-xs font-bold tracking-wider uppercase">Readiness</dt>
            <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">
              {readinessBefore} → {readinessAfter}
            </dd>
            <dd className="text-xs font-semibold">out of 100</dd>
          </div>
        </dl>

        {summary.withCoach > 0 && (
          <p className="relative mt-4 text-sm font-semibold">
            {summary.withCoach} more solved with the Coach&apos;s help 💪
          </p>
        )}
      </section>

      {newBadges.filter((b) => b.area !== null).length > 0 && (
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-slate-900">🏅 New badge unlocked</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {newBadges
              .filter((b) => b.area !== null)
              .map((badge) => (
                <li key={badge.id} className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                  <span aria-hidden className="text-3xl">
                    {badge.icon}
                  </span>
                  <span>
                    <span className="block font-bold text-slate-900">{badge.name}</span>
                    <span className="block text-xs text-slate-600">{badge.description}</span>
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {keyTerms.length > 0 && (
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-slate-900">What you learned</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {keyTerms.map((term) => (
              <li key={term.term} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-800">
                ✓ {term.term}
              </li>
            ))}
          </ul>
        </section>
      )}

      {next ? (
        <section className={`${card} p-5 sm:p-6`}>
          <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">
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
            Continue
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
