"use client";

import { useState, useTransition } from "react";
import { addMoneyEntry, markNoSpendDay } from "@/actions/money";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, rupees } from "@/lib/money/categories";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/topic-icons";
import { CheckIcon } from "@/components/ui/icons";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/**
 * The fastest way to log money: spent or got, how much, what for, when.
 * Logging something dated today is also today's money check-in.
 */
export function QuickAdd({ today, minDay, checkedInToday, spentToday }: { today: string; minDay: string; checkedInToday: boolean; spentToday: boolean }) {
  const [kind, setKind] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(today);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const categories = kind === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function switchKind(next: "EXPENSE" | "INCOME") {
    setKind(next);
    setCategory(next === "EXPENSE" ? "food" : "pocket-money");
    setMessage(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setAlert(null);
    startTransition(async () => {
      try {
        const result = await addMoneyEntry({ kind, amount, category, note, day });
        if (result.status === "invalid") return setMessage({ tone: "error", text: result.message });
        if (result.status === "slow-down") return setMessage({ tone: "error", text: SLOW_DOWN_MESSAGE });
        const label = categories.find((c) => c.id === category)?.label ?? "Entry";
        setMessage({
          tone: "ok",
          text: `${kind === "EXPENSE" ? "Logged" : "Added"} ${rupees(Number(amount))} · ${label}.${result.checkInXp ? ` Checked in for today · +${result.checkInXp} XP` : ""}`,
        });
        setAlert(result.alert);
        setAmount("");
        setNote("");
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  function noSpend() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await markNoSpendDay();
        if (result.status === "checked-in") setMessage({ tone: "ok", text: `No-spend day logged. Your wallet is sending flowers · +${result.checkInXp} XP` });
        if (result.status === "already") setMessage({ tone: "ok", text: "You've already checked in today." });
        if (result.status === "has-spends") setMessage({ tone: "error", text: "You've logged spends today, so it's not a no-spend day — and that's fine." });
        if (result.status === "slow-down") setMessage({ tone: "error", text: SLOW_DOWN_MESSAGE });
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  return (
    <section aria-labelledby="add-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="add-heading" className="text-xl text-slate-900">
          Log money
        </h2>
        {checkedInToday ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckIcon className="h-3.5 w-3.5" /> Checked in today
          </span>
        ) : (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">Today&apos;s check-in: not yet</span>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
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
              className={`rounded-lg py-2 text-sm transition ${kind === value ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-slate-600 hover:text-slate-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="money-amount" className="text-sm font-medium text-slate-700">
            Amount
          </label>
          <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <span aria-hidden className="font-display text-2xl text-slate-400">
              ₹
            </span>
            <input
              id="money-amount"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              required
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
            {categories.map((c) => {
              const on = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCategory(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition active:scale-[0.97] ${
                    on ? "border-slate-900 bg-slate-900 font-semibold text-white" : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <CategoryIcon id={c.id} className="h-4 w-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <div>
            <label htmlFor="money-note" className="text-sm font-medium text-slate-700">
              Note <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input id="money-note" value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Birthday treat for Aman" className={`${fieldClass} mt-1.5`} />
          </div>
          <div>
            <label htmlFor="money-day" className="text-sm font-medium text-slate-700">
              Date
            </label>
            <input id="money-day" type="date" value={day} min={minDay} max={today} onChange={(e) => setDay(e.target.value || today)} className={`${fieldClass} mt-1.5`} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={isPending || !amount} className={primaryButton}>
            {isPending ? "Saving…" : kind === "EXPENSE" ? "Add expense" : "Add income"}
          </button>
          {!checkedInToday && !spentToday && (
            <button type="button" onClick={noSpend} disabled={isPending} className={secondaryButton}>
              I spent nothing today
            </button>
          )}
        </div>
        {message && (
          <p role="status" className={`animate-fade-up text-sm font-medium ${message.tone === "ok" ? "text-emerald-800" : "text-rose-700"}`}>
            {message.text}
          </p>
        )}
        {alert && (
          <p role="alert" className="animate-fade-up rounded-xl bg-orange-50 px-3.5 py-2.5 text-sm font-medium text-orange-900 ring-1 ring-orange-100">
            {alert}
          </p>
        )}
      </form>
    </section>
  );
}
