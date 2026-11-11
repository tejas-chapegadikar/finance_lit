"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { markTipsSeen } from "@/actions/guide";
import { markAvatarEventsShown } from "@/actions/avatar";
import { GUIDE_EVENT, PAGE_GUIDE_EVENT, type GuideAction, type GuideTip } from "@/lib/guide/bus";
import type { AvatarConfig } from "@/lib/avatar";
import type { Expression } from "@/components/avatar/Avatar";
import type { PendingAvatarEvent } from "@/lib/avatar/events";
import { REACTIONS, buddyShows, reactionText } from "@/lib/avatar/reactions";
import { toast } from "sonner";
import { setAvatarReactions } from "@/actions/avatar";
import { openQuickAdd } from "@/components/money/QuickAddSheet";
import { BuddyPeek, type PeekFace, type PeekMessage } from "./BuddyPeek";

// The money buddy's brain: decides what it says and when, and shows it with
// <BuddyPeek /> (the head + speech bubble). All its words live in
// src/content/buddy-messages.ts.
//
// Rules:
// - One bubble at a time.
// - It keeps commenting the whole time you're on Home, Money, Learn, Invest
//   or Profile: a one-time tip on your first visit, then a running commentary
//   (about what you scroll to, your own numbers, or the page), a nudge with a
//   button when you've been idle for 20 seconds, plus roasts and celebrations.
//   A short pause (12 seconds) after each bubble so it never piles up. With
//   Buddy tips off in Settings, none of these.
// - Answers to something you did (tapping a locked item, the "?" button, an
//   error) always show, straight away.
// - One-time tips are saved to your account, so they never repeat.
// - It waits while you type or while a sheet is open, keeps the thing it
//   talks about visible above the bubble (scrolling if needed), and sits on
//   the side away from it (and away from the + button).

type Shown = GuideTip & {
  key: number;
  prompted: boolean;
  title?: string;
  eventId?: string;
  tour?: { section: string; steps: { target: string; text: string }[]; index: number };
};

// Safety limits only: the commentary is meant to keep going.
const PAGE_MAX = 60;
const DAY_MAX = 400;
const GAP_MS = 12000;
const IDLE_MS = 20000;
const FIRST_COMMENT_MS = 2500;
const DAY_KEY = "rupli-buddy-day";

const SECTION: { prefix: string; id: string }[] = [
  { prefix: "/dashboard", id: "home" },
  { prefix: "/money", id: "money" },
  { prefix: "/lessons", id: "learn" },
  { prefix: "/invest", id: "invest" },
  { prefix: "/profile", id: "profile" },
];
const sectionOf = (path: string) => SECTION.find((s) => path === s.prefix)?.id ?? null;

const find = (target?: string) => (target ? document.querySelector<HTMLElement>(`[data-guide="${target}"]`) : null);
const busy = () => {
  const el = document.activeElement as HTMLElement | null;
  const typing = !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
  return typing || !!document.querySelector('[role="dialog"][aria-modal="true"]');
};
const calmNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1";
const todayIst = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

/** The buddy's five faces. */
function faceOf(tip: GuideTip): PeekFace {
  const map: Partial<Record<Expression, PeekFace>> = {
    happy: "happy",
    excited: "happy",
    welcoming: "happy",
    thinking: "happy",
    confused: "happy",
    smirk: "smirk",
    facepalm: "smirk",
    shocked: "shocked",
    sad: "sad",
    sleepy: "sad",
    proud: "proud",
    celebrating: "proud",
  };
  if (tip.expression && map[tip.expression]) return map[tip.expression]!;
  return tip.kind === "error" ? "sad" : tip.kind === "locked" ? "smirk" : "happy";
}

/** Today's count of unprompted bubbles (kept on this device). */
function dayCount(add = 0) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DAY_KEY) ?? "null") as { day: string; n: number } | null;
    const n = (saved?.day === todayIst() ? saved.n : 0) + add;
    if (add) window.localStorage.setItem(DAY_KEY, JSON.stringify({ day: todayIst(), n }));
    return n;
  } catch {
    return 0;
  }
}

