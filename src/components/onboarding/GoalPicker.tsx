"use client";

import { LEARNING_GOALS } from "@/lib/learner-profile";
import { CardIcon, CheckIcon, ReceiptIcon, ShieldIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";

const ICONS: Record<string, (p: { className?: string }) => React.ReactNode> = {
  MANAGING_MONEY: WalletIcon,
  CREDIT: CardIcon,
  AVOIDING_SCAMS: ShieldIcon,
  SALARY_TAXES: ReceiptIcon,
  INVESTING: TrendingUpIcon,
};

/** Pick any number of learning goals. Used in onboarding and in Settings. */
export function GoalPicker({ value, onChange, compact = false }: { value: string[]; onChange: (goals: string[]) => void; compact?: boolean }) {
  return (
    <div role="group" aria-label="What you want to get better at" className={`grid gap-2.5 ${compact ? "sm:grid-cols-2" : ""}`}>
      {LEARNING_GOALS.map((goal) => {
        const selected = value.includes(goal.value);
        const Icon = ICONS[goal.value];
        return (
          <button
            key={goal.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onChange(selected ? value.filter((g) => g !== goal.value) : [...value, goal.value])}
            className={`group flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left font-medium transition duration-200 ease-out ${
              selected
                ? "border-brand-500 bg-brand-50 text-slate-900 ring-2 ring-brand-100"
                : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-brand-200"
            }`}
          >
            <span
              aria-hidden
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 group-hover:-rotate-6 ${selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">{goal.label}</span>
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors duration-200 ${selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}
            >
              {selected && <CheckIcon className="h-3.5 w-3.5 animate-check" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
