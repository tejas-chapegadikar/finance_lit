"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateReminders } from "@/actions/profile";
import { primaryButton, softButton } from "@/components/ui/button-styles";

const inputClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500";

/** Daily reminder settings: an optional email at a chosen time, or a reminder in the student's own calendar. */
export function ReminderForm({
  enabled,
  hour,
  hours,
  emailReady,
}: {
  enabled: boolean;
  hour: number;
  hours: { value: number; label: string }[];
  emailReady: boolean;
}) {
  const [state, formAction, isPending] = useActionState(updateReminders, {});
  const [chosenHour, setChosenHour] = useState(hour);

  useEffect(() => {
    if (state.success) toast.success("Reminder settings saved");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-5 w-5 accent-brand-600" />
        Email me a daily reminder
      </label>
      <div className="flex flex-col gap-1.5 sm:max-w-xs">
        <label htmlFor="reminder-hour" className="text-sm font-semibold text-slate-700">
          Reminder time (IST)
        </label>
        <select
          id="reminder-hour"
          name="hour"
          value={chosenHour}
          onChange={(e) => setChosenHour(Number(e.target.value))}
          className={inputClass}
        >
          {hours.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
      </div>
      {!emailReady && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
          Email reminders aren&apos;t switched on for StockStreak yet — your choice is saved for when they are. A calendar
          reminder works right now.
        </p>
      )}
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-rose-700">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isPending} className={primaryButton}>
          {isPending ? "Saving…" : "Save reminder"}
        </button>
        <a href={`/api/reminder-calendar?hour=${chosenHour}`} className={softButton}>
          📅 Add to my calendar
        </a>
      </div>
      <p className="text-xs text-slate-600">
        Reminders are optional — you can turn them off here any time. The calendar file just adds a daily event to your
        own calendar app.
      </p>
    </form>
  );
}
