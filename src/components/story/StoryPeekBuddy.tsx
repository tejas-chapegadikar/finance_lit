"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";
import { STORY_PEEK } from "@/content/buddy-messages";

// The money buddy in Story Mode: only his face peeks in from the right edge,
// with a small speech bubble, and ONLY while you're not scrolling. The moment
// you touch, scroll or press a scroll key he slides away; when you stop, he
// comes back (less often each time). Near the end he points to the quiz; when
// the Start Quiz button is on screen he says so once, then goes quiet.
// The wrapper never blocks taps or scrolling (pointer-events: none).
//
// Lines: src/content/buddy-messages.ts (STORY_PEEK). Timings: below.

/** Wait after the story opens before the intro line, if you haven't scrolled. */
const INTRO_AFTER_MS = 1200;
/** How long you must be idle before he peeks in: 1st, 2nd, then every later time. */
const IDLE_WAITS_MS = [2500, 4000, 6000];
/** Wait before the "there it is" line once the quiz button is on screen and you're idle. */
const QUIZ_LINE_AFTER_MS = 700;
/** He hides himself after this long, if you still haven't scrolled. */
const SHOW_FOR_MS = 4000;
/** At most this many appearances per story (the one-time quiz line doesn't count). */
const MAX_SHOWS = 6;
/** This many taps on × mutes him for the rest of the story (except the one-time quiz line). */
const MUTE_AFTER_CLOSES = 2;
/** From this far through the story, idle lines point to the quiz at the bottom. */
const NEAR_END = 0.85;
/** Exit animation length (keep in sync with .peek-*-out in globals.css). */
const EXIT_MS = 260;

const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Spacebar", "Home", "End"]);
type Pool = keyof typeof STORY_PEEK;

/** Lines in random order, every line used once before any repeats, never the same twice in a row. */
function makeBag() {
  const bags: Partial<Record<Pool, string[]>> = {};
  let last = "";
  return (pool: Pool) => {
    let bag = bags[pool];
    if (!bag || bag.length === 0) {
      bag = [...STORY_PEEK[pool]].sort(() => Math.random() - 0.5);
      if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop()!);
      bags[pool] = bag;
    }
    const line = bag.pop()!;
    last = line;
    return line;
  };
}