export function BuddyHost({
  avatar,
  seen: seenInitial,
  tipsOn,
  events,
  name,
  facts,
}: {
  avatar: AvatarConfig;
  seen: string[];
  tipsOn: boolean;
  events: PendingAvatarEvent[];
  name: string;
  /** Your numbers, for comments like "{xp} XP so far". */
  facts: Record<string, string | number>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const lines = useRef<typeof import("@/content/buddy-messages") | null>(null);
  const seen = useRef(new Set(seenInitial));
  const [current, setCurrent] = useState<Shown | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const currentRef = useRef<Shown | null>(null);
  // Avatar comments on or off: on by default, switchable from the bubble or Settings.
  const [commentsOn, setCommentsOn] = useState(tipsOn);
  useEffect(() => {
    const id = window.setTimeout(() => setCommentsOn(tipsOn), 0);
    return () => window.clearTimeout(id);
  }, [tipsOn]);
  const queue = useRef<Shown[]>([]);
  const replacement = useRef<Shown | null>(null);
  const pageCount = useRef(0);
  const lastClosed = useRef(0);
  const eventsQueued = useRef(new Set<string>());
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const load = useCallback(async () => (lines.current ??= await import("@/content/buddy-messages")), []);
  const say = useCallback(async (list: string[]) => (await load()).pick(list, Date.now() / 1000), [load]);

  const markSeen = useCallback((id: string) => {
    if (seen.current.has(id)) return;
    seen.current.add(id);
    void markTipsSeen([id]).catch(() => {});
  }, []);

  /** Puts a bubble on screen now, replacing (after its exit) anything already there. */
  const display = useCallback((tip: Shown) => {
    // Away from what it talks about, and away from the + button.
    const target = find(tip.target)?.getBoundingClientRect();
    const fab = document.querySelector<HTMLElement>("[data-buddy-avoid]");
    const fabRight = !!fab && fab.offsetParent !== null && fab.getBoundingClientRect().left > window.innerWidth / 2;
    setSide(fabRight || (target && target.left + target.width / 2 > window.innerWidth * 0.6 && target.width < window.innerWidth * 0.7) ? "left" : "right");
    if (tip.eventId) void markAvatarEventsShown([tip.eventId]).catch(() => {});
    if (currentRef.current) {
      replacement.current = tip;
      setLeaving(true);
    } else {
      currentRef.current = tip;
      setCurrent(tip);
    }
  }, []);

  /** Unprompted bubbles wait in line; prompted ones go straight up (once you stop typing). */
  const offer = useCallback(
    (tip: Shown) => {
      if (!tip.prompted && !commentsOn) {
        if (tip.eventId) void markAvatarEventsShown([tip.eventId]).catch(() => {});
        return;
      }
      if (tip.prompted && !busy()) display(tip);
      else if (tip.prompted) queue.current.unshift(tip);
      else queue.current.push(tip);
    },
    [commentsOn, display],
  );

  // The line: shows the next bubble when there's room under the limits.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (currentRef.current || busy()) return;
      while (queue.current.length) {
        const tip = queue.current[0];
        if (tip.prompted) break;
        if (pageCount.current < PAGE_MAX && dayCount() < DAY_MAX) break;
        queue.current.shift(); // over the limit: dropped
        if (tip.eventId) void markAvatarEventsShown([tip.eventId]).catch(() => {});
      }
      const tip = queue.current[0];
      if (!tip) return;
      if (!tip.prompted && Date.now() - lastClosed.current < GAP_MS) return;
      queue.current.shift();
      if (!tip.prompted) {
        pageCount.current++;
        dayCount(1);
      }
      display({ ...tip, key: Date.now() });
    }, 400);
    return () => window.clearInterval(id);
  }, [display]);

  const tourFor = useCallback(
    async (section: string, prompted: boolean): Promise<Shown | null> => {
      const l = await load();
      const steps = (l.TOURS[section] ?? []).filter((s) => find(s.target)).map((s) => ({ target: s.target, text: l.pick(s.lines, Date.now() / 1000) }));
      if (steps.length === 0) return null;
      return { kind: "tour", prompted, text: steps[0].text, target: steps[0].target, key: Date.now(), tour: { section, steps, index: 0 } };
    },
    [load],
  );

  // guideSay() from anywhere, and the "?" button.
  useEffect(() => {
    function onSay(e: Event) {
      const tip = (e as CustomEvent<GuideTip>).detail;
      const prompted = tip.kind === "locked" || tip.kind === "error" || tip.kind === "help";
      offer({ ...tip, key: Date.now(), prompted });
    }
    async function onHelp() {
      const section = sectionOf(pathname);
      const tour = section ? await tourFor(section, true) : null;
      if (tour) return display(tour);
      const l = await load();
      const help = l.PAGE_HELP.find((h) => pathname.startsWith(h.prefix));
      display({ kind: "help", prompted: true, text: await say(help?.lines ?? l.FALLBACK_HELP), key: Date.now() });
    }
    const help = () => void onHelp().catch(() => {});
    window.addEventListener(GUIDE_EVENT, onSay);
    window.addEventListener(PAGE_GUIDE_EVENT, help);
    return () => {
      window.removeEventListener(GUIDE_EVENT, onSay);
      window.removeEventListener(PAGE_GUIDE_EVENT, help);
    };
  }, [pathname, offer, display, tourFor, load, say]);

  // Celebrations and other moments the server recorded.
  useEffect(() => {
    const id = window.setTimeout(() => {
      for (const event of events) {
        if (eventsQueued.current.has(event.id)) continue;
        eventsQueued.current.add(event.id);
        if (!buddyShows(event.kind)) continue;
        const { title, text } = reactionText(event.kind, event.data, name, event.id);
        offer({ kind: "after", prompted: false, title, text, expression: REACTIONS[event.kind].expression, eventId: event.id, key: Date.now() });
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [events, name, offer]);

  // On a section page: the one-time tip on a first visit, then a running
  // commentary for as long as you stay. Each second it decides what's next:
  // something you just scrolled to, a nudge if you've gone idle, or the next
  // comment about the page. Never while another bubble is up or queued.
  const lastComment = useRef<Record<string, number>>({});
  const factsRef = useRef(facts);
  useEffect(() => {
    factsRef.current = facts;
  }, [facts]);
  useEffect(() => {
    pageCount.current = 0;
    queue.current = queue.current.filter((t) => t.kind !== "tour" && t.kind !== "idle" && t.kind !== "comment");
    const section = sectionOf(pathname);
    if (!section) return;
    let cancelled = false;
    let tourPending = !seen.current.has(`tour:${section}`);
    const opened = Date.now();
    let lastActivity = Date.now();
    let nudged = false;
    const spoken = new Set<string>();

    // The first-visit tip (the page may still be loading a skeleton: wait up to 10s for what it points at).
    void (async () => {
      if (!tourPending) return;
      await new Promise((r) => window.setTimeout(r, 900));
      const l = await load();
      for (let i = 0; i < 25 && !cancelled && !l.TOURS[section]?.some((step) => find(step.target)); i++) await new Promise((r) => window.setTimeout(r, 400));
      if (cancelled) return;
      const tour = await tourFor(section, false);
      if (tour && !cancelled) {
        markSeen(`tour:${section}`);
        offer(tour);
      }
      tourPending = false;
    })().catch(() => (tourPending = false));

    const known = (line: string) => [...line.matchAll(/\{(\w+)\}/g)].every(([, key]) => factsRef.current[key] !== undefined && factsRef.current[key] !== "");
    const nextComment = (l: NonNullable<typeof lines.current>) => {
      const pool = (l.COMMENTS[section] ?? []).filter(known);
      if (pool.length === 0) return null;
      let i = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && i === lastComment.current[section]) i = (i + 1) % pool.length;
      lastComment.current[section] = i;
      return l.fill(pool[i], factsRef.current);
    };

    const tick = window.setInterval(async () => {
      if (cancelled || tourPending || !commentsOn || currentRef.current || queue.current.length || busy()) return;
      if (Date.now() - opened < FIRST_COMMENT_MS || Date.now() - lastClosed.current < GAP_MS) return;
      const l = await load();
      if (cancelled || currentRef.current || queue.current.length) return;
      // 1. Something you just scrolled to.
      for (const [target, list] of Object.entries(l.COMMENTS_ON)) {
        const el = find(target);
        if (!el || spoken.has(target)) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.65 && r.bottom > window.innerHeight * 0.1) {
          spoken.add(target);
          return offer({ kind: "comment", prompted: false, text: l.pick(list, Date.now() / 1000), expression: "happy", key: Date.now() });
        }
      }
      // 2. Gone quiet for a while: a nudge with something to do.
      const action = l.IDLE_ACTIONS[section];
      if (!nudged && Date.now() - lastActivity > IDLE_MS && action && (!action.target || find(action.target))) {
        nudged = true;
        return offer({ kind: "idle", prompted: false, text: l.pick(l.IDLE, Date.now() / 1000), expression: "smirk", action, key: Date.now() });
      }
      // 3. The next comment about this page.
      const text = nextComment(l);
      if (text) offer({ kind: "comment", prompted: false, text, expression: Math.random() < 0.3 ? "smirk" : "happy", key: Date.now() });
    }, 1000);

    const activity = () => {
      lastActivity = Date.now();
      nudged = false;
    };
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("scroll", activity, { passive: true });
    window.addEventListener("keydown", activity);
    // Close page tips when you leave the page.
    const close = window.setTimeout(() => {
      const c = currentRef.current;
      if (c && (c.kind === "tour" || c.kind === "idle" || c.kind === "comment") && c.tour?.section !== section) setLeaving(true);
    }, 0);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
      window.clearTimeout(close);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("scroll", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [pathname, load, markSeen, offer, tourFor, commentsOn]);

  /** "Stop comments" in the bubble: off now, saved to your account, with Undo. */
  const mute = useCallback(() => {
    setCommentsOn(false);
    queue.current = queue.current.filter((t) => t.prompted);
    setLeaving(true);
    const save = (on: boolean) => setAvatarReactions(on).catch(() => toast.error("Couldn't save that. Try again in Settings."));
    void save(false);
    toast("Avatar comments are off", {
      description: "Turn them back on any time in Settings.",
      action: {
        label: "Undo",
        onClick: () => {
          setCommentsOn(true);
          void save(true);
        },
      },
    });
  }, []);

  const close = useCallback((why: "dismiss" | "timeout") => {
    const c = currentRef.current;
    // A tour moves on to its next step when it times out.
    if (why === "timeout" && c?.tour && c.tour.index + 1 < c.tour.steps.length) {
      const index = c.tour.index + 1;
      const step = c.tour.steps[index];
      const next = { ...c, text: step.text, target: step.target, key: Date.now(), tour: { ...c.tour, index } };
      replacement.current = next;
    }
    setLeaving(true);
  }, []);

  const left = useCallback(() => {
    lastClosed.current = Date.now();
    const next = replacement.current;
    replacement.current = null;
    currentRef.current = next;
    setLeaving(false);
    setCurrent(next);
  }, []);

  function act() {
    const c = currentRef.current;
    if (!c) return;
    if (c.tour && c.tour.index + 1 < c.tour.steps.length) {
      const index = c.tour.index + 1;
      const step = c.tour.steps[index];
      replacement.current = { ...c, text: step.text, target: step.target, key: Date.now(), tour: { ...c.tour, index } };
      setLeaving(true);
      return;
    }
    const action: GuideAction | undefined = c.action;
    if (!action) return setLeaving(true);
    if (action.quickAdd) {
      if (pathname === "/money") openQuickAdd();
      else router.push("/money?add=1");
    } else if (action.href) router.push(action.href);
    else if (action.target) {
      const el = find(action.target);
      if (el instanceof HTMLDetailsElement) el.open = true;
      replacement.current = { ...c, target: action.target, action: undefined, key: Date.now() };
    }
    setLeaving(true);
  }

  // Keep what the bubble talks about in view, above the bubble, with a ring around it.
  const placed = useCallback((bubbleTop: number) => {
    document.documentElement.dataset.buddy = "1";
    document.documentElement.style.setProperty("--buddy-space", `${Math.max(0, window.innerHeight - bubbleTop)}px`);
    const el = find(currentRef.current?.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const header = window.matchMedia("(min-width: 64rem)").matches ? 16 : 64;
    const limit = bubbleTop - 16;
    let delta = 0;
    if (r.bottom > limit) delta = Math.min(r.bottom - limit, r.top - header);
    else if (r.top < header) delta = r.top - header;
    if (Math.abs(delta) > 4) window.scrollBy({ top: delta, behavior: calmNow() ? "instant" : "smooth" });
  }, []);

  useEffect(() => {
    if (current) return;
    delete document.documentElement.dataset.buddy;
    document.documentElement.style.removeProperty("--buddy-space");
  }, [current]);

  useEffect(() => {
    const el = find(current?.target);
    if (!el || leaving) return;
    let frame = 0;
    const track = () => {
      const r = el.getBoundingClientRect();
      const s = spot.current;
      if (s) {
        s.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
        s.style.width = `${r.width + 12}px`;
        s.style.height = `${r.height + 12}px`;
      }
      frame = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frame);
  }, [current, leaving]);

  const tour = current?.tour;
  const message: PeekMessage | null = current && {
    key: current.key,
    text: current.text,
    title: current.title,
    face: faceOf(current),
    side,
    action: tour ? (tour.index + 1 < tour.steps.length ? `Next (${tour.index + 1}/${tour.steps.length})` : undefined) : current.action?.label,
  };

  return (
    <>
      {current?.target && !leaving && find(current.target) && (
        <div
          ref={spot}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-20 rounded-2xl ring-4 ring-brand-500 shadow-[0_0_0_9999px_rgb(15_31_24/0.22)]"
        />
      )}
      <div role="status" aria-live="polite">
        {message && (
          <BuddyPeek
            key={message.key}
            message={message}
            avatar={avatar}
            leaving={leaving}
            onAction={act}
            onClose={close}
            onLeft={left}
            onPlaced={placed}
            onMute={current && !current.prompted ? mute : undefined}
          />
        )}
      </div>
    </>
  );
}
