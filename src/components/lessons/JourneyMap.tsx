import Link from "next/link";
import { NEXT_PATH_NAME, LEVEL_COMPLETION_XP } from "@/lib/constants";
import type { LevelStatus } from "@/lib/journey";
import type { ReadinessAreaValue } from "@/lib/readiness-areas";
import { CheckIcon, FlagIcon, LockIcon } from "@/components/ui/icons";
import { LessonIcon } from "@/components/ui/topic-icons";
import { LevelIllustration, TrophyIllustration } from "@/components/ui/illustrations";

// The learning path as a journey: one road through the four levels, a stop
// per lesson, a marker (with its illustration) where each level begins, and
// the trophy at the end. The road fills in green up to where the student is.
// Levels open in order, stops in a locked level are shown but can't be
// opened (the server enforces it too).

export type MapLesson = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  area?: ReadinessAreaValue;
  number: number;
  minutes: number;
  status: "not-started" | "in-progress" | "completed";
  locked: boolean;
  /** 1-3 for completed lessons (from the best quiz), else 0. */
  stars: number;
  /** Topic mastery label for completed lessons, e.g. "Retained". */
  mastery: { label: string; className: string } | null;
  isNext: boolean;
};

export type MapChapter = {
  id: string;
  number: number;
  title: string;
  stage: string;
  icon: string;
  status: LevelStatus;
  completed: number;
  /** The student's onboarding goal points to this level. */
  isGoal: boolean;
  lessons: MapLesson[];
};

const LEVEL_CHIP: Record<LevelStatus, string> = {
  completed: "bg-emerald-50 text-emerald-800",
  current: "bg-brand-50 text-brand-800",
  available: "bg-brand-50 text-brand-800",
  locked: "bg-slate-100 text-slate-600",
};

function LevelChip({ chapter }: { chapter: MapChapter }) {
  const total = chapter.lessons.length;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_CHIP[chapter.status]}`}>
      {chapter.status === "completed" ? (
        <>
          <CheckIcon className="h-3.5 w-3.5" /> Completed
        </>
      ) : chapter.status === "locked" ? (
        <>
          <LockIcon className="h-3.5 w-3.5" /> Finish Level {chapter.number - 1} to unlock
        </>
      ) : (
        `${chapter.status === "current" ? "You're here" : "Open"} · ${chapter.completed}/${total} done`
      )}
    </span>
  );
}

const START_H = 116;
const BANNER_H = 150;
const ROW_H = 116;
const FINISH_H = 190;
const LOCKED_H = 92;
const BOTTOM_PAD = 28;

// The road sways left and right: x (in %) for the k-th stop.
const roadX = (k: number) => Math.round((50 + 22 * Math.sin(k * 0.85)) * 10) / 10;

type Point = { x: number; y: number };

function roadPath(points: Point[]): string {
  return points
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const prev = points[i - 1];
      const dy = (p.y - prev.y) / 2;
      return `C${prev.x} ${prev.y + dy} ${p.x} ${p.y - dy} ${p.x} ${p.y}`;
    })
    .join(" ");
}

function Stars({ count }: { count: number }) {
  return (
    <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 gap-px rounded-full bg-white px-1 py-0.5 shadow-sm ring-1 ring-slate-200" aria-hidden>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={`h-3 w-3 ${n <= count ? "fill-orange-400" : "fill-slate-200"}`}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

function LessonStop({ lesson }: { lesson: MapLesson }) {
  const done = lesson.status === "completed";
  const face = lesson.locked
    ? "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
    : done
      ? "bg-emerald-500 text-white ring-4 ring-white shadow-[0_6px_16px_-8px_rgb(16_120_80/0.6)]"
      : lesson.isNext
        ? "bg-white text-brand-700 ring-[3px] ring-brand-500 shadow-[0_8px_20px_-10px_rgb(91_72_224/0.7)]"
        : lesson.status === "in-progress"
          ? "bg-white text-brand-700 ring-2 ring-brand-300"
          : "bg-white text-slate-700 ring-1 ring-slate-300 shadow-sm";
  return (
    <span className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center">
      {lesson.isNext && !done && (
        <>
          <span className="absolute inset-0 animate-halo rounded-full bg-brand-400/50" />
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white">
            Up next
          </span>
        </>
      )}
      <span
        className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-full transition duration-200 ${
          lesson.locked ? "" : "group-hover:scale-105"
        } ${face}`}
      >
        {lesson.locked ? (
          <LockIcon className="h-5 w-5" />
        ) : done ? (
          <CheckIcon className="h-7 w-7" />
        ) : (
          <LessonIcon slug={lesson.slug} area={lesson.area} className="h-6 w-6" />
        )}
      </span>
      {done && <Stars count={lesson.stars} />}
    </span>
  );
}

