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
import { PageHeader, MetaRow } from "@/components/ui/PageHeader";
import { card } from "@/components/ui/button-styles";
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
      <Link href="/lessons#daily" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Learn
      </Link>

      <PageHeader icon={challenge.icon} eyebrow={`Daily Challenge · ${area.label}`} title={challenge.title}>
        <MetaRow
          items={[
            `${challenge.steps.length} questions`,
            challenge.difficulty,
            <span key="xp" className="font-semibold text-amber-200">
              {run ? `Done today · +${run.xpAwarded} XP` : `+${DAILY_CHALLENGE_XP} XP for finishing`}
            </span>,
          ]}
        />
      </PageHeader>

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
