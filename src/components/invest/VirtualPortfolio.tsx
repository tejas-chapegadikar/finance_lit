"use client";

import { useState, useTransition } from "react";
import { fastForward, investVirtual, resetPortfolio, sellVirtual, type PortfolioResult } from "@/actions/portfolio";
import { ASSETS, FAST_FORWARD, MIN_TRADE, START_CASH, findAsset, type AssetId } from "@/lib/invest/sim";
import type { PortfolioView } from "@/lib/invest/portfolio";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const signed = (f: number) => `${f >= 0 ? "+" : "−"}${Math.abs(f * 100).toFixed(1)}%`;
const RISK_TONE: Record<string, string> = {
  None: "bg-slate-100 text-slate-700",
  Low: "bg-emerald-50 text-emerald-800",
  Medium: "bg-amber-50 text-amber-800",
  High: "bg-orange-50 text-orange-800",
  "Very high": "bg-rose-50 text-rose-800",
};
const jumpLabel = (m: number) => (m === 1 ? "1 month" : m === 12 ? "1 year" : m === 60 ? "5 years" : `${m} months`);
const monthsLabel = (m: number) => (m === 0 ? "Day one" : m < 12 ? `${m} month${m === 1 ? "" : "s"} in` : `${Math.floor(m / 12)} yr${m >= 24 ? "s" : ""}${m % 12 ? ` ${m % 12} mo` : ""} in`);

