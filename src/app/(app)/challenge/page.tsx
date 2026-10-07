import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getTodaysChallenge } from "@/lib/challenge";
import { displayStreak } from "@/lib/streak";
import { readChoiceOptions } from "@/lib/lesson-content";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { DAILY_CHALLENGE_XP, NO_CHALLENGE_MESSAGE } from "@/lib/constants";
import { answerDailyChallenge } from "@/actions/challenge";
import { ChoiceQuestion } from "@/components/ui/ChoiceQuestion";
import { card, heroSurface } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Daily Money Challenge — StockStreak" };

function formatIstDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default async function ChallengePage() {
  const user = await requireOnboardedUser();
  const today = await getTodaysChallenge(user.id);
  const streak = displayStreak(user);

  const options = today ? readChoiceOptions(today.challenge.options) : [];
  const initialAnswer = today?.answer
    ? {
        pickedIndex: today.answer.optionIndex,
        isCorrect: today.answer.isCorrect,
        correctIndex: options.findIndex((o) => o.isCorrect),
        explanation: today.challenge.explanation,
        xpAwarded: today.answer.xpAwarded,
      }
    : null;
  const area = today ? READINESS_AREA_META[today.challenge.area] : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <section className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <p className="relative text-xs font-bold tracking-wider uppercase">
          {today ? formatIstDay(today.day) : "Daily Money Challenge"}
        </p>
        <h1 className="relative mt-1 text-2xl font-extrabold sm:text-3xl">⚡ Today&apos;s Money Challenge</h1>
        <p className="relative mt-1 text-sm">
          One real-life money situation a day. Answer it for +{DAILY_CHALLENGE_XP} XP and keep your streak going.
        </p>
        <p className="relative mt-4 inline-flex rounded-full bg-brand-900/30 px-3 py-1 text-sm font-bold">
          🔥 {streak} {streak === 1 ? "day" : "days"} streak
        </p>
      </section>

      {today && area ? (
        <section className={`${card} p-5 sm:p-6`}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${area.chipBg} ${area.labelText}`}
          >
            <span aria-hidden>{area.icon}</span>
            {area.label}
          </span>
          <div className="mt-3">
            <ChoiceQuestion
              prompt={today.challenge.prompt}
              options={options.map((o) => o.text)}
              answer={answerDailyChallenge.bind(null, today.challenge.id)}
              initialAnswer={initialAnswer}
            />
          </div>
          {today.answer && (
            <p className="mt-4 text-center text-sm font-semibold text-slate-600">
              That&apos;s today done — a new challenge arrives at midnight.
            </p>
          )}
        </section>
      ) : (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_CHALLENGE_MESSAGE}</p>
      )}
    </div>
  );
}
