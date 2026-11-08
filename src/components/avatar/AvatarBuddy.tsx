"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { markAvatarEventsShown } from "@/actions/avatar";
import type { AvatarConfig } from "@/lib/avatar";
import type { PendingAvatarEvent } from "@/lib/avatar/events";
import { REACTIONS, pickLine } from "@/lib/avatar/reactions";
import { POKE_LINES, contextLinesFor, fillName } from "@/lib/avatar/context-lines";
import { Burst } from "@/components/ui/Burst";
import { XIcon } from "@/components/ui/icons";
import { Avatar } from "./Avatar";
import { hubSay, subscribeBuddy, type BuddyMessage } from "./buddy-store";

// The student's avatar, peeking up from the bottom edge of the screen, only
// the top of its head shows until it has something to say. Then it rises
// with a speech bubble. What it says, in order:
//   1. real events from the server (a lesson finished, a budget crossed…),
//      one per real action, never twice, milestones first;
//   2. the page's own line (e.g. a roast worked out from your real spending);
//   3. a line for the page you're on.
// Click it and it pops up with something new. It waits while you're typing,
// never blocks the page (clicks pass through everything but the avatar and
// the close button), goes quiet when switched off in Settings, and the
// global reduced-motion switch removes its animations.

const COOLDOWN_MS = 15_000;
const SHOW_FOR = [7_000, 9_000, 11_000];
const LAST_SHOWN = "avatar-last-shown";

const store = (kind: "local" | "session") => {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};
const read = (key: string, kind: "local" | "session" = "local") => store(kind)?.getItem(key) ?? null;
const write = (key: string, value: string, kind: "local" | "session" = "local") => {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    /* private mode, fine */
  }
};

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
};

type Talk = BuddyMessage & { eventKind?: string; itemLink?: boolean };