/** The portfolio's total over simulated time — one series, so no legend; hover titles and a table. */
function ValueChart({ history }: { history: PortfolioView["history"] }) {
  if (history.length < 2) return <p className="text-sm text-slate-500">Invest something, then fast-forward — your portfolio&apos;s value over time appears here.</p>;
  const W = 600;
  const H = 180;
  const P = 10;
  const values = history.map((h) => h.total);
  const min = Math.min(START_CASH, ...values) * 0.97;
  const max = Math.max(START_CASH, ...values) * 1.03;
  const x = (i: number) => P + (i * (W - 2 * P)) / (history.length - 1);
  const y = (v: number) => P + (1 - (v - min) / (max - min)) * (H - 2 * P);
  const line = history.map((h, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(h.total).toFixed(1)}`).join(" ");
  const up = values.at(-1)! >= START_CASH;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Portfolio value over ${history.at(-1)!.month} simulated months: from ${inr(START_CASH)} to ${inr(values.at(-1)!)}`}>
        <defs>
          <linearGradient id="pf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={P} x2={W - P} y1={y(START_CASH)} y2={y(START_CASH)} stroke="var(--color-slate-300)" strokeDasharray="4 4" />
        <path d={`${line} L${x(history.length - 1)} ${H - P} L${x(0)} ${H - P} Z`} fill="url(#pf-area)" />
        <path d={line} fill="none" stroke={up ? "var(--color-brand-600)" : "#d03b3b"} strokeWidth={2.2} strokeLinejoin="round" />
        {history.length <= 80 &&
          history.map((h, i) => (
            <g key={h.month}>
              <title>{`${monthsLabel(h.month)}: ${inr(h.total)}`}</title>
              <rect x={x(i) - 6} y={0} width={12} height={H} fill="transparent" />
            </g>
          ))}
      </svg>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <span aria-hidden className="inline-block w-4 border-t border-dashed border-slate-400" /> What you started with ({inr(START_CASH)})
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-brand-700">Show as a table</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full max-w-xs text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th scope="col" className="py-1 font-medium">When</th>
                <th scope="col" className="py-1 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr key={h.month}>
                  <td className="py-1 text-slate-700">{monthsLabel(h.month)}</td>
                  <td className="py-1 text-right font-medium text-slate-900 tabular-nums">{inr(h.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function VirtualPortfolio({ portfolio }: { portfolio: PortfolioView }) {
  const [asset, setAsset] = useState<AssetId>("nifty");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const invested = portfolio.holdings.reduce((s, h) => s + h.value, 0);

  function run(action: () => Promise<PortfolioResult>, done: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.status === "invalid") setMessage({ tone: "error", text: result.message });
        else if (result.status === "slow-down") setMessage({ tone: "error", text: SLOW_DOWN_MESSAGE });
        else setMessage({ tone: "ok", text: done });
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" className={`${card} scroll-mt-20 p-5 sm:p-7`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">Virtual money · {monthsLabel(portfolio.month)}</p>
          <h2 id="portfolio-heading" className="text-2xl text-slate-900">
            Your virtual portfolio
          </h2>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("Start over with virtual ₹1,00,000? Your current portfolio and its history will be cleared.")) run(resetPortfolio, "Fresh start: ₹1,00,000 of virtual money.");
          }}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Start over
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total value", value: inr(portfolio.total), tone: "text-slate-900" },
          { label: "Since you started", value: signed(portfolio.sinceStart), tone: portfolio.sinceStart >= 0 ? "text-emerald-700" : "text-rose-700" },
          { label: "Invested", value: inr(invested), tone: "text-slate-900" },
          { label: "Virtual cash", value: inr(portfolio.cash), tone: "text-slate-900" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-50 px-3.5 py-3">
            <dt className="text-xs text-slate-500">{s.label}</dt>
            <dd className={`mt-0.5 font-display text-xl font-bold tabular-nums ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Invest */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => investVirtual({ asset, amount }), `Invested ${inr(Number(amount))} in ${findAsset(asset)?.name}.`);
            setAmount("");
          }}
        >
          <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Invest virtual money</h3>
          <fieldset className="mt-3">
            <legend className="sr-only">What to invest in</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ASSETS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={asset === a.id}
                  onClick={() => setAsset(a.id)}
                  className={`rounded-xl border p-3 text-left transition ${asset === a.id ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{a.name}</span>
                    <span className={`rounded-full px-2 py-px text-[10px] font-bold ${RISK_TONE[a.risk]}`}>{a.risk} risk</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">{a.blurb}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">Assumed ~{Math.round(a.mu * 1000) / 10}% a year</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="pf-amount" className="mt-4 block text-sm font-medium text-slate-700">
            Amount (virtual ₹)
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="pf-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
              placeholder={String(MIN_TRADE * 10)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {[0.25, 0.5].map((f) => (
              <button key={f} type="button" onClick={() => setAmount(String(Math.floor((portfolio.cash * f) / 100) * 100))} className={`${secondaryButton} px-3`}>
                {f * 100}%
              </button>
            ))}
          </div>
          <button type="submit" disabled={isPending || !amount} className={`${primaryButton} mt-3 w-full`}>
            {isPending ? "Working…" : `Invest in ${findAsset(asset)?.name}`}
          </button>
        </form>

        {/* Holdings + fast-forward */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Fast-forward time</h3>
            <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Fast-forward">
              {FAST_FORWARD.map((m) => (
                <button key={m} type="button" disabled={isPending} onClick={() => run(() => fastForward(m), `Fast-forwarded ${jumpLabel(m)}.`)} className={`${secondaryButton} px-2 text-xs sm:text-sm`}>
                  +{jumpLabel(m)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Your holdings</h3>
            {portfolio.holdings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Nothing invested yet. Pick an option and put some virtual money in.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {portfolio.holdings.map((h) => {
                  const a = findAsset(h.asset)!;
                  const ret = h.invested > 0 ? h.value / h.invested - 1 : 0;
                  return (
                    <li key={h.asset} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">{a.name}</span>
                        <span className="text-xs text-slate-500 tabular-nums">Put in {inr(h.invested)}</span>
                      </span>
                      <span className="text-right tabular-nums">
                        <span className="block font-semibold text-slate-900">{inr(h.value)}</span>
                        <span className={`text-xs font-semibold ${ret >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{signed(ret)}</span>
                      </span>
                      <span className="flex gap-1">
                        <button type="button" disabled={isPending} onClick={() => run(() => sellVirtual({ asset: h.asset, amount: Math.floor(h.value / 2) }), `Sold half of ${a.name}.`)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                          Sell half
                        </button>
                        <button type="button" disabled={isPending} onClick={() => run(() => sellVirtual({ asset: h.asset, amount: "all" }), `Sold all of ${a.name}.`)} className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                          Sell all
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={`mt-4 text-sm font-medium ${message.tone === "error" ? "text-rose-700" : "text-emerald-800"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Value over time</h3>
        <div className="mt-3">
          <ValueChart history={portfolio.history} />
        </div>
      </div>

      <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
        A simulation with virtual money only. Returns are generated from assumed long-run rates with realistic ups and downs — not real market data, not a
        prediction, and not investment advice. Real investments can lose money.
      </p>
    </section>
  );
}
