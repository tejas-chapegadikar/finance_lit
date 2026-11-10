import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress, type LessonProgress } from "@/lib/progress";
import { countDueRevision } from "@/lib/revision";
import { INVEST_TRACK } from "@/lib/journey";
import { SCENARIOS, SCENARIO_XP, maxScore } from "@/lib/scenarios";
import { bonusScenarioOpen, rewardForScenario } from "@/lib/rewards";
import { NO_LESSONS_MESSAGE } from "@/lib/constants";
import { investToolsUnlocked } from "@/lib/invest/access";
import { LearnPath, type PathStop, type PathUnit, type StopState } from "@/components/lessons/LearnPath";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { card, primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Learn | Rupli" };

const lessonState = (lesson: LessonProgress, currentId: string | undefined): StopState =>
  lesson.status === "completed" ? "done" : lesson.locked ? "locked" : lesson.id === currentId ? "current" : "open";

const unitState = (stops: PathStop[]): StopState =>
  stops.some((s) => s.state === "current") ? "current" : stops.every((s) => s.state === "done") ? "done" : stops.every((s) => s.state === "locked") ? "locked" : "open";

export default async function LearnPage() {
  const user = await requireOnboardedUser();
  const [progress, due, runs, owned, toolsOpen] = await Promise.all([
    getProgress(user.id),
    countDueRevision(user.id),
    db.scenarioRun.groupBy({ by: ["scenarioSlug"], where: { userId: user.id }, _max: { score: true } }),
    db.rewardUnlock.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    investToolsUnlocked(user.id),
  ]);
  const { lessons, levels, invest, completedCount, totalLessons } = progress;
  const best = new Map(runs.map((r) => [r.scenarioSlug, r._max.score ?? 0]));
  const ownedIds = new Set(owned.map((o) => o.rewardId));

  const firstOpenInvest = invest.find((l) => !l.locked && l.status !== "completed");
  const pathNext = progress.next && !progress.next.isRetake ? progress.next.lesson : null;
  const next = pathNext ?? firstOpenInvest ?? null;

  const lessonStop = (lesson: LessonProgress, levelNumber?: number): PathStop => ({
    key: lesson.id,
    kind: "lesson",
    title: lesson.title,
    note: lesson.locked ? (levelNumber ? `Finish Level ${levelNumber - 1} to unlock` : "Finish the lesson before to unlock") : lesson.status === "completed" ? "Done" : `${lesson.estimatedMinutes} min · +${lesson.xpReward} XP`,
    href: lesson.locked ? null : `/lessons/${lesson.slug}`,
    state: lessonState(lesson, next?.id),
  });

  const scenarioStop = (scenario: (typeof SCENARIOS)[number], levelNumber: number): PathStop => {
    const lesson = lessons.find((l) => l.slug === scenario.lessonSlug);
    const reward = scenario.bonus ? rewardForScenario(scenario.slug) : undefined;
    const xpLocked = !!reward && !bonusScenarioOpen(scenario.slug, user.xpTotal, ownedIds.has(reward.id));
    const levelLocked = !!lesson?.locked;
    const score = best.get(scenario.slug);
    return {
      key: scenario.slug,
      kind: "practice",
      title: scenario.title,
      note: levelLocked ? `Finish Level ${levelNumber - 1} to unlock` : xpLocked ? `Opens at ${reward!.cost} XP` : score !== undefined ? `Best score ${score}/${maxScore(scenario)}` : `${scenario.minutes} min · +${SCENARIO_XP} XP`,
      href: levelLocked || xpLocked ? null : `/practice/${scenario.slug}`,
      state: levelLocked || xpLocked ? "locked" : score !== undefined ? "done" : "open",
    };
  };

  const furthest = [...levels].reverse().find((l) => l.status !== "locked");
  const placedScenarios = new Set<string>();
  const units: PathUnit[] = levels.map((level) => {
    const stops: PathStop[] = [];
    for (const slug of level.slugs) {
      const lesson = lessons.find((l) => l.slug === slug);
      if (!lesson) continue;
      stops.push(lessonStop(lesson, level.chapter.number));
      for (const scenario of SCENARIOS.filter((s) => s.lessonSlug === slug)) {
        placedScenarios.add(scenario.slug);
        stops.push(scenarioStop(scenario, level.chapter.number));
      }
    }
    if (level.chapter.id === furthest?.chapter.id) {
      stops.push({ key: `revision-${level.chapter.id}`, kind: "revision", title: "Revision", note: due > 0 ? `${due} ${due === 1 ? "question" : "questions"} waiting for you` : "Nothing due. Enjoy it, it won't last", href: "/revision", state: "open" });
    }
    return { id: level.chapter.id, eyebrow: `Level ${level.chapter.number}`, title: level.chapter.title, state: unitState(stops), done: stops.filter((s) => s.state === "done").length, total: stops.length, stops };
  });

  // Anything not tied to a lesson goes at the end of Money IQ, locked ones by what opens them.
  const loose = SCENARIOS.filter((s) => !placedScenarios.has(s.slug));
  if (loose.length && units.length) {
    const last = units[units.length - 1];
    last.stops.push(...loose.map((s) => scenarioStop(s, levels.length)));
    last.total = last.stops.length;
    last.done = last.stops.filter((s) => s.state === "done").length;
    last.state = unitState(last.stops);
  }

  // InvestSmart: a later unit in the same path, with its own unlock rule.
  const investStops: PathStop[] = invest.flatMap((lesson, i) => {
    const stop = lessonStop(lesson);
    if (i !== 0) return [stop];
    const note = toolsOpen ? "Try it with pretend money" : `Finish "${lesson.title}" to unlock`;
    return [
      stop,
      { key: "tool-portfolio", kind: "tool" as const, title: "Virtual investing simulator", note, href: toolsOpen ? "/invest" : null, state: (toolsOpen ? "open" : "locked") as StopState },
      { key: "tool-compound", kind: "tool" as const, title: "Compounding simulator", note: toolsOpen ? "See what waiting costs you" : note, href: toolsOpen ? "/invest/simulator" : null, state: (toolsOpen ? "open" : "locked") as StopState },
    ];
  });
  if (investStops.length && INVEST_TRACK.length) {
    units.push({ id: "investsmart", eyebrow: "InvestSmart", title: "How investing really works", state: unitState(investStops), done: investStops.filter((s) => s.state === "done").length, total: investStops.length, stops: investStops });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header>
        <h1 className="text-2xl text-slate-900">Learn</h1>
        <div className="mt-2">
          <ProgressBar value={completedCount} max={Math.max(1, totalLessons)} label="Money IQ progress" size="sm" tone="bg-brand-500" />
          <p className="mt-1 text-xs font-medium text-slate-600">
            {completedCount} of {totalLessons} Money IQ lessons done
          </p>
        </div>
      </header>

      {lessons.length === 0 ? (
        <p className={`${card} p-8 text-center font-semibold text-slate-700`}>{NO_LESSONS_MESSAGE}</p>
      ) : (
        <>
          {next && (
            <Link href={`/lessons/${next.slug}`} className={`${primaryButton} w-full justify-between px-5 py-4 text-base`}>
              <span className="min-w-0 truncate">Continue: {next.title}</span>
              <ArrowRightIcon className="h-5 w-5 shrink-0" />
            </Link>
          )}
          <LearnPath units={units} />
        </>
      )}
    </div>
  );
}
