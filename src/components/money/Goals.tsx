"use client";

import { useState, useTransition } from "react";
import { addToSavingsGoal, createSavingsGoal, deleteSavingsGoal, deleteMoneyEntry } from "@/actions/money";
import { GOAL_ICONS, rupees, type GoalIconKey } from "@/lib/money/categories";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { GoalIcon } from "@/components/ui/topic-icons";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { Burst } from "@/components/ui/Burst";
import { CheckIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { primaryButton, secondaryButton } from "@/components/ui/button-styles";

export type GoalView = { id: string; name: string; icon: string; target: number; saved: number; targetDay: string | null; completed: boolean; today: string };

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

const GOAL_LABELS: Record<GoalIconKey, string> = {
  phone: "Phone",
  laptop: "Laptop",
  travel: "Trip",
  clothes: "Clothes",
  study: "Course",
  emergency: "Emergency fund",
  gift: "Gift",
  home: "Home stuff",
  target: "Something else",
};

const formatDay = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** “About ₹X a month to get there on time”, from the amount left and the target date. */
function perMonthHint(left: number, targetDay: string, today: string) {
  const days = Math.round((Date.parse(`${targetDay}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 864e5);
  if (days <= 0) return "The target date has passed. Pick a new one or keep going.";
  const months = Math.max(1, Math.round(days / 30.4));
  return months <= 1 ? `About ${rupees(left)} more in the next ${days} days` : `About ${rupees(Math.ceil(left / months))} a month to get there on time`;
}

/** One savings goal: progress, add or take out money, remove it. */
export function GoalCard({ goal }: { goal: GoalView }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [isPending, startTransition] = useTransition();

  function move(sign: 1 | -1) {
    const value = Number(amount);
    if (!value) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await addToSavingsGoal(goal.id, sign * value);
        if (result.status === "saved") {
          setAmount("");
          if (result.justCompleted) {
            setCelebrate(true);
            setMessage(
              result.goalXp
                ? `Goal reached! +${result.goalXp} XP. Treat yourself, responsibly.`
                : "Goal reached! Treat yourself, responsibly. (Goal XP goes to goals of ₹500+ that are a week old, one a month.)",
            );
          } else {
            setMessage(sign > 0 ? `${rupees(value)} saved. Future you is impressed.` : `${rupees(value)} taken out.`);
          }
        }
        if (result.status === "invalid") setMessage(result.message);
        if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function remove() {
    if (!window.confirm(`Remove the goal “${goal.name}”? Its history goes too.`)) return;
    startTransition(async () => {
      try {
        await deleteSavingsGoal(goal.id);
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  const left = Math.max(0, goal.target - goal.saved);
  return (
    <li className={`relative flex flex-col rounded-2xl border bg-white p-5 ${goal.completed ? "border-emerald-200" : "border-slate-200"}`}>
      {celebrate && <Burst />}
      <div className="flex items-start gap-4">
        <ProgressRing value={goal.saved} max={goal.target} label={`${goal.name} progress`} size={64} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
            <GoalIcon icon={goal.icon} className="h-4 w-4" />
            {goal.completed ? "Reached" : goal.targetDay ? `By ${formatDay(goal.targetDay)}` : "Savings goal"}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-lg leading-snug text-slate-900">{goal.name}</h3>
          <p className="text-sm text-slate-600 tabular-nums">
            <span className="font-semibold text-slate-900">{rupees(goal.saved)}</span> of {rupees(goal.target)}
            {!goal.completed && left > 0 && <span className="text-slate-500"> · {rupees(left)} to go</span>}
          </p>
          {!goal.completed && left > 0 && goal.targetDay && <p className="mt-0.5 text-xs text-slate-500">{perMonthHint(left, goal.targetDay, goal.today)}</p>}
        </div>
        <button type="button" onClick={remove} disabled={isPending} aria-label={`Remove ${goal.name}`} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
      {goal.completed ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <CheckIcon className="h-4 w-4" /> Goal reached
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <label htmlFor={`goal-amount-${goal.id}`} className="sr-only">
            Amount for {goal.name}
          </label>
          <span className="flex min-w-0 flex-1 items-center rounded-xl border border-slate-200 px-3 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <span aria-hidden className="text-slate-500">
              ₹
            </span>
            <input
              id={`goal-amount-${goal.id}`}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
              placeholder="Amount"
              className="w-full bg-transparent px-1.5 py-2 text-sm text-slate-900 outline-none"
            />
          </span>
          <button type="button" onClick={() => move(1)} disabled={isPending || !amount} className={`${primaryButton} px-3.5`}>
            <PlusIcon className="h-4 w-4" /> Save
          </button>
          <button type="button" onClick={() => move(-1)} disabled={isPending || !amount || goal.saved === 0} aria-label={`Take money out of ${goal.name}`} className={`${secondaryButton} px-3`}>
            <MinusIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="mt-2 animate-fade-up text-sm font-medium text-slate-700">
          {message}
        </p>
      )}
    </li>
  );
}

/** Creates a savings goal. */
export function NewGoalForm({ today, empty = false }: { today: string; empty?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<GoalIconKey>("target");
  const [target, setTarget] = useState("");
  const [targetDay, setTargetDay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createSavingsGoal({ name, icon, target, targetDay });
        if (result.status === "created") {
          setOpen(false);
          setName("");
          setTarget("");
          setTargetDay("");
        }
        if (result.status === "invalid") setError(result.message);
        if (result.status === "slow-down") setError(SLOW_DOWN_MESSAGE);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  if (!open && empty) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="font-display text-lg font-bold text-slate-900">No savings goal yet</p>
        <p className="text-sm text-slate-600">Money without a job goes on food delivery. Give it one.</p>
        <button type="button" onClick={() => setOpen(true)} className={`${primaryButton} mt-2 py-3`}>
          Create a goal
        </button>
        <p className="text-xs font-semibold text-orange-700">+50 XP when you reach a goal of ₹500 or more</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white">
        <PlusIcon className="h-5 w-5" />
        New savings goal
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex animate-fade-up flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <label htmlFor="goal-name" className="text-sm font-medium text-slate-700">
          What are you saving for?
        </label>
        <input id="goal-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa trip with the gang" className={`${fieldClass} mt-1.5`} />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Pick an icon</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {GOAL_ICONS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={icon === key}
              aria-label={GOAL_LABELS[key]}
              title={GOAL_LABELS[key]}
              onClick={() => setIcon(key)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${icon === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              <GoalIcon icon={key} className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="goal-target" className="text-sm font-medium text-slate-700">
            Target (₹)
          </label>
          <input id="goal-target" required inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, "").slice(0, 8))} placeholder="5000" className={`${fieldClass} mt-1.5`} />
        </div>
        <div>
          <label htmlFor="goal-day" className="text-sm font-medium text-slate-700">
            By <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input id="goal-day" type="date" min={today} value={targetDay} onChange={(e) => setTargetDay(e.target.value)} className={`${fieldClass} mt-1.5`} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isPending} className={primaryButton}>
          {isPending ? "Creating…" : "Create goal"}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={isPending} className={secondaryButton}>
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </form>
  );
}

/** Deletes one Money Manager entry, after a quick confirm. */
export function DeleteEntryButton({ id, label }: { id: string; label: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (!window.confirm(`Delete ${label}?`)) return;
        startTransition(async () => {
          await deleteMoneyEntry(id);
        });
      }}
      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
