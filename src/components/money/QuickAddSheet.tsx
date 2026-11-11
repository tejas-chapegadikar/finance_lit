"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addMoneyEntry, markNoSpendDay } from "@/actions/money";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, rupees } from "@/lib/money/categories";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/topic-icons";
import { PlusIcon, XIcon } from "@/components/ui/icons";
import { primaryButton } from "@/components/ui/button-styles";
import { guideSay } from "@/lib/guide/bus";

const OPEN_EVENT = "rupli:quick-add";
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

/** Opens the Quick add sheet from anywhere on the page (e.g. a quest's button). */
export function openQuickAdd() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function QuickAddButton({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <button type="button" onClick={openQuickAdd} className={className}>
      {children}
    </button>
  );
}

/** The floating + button and its bottom sheet: I spent / I got money, how much, what for, Save. */
export function QuickAddSheet({ today, minDay, startOpen = false, canNoSpend }: { today: string; minDay: string; startOpen?: boolean; canNoSpend: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [kind, setKind] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const categories = kind === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  // While open: focus the amount, keep Tab inside, Esc closes, the page behind stays still.
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLInputElement>("#quick-amount")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>("button, input, summary, select")].filter((el) => !el.matches(":disabled") && el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      opener.current?.focus();
    };
  }, [open]);

  function switchKind(next: "EXPENSE" | "INCOME") {
    setKind(next);
    setCategory(next === "EXPENSE" ? "food" : "pocket-money");
    setError(null);
  }

  function finish() {
    setOpen(false);
    setAmount("");
    setNote("");
    setDay(today);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await addMoneyEntry({ kind, amount, category, note, day });
        if (result.status === "invalid") return setError(result.message);
        if (result.status === "slow-down") return setError(SLOW_DOWN_MESSAGE);
        const label = categories.find((c) => c.id === category)?.label ?? "Entry";
        toast.success(result.questXp > 0 ? `+${result.questXp} XP` : "Saved", { description: `${rupees(Number(amount))} · ${label}` });
        if (result.alert) toast.warning(result.alert);
        finish();
        if (kind === "EXPENSE") {
          const { AFTER } = await import("@/content/avatar-lines");
          guideSay({ kind: "after", text: AFTER.expense.text, expression: "happy", action: { label: AFTER.expense.button, target: "money-chart" } });
        }
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
        guideSay({ kind: "error", text: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  function noSpend() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await markNoSpendDay();
        if (result.status === "checked-in") {
          toast.success(`+${result.checkInXp} XP`, { description: "No-spend day. Your wallet is sending flowers." });
          finish();
        }
        if (result.status === "already") setError("You've already checked in today.");
        if (result.status === "has-spends") setError("You've logged spends today, so that's not a no-spend day.");
        if (result.status === "slow-down") setError(SLOW_DOWN_MESSAGE);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          opener.current = e.currentTarget;
          setOpen(true);
        }}
        aria-label="Quick add money"
        data-guide="money-add"
        className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-brand-900 shadow-[0_10px_24px_-8px_rgb(15_31_24/0.55)] transition hover:scale-105 lg:right-8 lg:bottom-8"
      >
        <PlusIcon className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button type="button" tabIndex={-1} aria-label="Close" onClick={() => setOpen(false)} className="sheet-backdrop absolute inset-0 bg-slate-950/50" />
          <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="quick-add-title" className="sheet-up relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 id="quick-add-title" className="text-xl text-slate-900">
                Quick add
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close quick add" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={save} className="mt-3 flex flex-col gap-4">
              <div role="radiogroup" aria-label="Money in or out" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    ["EXPENSE", "I spent"],
                    ["INCOME", "I got money"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={kind === value}
                    onClick={() => switchKind(value)}
                    className={`min-h-11 rounded-lg text-sm transition ${kind === value ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-slate-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="quick-amount" className="text-sm font-medium text-slate-700">
                  Amount
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3.5 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-200">
                  <span aria-hidden className="font-display text-2xl text-slate-500">
                    ₹
                  </span>
                  <input
                    id="quick-amount"
                    inputMode="numeric"
                    autoComplete="off"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                    placeholder="0"
                    className="w-full bg-transparent px-2 py-2.5 font-display text-2xl text-slate-900 outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-slate-700">{kind === "EXPENSE" ? "What was it?" : "Where's it from?"}</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={c.id === category}
                      onClick={() => setCategory(c.id)}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition ${c.id === category ? "border-slate-900 bg-slate-900 font-semibold text-white" : "border-slate-200 bg-white font-medium text-slate-700"}`}
                    >
                      <CategoryIcon id={c.id} className="h-4 w-4" />
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Add a note or change the date</summary>
                <div className="mt-2 flex flex-col gap-3">
                  <div>
                    <label htmlFor="quick-note" className="text-sm font-medium text-slate-700">
                      Note
                    </label>
                    <input id="quick-note" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="quick-day" className="text-sm font-medium text-slate-700">
                      Date
                    </label>
                    <input id="quick-day" type="date" value={day} min={minDay} max={today} onChange={(e) => setDay(e.target.value || today)} className={fieldClass} />
                  </div>
                  {canNoSpend && (
                    <button type="button" onClick={noSpend} disabled={isPending} className="self-start text-sm font-semibold text-brand-700 underline underline-offset-2">
                      I spent nothing today
                    </button>
                  )}
                </div>
              </details>
              {error && (
                <p role="alert" className="text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}
              <button type="submit" disabled={isPending || !amount} className={`${primaryButton} w-full py-3.5 text-base`}>
                {isPending ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
