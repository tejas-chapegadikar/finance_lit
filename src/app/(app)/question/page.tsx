import Link from "next/link";
import { moneyFactFor } from "@/lib/money-facts";
import { MoneyFactCard } from "@/components/money/Insights";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getTodaysQuestion } from "@/lib/daily-question";
import { readChoiceOptions } from "@/lib/lesson-content";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { NO_QUESTION_MESSAGE, QUESTION_OF_THE_DAY_XP } from "@/lib/constants";
import { answerQuestionOfTheDay } from "@/actions/daily-question";
import { ChoiceQuestion } from "@/components/ui/ChoiceQuestion";
import { PageHeader, MetaRow } from "@/components/ui/PageHeader";
import { card, softButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Daily Money Reality Check — StockStreak" };

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
      <Link href="/practice#today" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Daily
      </Link>

      <PageHeader eyebrow={today ? formatIstDay(today.day) : undefined} title="Daily Money Reality Check">
        <MetaRow
          items={[
            area ? area.label : "Money basics",
            today?.answer ? "Answered today" : "About 1 minute",
            <span key="xp" className="font-semibold text-orange-700">
              {today?.answer ? `+${today.answer.xpAwarded} XP earned` : `+${QUESTION_OF_THE_DAY_XP} XP`}
            </span>,
          ]}
        />
      </PageHeader>

      {today && area ? (
        <section className={`${card} p-5 sm:p-6`}>
          <p className="text-sm text-slate-600">
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
              <div className="w-full text-left">
                <MoneyFactCard fact={moneyFactFor(today.day)} compact />
              </div>
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
