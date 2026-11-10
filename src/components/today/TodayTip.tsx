"use client";

import { useSyncExternalStore } from "react";
import { markAvatarEventsShown } from "@/actions/avatar";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { XIcon } from "@/components/ui/icons";

const listeners = new Set<() => void>();
const key = (day: string) => `rupli-tip-dismissed:${day}`;

function isDismissed(day: string) {
  try {
    return window.localStorage.getItem(key(day)) === "1";
  } catch {
    return false;
  }
}

/** The one buddy message on the app: small, in the page flow, gone for the day once dismissed. */
export function TodayTip({ day, text, expression, eventId, avatar }: { day: string; text: string; expression: Expression; eventId?: string; avatar: AvatarConfig }) {
  const hidden = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => isDismissed(day),
    () => true,
  );
  if (hidden) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(key(day), "1");
    } catch {
      /* private mode, fine */
    }
    listeners.forEach((listener) => listener());
    if (eventId) void markAvatarEventsShown([eventId]);
  }

  return (
    <aside aria-label="Tip from your buddy" className="flex animate-fade-up items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <Avatar config={avatar} expression={expression} crop="head" className="h-10 w-10 shrink-0" />
      <p className="min-w-0 flex-1 text-sm leading-snug font-medium text-slate-800">{text}</p>
      <button type="button" onClick={dismiss} aria-label="Dismiss tip for today" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
        <XIcon className="h-4 w-4" />
      </button>
    </aside>
  );
}
