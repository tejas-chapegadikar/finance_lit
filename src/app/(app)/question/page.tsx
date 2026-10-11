import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getTodaysQuestion } from "@/lib/daily-question";
import { readChoiceOptions } from "@/lib/lesson-content";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { NO_QUESTION_MESSAGE, QUESTION_OF_THE_DAY_XP } from "@/lib/constants";
import { answerQuestionOfTheDay } from "@/actions/daily-question";
import { ChoiceQuestion } from "@/components/ui/ChoiceQuestion";
import { card, heroChip, heroSurface, softButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Question of the Day — StockStreak" };

function formatIstDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default async function QuestionOfTheDayPage() {
  const user = await requireOnboardedUser();
  const today = await getTodaysQuestion(user.id);

  const options = today ? readChoiceOptions(today.question.options) : [];
  const initialAnswer = today?.answer
    ? {
        pickedIndex: today.answer.optionIndex,
        isCorrect: today.answer.isCorrect,
        correctIndex: options.findIndex((o) => o.isCorrect),
        explanation: today.question.explanation,
        xpAwarded: today.answer.xpAwarded,
      }
    : null;
  const area = today ? READINESS_AREA_META[today.question.area] : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/practice" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Practice
      </Link>

      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-14 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-4xl shadow-[0_4px_0_0_var(--color-orange-800)]"
          >
            ❓
          </span>
          <div className="min-w-0">
            <p>
              <span className={heroChip}>{today ? formatIstDay(today.day) : "Question of the Day"}</span>
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Question of the Day</h1>
          </div>
        </div>
        <p className="relative mt-4">
          <span className={heroChip}>
            {today?.answer ? `✅ Answered today · +${today.answer.xpAwarded} XP` : "One quick question · about 1 minute"}
          </span>
        </p>
      </section>

      {today && area ? (
        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${area.chipBg} ${area.labelText}`}
            >
              <span aria-hidden>{area.icon}</span>
              {area.label}
            </span>
            {!today.answer && (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-orange-700 ring-2 ring-orange-200">
                +{QUESTION_OF_THE_DAY_XP} XP
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            A new real-life money question every day. Your first answer earns +{QUESTION_OF_THE_DAY_XP} XP — right or
            wrong, you&apos;ll see the explanation.
          </p>
          <div className="mt-4">
            <ChoiceQuestion
              prompt={today.question.prompt}
              options={options.map((o) => o.text)}
              answer={answerQuestionOfTheDay.bind(null, today.question.id)}
              initialAnswer={initialAnswer}
            />
          </div>
          {today.answer && (
            <div className="mt-5 flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold text-slate-600">That&apos;s today done — a new question arrives at midnight.</p>
              <Link href="/challenge" className={softButton}>
                Try today&apos;s Daily Challenge
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      ) : (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_QUESTION_MESSAGE}</p>
      )}
    </div>
  );
}
