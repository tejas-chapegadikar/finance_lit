import type { CategoryTotal, MoneyMonth } from "@/lib/money";
import { rupees, SPEND_KIND_LABEL, type SpendKind } from "@/lib/money/categories";
import { CategoryIcon } from "@/components/ui/topic-icons";
import { AlertIcon } from "@/components/ui/icons";

// Money Manager charts — plain HTML/CSS, server-rendered. One validated
// categorical set for essentials / wants / food & others (blue, orange, aqua; checked for
// colour-blind separation), thin marks, values as text in ink (never in the
// series colour), a legend for the split, hover titles and a table view.

export const KIND_COLOR: Record<SpendKind, string> = { need: "#2a78d6", want: "#eb6834", mixed: "#1baf7a" };

function Swatch({ kind }: { kind: SpendKind }) {
  return <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: KIND_COLOR[kind] }} />;
}

/** Spending by category, biggest first, coloured by need / want / other, with budget marks. */
export function CategoryBars({ categories }: { categories: CategoryTotal[] }) {
  const rows = categories.filter((c) => c.amount > 0 || c.budget);
  const max = Math.max(1, ...rows.map((c) => Math.max(c.amount, c.budget ?? 0)));
  if (rows.length === 0) return <p className="text-sm text-slate-500">No spending logged this month yet.</p>;
  return (
    <div>
      <ul className="flex flex-col gap-3.5">
        {rows.map((c) => {
          const over = c.budget !== null && c.amount > c.budget;
          return (
            <li key={c.id} title={`${c.label}: ${rupees(c.amount)}${c.budget !== null ? ` of a ${rupees(c.budget)} budget` : ""}`}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex min-w-0 items-center gap-2 font-medium text-slate-800">
                  <CategoryIcon id={c.id} className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{c.label}</span>
                </span>
                <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
                  {rupees(c.amount)}
                  {c.budget !== null && <span className="font-normal text-slate-500"> / {rupees(c.budget)}</span>}
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 rounded-sm bg-slate-100">
                <div
                  className="h-full animate-bar rounded-r-[4px]"
                  style={{ width: `${(c.amount / max) * 100}%`, background: KIND_COLOR[c.kind] }}
                />
                {c.budget !== null && (
                  <span aria-hidden className="absolute -top-1 -bottom-1 w-px bg-slate-900" style={{ left: `${(c.budget / max) * 100}%` }} />
                )}
              </div>
              {over && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                  <AlertIcon className="h-3.5 w-3.5" /> {rupees(c.amount - c.budget!)} over budget
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        {(["need", "want", "mixed"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <Swatch kind={k} /> {SPEND_KIND_LABEL[k]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-3 w-px bg-slate-900" /> Budget
        </span>
      </p>
    </div>
  );
}

/** Needs vs wants vs other, as one 100% bar against the 50/30/20 guideline. */
export function SpendSplit({ byKind, spent }: { byKind: MoneyMonth["byKind"]; spent: number }) {
  if (spent === 0) return <p className="text-sm text-slate-500">Log a few spends to see your essentials-vs-wants split.</p>;
  const kinds = (["need", "want", "mixed"] as const).filter((k) => byKind[k] > 0);
  const pct = (k: SpendKind) => Math.round((byKind[k] / spent) * 100);
  return (
    <div>
      <div role="img" aria-label={kinds.map((k) => `${SPEND_KIND_LABEL[k]} ${pct(k)}%`).join(", ")} className="flex h-4 gap-0.5 overflow-hidden rounded-[4px]">
        {kinds.map((k) => (
          <div key={k} className="h-full animate-bar" title={`${SPEND_KIND_LABEL[k]}: ${rupees(byKind[k])} (${pct(k)}%)`} style={{ width: `${(byKind[k] / spent) * 100}%`, background: KIND_COLOR[k] }} />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {(["need", "want", "mixed"] as const).map((k) => (
          <div key={k}>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Swatch kind={k} /> {SPEND_KIND_LABEL[k]}
            </dt>
            <dd className="mt-0.5 font-display text-xl font-semibold text-slate-900 tabular-nums">{pct(k)}%</dd>
            <dd className="text-xs text-slate-500 tabular-nums">{rupees(byKind[k])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-500">Guide: about 50% needs, 30% wants and 20% saved — a starting point, not a law. Food mixes both, so it sits on its own.</p>
    </div>
  );
}

const dayLabel = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** Spending per day this month, with the daily budget as a reference line. */
export function DailyColumns({ month }: { month: MoneyMonth }) {
  const days = month.daily;
  const dailyBudget = month.totalBudget ? Math.round(month.totalBudget / month.daysInMonth) : null;
  const max = Math.max(1, dailyBudget ?? 0, ...days.map((d) => d.amount));
  const top = Math.ceil(max / 100) * 100;
  const spendDays = days.filter((d) => d.amount > 0);
  return (
    <div>
      <div className="flex gap-2">
        <div aria-hidden className="flex h-40 flex-col justify-between py-0 text-right text-[11px] text-slate-400 tabular-nums">
          <span>{rupees(top)}</span>
          <span>₹0</span>
        </div>
        <div className="relative flex-1">
          <div aria-hidden className="absolute inset-x-0 top-0 border-t border-slate-100" />
          <div
            role="img"
            aria-label={`Daily spending, ${month.label}: ${spendDays.length} days with spending, highest ${rupees(Math.max(0, ...days.map((d) => d.amount)))}`}
            className="flex h-40 items-end gap-0.5 border-b border-slate-200"
          >
            {days.map((d, i) => {
              const future = month.isCurrent && i >= month.daysElapsed;
              const isToday = month.isCurrent && i === month.daysElapsed - 1;
              return (
                <div key={d.day} className="group relative flex h-full flex-1 items-end justify-center" title={`${dayLabel(d.day)}: ${rupees(d.amount)}`}>
                  {!future && d.amount > 0 && (
                    <div
                      className={`w-full max-w-6 animate-column rounded-t-[4px] ${isToday ? "bg-brand-700" : "bg-brand-400 group-hover:bg-brand-500"}`}
                      style={{ height: `${(d.amount / top) * 100}%`, animationDelay: `${Math.min(i * 15, 400)}ms` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {dailyBudget !== null && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-slate-900/60" style={{ bottom: `${(dailyBudget / top) * 100}%` }}>
            </div>
          )}
          <div aria-hidden className="mt-1.5 flex justify-between text-[11px] text-slate-400 tabular-nums">
            {[1, 8, 15, 22, month.daysInMonth].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      </div>
      {dailyBudget !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
          <span aria-hidden className="inline-block w-4 border-t border-slate-900/60" /> Daily budget: {rupees(dailyBudget)}
        </p>
      )}
      {spendDays.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-xs font-semibold text-brand-700">Show as a table</summary>
          <table className="mt-2 w-full max-w-xs text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th scope="col" className="py-1 font-medium">Day</th>
                <th scope="col" className="py-1 text-right font-medium">Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spendDays.map((d) => (
                <tr key={d.day}>
                  <td className="py-1 text-slate-700">{dayLabel(d.day)}</td>
                  <td className="py-1 text-right font-medium text-slate-900 tabular-nums">{rupees(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

/** Spending per week or per month — thin columns, the current period darker, a table view underneath. */
export function TrendColumns({ points, unit, caption }: { points: { key: string; label: string; amount: number; current: boolean }[]; unit: "week" | "month"; caption: string }) {
  const max = Math.max(1, ...points.map((p) => p.amount));
  const top = Math.ceil(max / 500) * 500;
  const any = points.some((p) => p.amount > 0);
  if (!any) return <p className="text-sm text-slate-500">Log a few spends and your {unit}ly trend appears here.</p>;
  const name = (p: { label: string }) => (unit === "week" ? `Week of ${p.label}` : p.label);
  return (
    <div>
      <div className="flex gap-2">
        <div aria-hidden className="flex h-32 flex-col justify-between text-right text-[11px] text-slate-400 tabular-nums">
          <span>{rupees(top)}</span>
          <span>₹0</span>
        </div>
        <div className="min-w-0 flex-1">
          <div role="img" aria-label={caption} className="flex h-32 items-end gap-1 border-b border-slate-200">
            {points.map((p) => (
              <div key={p.key} className="group flex h-full flex-1 items-end justify-center" title={`${name(p)}: ${rupees(p.amount)}`}>
                {p.amount > 0 && (
                  <div
                    className={`w-full max-w-8 animate-column rounded-t-[4px] ${p.current ? "bg-brand-700" : "bg-brand-300 group-hover:bg-brand-400"}`}
                    style={{ height: `${(p.amount / top) * 100}%` }}
                  />
                )}
              </div>
            ))}
          </div>
          <div aria-hidden className="mt-1.5 flex gap-1 text-[11px] text-slate-400 tabular-nums">
            {points.map((p, i) => (
              <span key={p.key} className="flex-1 truncate text-center">
                {unit === "month" || i === 0 || i === points.length - 1 ? (p.current ? (unit === "week" ? "This wk" : p.label) : p.label) : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-brand-700">Show as a table</summary>
        <table className="mt-2 w-full max-w-xs text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th scope="col" className="py-1 font-medium">{unit === "week" ? "Week of" : "Month"}</th>
              <th scope="col" className="py-1 text-right font-medium">Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {points.map((p) => (
              <tr key={p.key}>
                <td className="py-1 text-slate-700">
                  {p.label}
                  {p.current ? ` (this ${unit})` : ""}
                </td>
                <td className="py-1 text-right font-medium text-slate-900 tabular-nums">{rupees(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
