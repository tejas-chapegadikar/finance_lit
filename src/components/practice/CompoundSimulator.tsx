"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { recordSimulatorMoment } from "@/actions/avatar";
import { compoundGrowth, shortRupees } from "@/lib/simulator";

// Two validated categorical slots (blue, orange) for invested vs growth.
const INVESTED = "#2a78d6";
const GROWTH = "#eb6834";

const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-lg font-semibold text-slate-900 tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600"
      />
    </div>
  );
}

/**
 * Play with compounding: a monthly amount, a time span and an assumed yearly
 * return, then see what waiting a few years would cost. Every number is an
 * illustration under a fixed assumed rate, not a forecast.
 */
export function CompoundSimulator({ initial }: { initial: { monthly: number; years: number; rate: number } }) {
  const [monthly, setMonthly] = useState(initial.monthly);
  const [years, setYears] = useState(initial.years);
  const [rate, setRate] = useState(initial.rate);
  const [lump, setLump] = useState(0);
  const [delay, setDelay] = useState(5);

  const now = useMemo(() => compoundGrowth({ monthly, years, annualRatePct: rate, initial: lump }), [monthly, years, rate, lump]);
  const later = useMemo(
    () => compoundGrowth({ monthly, years: Math.max(0, years - delay), annualRatePct: rate, initial: lump }),
    [monthly, years, rate, lump, delay],
  );
  // The avatar reacts once to the "aha": past ₹1 crore, or after a good look around.
  const changes = useRef(0);
  const told = useRef(false);
  useEffect(() => {
    changes.current += 1;
    if (told.current || (now.value < 1_00_00_000 && changes.current < 8)) return;
    told.current = true;
    void recordSimulatorMoment().catch(() => {});
  }, [now.value]);
  const top = Math.max(1, ...now.series.map((p) => p.value));
  const waitCost = now.value - later.value;
  const investedLess = now.invested - later.invested;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <div className="flex flex-col gap-6">
        <Slider id="sim-monthly" label="Monthly investment" value={monthly} min={100} max={25000} step={100} display={rupees(monthly)} onChange={setMonthly} />
        <Slider id="sim-years" label="Duration" value={years} min={1} max={40} step={1} display={`${years} ${years === 1 ? "year" : "years"}`} onChange={setYears} />
        <Slider id="sim-rate" label="Expected annual return (assumed)" value={rate} min={1} max={15} step={0.5} display={`${rate}%`} onChange={setRate} />
        <Slider id="sim-lump" label="Starting amount (optional)" value={lump} min={0} max={200000} step={1000} display={rupees(lump)} onChange={setLump} />
        <p className="text-xs leading-relaxed text-slate-500">
          For comparison: savings accounts often pay around 2.5–3% and FDs a little more. Equity funds have historically done better over long periods,
          with big ups and downs, and no guarantee. Inflation and taxes aren&apos;t included here.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <p className="text-[13px] font-medium text-slate-500">
            Estimated future value after {years} {years === 1 ? "year" : "years"}
          </p>
          <p className="mt-1 font-display text-5xl leading-none font-semibold text-slate-900 tabular-nums" aria-live="polite">
            {shortRupees(now.value)}
          </p>
          <dl className="mt-4 grid max-w-md grid-cols-2 gap-4">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: INVESTED }} /> Total invested
              </dt>
              <dd className="mt-0.5 font-display text-xl font-semibold text-slate-900 tabular-nums">{shortRupees(now.invested)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: GROWTH }} /> Estimated returns
              </dt>
              <dd className="mt-0.5 font-display text-xl font-semibold text-slate-900 tabular-nums">{shortRupees(now.growth)}</dd>
            </div>
          </dl>
        </div>

        <div>
          <div role="img" aria-label={`Growth over ${years} years: ${shortRupees(now.invested)} put in grows to about ${shortRupees(now.value)}`} className="flex h-48 items-end gap-0.5 border-b border-slate-200">
            {now.series.slice(1).map((p) => (
              <div
                key={p.year}
                className="group flex h-full flex-1 flex-col justify-end"
                title={`Year ${p.year}: ${shortRupees(p.invested)} put in, ${shortRupees(p.value - p.invested)} growth, ${shortRupees(p.value)} total`}
              >
                <div className="mx-auto flex w-full max-w-6 flex-col justify-end gap-0.5 transition-[height] duration-300" style={{ height: `${(p.value / top) * 100}%` }}>
                  <div className="w-full rounded-t-[4px]" style={{ height: `${((p.value - p.invested) / p.value) * 100}%`, background: GROWTH }} />
                  <div className="w-full flex-1" style={{ background: INVESTED }} />
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden className="mt-1.5 flex justify-between text-[11px] text-slate-500 tabular-nums">
            <span>Year 1</span>
            <span>Year {years}</span>
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900">See it year by year</summary>
            <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-sm tabular-nums">
                <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-medium">Year</th>
                    <th scope="col" className="px-3 py-2 font-medium">Invested</th>
                    <th scope="col" className="px-3 py-2 font-medium">Est. returns</th>
                    <th scope="col" className="px-3 py-2 font-medium">Est. value</th>
                  </tr>
                </thead>
                <tbody>
                  {now.series.slice(1).map((p) => (
                    <tr key={p.year} className="border-t border-slate-100">
                      <th scope="row" className="px-3 py-1.5 text-left font-medium text-slate-700">{p.year}</th>
                      <td className="px-3 py-1.5 text-slate-700">{rupees(p.invested)}</td>
                      <td className="px-3 py-1.5 text-slate-700">{rupees(p.value - p.invested)}</td>
                      <td className="px-3 py-1.5 font-semibold text-slate-900">{rupees(p.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="rounded-2xl bg-peach-100/70 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-semibold text-slate-900">The cost of waiting</p>
            <label htmlFor="sim-delay" className="text-sm text-slate-700">
              Start{" "}
              <select
                id="sim-delay"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900"
              >
                {[1, 2, 3, 5, 7, 10].filter((d) => d < years).map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "year" : "years"}
                  </option>
                ))}
              </select>{" "}
              later
            </label>
          </div>
          {years > delay ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              Starting {delay} {delay === 1 ? "year" : "years"} later, you&apos;d end up with about <span className="font-semibold">{shortRupees(later.value)}</span>{" "}
              <span className="font-semibold">{shortRupees(waitCost)} less</span>, though you&apos;d only have put in {shortRupees(investedLess)} less. That gap is what
              compounding does with time.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-700">Pick a longer time span to compare.</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-slate-800">Before you read too much into these numbers</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">
            <li>The returns here are hypothetical: one fixed rate you chose, compounded monthly, with money added at the start of each month.</li>
            <li>Actual market returns vary from year to year, and some years are negative.</li>
            <li>No return is guaranteed.</li>
            <li>This is an educational simulator, not personalised investment advice.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
