import Link from "next/link";
import type { Insight } from "@/lib/money";
import type { MoneyFact } from "@/lib/money-facts";
import { AlertIcon, ArrowRightIcon, CheckIcon, GaugeIcon, SparklesIcon } from "@/components/ui/icons";

const TONE = {
  good: { Icon: CheckIcon, tile: "bg-emerald-50 text-emerald-700" },
  warn: { Icon: AlertIcon, tile: "bg-orange-50 text-orange-700" },
  info: { Icon: SparklesIcon, tile: "bg-brand-50 text-brand-700" },
};

/** What the numbers are saying — a short list, most useful first. */
export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="divide-y divide-slate-200 border-y border-slate-200">
      {insights.map((insight, i) => {
        const { Icon, tile } = TONE[insight.tone];
        return (
          <li key={insight.id} className="flex animate-fade-up gap-3 py-4" style={{ animationDelay: `${i * 60}ms` }}>
            <span aria-hidden className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-snug text-slate-900">{insight.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{insight.text}</p>
              {insight.href && insight.cta && (
                <Link href={insight.href} className="group mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {insight.cta}
                  <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Today's money fact — a short, true thing worth knowing (or one about your own numbers). */
export function MoneyFactCard({ fact: check, compact = false }: { fact: MoneyFact; compact?: boolean }) {
  return (
    <section aria-labelledby="fact-heading" className={`rounded-2xl bg-peach-100/70 ${compact ? "p-5" : "p-5 sm:p-6"}`}>
      <p id="fact-heading" className="flex items-center gap-1.5 text-[13px] font-semibold text-orange-800">
        <GaugeIcon className="h-4 w-4" /> {check.id.startsWith("personal") ? "Your numbers, honestly" : "Money fact of the day"}
      </p>
      <p className={`mt-2 font-display leading-snug text-slate-900 ${compact ? "text-lg" : "text-xl"}`}>{check.text}</p>
      {check.source && <p className="mt-1.5 text-xs text-slate-600">{check.source}</p>}
      {check.href && check.cta && (
        <Link href={check.href} className="group mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
          {check.cta}
          <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </section>
  );
}
