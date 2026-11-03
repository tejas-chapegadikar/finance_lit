import { shiftDay } from "@/lib/ist-date";
import type { DayMark } from "@/lib/streak";
import { FlameIcon, SnowflakeIcon } from "@/components/ui/icons";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Monday = 0 … Sunday = 6, for an IST calendar day.
const weekdayOf = (day: string) => (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function Cell({ day, mark, today, index }: { day: string; mark: DayMark | undefined; today: string; index: number }) {
  const isToday = day === today;
  const future = day > today;
  const label = `${formatDay(day)}: ${mark === "active" ? "learned" : mark === "frozen" ? "covered by a streak freeze" : future ? "upcoming" : "no activity"}`;
  return (
    <span
      title={label}
      className={`flex aspect-square w-full animate-fade-up items-center justify-center rounded-lg text-xs font-medium tabular-nums ${
        mark === "active"
          ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
          : mark === "frozen"
            ? "bg-sky-100 text-sky-700"
            : future
              ? "text-slate-300"
              : "bg-slate-100 text-slate-500"
      } ${isToday ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white" : ""}`}
      style={{ animationDelay: `${Math.min(index * 12, 400)}ms` }}
    >
      <span aria-hidden>
        {mark === "active" ? (
          <FlameIcon className="h-4 w-4" />
        ) : mark === "frozen" ? (
          <SnowflakeIcon className="h-4 w-4" />
        ) : (
          Number(day.slice(8))
        )}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** The last five weeks as a calendar — for the profile. */
export function StreakCalendar({ marks, today }: { marks: Map<string, DayMark>; today: string }) {
  const lastSunday = shiftDay(today, 6 - weekdayOf(today));
  const first = shiftDay(lastSunday, -34);
  const days = Array.from({ length: 35 }, (_, i) => shiftDay(first, i));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-slate-500" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d.charAt(0)}</span>
        ))}
      </div>
      <ol className="mt-2 grid grid-cols-7 gap-1.5" aria-label="Learning days, last five weeks">
        {days.map((day, i) => (
          <li key={day}>
            <Cell day={day} mark={marks.get(day)} today={today} index={i} />
          </li>
        ))}
      </ol>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-white">
            <FlameIcon className="h-3 w-3" />
          </span>
          Learned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded bg-sky-100 text-sky-700">
            <SnowflakeIcon className="h-3 w-3" />
          </span>
          Covered by a freeze
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-4 w-4 rounded ring-2 ring-slate-900" />
          Today
        </span>
      </p>
    </div>
  );
}
