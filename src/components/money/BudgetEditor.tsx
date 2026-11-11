"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveBudgets } from "@/actions/money";
import { EXPENSE_CATEGORIES } from "@/lib/money/categories";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/topic-icons";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { AvatarEmpty } from "@/components/guide/AvatarEmpty";
import { EMPTY, ERRORS, pick } from "@/content/buddy-messages";
import { guideSay } from "@/lib/guide/bus";

const fieldClass =
  "w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right text-sm text-slate-900 tabular-nums outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/** This month's budgets: an overall cap and optional per-category limits. Empty = no budget. */
export function BudgetEditor({ budgets, monthLabel }: { budgets: Record<string, number>; monthLabel: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(["total", ...EXPENSE_CATEGORIES.map((c) => c.id)].map((id) => [id, budgets[id] ? String(budgets[id]) : ""])),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v.replace(/[^\d]/g, "").slice(0, 7) }));

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveBudgets(Object.entries(values).map(([category, amount]) => ({ category, amount: amount === "" ? null : amount })));
        if (result.status === "saved") {
          setMessage("Budgets saved. Now the fun part: sticking to them.");
          if (result.xp > 0) toast.success(`+${result.xp} XP`, { description: "First budget set" });
          setOpen(false);
        }
        if (result.status === "invalid") setMessage(result.message);
        if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
        guideSay({ kind: "error", text: pick(ERRORS, Date.now() / 1000) });
      }
    });
  }

  if (!open && Object.keys(budgets).length === 0) {
    return (
      <AvatarEmpty text={EMPTY.budget.lines[0]}>
        <button type="button" onClick={() => setOpen(true)} className={`${primaryButton} py-3`}>
          {EMPTY.budget.button}
        </button>
        <p className="text-xs font-semibold text-orange-700">+10 XP, first time</p>
      </AvatarEmpty>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen(true)} className={secondaryButton}>
          {Object.keys(budgets).length ? "Edit budgets" : "Set budgets"}
        </button>
        {message && (
          <p role="status" className="text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">Budgets for {monthLabel}. Leave a box empty for no limit.</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <label htmlFor="budget-total" className="font-semibold text-slate-900">
          Whole month
        </label>
        <span className="flex items-center gap-1.5 text-slate-500">
          ₹
          <input
            id="budget-total"
            inputMode="numeric"
            value={values.total}
            onChange={(e) => set("total", e.target.value)}
            className={fieldClass}
            placeholder="-"
          />
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {EXPENSE_CATEGORIES.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <label htmlFor={`budget-${c.id}`} className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-800">
              <CategoryIcon id={c.id} className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">{c.label}</span>
            </label>
            <span className="flex items-center gap-1.5 text-slate-500">
              ₹
              <input
                id={`budget-${c.id}`}
                inputMode="numeric"
                value={values[c.id]}
                onChange={(e) => set(c.id, e.target.value)}
                className={fieldClass}
                placeholder="-"
              />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={isPending} className={primaryButton}>
          {isPending ? "Saving…" : "Save budgets"}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={isPending} className={secondaryButton}>
          Cancel
        </button>
      </div>
      {message && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
          {message}
        </p>
      )}
    </div>
  );
}
