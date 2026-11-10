"use client";

import { useState, useTransition } from "react";
import { updateMoneyEntry } from "@/actions/money";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, rupees } from "@/lib/money/categories";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/topic-icons";
import { PencilIcon } from "@/components/ui/icons";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { DeleteEntryButton } from "./Goals";

export type EntryView = { id: string; kind: "INCOME" | "EXPENSE"; amount: number; category: string; note: string | null; day: string };

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/** One transaction in the history: shown as a row, edited in place. */
export function EntryRow({ entry, label, dayText, today, minDay }: { entry: EntryView; label: string; dayText: string; today: string; minDay: string }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(entry.amount));
  const [category, setCategory] = useState(entry.category);
  const [note, setNote] = useState(entry.note ?? "");
  const [day, setDay] = useState(entry.day);
  const [message, setMessage] = useState<{ tone: "ok" | "error" | "warn"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const categories = entry.kind === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateMoneyEntry(entry.id, { kind: entry.kind, amount, category, note, day });
        if (result.status === "invalid") return setMessage({ tone: "error", text: result.message });
        if (result.status === "slow-down") return setMessage({ tone: "error", text: SLOW_DOWN_MESSAGE });
        if (result.status === "not-found") return setMessage({ tone: "error", text: "This entry no longer exists." });
        setEditing(false);
        setMessage(result.alert ? { tone: "warn", text: result.alert } : { tone: "ok", text: "Saved." });
      } catch {
        setMessage({ tone: "error", text: GENERIC_ERROR_MESSAGE });
      }
    });
  }

  const tone = message?.tone === "error" ? "text-rose-700" : message?.tone === "warn" ? "text-orange-800" : "text-emerald-800";

  return (
    <li className="py-3 text-sm">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${entry.kind === "INCOME" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
          <CategoryIcon id={entry.category} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-slate-900">{entry.note || label}</span>
          <span className="text-xs text-slate-500">
            {label} · {dayText}
          </span>
        </span>
        <span className={`shrink-0 font-semibold tabular-nums ${entry.kind === "INCOME" ? "text-emerald-700" : "text-slate-900"}`}>
          {entry.kind === "INCOME" ? "+" : "−"}
          {rupees(entry.amount)}
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing((v) => !v);
            setMessage(null);
          }}
          aria-expanded={editing}
          aria-label={`Edit ${label} ${rupees(entry.amount)}`}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <DeleteEntryButton id={entry.id} label={`${label} ${rupees(entry.amount)}`} />
      </div>

      {editing && (
        <form onSubmit={save} className="mt-3 grid animate-fade-up gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2" aria-label={`Edit ${label}`}>
          <div>
            <label htmlFor={`edit-amount-${entry.id}`} className="text-xs font-medium text-slate-700">
              Amount (₹)
            </label>
            <input
              id={`edit-amount-${entry.id}`}
              inputMode="numeric"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
              className={`${fieldClass} mt-1`}
            />
          </div>
          <div>
            <label htmlFor={`edit-category-${entry.id}`} className="text-xs font-medium text-slate-700">
              Category
            </label>
            <select id={`edit-category-${entry.id}`} value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldClass} mt-1`}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`edit-note-${entry.id}`} className="text-xs font-medium text-slate-700">
              Note
            </label>
            <input id={`edit-note-${entry.id}`} value={note} maxLength={80} onChange={(e) => setNote(e.target.value)} className={`${fieldClass} mt-1`} />
          </div>
          <div>
            <label htmlFor={`edit-day-${entry.id}`} className="text-xs font-medium text-slate-700">
              Date
            </label>
            <input id={`edit-day-${entry.id}`} type="date" value={day} min={minDay} max={today} onChange={(e) => setDay(e.target.value || entry.day)} className={`${fieldClass} mt-1`} />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" disabled={isPending || !amount} className={primaryButton}>
              {isPending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={isPending} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={`mt-2 text-sm font-medium ${tone}`}>
          {message.text}
        </p>
      )}
    </li>
  );
}
