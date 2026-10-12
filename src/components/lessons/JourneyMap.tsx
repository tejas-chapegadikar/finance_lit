import Link from "next/link";
import { NEXT_PATH_NAME, LEVEL_COMPLETION_XP } from "@/lib/constants";
import type { LevelStatus } from "@/lib/journey";
import { LockIcon } from "@/components/ui/icons";

// The learning path as a game map: a winding road through the four levels,
// one stop per lesson, starting at home and ending at the trophy, with the
// next path waiting (locked) beyond it. Levels open in order — stops in a
// locked level are shown but can't be opened (the server enforces it too).

export type MapLesson = {
  id: string;
  slug: string;
  title: string;
  icon: string;
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
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  current: "bg-brand-50 text-brand-800 ring-brand-200",
  available: "bg-brand-50 text-brand-800 ring-brand-200",
  locked: "bg-slate-100 text-slate-600 ring-slate-200",
};

function levelChipText(chapter: MapChapter): string {
  const total = chapter.lessons.length;
  if (chapter.status === "completed") return "✓ Completed";
  if (chapter.status === "locked") return `🔒 Finish Level ${chapter.number - 1} to unlock`;
  return `${chapter.status === "current" ? "You're here" : "Open"} · ${chapter.completed}/${total} done`;
}

const START_H = 130;
const BANNER_H = 96;
const ROW_H = 120;
const FINISH_H = 140;
const LOCKED_H = 108;
const BOTTOM_PAD = 24;

// Scenery beside the road, a different set per chapter.
const SCENERY = [
  ["🌳", "🏫", "🎒", "☕"],
  ["📱", "🏦", "🌲", "🔒"],
  ["🐷", "🪙", "🌳", "💳"],
  ["🏢", "💼", "🌴", "📈"],
];

const CLOUDS = [
  { top: 30, side: "left", width: 96 },
  { top: 420, side: "right", width: 120 },
  { top: 880, side: "left", width: 110 },
  { top: 1340, side: "right", width: 96 },
  { top: 1800, side: "left", width: 120 },
  { top: 2180, side: "right", width: 104 },
] as const;

// The road snakes left and right: x (in %) for the k-th stop.
const roadX = (k: number) => Math.round((50 + 24 * Math.sin(k * 0.8)) * 10) / 10;

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
    <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-0.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={`h-4 w-4 ${n <= count ? "fill-amber-400" : "fill-slate-300"} drop-shadow-sm`}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" stroke="#fff" strokeWidth="1.2" />
        </svg>
      ))}
    </span>
  );
}

function LessonStop({ lesson }: { lesson: MapLesson }) {
  const done = lesson.status === "completed";
  const face = lesson.locked
    ? "bg-slate-200 text-slate-500 shadow-[0_5px_0_0_var(--color-slate-300)]"
    : done
      ? "bg-amber-400 text-amber-950 shadow-[0_5px_0_0_var(--color-amber-600)]"
      : lesson.isNext
        ? "bg-brand-600 text-white shadow-[0_5px_0_0_var(--color-brand-800)]"
        : lesson.status === "in-progress"
          ? "bg-brand-100 text-brand-800 shadow-[0_5px_0_0_var(--color-brand-300)]"
          : "bg-white text-brand-700 shadow-[0_5px_0_0_var(--color-brand-300)]";
  return (
    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      {lesson.isNext && !done && (
        <>
          <span className="absolute inset-0 rounded-full bg-brand-400 opacity-40 motion-safe:animate-ping" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-brand-800 px-2 py-0.5 text-xs font-extrabold whitespace-nowrap text-white shadow-[0_3px_0_0_var(--color-brand-900)]">
            GO!
          </span>
        </>
      )}
      <span
        className={`relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold ring-4 ring-white transition ${
          lesson.locked ? "" : "group-hover:-translate-y-0.5"
        } ${face}`}
      >
        {lesson.locked ? <LockIcon className="h-6 w-6" /> : lesson.number}
      </span>
      {done && <Stars count={lesson.stars} />}
    </span>
  );
}

