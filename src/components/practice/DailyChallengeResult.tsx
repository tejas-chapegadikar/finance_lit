import Link from "next/link";
import type { ReadinessAreaValue } from "@/lib/readiness-areas";
import { Medal } from "@/components/ui/Medal";
import { Burst } from "@/components/ui/Burst";
import { AreaIcon } from "@/components/ui/topic-icons";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";

/** The Daily Challenge result — right after finishing, and for the rest of the day. */
export function DailyChallengeResult({
  area,
  label,
  score,
  maxScore,
  xpAwarded,
  takeaway,
}: {
  area: ReadinessAreaValue;
  label: string;
  score: number;
  maxScore: number;
  xpAwarded: number;
  takeaway: string;
}) {
  return (
    <section className={`${card} flex flex-col items-center p-6 text-center sm:p-10`} aria-labelledby="challenge-done">
      <span className="relative animate-pop">
        {score > 0 && <Burst />}
        <Medal icon={<AreaIcon area={area} />} earned={score > 0} size="lg" />
      </span>
      <h2 id="challenge-done" className="mt-4 text-3xl text-slate-900">
        {label}
      </h2>
      <p className="mt-1.5 text-slate-600">
        You scored <span className="font-semibold text-slate-900">{score}/{maxScore}</span> on today&apos;s Daily Challenge.
      </p>
      {xpAwarded > 0 && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-sm font-semibold text-orange-800 ring-1 ring-orange-100">
          <StarIcon className="h-4 w-4 text-orange-500" /> +{xpAwarded} XP
        </p>
      )}
      <div className="mt-6 w-full border-l-2 border-brand-300 bg-slate-50 py-3 pr-4 pl-4 text-left">
        <p className="text-[13px] font-medium text-slate-500">Takeaway</p>
        <p className="mt-0.5 font-semibold text-slate-900">{takeaway}</p>
      </div>
      <p className="mt-4 text-sm text-slate-500">A new challenge — on a new topic — arrives at midnight.</p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link href="/dashboard" className={primaryButton}>
          Back to dashboard
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href="/practice" className={secondaryButton}>
          More practice
        </Link>
      </div>
    </section>
  );
}
