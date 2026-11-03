// TEMPORARY — local design QA only. Delete before shipping.
import { LevelIllustration, TrophyIllustration } from "@/components/ui/illustrations";
import { AreaIcon, BadgeIcon, IconTile, LessonIcon, MissionIcon, RewardIcon, ScenarioIcon } from "@/components/ui/topic-icons";
import { READINESS_AREA_VALUES } from "@/lib/readiness-areas";

const LESSONS = [
  "budgeting-basics",
  "compound-interest",
  "saving-vs-spending",
  "upi-digital-payments",
  "financial-scams",
  "bank-accounts",
  "fd-rd",
  "cibil-score",
  "credit-cards-101",
  "first-salary-tax",
  "stocks-mutual-funds-fds",
  "sip-starting-early",
];
const BADGES = ["first-lesson", "budget-beginner", "scam-spotter", "banking-beginner", "credit-ready", "tax-smart", "quiz-champion", "seven-day-learner", "thirty-day-learner", "scenario-solver", "memory-master", "financial-foundations"];

export default function DesignPreview() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-10">
      <section className="grid grid-cols-5 gap-6">
        {[1, 2, 3, 4].map((l) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white p-4">
            <LevelIllustration level={l} className="w-full" />
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <TrophyIllustration won className="w-full" />
          <TrophyIllustration won={false} className="mt-2 w-full" />
        </div>
      </section>
      <section className="rounded-3xl bg-slate-900 p-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((l) => (
            <LevelIllustration key={l} level={l} className="w-full" />
          ))}
        </div>
      </section>
      <section className="flex flex-wrap gap-3">
        {LESSONS.map((slug) => (
          <IconTile key={slug} size="lg">
            <LessonIcon slug={slug} />
          </IconTile>
        ))}
      </section>
      <section className="flex flex-wrap gap-3">
        {READINESS_AREA_VALUES.map((a) => (
          <IconTile key={a} area={a} size="md">
            <AreaIcon area={a} />
          </IconTile>
        ))}
        {BADGES.map((b) => (
          <IconTile key={b} size="md">
            <BadgeIcon id={b} />
          </IconTile>
        ))}
        {["stipend-15000", "credit-card-bill", "upi-request", "first-salary-slip", "no-cost-emi", "emergency-8000"].map((s) => (
          <IconTile key={s} size="md">
            <ScenarioIcon slug={s} />
          </IconTile>
        ))}
        {["lesson", "answer-3", "correct-3", "question", "scenario", "challenge"].map((m) => (
          <IconTile key={m} size="sm">
            <MissionIcon id={m} />
          </IconTile>
        ))}
        <IconTile size="md">
          <RewardIcon id="title-scam-buster" kind="title" />
        </IconTile>
      </section>
      <section>
        <p className="text-sm text-slate-500">Level 2 of 4 · Paying and banking safely</p>
        <h1 className="mt-1 text-5xl text-slate-900">Good evening, Riya</h1>
        <p className="mt-3 max-w-xl text-slate-600">Pay and get paid on UPI with confidence — and the one rule that stops most UPI frauds. ₹15,000</p>
      </section>
    </main>
  );
}
