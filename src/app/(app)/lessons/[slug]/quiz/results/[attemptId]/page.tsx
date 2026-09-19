import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function QuizResultsPage(
  props: PageProps<"/lessons/[slug]/quiz/results/[attemptId]">,
) {
  const user = await requireOnboardedUser();
  const { slug, attemptId } = await props.params;

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      lesson: true,
      answers: {
        include: { question: true, selectedOption: true },
      },
    },
  });

  if (!attempt || attempt.userId !== user.id || attempt.lesson.slug !== slug) {
    notFound();
  }
  if (attempt.status !== "COMPLETED") {
    notFound();
  }

  const passed = attempt.score >= Math.ceil(attempt.totalQuestions * 0.6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-center text-white shadow-lg shadow-violet-900/20">
        <span className="text-5xl" aria-hidden>
          {passed ? "🏆" : "📚"}
        </span>
        <h1 className="text-2xl font-extrabold">
          {passed ? "Nice work!" : "Quiz complete!"}
        </h1>
        <p className="text-violet-100">{attempt.lesson.title}</p>

        <div className="mt-2 flex gap-10">
          <div>
            <p className="text-3xl font-extrabold">
              {attempt.score}/{attempt.totalQuestions}
            </p>
            <p className="text-xs font-medium text-violet-200">Correct answers</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-orange-300">
              +{attempt.xpAwarded ?? 0} XP
            </p>
            <p className="text-xs font-medium text-violet-200">
              {attempt.xpAwarded ? "Earned" : "Already earned"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {attempt.answers.map((answer) => (
          <div
            key={answer.id}
            className={`rounded-xl border-2 p-3 text-sm ${
              answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <p className="font-semibold text-neutral-900">{answer.question.prompt}</p>
            <p className="mt-1 text-neutral-600">
              Your answer: {answer.selectedOption.text} —{" "}
              {answer.isCorrect ? "✅ Correct" : "❌ Incorrect"}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/lessons"
        className="inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-900/20 transition hover:brightness-110"
      >
        Back to lessons
      </Link>
    </div>
  );
}
