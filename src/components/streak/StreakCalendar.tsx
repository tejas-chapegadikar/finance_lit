import { shiftDay } from "@/lib/ist-date";
import type { DayMark } from "@/lib/streak";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Monday = 0 … Sunday = 6, for an IST calendar day.
const weekdayOf = (day: string) => (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function Cell({ day, mark, today, compact }: { day: string; mark: DayMark | undefined; today: string; compact?: boolean }) {
  const isToday = day === today;
  const future = day > today;
  const label = `${formatDay(day)}: ${mark === "active" ? "learned" : mark === "frozen" ? "covered by a streak freeze" : future ? "upcoming" : "no activity"}`;
  return (
    <span
      title={label}
      className={`flex items-center justify-center rounded-xl font-bold ${compact ? "h-9 w-9 text-base" : "aspect-square w-full text-sm"} ${
        mark === "active"
          ? "bg-orange-100 ring-2 ring-orange-300"
          : mark === "frozen"
            ? "bg-brand-100 ring-2 ring-brand-300"
            : future
              ? "bg-white/50 text-slate-300"
              : "bg-slate-100 text-slate-500"
      } ${isToday && !mark ? "outline-2 outline-offset-1 outline-orange-400 outline-dashed" : ""}`}
    >
      <span aria-hidden>{mark === "active" ? "🔥" : mark === "frozen" ? "🧊" : compact ? "" : Number(day.slice(8))}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** This week, Monday to Sunday — for the dashboard. */
export function StreakWeek({ marks, today }: { marks: Map<string, DayMark>; today: string }) {
  const monday = shiftDay(today, -weekdayOf(today));
  const days = WEEKDAYS.map((_, i) => shiftDay(monday, i));
  return (
    <ol className="flex justify-between gap-1" aria-label="This week">
      {days.map((day, i) => (
        <li key={day} className="flex flex-col items-center gap-1">
          <span className={`text-xs font-bold ${day === today ? "text-orange-700" : "text-slate-600"}`}>{WEEKDAYS[i].charAt(0)}</span>
          <Cell day={day} mark={marks.get(day)} today={today} compact />
        </li>
      ))}
    </ol>
  );
}

/** The last five weeks as a calendar — for the profile. */
export function StreakCalendar({ marks, today }: { marks: Map<string, DayMark>; today: string }) {
  const lastSunday = shiftDay(today, 6 - weekdayOf(today));
  const first = shiftDay(lastSunday, -34);
  const days = Array.from({ length: 35 }, (_, i) => shiftDay(first, i));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-600" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d.charAt(0)}</span>
        ))}
      </div>
      <ol className="mt-1.5 grid grid-cols-7 gap-1.5" aria-label="Learning days, last five weeks">
        {days.map((day) => (
          <li key={day}>
            <Cell day={day} mark={marks.get(day)} today={today} />
          </li>
        ))}
      </ol>
    </div>
  );
}
