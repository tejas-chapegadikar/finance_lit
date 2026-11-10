import Link from "next/link";
import { BookIcon, CheckIcon, LockIcon, RefreshIcon, TrendingUpIcon, CompassIcon, ChevronRightIcon } from "@/components/ui/icons";

// One vertical path: units of stops, Duolingo style. Done units and locked
// units fold away so the screen stays short; the one you're on is open.

export type StopState = "done" | "current" | "open" | "locked";

export type PathStop = {
  key: string;
  kind: "lesson" | "practice" | "revision" | "tool";
  title: string;
  /** A short line under the title: minutes, XP, or how to unlock it. */
  note: string;
  href: string | null;
  state: StopState;
};

export type PathUnit = { id: string; eyebrow: string; title: string; state: StopState; done: number; total: number; stops: PathStop[] };

const OFFSET = ["0rem", "1.75rem", "3rem", "1.75rem"];

const NODE: Record<StopState, string> = {
  done: "bg-emerald-700 text-white",
  current: "bg-brand-500 text-brand-900 ring-4 ring-brand-300 path-pulse",
  open: "bg-white text-brand-900 ring-2 ring-brand-900",
  locked: "bg-slate-100 text-slate-500 ring-1 ring-slate-300",
};

const KIND_ICON = { lesson: BookIcon, practice: CompassIcon, revision: RefreshIcon, tool: TrendingUpIcon };

function Stop({ stop, index }: { stop: PathStop; index: number }) {
  const Icon = stop.state === "done" ? CheckIcon : stop.state === "locked" ? LockIcon : KIND_ICON[stop.kind];
  const label = { lesson: "Lesson", practice: "Practice", revision: "Practice", tool: "Tool" }[stop.kind];
  const body = (
    <>
      <span aria-hidden className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${NODE[stop.state]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className={`block leading-snug font-semibold ${stop.state === "locked" ? "text-slate-600" : "text-slate-900"}`}>{stop.title}</span>
        <span className={`block text-xs ${stop.state === "current" ? "font-semibold text-orange-700" : "text-slate-600"}`}>{stop.note}</span>
        <span className="sr-only">{{ done: "Done", current: "Up next", open: "Open", locked: "Locked" }[stop.state]}</span>
      </span>
    </>
  );
  return (
    <li style={{ marginLeft: OFFSET[index % OFFSET.length] }}>
      {stop.href ? (
        <Link href={stop.href} className="group flex min-h-16 items-center gap-3 rounded-2xl py-1 pr-2 transition hover:bg-white/70">
          {body}
        </Link>
      ) : (
        <div className="flex min-h-16 items-center gap-3 py-1 pr-2">{body}</div>
      )}
    </li>
  );
}

export function LearnPath({ units }: { units: PathUnit[] }) {
  return (
    <div className="flex flex-col gap-3">
      {units.map((unit) => (
        <details key={unit.id} open={unit.state === "current"} className="group/unit overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${unit.state === "done" ? "bg-emerald-700 text-white" : unit.state === "locked" ? "bg-slate-100 text-slate-500" : "bg-brand-500 text-brand-900"}`}>
              {unit.state === "done" ? <CheckIcon className="h-4 w-4" /> : unit.state === "locked" ? <LockIcon className="h-4 w-4" /> : <BookIcon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-slate-600">
                {unit.eyebrow} · {unit.done}/{unit.total}
              </span>
              <span className="block leading-tight font-display font-semibold text-slate-900">{unit.title}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-500 transition group-open/unit:rotate-90" />
          </summary>
          <ol className="flex flex-col gap-1 px-4 pb-4">
            {unit.stops.map((stop, i) => (
              <Stop key={stop.key} stop={stop} index={i} />
            ))}
          </ol>
        </details>
      ))}
    </div>
  );
}
