import Link from "next/link";
import type { DailyMissions } from "@/lib/missions";
import { DAILY_CHALLENGE_XP, MISSION_BONUS_XP, QUESTION_OF_THE_DAY_XP } from "@/lib/constants";
import { card, tile } from "@/components/ui/button-styles";
import { ArrowRightIcon, BoltIcon, CheckIcon, HelpIcon, StarIcon } from "@/components/ui/icons";
import { MissionIcon } from "@/components/ui/topic-icons";
import { StepBar } from "@/components/ui/ProgressBar";
import { ClaimBonusButton } from "./ClaimBonusButton";

type Props = {
  /** Anchor id for the section, e.g. "daily". */
  id?: string;
  headingLevel?: "h2" | "h3";
  /** "row" spreads the activities across a wide page; "stack" fits a narrow column. */
  layout?: "row" | "stack";
  /** XP earned from today's question, or null when not answered yet. */
  questionXp: number | null;
  /** Today's question, as a teaser on its tile. */
  questionPrompt?: string;
  challengeTitle: string;
  /** XP earned from today's challenge, or null when not played yet. */
  challengeXp: number | null;
  missions: DailyMissions;
};

/**
 * Today's daily activities in one place: the Question of the Day, the Daily
 * Challenge and the three missions — what's done, what's left and the XP
 * still on offer. Every reward here is paid once a day on the server.
 */
export function TodayPanel({ id, headingLevel = "h2", layout = "row", questionXp, questionPrompt, challengeTitle, challengeXp, missions }: Props) {
  const Heading = headingLevel;
  const doneMissions = missions.missions.filter((m) => m.done).length;
  const xpLeft =
    (questionXp === null ? QUESTION_OF_THE_DAY_XP : 0) +
    (challengeXp === null ? DAILY_CHALLENGE_XP : 0) +
    (missions.bonusClaimed ? 0 : MISSION_BONUS_XP);
  const activities = [
    {
      href: "/question",
      Icon: HelpIcon,
      title: "Daily Money Reality Check",
      meta: questionXp === null ? `About 1 minute · +${QUESTION_OF_THE_DAY_XP} XP` : `Answered · +${questionXp} XP`,
      done: questionXp !== null,
      cta: "Answer",
      teaser: questionXp === null ? questionPrompt : undefined,
    },
    {
      href: "/challenge",
      Icon: BoltIcon,
      title: `Daily Challenge: ${challengeTitle}`,
      meta: challengeXp === null ? `A few minutes · +${DAILY_CHALLENGE_XP} XP` : `Done · +${challengeXp} XP`,
      done: challengeXp !== null,
      cta: "Play",
      teaser: undefined,
    },
  ];

  return (
    <section id={id} className="scroll-mt-6" aria-labelledby="daily-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading id="daily-heading" className={`${headingLevel === "h2" ? "text-2xl" : "text-xl"} text-slate-900`}>
          Today
        </Heading>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700">
          <StarIcon className="h-4 w-4 text-orange-500" />
          {xpLeft > 0 ? `${xpLeft} XP still available` : "All of today's XP earned"}
        </span>
      </div>

      <div className={`mt-4 grid gap-3 ${layout === "row" ? "grid-cols-2 lg:grid-cols-[1fr_1fr_1.25fr]" : "grid-cols-1 sm:grid-cols-2"}`}>
        {activities.map(({ href, Icon, title, meta, done, cta, teaser }) => (
          <Link key={href} href={href} className={`${tile} group flex min-w-0 flex-col p-4 sm:p-5`}>
            <span className="flex items-start justify-between gap-3">
              <span
                aria-hidden
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {done ? (
                <span className="inline-flex animate-check items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <CheckIcon className="h-3.5 w-3.5" /> Done
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">To do</span>
              )}
            </span>
            <span className="mt-4 block leading-snug font-semibold text-slate-900">{title}</span>
            <span className={`mt-0.5 block text-sm ${done ? "text-emerald-800" : "text-slate-600"}`}>{meta}</span>
            {teaser && <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">“{teaser}”</span>}
            {!done && (
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700">
                {cta}
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            )}
          </Link>
        ))}

        <div className={`${card} p-5 ${layout === "row" ? "col-span-2 lg:col-span-1" : "sm:col-span-2"}`}>
          <div className="flex items-baseline justify-between gap-2">
            <p id="missions-heading" className="font-semibold text-slate-900">
              Today&apos;s missions
            </p>
            <span className="text-xs font-semibold text-slate-600 tabular-nums">
              {doneMissions}/{missions.missions.length} done
            </span>
          </div>
          <StepBar done={doneMissions} total={missions.missions.length} label="Missions done today" className="mt-3" />
          <ul aria-labelledby="missions-heading" className="mt-4 flex flex-col gap-2.5 text-sm">
            {missions.missions.map((mission) => (
              <li key={mission.id}>
                <Link href={mission.href} className="group flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                      mission.done ? "animate-check bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    {mission.done ? <CheckIcon className="h-4 w-4" /> : <MissionIcon id={mission.id} className="h-3.5 w-3.5" />}
                    <span className="sr-only">{mission.done ? "Done:" : "To do:"}</span>
                  </span>
                  <span className={`min-w-0 flex-1 ${mission.done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 group-hover:text-slate-900"}`}>
                    {mission.title}
                    {mission.target > 1 && !mission.done ? ` (${mission.progress}/${mission.target})` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-100 pt-3">
            {missions.bonusClaimed ? (
              <p className="text-sm font-semibold text-emerald-800">+{MISSION_BONUS_XP} XP bonus claimed — new missions tomorrow.</p>
            ) : missions.allDone ? (
              <ClaimBonusButton xp={MISSION_BONUS_XP} />
            ) : (
              <p className="text-sm text-slate-600">
                Finish all three for a <span className="font-semibold text-orange-700">+{MISSION_BONUS_XP} XP bonus</span>.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