export function StoryPeekBuddy({
  avatar,
  progress,
  quizEl,
  quizReady,
}: {
  avatar: AvatarConfig;
  /** The story's scroll progress (0–1), read without re-rendering. */
  progress: React.RefObject<number>;
  /** The Start Quiz button's wrapper, watched with an IntersectionObserver. */
  quizEl: React.RefObject<HTMLElement | null>;
  /** True once the story has unlocked the quiz button (it's invisible before). */
  quizReady: boolean;
}) {
  const [line, setLine] = useState<{ key: number; text: string } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [calm] = useState(
    () => typeof window !== "undefined" && (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1"),
  );
  const visible = useRef(false);
  const s = useRef({ shows: 0, closes: 0, quizSaid: false, quizOnScreen: false, everScrolled: false, fingerDown: false });
  const timers = useRef({ idle: 0, auto: 0, exit: 0 });
  const next = useRef(makeBag());
  const quizReadyRef = useRef(quizReady);
  const scheduleRef = useRef<(ms?: number) => void>(() => {});

  const hide = useCallback((fast = false) => {
    window.clearTimeout(timers.current.auto);
    if (!visible.current) return;
    visible.current = false;
    if (fast) {
      setLine(null);
      return;
    }
    setLeaving(true);
    window.clearTimeout(timers.current.exit);
    timers.current.exit = window.setTimeout(() => {
      setLine(null);
      setLeaving(false);
    }, EXIT_MS);
  }, []);

  const show = useCallback(
    (text: string) => {
      window.clearTimeout(timers.current.exit);
      visible.current = true;
      setLeaving(false);
      setLine({ key: Date.now(), text });
      window.clearTimeout(timers.current.auto);
      timers.current.auto = window.setTimeout(() => hide(), SHOW_FOR_MS);
    },
    [hide],
  );

  /** Called when the reader has been idle long enough: pick what (if anything) to say. */
  const speak = useCallback(() => {
    const st = s.current;
    if (st.fingerDown || visible.current) return;
    if (st.quizOnScreen) {
      if (!st.quizSaid) {
        st.quizSaid = true; // E: once, even when muted, then quiet for good
        show(next.current("quizVisible"));
      }
      return;
    }
    if (st.quizSaid || st.closes >= MUTE_AFTER_CLOSES || st.shows >= MAX_SHOWS) return;
    st.shows++;
    const p = progress.current ?? 0;
    show(next.current(p >= NEAR_END ? "nearEnd" : "idle"));
    scheduleRef.current();
  }, [progress, show]);

  // Activity and idle tracking: passive listeners, no re-render per scroll.
  useEffect(() => {
    const st = s.current;
    let frame = 0;
    const schedule = (ms?: number) => {
      window.clearTimeout(timers.current.idle);
      if (st.fingerDown) return;
      const wait = ms ?? IDLE_WAITS_MS[Math.min(st.shows, IDLE_WAITS_MS.length - 1)];
      timers.current.idle = window.setTimeout(speak, wait);
    };
    scheduleRef.current = schedule;

    const active = () => {
      st.everScrolled = true;
      hide();
      schedule();
    };
    // Scroll events can fire many times a frame: handle at most once per frame.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        active();
      });
    };
    const down = () => {
      st.fingerDown = true;
      st.everScrolled = true;
      window.clearTimeout(timers.current.idle);
      hide();
    };
    const up = () => {
      st.fingerDown = false;
      schedule();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible.current) return hide();
      if (SCROLL_KEYS.has(e.key)) active();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    window.addEventListener("touchcancel", up, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    window.addEventListener("keydown", onKey);

    // A: the story just opened and you haven't scrolled yet.
    const intro = window.setTimeout(() => {
      if (st.everScrolled || (progress.current ?? 0) > 0.03 || visible.current) return schedule();
      st.shows++;
      show(next.current("intro"));
      schedule();
    }, INTRO_AFTER_MS);

    const t = timers.current;
    return () => {
      window.clearTimeout(intro);
      window.clearTimeout(t.idle);
      window.clearTimeout(t.auto);
      window.clearTimeout(t.exit);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("touchstart", down);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchcancel", up);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", onKey);
    };
  }, [hide, show, speak, progress]);

  // E: is the Start Quiz button really on screen? (Watched, not guessed from scroll.)
  useEffect(() => {
    quizReadyRef.current = quizReady;
    const el = quizEl.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const onScreen = entry.isIntersecting && quizReadyRef.current;
        if (onScreen && !s.current.quizOnScreen) scheduleRef.current(QUIZ_LINE_AFTER_MS);
        s.current.quizOnScreen = onScreen;
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [quizEl, quizReady]);

  const close = () => {
    s.current.closes++;
    hide();
  };

  if (!line) return null;
  const motion = calm ? (leaving ? "peek-fade-out" : "peek-fade-in") : "";
  return (
    <div className={`story-peek pointer-events-none fixed right-0 z-30 flex items-center ${calm ? "peek-low" : ""}`}>
      <div
        role="status"
        aria-live="polite"
        onClick={close}
        className={`pointer-events-auto relative mr-1 max-w-[min(60vw,280px)] cursor-pointer rounded-2xl border-[2.5px] border-[#0F1F18] bg-white py-2 pr-7 pl-3 text-[15px] leading-snug font-medium text-[#0F1F18] shadow-[4px_4px_0_#0F1F18] ${motion || (leaving ? "peek-bubble-out" : "peek-bubble-in")}`}
      >
        {line.text}
        <button
          type="button"
          aria-label="Close tip"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[#0F1F18] outline-offset-1 hover:bg-[#F5EFE3] focus-visible:outline-2 focus-visible:outline-[#FFB81F]"
        >
          <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
        {/* the tail, pointing at the face */}
        <span
          aria-hidden
          className="absolute top-1/2 -right-[9px] h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-t-[2.5px] border-r-[2.5px] border-[#0F1F18] bg-white"
        />
      </div>
      <div
        aria-hidden
        className={`h-[68px] w-[68px] shrink-0 ${motion || (leaving ? "peek-face-out" : "peek-face-in")}`}
        style={calm ? { transform: "translateX(40%) rotate(-8deg)" } : undefined}
      >
        <div className={calm ? "h-full w-full" : "peek-wobble h-full w-full"}>
          <Avatar config={avatar} expression="smirk" crop="peek" alive className="block h-full w-full" />
        </div>
      </div>
    </div>
  );
}
