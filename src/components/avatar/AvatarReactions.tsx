"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { markAvatarEventsShown } from "@/actions/avatar";
import type { AvatarConfig } from "@/lib/avatar";
import type { PendingAvatarEvent } from "@/lib/avatar/events";
import { REACTIONS, pickLine } from "@/lib/avatar/reactions";
import { Burst } from "@/components/ui/Burst";
import { XIcon } from "@/components/ui/icons";
import { Avatar } from "./Avatar";

// The talking avatar: the student's own avatar pops in with a speech bubble
// when something real happens (events come from the server, one per real
// action, never twice). Rules:
//  • one at a time; milestones (priority 2) first, then important ones (1);
//    of ordinary ones (0) only the newest is shown, with a cooldown between;
//  • it waits while you're typing in a field, and while the tab is hidden;
//  • it sits in the corner, small, and clicks pass straight through it to
//    whatever is underneath (only its close button and link take clicks),
//    and disappears by itself after a few seconds — or when dismissed;
//  • switched off in Settings, nothing pops up at all;
//  • reduced motion: the global switch removes the animations.

const COOLDOWN_MS = 20_000;
const SHOW_FOR = [6_000, 8_000, 10_000];
const LAST_SHOWN = "avatar-last-shown";
const LAST_LINE = (kind: string) => `avatar-line:${kind}`;

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — fine */
  }
};

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
};

type Showing = { event: PendingAvatarEvent; text: string; title?: string };

export function AvatarReactions({ events, avatar, name, enabled }: { events: PendingAvatarEvent[]; avatar: AvatarConfig; name: string; enabled: boolean }) {
  const queue = useRef<PendingAvatarEvent[]>([]);
  const seen = useRef(new Set<string>());
  const [current, setCurrent] = useState<Showing | null>(null);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  // New events from the server (every navigation and refresh brings the latest).
  useEffect(() => {
    const fresh = events.filter((e) => !seen.current.has(e.id));
    if (fresh.length === 0) return;
    fresh.forEach((e) => seen.current.add(e.id));
    if (!enabled) {
      void markAvatarEventsShown(fresh.map((e) => e.id));
      return;
    }
    // Ordinary reactions don't pile up: keep only the newest one.
    const ordinary = fresh.filter((e) => e.priority === 0).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const skipped = ordinary.slice(1);
    if (skipped.length) void markAvatarEventsShown(skipped.map((e) => e.id));
    queue.current = [...queue.current.filter((e) => e.priority > 0), ...fresh.filter((e) => e.priority > 0), ...ordinary.slice(0, 1)].sort(
      (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt),
    );
  }, [events, enabled]);

  const showNext = useCallback(() => {
    const next = queue.current[0];
    if (!next || document.hidden || isTyping()) return false;
    const last = Number(read(LAST_SHOWN) ?? 0);
    if (next.priority === 0 && Date.now() - last < COOLDOWN_MS) {
      // Too soon for an ordinary one: drop it quietly rather than nag later.
      queue.current.shift();
      void markAvatarEventsShown([next.id]);
      return true;
    }
    queue.current.shift();
    const def = REACTIONS[next.kind];
    const lastLine = read(LAST_LINE(next.kind));
    const index = pickLine(next.kind, next.id, lastLine === null ? undefined : Number(lastLine));
    write(LAST_LINE(next.kind), String(index));
    write(LAST_SHOWN, String(Date.now()));
    setCurrent({ event: next, text: def.lines[index](name, next.data), title: def.title?.(next.data) });
    void markAvatarEventsShown([next.id]);
    return true;
  }, [name]);

  // Try to show the next one; if the student is typing, check again shortly.
  // (Runs after the effect above has queued any new events.)
  useEffect(() => {
    if (current || queue.current.length === 0) return;
    const id = window.setInterval(() => {
      if (showNext()) setTick((t) => t + 1);
    }, 1_200);
    const first = window.setTimeout(() => {
      if (showNext()) setTick((t) => t + 1);
    }, 700);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [current, tick, events, showNext]);

  // Auto-dismiss, paused while hovered or focused.
  useEffect(() => {
    if (!current || paused) return;
    const id = window.setTimeout(() => setCurrent(null), SHOW_FOR[current.event.priority] ?? SHOW_FOR[0]);
    return () => window.clearTimeout(id);
  }, [current, paused]);

  if (!current) return <div aria-live="polite" className="sr-only" />;
  const def = REACTIONS[current.event.kind];
  const major = current.event.priority === 2;

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 bottom-[76px] z-40 flex max-w-[calc(100vw-1.5rem)] items-end justify-end gap-2 sm:right-5 lg:bottom-5">
      <div
        role="status"
        className="pointer-events-none relative order-1 max-w-[17rem] animate-avatar-in rounded-2xl bg-white p-3 pr-8 text-[13px] leading-snug sm:p-3.5 sm:pr-9 sm:text-sm text-slate-800 shadow-[0_12px_32px_-12px_rgb(28_26_38/0.35)] ring-1 ring-slate-200 sm:max-w-xs"
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {current.title && <p className="mb-1 text-xs font-bold tracking-wide text-brand-700 uppercase">{current.title}</p>}
        <p className="font-medium">{current.text}</p>
        {(current.event.kind === "item-unlocked" || (current.event.kind === "badge" && current.event.data.item)) && (
          <Link href="/profile/avatar" className="pointer-events-auto mt-2 inline-block text-xs font-semibold text-brand-700 underline-offset-4 hover:underline">
            Open Avatar Studio
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCurrent(null)}
          aria-label="Dismiss"
          className="pointer-events-auto absolute top-2 right-2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <XIcon className="h-4 w-4" />
        </button>
        {/* the bubble's pointer, towards the avatar */}
        <span aria-hidden className="absolute -right-1.5 bottom-6 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_0)]" />
      </div>
      <div className={`relative order-2 shrink-0 ${major ? "animate-hop" : "animate-avatar-in"}`}>
        {major && <Burst />}
        <Avatar config={avatar} expression={def.expression} className="h-16 w-auto drop-shadow-[0_8px_12px_rgb(28_26_38/0.18)] sm:h-28" label={`${name}'s avatar`} />
      </div>
    </div>
  );
}