function LessonLabel({ lesson, alignRight }: { lesson: MapLesson; alignRight: boolean }) {
  return (
    <span className={`min-w-0 px-1 py-1 ${alignRight ? "text-right" : "text-left"}`}>
      <span className="block text-[11px] font-medium text-slate-500 tabular-nums">
        Lesson {String(lesson.number).padStart(2, "0")} · {lesson.minutes} min
      </span>
      <span
        className={`line-clamp-3 text-[15px] leading-snug font-semibold transition ${
          lesson.locked ? "text-slate-500" : "text-slate-900 group-hover:text-brand-700"
        }`}
      >
        {lesson.title}
      </span>
      <span className={`mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs ${alignRight ? "justify-end" : ""}`}>
        {lesson.locked ? (
          <span className="font-medium text-slate-500">Locked</span>
        ) : lesson.mastery ? (
          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${lesson.mastery.className}`}>{lesson.mastery.label}</span>
        ) : lesson.status === "completed" ? (
          <span className="font-medium text-emerald-700">Completed</span>
        ) : lesson.isNext ? (
          <span className="font-semibold text-brand-700">Up next</span>
        ) : lesson.status === "in-progress" ? (
          <span className="font-semibold text-brand-700">In progress</span>
        ) : (
          <span className="text-slate-500">Open</span>
        )}
      </span>
    </span>
  );
}

// Places a stop so its node is centred on the road at x%, label on the roomier side.
function stopStyle(x: number, labelLeft: boolean): React.CSSProperties {
  return labelLeft
    ? { right: `calc(${100 - x}% - 30px)`, flexDirection: "row-reverse", maxWidth: `calc(${x}% + 22px)` }
    : { left: `calc(${x}% - 30px)`, maxWidth: `calc(${100 - x}% + 22px)` };
}

/** Positions every part of the map, top to bottom. */
function layout(chapters: MapChapter[]) {
  let y = 0;
  let k = 0;
  const road: Point[] = [];
  const start = { x: 50, y: START_H / 2 };
  road.push(start);
  y += START_H;

  const laidOut = [];
  for (const chapter of chapters) {
    const bandTop = y;
    const bannerY = y + BANNER_H / 2;
    road.push({ x: 50, y: bannerY });
    y += BANNER_H;
    const stops = [];
    for (const lesson of chapter.lessons) {
      k++;
      const point = { x: roadX(k), y: y + ROW_H / 2 };
      road.push(point);
      y += ROW_H;
      stops.push({ lesson, point, k });
    }
    laidOut.push({ chapter, bannerY, bandTop, bandHeight: y - bandTop, stops });
  }

  const finish = { x: 50, y: y + FINISH_H / 2 };
  road.push(finish);
  y += FINISH_H;
  const locked: Point[] = [];
  for (let i = 0; i < 2; i++) {
    k++;
    locked.push({ x: roadX(k), y: y + LOCKED_H / 2 });
    y += LOCKED_H;
  }
  return { start, laidOut, finish, locked, height: y + BOTTOM_PAD, path: roadPath(road), lockedPath: roadPath([finish, ...locked]) };
}

export function JourneyMap({ chapters, levelComplete }: { chapters: MapChapter[]; levelComplete: boolean }) {
  const { start, laidOut, finish, locked, height, path, lockedPath } = layout(chapters);

  // How far the green road reaches: to the next stop, or the last finished one.
  const stops = laidOut.flatMap((c) => c.stops);
  const nextStop = stops.find((s) => s.lesson.isNext);
  const lastDone = [...stops].reverse().find((s) => s.lesson.status === "completed");
  const progressY = levelComplete ? finish.y : nextStop ? nextStop.point.y : lastDone ? lastDone.point.y : start.y;

  return (
    <div
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] bg-slate-100/70 ring-1 ring-slate-200"
      style={{
        height,
        backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)",
        backgroundSize: "22px 22px",
      }}
    >
      {/* Each level's stretch of road gets a faint wash: green when done, violet where you are. */}
      {laidOut.map(({ chapter, bandTop, bandHeight }) =>
        chapter.status === "locked" ? null : (
          <div
            key={chapter.id}
            aria-hidden
            className={`absolute inset-x-0 ${chapter.status === "completed" ? "bg-emerald-50" : "bg-brand-50"}`}
            style={{
              top: bandTop - 24,
              height: bandHeight + 48,
              maskImage: "linear-gradient(transparent, black 72px, black calc(100% - 72px), transparent)",
              WebkitMaskImage: "linear-gradient(transparent, black 72px, black calc(100% - 72px), transparent)",
              opacity: 0.85,
            }}
          />
        ),
      )}

      {/* The road: a quiet track, the next path dashed, and the green stretch you've travelled. */}
      <svg aria-hidden viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={lockedPath} fill="none" stroke="var(--color-slate-300)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={path} fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={path} fill="none" stroke="var(--color-slate-200)" strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div aria-hidden className="absolute inset-x-0 top-0 animate-reveal overflow-hidden" style={{ height: progressY }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute top-0 left-0 w-full" style={{ height }}>
          <path d={path} fill="none" stroke="var(--color-emerald-500)" strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Start */}
      <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${start.x}%`, top: start.y }}>
        <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white ring-4 ring-white">
          <FlagIcon className="h-5 w-5" />
        </span>
        <span className="mt-1.5 text-xs font-semibold text-slate-700">Start</span>
      </div>

      {laidOut.map(({ chapter, bannerY, stops: chapterStops }) => (
        <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`}>
          {/* Where the level begins */}
          <div className="absolute left-1/2 z-10 w-max max-w-[94%] -translate-x-1/2 -translate-y-1/2 animate-fade-up" style={{ top: bannerY }}>
            <div
              className={`flex items-center gap-3 rounded-2xl bg-white/95 py-2.5 pr-4 pl-2.5 shadow-[0_10px_30px_-18px_rgb(30_28_26/0.4)] ring-1 backdrop-blur sm:gap-4 ${
                chapter.status === "locked" ? "ring-slate-200" : chapter.status === "completed" ? "ring-emerald-200" : "ring-brand-200"
              }`}
            >
              <LevelIllustration
                level={chapter.number}
                className={`h-16 w-auto shrink-0 sm:h-[72px] ${chapter.status === "locked" ? "opacity-60 grayscale" : ""}`}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Level {chapter.number} · {chapter.stage}
                </p>
                <h2 id={`chapter-${chapter.id}`} className="text-lg leading-tight text-slate-900 sm:text-xl">
                  {chapter.title}
                </h2>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  <LevelChip chapter={chapter} />
                  {chapter.isGoal && chapter.status !== "completed" && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">Your goal</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <ol className="m-0 list-none p-0" aria-label={chapter.title}>
            {chapterStops.map(({ lesson, point, k }) => {
              const labelLeft = point.x >= 50;
              const delay = { animationDelay: `${Math.min(k * 45, 540)}ms` };
              return (
                <li
                  key={lesson.id}
                  id={lesson.isNext ? "up-next" : undefined}
                  className="absolute inset-x-0 scroll-mt-32"
                  style={{ top: point.y - ROW_H / 2, height: ROW_H }}
                >
                  {lesson.locked ? (
                    <div
                      aria-label={`Lesson ${lesson.number}: ${lesson.title}, locked until Level ${chapter.number - 1} is complete`}
                      className="absolute top-1/2 flex -translate-y-1/2 animate-fade-up items-center gap-3"
                      style={{ ...stopStyle(point.x, labelLeft), ...delay }}
                    >
                      <LessonStop lesson={lesson} />
                      <LessonLabel lesson={lesson} alignRight={labelLeft} />
                    </div>
                  ) : (
                    <Link
                      href={`/lessons/${lesson.slug}`}
                      aria-label={`Lesson ${lesson.number}: ${lesson.title}${lesson.status === "completed" ? `, completed, ${lesson.stars} of 3 stars` : lesson.isNext ? ", up next" : ""}`}
                      className="group absolute top-1/2 flex -translate-y-1/2 animate-fade-up items-center gap-3 rounded-2xl outline-offset-4"
                      style={{ ...stopStyle(point.x, labelLeft), ...delay }}
                    >
                      <LessonStop lesson={lesson} />
                      <LessonLabel lesson={lesson} alignRight={labelLeft} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {/* The path's trophy */}
      <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${finish.x}%`, top: finish.y }}>
        <TrophyIllustration won={levelComplete} className={`h-24 w-24 ${levelComplete ? "animate-pop" : ""}`} />
        <span className="mt-1 rounded-full bg-white px-3 py-1 text-center text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
          {levelComplete ? "All 4 levels complete!" : `Finish all 4 levels · +${LEVEL_COMPLETION_XP} XP`}
        </span>
      </div>

      {/* The next path, coming soon */}
      {locked.map((point, i) => (
        <div
          key={point.y}
          className="absolute flex -translate-y-1/2 items-center gap-3"
          style={point.x >= 50 ? { right: `calc(${100 - point.x}% - 22px)`, flexDirection: "row-reverse", top: point.y } : { left: `calc(${point.x}% - 22px)`, top: point.y }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
            <LockIcon className="h-4 w-4" />
          </span>
          {i === 0 && (
            <span className="rounded-xl bg-slate-50/85 px-2.5 py-1.5 text-xs">
              <span className="block font-semibold text-slate-700">Next path · {NEXT_PATH_NAME}</span>
              <span className="text-slate-500">Coming soon</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
