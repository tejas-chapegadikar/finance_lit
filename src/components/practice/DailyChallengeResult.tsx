import Link from "next/link";
import { Medal } from "@/components/ui/Medal";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

/** The Daily Challenge result — right after finishing, and for the rest of the day. */
export function DailyChallengeResult({
  icon,
  label,
  score,
  maxScore,
  xpAwarded,
  takeaway,
}: {
  icon: string;
  label: string;
  score: number;
  maxScore: number;
  xpAwarded: number;
  takeaway: string;
}) {
  return (
    <section className={`${card} flex flex-col items-center p-6 text-center sm:p-8`} aria-labelledby="challenge-done">
      <span className="motion-safe:animate-pop">
        <Medal icon={icon} earned={score > 0} />
      </span>
      <h2 id="challenge-done" className="mt-3 text-2xl font-extrabold text-slate-900">
        {label}
      </h2>
      <p className="mt-1 text-slate-700">
        You scored <span className="font-extrabold text-slate-900">{score}/{maxScore}</span> on today&apos;s Daily Challenge.
      </p>
      {xpAwarded > 0 && (
        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-800 ring-2 ring-amber-200">
          ⭐ +{xpAwarded} XP
        </p>
      )}
      <div className="mt-5 w-full rounded-2xl bg-brand-50 p-4 text-left ring-1 ring-brand-100">
        <p className="text-xs font-extrabold tracking-wider text-brand-800 uppercase">Takeaway</p>
        <p className="mt-1 font-semibold text-slate-900">{takeaway}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">A new challenge — on a new topic — arrives at midnight.</p>
      <div className="mt-5 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link href="/dashboard" className={primaryButton}>
          Back to dashboard
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href="/lessons#practise" className={secondaryButton}>
          More practice
        </Link>
      </div>
    </section>
  );
}
