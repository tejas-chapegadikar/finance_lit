import type { DayMark } from "@/lib/streak";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** This month as a heatmap: active days gold, days a freeze covered blue, today outlined. */
export function StreakCalendar({ month, today, days, label }: { month: string; today: string; days: Map<string, DayMark>; label: string }) {
  const [year, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  // getUTCDay: Sunday 0. Shift so the week starts on Monday.
  const lead = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  return (
    <figure>
      <figcaption className="text-sm font-semibold text-slate-900">{label}</figcaption>
      <div role="img" aria-label={`${label}: ${[...days.values()].filter((d) => d === "active").length} active days, ${[...days.values()].filter((d) => d === "frozen").length} covered by a freeze`} className="mt-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} aria-hidden className="text-[11px] font-medium text-slate-600">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`gap-${i}`} aria-hidden />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const day = `${month}-${String(i + 1).padStart(2, "0")}`;
          const mark = days.get(day);
          return (
            <span
              key={day}
              aria-hidden
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${mark === "active" ? "bg-brand-500 text-brand-900" : mark === "frozen" ? "bg-sky-200 text-sky-950" : "bg-slate-100 text-slate-600"} ${day === today ? "ring-2 ring-brand-900" : ""}`}
            >
              {i + 1}
            </span>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded bg-brand-500" /> Active
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded bg-sky-200" /> Freeze used
        </span>
      </p>
    </figure>
  );
}
