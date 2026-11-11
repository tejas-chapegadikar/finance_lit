"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { markTipsSeen } from "@/actions/guide";
import { GUIDE_EVENT, PAGE_GUIDE_EVENT, type GuideAction, type GuideTip } from "@/lib/guide/bus";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { openQuickAdd } from "@/components/money/QuickAddSheet";
import { XIcon } from "@/components/ui/icons";

// The avatar guide: its face pops up from the bottom with a speech cloud.
// One pop-up at a time, hides itself after about 7 seconds, and can be
// dismissed with a tap or a swipe. It waits while you type or while a sheet
// is open, sits above the bottom tabs and clear of the + button, and moves to
// the top when the thing it points at is low on the screen.
//
// Triggers: a one-time tour on the first visit to each section, an offer of
// help after 15 idle seconds on a first visit, "?" in the header, and
// guideSay() from anywhere (locked items, finished actions, errors). Which
// one-time tips you've seen is saved to your account, so they never repeat.

type Lines = typeof import("@/content/avatar-lines");
type Shown = GuideTip & { key: number; tour?: { section: string; steps: { target: string; text: string }[]; index: number } };

const SHOW_MS = 7000;
const IDLE_MS = 15000;

const SECTION: { prefix: string; id: string; exact?: boolean }[] = [
  { prefix: "/dashboard", id: "home", exact: true },
  { prefix: "/money", id: "money", exact: true },
  { prefix: "/lessons", id: "learn", exact: true },
  { prefix: "/invest", id: "invest", exact: true },
  { prefix: "/profile", id: "profile", exact: true },
];
const sectionOf = (path: string) => SECTION.find((s) => (s.exact ? path === s.prefix : path.startsWith(s.prefix)))?.id ?? null;

const find = (target?: string) => (target ? document.querySelector<HTMLElement>(`[data-guide="${target}"]`) : null);
const busy = () => {
  const el = document.activeElement as HTMLElement | null;
  const typing = !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
  return typing || !!document.querySelector('[role="dialog"][aria-modal="true"]');
};

