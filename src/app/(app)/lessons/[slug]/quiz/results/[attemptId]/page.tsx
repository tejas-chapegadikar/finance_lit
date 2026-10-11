import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome, summarizeAttempt, type QuestionOutcome } from "@/lib/quiz-outcome";
import { getProgress } from "@/lib/progress";
import { BADGES } from "@/lib/badges";
import { readKeyTerms } from "@/lib/lesson-content";
import { LEVEL_1_NAME, LEVEL_2_NAME } from "@/lib/constants";
import { beginQuiz } from "@/actions/quiz";
import { saveLessonFeedback } from "@/actions/feedback";
import { LessonFeedbackForm } from "@/components/lessons/LessonFeedbackForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Medal } from "@/components/ui/Medal";
import { Confetti } from "@/components/ui/Confetti";
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
          {levelBonus > 0 && <p className="mt-4 text-sm font-bold text-slate-900">+{levelBonus} XP level bonus</p>}
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-slate-900">
            Next: Level 2 — {LEVEL_2_NAME} is coming soon. Until then, keep your skills sharp with the daily
            question and challenge.
          </p>
        </section>
      )}

      {/* The celebration: confetti, a medal, then the scores on a white card */}
      <div>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-brand-900 to-brand-800 px-6 pt-8 pb-24 text-center text-white shadow-lg shadow-brand-900/30 sm:px-8">
          <Confetti />
          <div className="relative flex justify-center motion-safe:animate-pop">
            <Medal icon={levelJustCompleted ? "🎓" : "⭐"} size="lg" />
          </div>
          <h1 className="relative mt-4 text-3xl font-extrabold sm:text-4xl">Lesson Complete!</h1>
          <p className="relative mt-1 font-semibold">
            <span aria-hidden>{attempt.lesson.icon}</span> {attempt.lesson.title}
          </p>
          <p className="relative mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
            {lessonXp > 0
              ? `✅ Lesson ${lessonNumber ? String(lessonNumber).padStart(2, "0") : ""} completed`
              : "✅ Already completed — this retake can raise your readiness"}
          </p>
        </section>

        <div className="relative z-10 mx-3 -mt-16 rounded-3xl bg-white p-4 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 sm:mx-6 sm:p-5">
          <h2 className="text-center text-sm font-extrabold tracking-wider text-slate-600 uppercase">Your performance</h2>
          <dl className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="flex flex-col-reverse justify-end rounded-2xl bg-emerald-50 p-3 ring-2 ring-emerald-200 shadow-[0_4px_0_0_var(--color-emerald-200)]">
              <dt className="text-xs font-semibold text-slate-600">
                <span className="block font-extrabold tracking-wider text-emerald-800 uppercase">Score</span>
                {percent}% correct first try
              </dt>
              <dd className="text-xl font-extrabold text-slate-900 tabular-nums sm:text-2xl">
                {summary.firstTry}/{attempt.totalQuestions}
              </dd>
            </div>
            <div className="flex flex-col-reverse justify-end rounded-2xl bg-orange-50 p-3 ring-2 ring-orange-200 shadow-[0_4px_0_0_var(--color-orange-200)]">
              <dt className="text-xs font-semibold text-slate-600">
                <span className="block font-extrabold tracking-wider text-orange-800 uppercase">XP earned</span>
                {lessonXp ? "for your first completion" : "retakes earn no XP"}
              </dt>
              <dd className="text-xl font-extrabold text-slate-900 tabular-nums sm:text-2xl">⭐ +{lessonXp}</dd>
            </div>
            <div className="flex flex-col-reverse justify-end rounded-2xl bg-brand-50 p-3 ring-2 ring-brand-200 shadow-[0_4px_0_0_var(--color-brand-200)]">
              <dt className="text-xs font-semibold text-slate-600">
                <span className="block font-extrabold tracking-wider text-brand-800 uppercase">Readiness</span>
                out of 100
              </dt>
              <dd className="text-xl font-extrabold text-slate-900 tabular-nums sm:text-2xl">
                {readinessBefore} → {readinessAfter}
              </dd>
            </div>
          </dl>
          {summary.withCoach > 0 && (
            <p className="mt-3 text-center text-sm font-semibold text-slate-700">
              {summary.withCoach} more solved with the Coach&apos;s help 💪
            </p>
          )}
          {previousBest !== null && (attempt.mastery ?? 0) > previousBest && (
            <p className="mt-3 text-center text-sm font-extrabold text-emerald-800">
              📈 You improved — quiz accuracy {previousBest}% → {attempt.mastery}%. That&apos;s learning sticking!
            </p>
          )}
        </div>
      </div>

      {shownBadges.length > 0 && (
        <section className={`${card} p-5 sm:p-6`}>
          <h2 className="text-lg font-extrabold text-slate-900">🏅 New badge unlocked</h2>
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
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
            🔁
          </span>
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
          className={`${tile} flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}
        >
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
            {practiceScenario.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-wider text-brand-700 uppercase">Practise it for real</span>
            <span className="block font-extrabold text-slate-900">{practiceScenario.title}</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-700" />
        </Link>
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