function LessonLabel({ lesson, alignRight }: { lesson: MapLesson; alignRight: boolean }) {
  return (
    <span
      className={`min-w-0 rounded-2xl px-3 py-2 ring-1 transition ${
        lesson.locked
          ? "bg-white/70 ring-slate-200"
          : "bg-white/95 shadow-[0_3px_0_0_var(--color-brand-200)] ring-brand-100 group-hover:ring-brand-300"
      } ${alignRight ? "text-right" : "text-left"}`}
    >
      <span className={`line-clamp-3 text-sm leading-snug font-extrabold ${lesson.locked ? "text-slate-600" : "text-slate-900"}`}>
        {lesson.title}
      </span>
      <span className={`mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-600 ${alignRight ? "justify-end" : ""}`}>
        <span aria-hidden className={lesson.locked ? "grayscale" : ""}>
          {lesson.icon}
        </span>
        <span>{lesson.minutes} min</span>
        {lesson.locked ? (
          <span className="font-bold">Locked</span>
        ) : lesson.mastery ? (
          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${lesson.mastery.className}`}>{lesson.mastery.label}</span>
        ) : lesson.isNext ? (
          <span className="font-extrabold text-brand-700">Up next</span>
        ) : lesson.status === "in-progress" ? (
          <span className="font-bold text-brand-700">In progress</span>
        ) : null}
      </span>
    </span>
  );
}

// Places a stop so its node is centred on the road at x%, label on the roomier side.
function stopStyle(x: number, labelLeft: boolean): React.CSSProperties {
  return labelLeft
    ? { right: `calc(${100 - x}% - 32px)`, flexDirection: "row-reverse", maxWidth: `calc(${x}% + 20px)` }
    : { left: `calc(${x}% - 32px)`, maxWidth: `calc(${100 - x}% + 20px)` };
}

function Cloud({ width }: { width: number }) {
  return (
    <svg viewBox="0 0 120 50" width={width} aria-hidden className="fill-white">
      <ellipse cx="38" cy="32" rx="30" ry="16" />
      <ellipse cx="66" cy="22" rx="26" ry="20" />
      <ellipse cx="90" cy="32" rx="24" ry="14" />
      <rect x="14" y="32" width="96" height="16" rx="8" />
    </svg>
  );
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
  for (const [c, chapter] of chapters.entries()) {
    const bannerY = y + BANNER_H / 2;
    const bandTop = y;
    y += BANNER_H;
    const stops = [];
    for (const [i, lesson] of chapter.lessons.entries()) {
      k++;
      const point = { x: roadX(k), y: y + ROW_H / 2 };
      road.push(point);
      y += ROW_H;
      stops.push({ lesson, point, scenery: SCENERY[c % SCENERY.length][i % 4] });
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

  return (
    <div
      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] bg-brand-100 shadow-[0_6px_0_0_var(--color-brand-200)] ring-1 ring-brand-200"
      style={{ height }}
    >
      {/* Level regions: alternating bands with a wavy top edge; locked levels in grey */}
      {laidOut.map(({ chapter, bandTop, bandHeight }, c) => {
        const tone = chapter.status === "locked" ? ["fill-slate-100", "bg-slate-100"] : c % 2 ? ["fill-brand-50", "bg-brand-50"] : ["fill-white/60", "bg-white/60"];
        return (
          <div key={chapter.id} aria-hidden className="absolute inset-x-0" style={{ top: bandTop, height: bandHeight }}>
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute -top-4 h-4 w-full">
              <path d="M0 10 Q12 0 25 5 T50 5 T75 4 T100 6 L100 10 Z" className={tone[0]} />
            </svg>
            <div className={`h-full ${tone[1]}`} />
          </div>
        );
      })}

      {CLOUDS.filter((cloud) => cloud.top < height - 60).map((cloud) => (
        <div
          key={cloud.top}
          aria-hidden
          className="absolute opacity-80"
          style={cloud.side === "left" ? { top: cloud.top, left: -cloud.width * 0.3 } : { top: cloud.top, right: -cloud.width * 0.3 }}
        >
          <Cloud width={cloud.width} />
        </div>
      ))}

      {/* The road */}
      <svg aria-hidden viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={lockedPath} fill="none" stroke="#cbd5e1" strokeWidth="34" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={lockedPath} fill="none" stroke="#f1f5f9" strokeWidth="28" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={path} transform="translate(0 4)" fill="none" stroke="#82d2f8" strokeWidth="42" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={path} fill="none" stroke="#ffffff" strokeWidth="36" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          fill="none"
          stroke="#b9e5fb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1 14"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Start */}
      <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${start.x}%`, top: start.y }}>
        <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-[0_5px_0_0_var(--color-brand-300)] ring-4 ring-brand-200">
          🏡
        </span>
        <span className="mt-2 rounded-full bg-brand-700 px-3 py-0.5 text-xs font-extrabold text-white">Start</span>
      </div>

      {laidOut.map(({ chapter, bannerY, stops }) => (
        <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`}>
          <div className="absolute left-1/2 z-10 w-max max-w-[88%] -translate-x-1/2 -translate-y-1/2" style={{ top: bannerY }}>
            <div
              className={`rounded-2xl bg-white px-4 py-2 text-center ring-2 ${
                chapter.status === "locked" ? "ring-slate-200" : "shadow-[0_4px_0_0_var(--color-brand-200)] ring-brand-200"
              }`}
            >
              <p className={`text-[11px] font-extrabold tracking-wider uppercase ${chapter.status === "locked" ? "text-slate-600" : "text-brand-700"}`}>
                Level {chapter.number} · {chapter.stage}
              </p>
              <h2 id={`chapter-${chapter.id}`} className="font-extrabold text-slate-900">
                <span aria-hidden className={chapter.status === "locked" ? "grayscale" : ""}>
                  {chapter.icon}
                </span>{" "}
                {chapter.title}
              </h2>
            </div>
            <p className="mt-1.5 flex flex-wrap justify-center gap-1.5 text-center">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ring-2 ${LEVEL_CHIP[chapter.status]}`}>{levelChipText(chapter)}</span>
              {chapter.isGoal && chapter.status !== "completed" && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-900 ring-2 ring-amber-200">⭐ Your goal</span>
              )}
            </p>
          </div>

          <ol className="m-0 list-none p-0" aria-label={chapter.title}>
            {stops.map(({ lesson, point, scenery }) => {
              const labelLeft = point.x >= 50;
              const sceneryX = labelLeft ? (point.x + 100) / 2 + 3 : point.x / 2 - 3;
              return (
                <li
                  key={lesson.id}
                  id={lesson.isNext ? "up-next" : undefined}
                  className="absolute inset-x-0 scroll-mt-32"
                  style={{ top: point.y - ROW_H / 2, height: ROW_H }}
                >
                  <span
                    aria-hidden
                    className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{ left: `${sceneryX}%` }}
                  >
                    <span className="text-[28px] leading-none">{scenery}</span>
                    <span className="mt-0.5 h-1.5 w-9 rounded-full bg-brand-300/50" />
                  </span>
                  {lesson.locked ? (
                    <div
                      aria-label={`Lesson ${lesson.number}: ${lesson.title}, locked until Level ${chapter.number - 1} is complete`}
                      className="absolute top-1/2 flex -translate-y-1/2 items-center gap-3"
                      style={stopStyle(point.x, labelLeft)}
                    >
                      <LessonStop lesson={lesson} />
                      <LessonLabel lesson={lesson} alignRight={labelLeft} />
                    </div>
                  ) : (
                    <Link
                      href={`/lessons/${lesson.slug}`}
                      aria-label={`Lesson ${lesson.number}: ${lesson.title}${lesson.status === "completed" ? `, completed, ${lesson.stars} of 3 stars` : lesson.isNext ? ", up next" : ""}`}
                      className="group absolute top-1/2 flex -translate-y-1/2 items-center gap-3 rounded-2xl outline-offset-4"
                      style={stopStyle(point.x, labelLeft)}
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
        <span
          aria-hidden
          className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-4xl ring-4 ring-white ${
            levelComplete ? "bg-amber-400 shadow-[0_5px_0_0_var(--color-amber-600)]" : "bg-white shadow-[0_5px_0_0_var(--color-brand-300)] grayscale"
          }`}
        >
          🏆
        </span>
        <span className="mt-2 rounded-full bg-white px-3 py-1 text-center text-xs font-extrabold text-slate-900 shadow-sm ring-1 ring-brand-200">
          {levelComplete ? "All 4 levels complete!" : `Finish all 4 levels · +${LEVEL_COMPLETION_XP} XP`}
        </span>
      </div>

      {/* The next path, coming soon */}
      {locked.map((point, i) => (
        <div
          key={point.y}
          className="absolute flex -translate-y-1/2 items-center gap-3"
          style={point.x >= 50 ? { right: `calc(${100 - point.x}% - 28px)`, flexDirection: "row-reverse", top: point.y } : { left: `calc(${point.x}% - 28px)`, top: point.y }}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-[0_5px_0_0_var(--color-slate-300)] ring-4 ring-white">
            <LockIcon className="h-6 w-6" />
          </span>
          {i === 0 && (
            <span className="rounded-2xl bg-white/90 px-3 py-2 text-xs ring-1 ring-slate-200">
              <span className="block font-extrabold text-slate-700">Next path · {NEXT_PATH_NAME}</span>
              <span className="text-slate-600">Coming soon</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