export function GuideHost({ avatar, seen: seenInitial, tipsOn }: { avatar: AvatarConfig; seen: string[]; tipsOn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const lines = useRef<Lines | null>(null);
  const seen = useRef(new Set(seenInitial));
  const [current, setCurrent] = useState<Shown | null>(null);
  const [atTop, setAtTop] = useState(false);
  const pending = useRef<Shown | null>(null);
  const spot = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const load = useCallback(async () => (lines.current ??= await import("@/content/avatar-lines")), []);

  const markSeen = useCallback((id: string) => {
    if (seen.current.has(id)) return;
    seen.current.add(id);
    void markTipsSeen([id]).catch(() => {});
  }, []);

  // Show now if nothing's in the way, otherwise as soon as typing stops / the sheet closes.
  const show = useCallback((tip: Shown) => {
    if (busy()) pending.current = tip;
    else setCurrent(tip);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pending.current && !busy()) {
        setCurrent(pending.current);
        pending.current = null;
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const startTour = useCallback(
    async (section: string) => {
      const l = await load();
      const steps = (l.TOURS[section] ?? []).filter((s) => find(s.target));
      if (steps.length === 0) return false;
      show({ kind: "tour", text: steps[0].text, target: steps[0].target, key: Date.now(), tour: { section, steps, index: 0 } });
      return true;
    },
    [load, show],
  );

  const pageHelp = useCallback(async () => {
    const section = sectionOf(pathname);
    if (section && (await startTour(section))) return;
    const l = await load();
    const help = l.PAGE_HELP.find((h) => pathname.startsWith(h.prefix));
    show({ kind: "help", text: help?.text ?? l.FALLBACK_HELP, expression: "thinking", key: Date.now() });
  }, [pathname, load, show, startTour]);

  // guideSay() from anywhere, and the "?" button.
  useEffect(() => {
    function onSay(e: Event) {
      const tip = (e as CustomEvent<GuideTip>).detail;
      // With tips off, only answers to something you just did (locked, errors).
      if (!tipsOn && (tip.kind === "after" || tip.kind === "idle" || tip.kind === "tour")) return;
      show({ ...tip, key: Date.now() });
    }
    const onHelp = () => void pageHelp().catch(() => {});
    window.addEventListener(GUIDE_EVENT, onSay);
    window.addEventListener(PAGE_GUIDE_EVENT, onHelp);
    return () => {
      window.removeEventListener(GUIDE_EVENT, onSay);
      window.removeEventListener(PAGE_GUIDE_EVENT, onHelp);
    };
  }, [tipsOn, show, pageHelp]);

  // First visit to a section: a short tour. Still a first visit 15 idle seconds later: an offer of help.
  useEffect(() => {
    const section = sectionOf(pathname);
    if (!tipsOn || !section) return;
    let idleTimer = 0;
    let cancelled = false;
    const armIdle = () => {
      window.clearTimeout(idleTimer);
      if (seen.current.has(`idle:${section}`)) return;
      idleTimer = window.setTimeout(async () => {
        if (cancelled || seen.current.has(`idle:${section}`)) return;
        const l = await load();
        const action = l.IDLE_ACTIONS[section];
        if (!action || (action.target && !find(action.target))) return;
        markSeen(`idle:${section}`);
        show({ kind: "idle", text: l.IDLE_TEXT, expression: "confused", action, key: Date.now() });
      }, IDLE_MS);
    };
    const tourTimer = window.setTimeout(async () => {
      if (cancelled || section === "home" || seen.current.has(`tour:${section}`)) return;
      if (await startTour(section)) markSeen(`tour:${section}`);
    }, 900);
    armIdle();
    const activity = () => armIdle();
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("scroll", activity, { passive: true });
    window.addEventListener("keydown", activity);
    return () => {
      cancelled = true;
      window.clearTimeout(tourTimer);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("scroll", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [pathname, tipsOn, load, markSeen, show, startTour]);

  const next = useCallback(() => {
    setCurrent((c) => {
      if (c?.tour && c.tour.index + 1 < c.tour.steps.length) {
        const index = c.tour.index + 1;
        const step = c.tour.steps[index];
        return { ...c, text: step.text, target: step.target, key: Date.now(), tour: { ...c.tour, index } };
      }
      return null;
    });
  }, []);

  // Auto-hide (or move on to the next tour step), paused while hovered.
  useEffect(() => {
    if (!current) return;
    const id = window.setInterval(() => {
      if (!hovering.current) next();
    }, SHOW_MS);
    return () => window.clearInterval(id);
  }, [current, next]);

  // Spotlight what the tip points at, and keep the cloud out of its way.
  useEffect(() => {
    const el = find(current?.target);
    if (!el) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    let frame = 0;
    const track = () => {
      const r = el.getBoundingClientRect();
      const s = spot.current;
      if (s) {
        s.style.transform = `translate(${r.left - 6}px, ${r.top - 6}px)`;
        s.style.width = `${r.width + 12}px`;
        s.style.height = `${r.height + 12}px`;
      }
      setAtTop(r.top + r.height / 2 > window.innerHeight * 0.55);
      frame = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frame);
  }, [current]);

  // Close when you navigate away.
  useEffect(() => {
    const id = window.setTimeout(() => setCurrent((c) => (c?.kind === "tour" || c?.kind === "idle" ? null : c)), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  function act(action: GuideAction) {
    if (action.quickAdd) {
      if (pathname === "/money") openQuickAdd();
      else router.push("/money?add=1");
    } else if (action.href) router.push(action.href);
    else if (action.target) {
      const el = find(action.target);
      if (el instanceof HTMLDetailsElement) el.open = true;
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      setCurrent((c) => (c ? { ...c, target: action.target, action: undefined, key: Date.now() } : c));
      return;
    }
    setCurrent(null);
  }

  const tourStep = current?.tour;
  const lastStep = !!tourStep && tourStep.index === tourStep.steps.length - 1;

  return (
    <>
      {current?.target && (
        <div
          ref={spot}
          aria-hidden
          className="guide-spot pointer-events-none fixed top-0 left-0 z-40 rounded-2xl ring-4 ring-brand-500 shadow-[0_0_0_9999px_rgb(15_31_24/0.42)]"
        />
      )}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed left-3 z-50 w-[min(22rem,calc(100vw-6rem))] lg:left-[calc(16rem+1.5rem)] ${atTop && current?.target ? "top-[4.25rem] lg:top-6" : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-6"}`}
      >
        {current && (
          <div
            key={current.key}
            className="guide-pop pointer-events-auto relative pt-9"
            onPointerEnter={() => (hovering.current = true)}
            onPointerLeave={() => (hovering.current = false)}
            onFocus={() => (hovering.current = true)}
            onBlur={() => (hovering.current = false)}
            onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
            onPointerUp={(e) => {
              const s = swipe.current;
              swipe.current = null;
              if (s && (Math.abs(e.clientY - s.y) > 40 || Math.abs(e.clientX - s.x) > 60)) setCurrent(null);
            }}
          >
            <Avatar
              config={avatar}
              expression={current.expression ?? (current.kind === "error" ? "sad" : current.kind === "locked" ? "facepalm" : "happy")}
              crop="head"
              alive
              className="guide-face absolute top-0 left-3 h-14 w-14"
              label="Your avatar"
            />
            <div className="rounded-2xl bg-brand-900 p-3.5 pr-10 text-sm leading-snug font-medium text-white shadow-[0_14px_36px_-12px_rgb(15_31_24/0.6)]">
              <p>{current.text}</p>
              {(current.action || tourStep) && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {current.action && (
                    <button
                      type="button"
                      onClick={() => act(current.action!)}
                      className="inline-flex min-h-9 items-center rounded-full bg-brand-500 px-3.5 text-xs font-bold text-brand-900"
                    >
                      {current.action.label}
                    </button>
                  )}
                  {tourStep && (
                    <button
                      type="button"
                      onClick={next}
                      className="inline-flex min-h-9 items-center rounded-full bg-white/15 px-3.5 text-xs font-bold text-white"
                    >
                      {lastStep ? "Got it" : `Next (${tourStep.index + 1}/${tourStep.steps.length})`}
                    </button>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrent(null)}
                aria-label="Dismiss tip"
                className="absolute top-10 right-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
