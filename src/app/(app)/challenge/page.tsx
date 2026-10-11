import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay } from "@/lib/ist-date";
import { DAILY_CHALLENGE_XP } from "@/lib/constants";
import { getDailyChallenge, publicDailyChallenge } from "@/lib/daily-challenge";
import { scoreLabel } from "@/lib/scenarios";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { DailyChallengePlayer } from "@/components/practice/DailyChallengePlayer";
import { DailyChallengeResult } from "@/components/practice/DailyChallengeResult";
import { card, heroChip, heroSurface } from "@/components/ui/button-styles";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Daily Challenge — StockStreak" };

export default async function DailyChallengePage() {
  const user = await requireOnboardedUser();
  const day = istDay();
  const [challenge, run] = await Promise.all([
    getDailyChallenge(user.id, day),
    db.dailyChallengeRun.findUnique({ where: { userId_day: { userId: user.id, day } } }),
  ]);
  const area = READINESS_AREA_META[challenge.area];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/practice" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Practice
      </Link>

      <header className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
        <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
        <p className="relative">
          <span className={heroChip}>⚡ Daily Challenge · {area.label}</span>
        </p>
        <div className="relative mt-4 flex items-center gap-4">
          <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-[0_4px_0_0_var(--color-brand-800)]">
            {challenge.icon}
          </span>
          <h1 className="min-w-0 text-2xl leading-tight font-extrabold sm:text-3xl">{challenge.title}</h1>
        </div>
        <ul className="relative mt-4 flex flex-wrap gap-2">
          <li className={heroChip}>{challenge.steps.length} questions</li>
          <li className={heroChip}>{challenge.difficulty}</li>
          <li className={heroChip}>{run ? `✅ Done today · +${run.xpAwarded} XP` : `+${DAILY_CHALLENGE_XP} XP for finishing`}</li>
        </ul>
      </header>

      {run ? (
        <DailyChallengeResult
          icon={challenge.icon}
          label={scoreLabel(run.score, run.maxScore)}
          score={run.score}
          maxScore={run.maxScore}
          xpAwarded={run.xpAwarded}
          takeaway={challenge.takeaway}
        />
      ) : (
        <>
          <p className={`${card} p-5 text-slate-700`}>{challenge.intro}</p>
          <DailyChallengePlayer
            day={day}
            steps={publicDailyChallenge(challenge).steps}
            icon={challenge.icon}
            takeaway={challenge.takeaway}
            xpReward={DAILY_CHALLENGE_XP}
          />
        </>
      )}
    </div>
  );
}
