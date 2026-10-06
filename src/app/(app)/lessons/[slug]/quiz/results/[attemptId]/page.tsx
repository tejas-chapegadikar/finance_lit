import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionOutcome, summarizeAttempt, type QuestionOutcome } from "@/lib/quiz-outcome";
import { getReadiness } from "@/lib/readiness";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Quiz results — StockStreak" };

const OUTCOME_BADGE: Record<QuestionOutcome, { label: string; className: string }> = {
  "first-try": { label: "First try", className: "bg-emerald-100 text-emerald-800" },
  "with-coach": { label: "With the Coach", className: "bg-violet-100 text-violet-700" },
  revealed: { label: "Answer shown", className: "bg-neutral-100 text-neutral-700" },
};

function headlineFor(mastery: number) {
  if (mastery >= 80) return { emoji: "🏆", title: "Great job!" };
  if (mastery >= 50) return { emoji: "🎉", title: "Nice work!" };
  return { emoji: "💪", title: "Good effort!" };
}

export default async function QuizResultsPage(
  props: PageProps<"/lessons/[slug]/quiz/results/[attemptId]">,
) {
  const user = await requireOnboardedUser();
  const { slug, attemptId } = await props.params;

  const attempt = await db.quizAttempt.findUnique({
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
    },
  });

  if (
    !attempt ||
    attempt.userId !== user.id ||
    attempt.lesson.slug !== slug ||
    attempt.status !== "COMPLETED"
  ) {
    notFound();
  }

  const summary = summarizeAttempt(attempt.answers, attempt.totalQuestions);
  const mastery = attempt.mastery ?? summary.mastery;
  const headline = headlineFor(mastery);
  const { next } = await getReadiness(user.id);
  const nextIsThisLesson = next?.lesson.slug === slug;

  const stats = [
    { label: "First try", value: summary.firstTry },
    { label: "With the Coach", value: summary.withCoach },
    { label: "Answer shown", value: summary.revealed },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-violet-900/10 ring-1 ring-violet-900/5">
        <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-violet-600 to-indigo-600 px-6 pt-8 pb-10 text-center text-white">
          <span
            aria-hidden
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-5xl ring-8 ring-white/10"
          >
            {headline.emoji}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold">{headline.title}</h1>
          <p className="text-violet-100">
            You got {summary.firstTry} of {attempt.totalQuestions} right on the first try
          </p>
          <p className="text-sm font-semibold text-violet-100">{attempt.lesson.title}</p>
        </div>

        <div className="-mt-6 flex flex-col gap-5 rounded-t-3xl bg-white p-6">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-violet-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-neutral-900">{stat.value}</p>
                <p className="text-xs font-medium text-neutral-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-neutral-700">Lesson mastery</span>
              <span className="font-bold text-neutral-900">{mastery}%</span>
            </div>
            <div
              role="meter"
              aria-label="Lesson mastery"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={mastery}
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-violet-100"
            >
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${mastery}%` }} />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              First-try answers count fully; answers you got with the Coach&apos;s help count half.
            </p>
          </div>

          <p className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
            {attempt.xpAwarded
              ? `⚡ +${attempt.xpAwarded} XP earned`
              : "⚡ You already earned XP for this lesson — retakes still raise your Readiness Score."}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            {next && !nextIsThisLesson ? (
              <Link href={`/lessons/${next.lesson.slug}`} className={primaryButton}>
                Next: {next.lesson.title}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/dashboard" className={primaryButton}>
                Back to dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
            <Link href={`/lessons/${slug}/quiz`} prefetch={false} className={secondaryButton}>
              Try again
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-neutral-900">Review your answers</h2>
        {attempt.lesson.questions.map((question, i) => {
          const tries = attempt.answers.filter((a) => a.questionId === question.id);
          const outcome = questionOutcome(tries);
          const correct = question.options.find((o) => o.isCorrect);
          const firstPick = question.options.find((o) => o.id === tries[0]?.selectedOptionId);

          return (
            <div
              key={question.id}
              className="rounded-2xl bg-white p-4 text-sm shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-neutral-900">
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
                <p className="mt-2 text-neutral-600">
                  Your first pick: <span className="text-rose-700">{firstPick.text}</span>
                </p>
              )}
              {correct && (
                <p className="mt-1 text-neutral-600">
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