export function AvatarBuddy({ events, avatar, name, enabled }: { events: PendingAvatarEvent[]; avatar: AvatarConfig; name: string; enabled: boolean }) {
  const pathname = usePathname();
  const queue = useRef<PendingAvatarEvent[]>([]);
  const seen = useRef(new Set<string>());
  const pageLine = useRef<BuddyMessage | null>(null);
  const pokes = useRef(0);
  const [talk, setTalk] = useState<Talk | null>(null);
  const [popped, setPopped] = useState(false);
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
    if (ordinary.length > 1) void markAvatarEventsShown(ordinary.slice(1).map((e) => e.id));
    queue.current = [...queue.current.filter((e) => e.priority > 0), ...fresh.filter((e) => e.priority > 0), ...ordinary.slice(0, 1)].sort(
      (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt),
    );
  }, [events, enabled]);

  const eventTalk = useCallback((): Talk | null => {
    const next = queue.current[0];
    if (!next) return null;
    const last = Number(read(LAST_SHOWN) ?? 0);
    queue.current.shift();
    void markAvatarEventsShown([next.id]);
    if (next.priority === 0 && Date.now() - last < COOLDOWN_MS) return null; // too soon for small talk
    const def = REACTIONS[next.kind];
    const lastLine = read(`avatar-line:${next.kind}`);
    const index = pickLine(next.kind, next.id, lastLine === null ? undefined : Number(lastLine));
    write(`avatar-line:${next.kind}`, String(index));
    return {
      id: next.id,
      expression: def.expression,
      text: def.lines[index](name, next.data),
      title: def.title?.(next.data),
      priority: next.priority,
      celebrate: next.priority === 2,
      eventKind: next.kind,
      itemLink: next.kind === "item-unlocked" || (next.kind === "badge" && !!next.data.item),
    };
  }, [name]);

  const contextTalk = useCallback((): Talk | null => {
    if (pageLine.current) return pageLine.current;
    const lines = contextLinesFor(pathname);
    if (lines.length === 0) return null;
    const key = `buddy-ctx:${pathname}`;
    const index = (Number(read(key, "session") ?? -1) + 1) % lines.length;
    write(key, String(index), "session");
    return { id: `ctx:${pathname}:${index}`, expression: lines[index].expression, text: fillName(lines[index].text, name) };
  }, [pathname, name]);

  // On the dashboard, the big centre avatar says it instead.
  const onHub = pathname === "/dashboard";
  const say = useCallback(
    (message: Talk | null) => {
      if (!message) return false;
      write(LAST_SHOWN, String(Date.now()));
      if (onHub && hubSay(message)) return true;
      setTalk(message);
      return true;
    },
    [onHub],
  );

  // Pages hand over their own line; clicks elsewhere can make it talk now.
  useEffect(
    () =>
      subscribeBuddy((message, mode) => {
        if (!enabled) return;
        if (mode === "page") pageLine.current = message;
        else {
          setPopped(true);
          say(message);
        }
      }),
    [enabled, say],
  );

  // A new page: forget the old page's line; after a moment, say something.
  useEffect(() => {
    pageLine.current = null;
    if (!enabled) return;
    const shown = `buddy-said:${pathname}`;
    const t = window.setTimeout(() => {
      if (isTyping() || document.hidden) return;
      if (say(eventTalk())) return;
      // Page lines once per visit to a page per session; events always. (The
      // dashboard's centre avatar has its own greeting.)
      if (onHub || read(shown, "session")) return;
      write(shown, "1", "session");
      say(contextTalk());
    }, 1400);
    return () => window.clearTimeout(t);
  }, [pathname, enabled, onHub, eventTalk, contextTalk, say]);

  // While quiet, keep checking for new events (and wait while typing).
  useEffect(() => {
    if (!enabled || talk) return;
    const id = window.setInterval(() => {
      if (queue.current.length === 0 || isTyping() || document.hidden) return;
      if (say(eventTalk())) setTick((n) => n + 1);
    }, 1500);
    return () => window.clearInterval(id);
  }, [enabled, talk, tick, eventTalk, say]);

  // Talk for a while, then sink back to peeking.
  useEffect(() => {
    if (!talk || paused) return;
    const id = window.setTimeout(
      () => {
        setTalk(null);
        setPopped(false);
      },
      SHOW_FOR[talk.priority ?? 0] ?? SHOW_FOR[0],
    );
    return () => window.clearTimeout(id);
  }, [talk, paused]);

  function poke() {
    const fromEvents = eventTalk();
    if (fromEvents) {
      setPopped(true);
      say(fromEvents);
      return;
    }
    // Alternate: the page's own line, then a poke line, then the page line again…
    pokes.current += 1;
    const pageOrContext = pokes.current % 2 === 1 ? contextTalk() : null;
    const poke = POKE_LINES[pokes.current % POKE_LINES.length];
    setPopped(true);
    say(pageOrContext && pageOrContext.text !== talk?.text ? pageOrContext : { id: `poke:${pokes.current}`, expression: poke.expression, text: poke.text });
  }

  if (!enabled || onHub) return null;
  const position = popped ? "translate-y-[12%]" : talk ? "translate-y-[32%]" : "translate-y-[62%] hover:translate-y-[52%]";

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-2 bottom-[56px] z-30 flex items-end gap-1 sm:right-6 lg:bottom-0">
      {talk && (
        <div
          role="status"
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="relative mb-[72px] max-w-[min(17rem,calc(100vw-8rem))] animate-avatar-in rounded-2xl rounded-br-md bg-white p-3 pr-8 text-[13px] leading-snug font-medium text-slate-800 shadow-[0_14px_36px_-12px_rgb(28_26_38/0.4)] ring-1 ring-slate-200 sm:mb-[88px] sm:max-w-xs sm:p-3.5 sm:pr-9 sm:text-sm"
        >
          {talk.title && <p className="mb-1 text-[11px] font-bold tracking-wide text-brand-700 uppercase">{talk.title}</p>}
          <p>{talk.text}</p>
          {talk.itemLink && (
            <Link href="/profile/avatar" className="pointer-events-auto mt-2 inline-block text-xs font-semibold text-brand-700 underline-offset-4 hover:underline">
              Open Avatar Studio
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setTalk(null);
              setPopped(false);
            }}
            aria-label="Dismiss"
            className="pointer-events-auto absolute top-2 right-2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <span aria-hidden className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_0)]" />
        </div>
      )}
      <button
        type="button"
        onClick={poke}
        aria-label={`${name}'s avatar, click for a comment`}
        className={`pointer-events-auto relative h-32 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:h-40 ${position}`}
      >
        {talk?.celebrate && <Burst />}
        <Avatar
          config={avatar}
          expression={talk?.expression}
          alive
          className={`h-full w-auto drop-shadow-[0_-6px_14px_rgb(28_26_38/0.16)] ${talk?.celebrate ? "animate-hop" : ""}`}
          label={`${name}'s avatar`}
        />
      </button>
    </div>
  );
}
