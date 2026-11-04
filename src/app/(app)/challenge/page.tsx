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
import { AreaIcon, IconTile } from "@/components/ui/topic-icons";

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
      <Link href="/practice#today" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Daily
      </Link>

      <PageHeader
        icon={
          <IconTile area={challenge.area} size="lg">
            <AreaIcon area={challenge.area} />
          </IconTile>
        }
        eyebrow={`Daily Challenge · ${area.label}`} title={challenge.title}>
        <MetaRow
          items={[
            `${challenge.steps.length} questions`,
            challenge.difficulty,
            <span key="xp" className="font-semibold text-orange-700">
              {run ? `Done today · +${run.xpAwarded} XP` : `+${DAILY_CHALLENGE_XP} XP for finishing`}
            </span>,
          ]}
        />
      </PageHeader>

      {run ? (
        <DailyChallengeResult
          area={challenge.area}
          label={scoreLabel(run.score, run.maxScore)}
          score={run.score}
          maxScore={run.maxScore}
          xpAwarded={run.xpAwarded}
          takeaway={challenge.takeaway}
        />
      ) : (
        <>
          <p className="border-l-2 border-brand-300 pl-4 text-[15px] leading-relaxed text-slate-700">{challenge.intro}</p>
          <DailyChallengePlayer
            day={day}
            steps={publicDailyChallenge(challenge).steps}
            area={challenge.area}
            takeaway={challenge.takeaway}
            xpReward={DAILY_CHALLENGE_XP}
          />
        </>
      )}
    </div>
  );
}
