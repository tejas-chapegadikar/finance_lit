"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AvatarConfig } from "@/lib/avatar";
import { Avatar } from "@/components/avatar/Avatar";

// The money buddy's pop-up: its head peeks up from behind the bottom tabs
// (from the bottom edge of the screen on desktop) and says something in a
// comic speech bubble. Enter: the head springs up, looks up, the bubble pops
// out of its tail, the words type themselves out (tap to skip). Exit: the
// bubble shrinks into its tail and the head sinks back. Hides itself 7s after
// the words finish, unless you're touching or hovering it; swipe it down, tap
// "Got it" or ✕, or press Esc to close it. Reduced motion: a quick fade, no
// typing. Transform and opacity only.
//
// Shown by components/buddy/BuddyHost.tsx, which decides what and when.

export type PeekFace = "happy" | "smirk" | "shocked" | "sad" | "proud";

export type PeekMessage = {
  key: number;
  text: string;
  /** A short bold line above the text (e.g. "Quest done · +10 XP"). */
  title?: string;
  face: PeekFace;
  side: "left" | "right";
  /** The dark pill button, e.g. "Show me", "Log it", "Next (1/3)". */
  action?: string;
};

const SHOW_MS = 7000;
const TYPE_MS = 25;
const ENTER_MS = 560;
const EXIT_MS = 300;
const TAIL = 14;
const DEPTH = 5;
const INK = "#0F1F18";

const calmNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1";

/** Amounts and numbers in bold: ₹1,840, 42%, 7. */
function segments(text: string) {
  return text.split(/(₹[\d,]+(?:\.\d+)?|\b\d[\d,]*%?)/).map((part, i) => ({ part, bold: i % 2 === 1 }));
}

/** The first `count` characters, keeping amounts bold. */
function typedPieces(text: string, count: number) {
  let left = count;
  return segments(text).map(({ part, bold }, i) => {
    const piece = part.slice(0, Math.max(0, left));
    left -= part.length;
    return bold ? <strong key={i}>{piece}</strong> : <span key={i}>{piece}</span>;
  });
}

/** The bubble's outline: a rounded pill with a curved tail at `tailX`, pointing down at the head. */
function bubblePath(w: number, h: number, tailX: number, lean: number) {
  const s = 1.25; // half the stroke, so the outline stays inside the box
  const [x0, y0, x1, y1] = [s, s, w - s, h - s];
  const r = Math.min((y1 - y0) / 2, 26);
  const t = Math.min(Math.max(tailX, x0 + r + 12), x1 - r - 12);
  return [
    `M${x0 + r} ${y0}`,
    `H${x1 - r}`,
    `A${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `V${y1 - r}`,
    `A${r} ${r} 0 0 1 ${x1 - r} ${y1}`,
    `H${t + 9}`,
    `Q${t + 4} ${y1 + 6} ${t + lean * 5} ${y1 + TAIL}`,
    `Q${t - 3} ${y1 + 5} ${t - 9} ${y1}`,
    `H${x0 + r}`,
    `A${r} ${r} 0 0 1 ${x0} ${y1 - r}`,
    `V${y0 + r}`,
    `A${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    "Z",
  ].join(" ");
}

function BubbleShape({ w, h, tailX, lean, id }: { w: number; h: number; tailX: number; lean: number; id: string }) {
  const d = bubblePath(w, h, tailX, lean);
  const r = Math.min((h - 2.5) / 2, 26);
  // A few hatch lines in the 3D edge, like a comic print.
  const hatch = Array.from({ length: Math.ceil((w + h) / 7) }, (_, i) => i * 7);
  return (
    <svg aria-hidden className="pointer-events-none absolute top-0 left-0 overflow-visible" width={w + DEPTH} height={h + TAIL + DEPTH}>
      <defs>
        <clipPath id={id}>
          <path d={d} transform={`translate(${DEPTH} ${DEPTH})`} />
        </clipPath>
      </defs>
      <path d={d} transform={`translate(${DEPTH} ${DEPTH})`} fill={INK} />
      <g clipPath={`url(#${id})`} stroke="#F5EFE3" strokeWidth={1} opacity={0.55}>
        {hatch.map((x) => (
          <line key={x} x1={x} y1={0} x2={x - h - TAIL - 10} y2={h + TAIL + 10} />
        ))}
      </g>
      <path d={d} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <g stroke={INK} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" fill="none">
        <path d={`M6.5 ${r * 0.8 + 1.5} Q7.5 7.5 ${r * 0.8 + 1.5} 6.5`} />
        <path d={`M${w - 6.5} ${h - r * 0.8 - 1.5} Q${w - 7.5} ${h - 7.5} ${w - r * 0.8 - 1.5} ${h - 6.5}`} />
      </g>
    </svg>
  );
}

export function BuddyPeek({
  message,
  avatar,
  leaving,
  onAction,
  onClose,
  onLeft,
  onPlaced,
  onMute,
}: {
  message: PeekMessage;
  avatar: AvatarConfig;
  /** True while the exit plays; onLeft fires when it's done. */
  leaving: boolean;
  onAction: () => void;
  onClose: (why: "dismiss" | "timeout") => void;
  onLeft: () => void;
  /** Where the bubble's top edge is on screen, so the page can keep things out from under it. */
  onPlaced: (top: number) => void;
  /** Shown on comments the buddy makes by itself: turns its comments off. */
  onMute?: () => void;
}) {
  const [calm] = useState(calmNow);
  const [typed, setTyped] = useState(() => (calm ? message.text.length : 0));
  const [box, setBox] = useState<{ w: number; h: number; head: number } | null>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const well = useRef<HTMLDivElement>(null);
  const held = useRef(false);
  const done = typed >= message.text.length;
  const clipId = `buddy-clip-${message.key}`;

  // Measure the bubble (and the head) so the outline fits exactly.
  useLayoutEffect(() => {
    const el = bubble.current;
    if (!el) return;
    const measure = () => {
      setBox({ w: el.offsetWidth, h: el.offsetHeight, head: well.current?.offsetWidth ?? 84 });
      onPlaced(el.getBoundingClientRect().top);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onPlaced]);

  // The typewriter, after the entrance.
  useEffect(() => {
    if (done) return;
    let timer = 0;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => setTyped((n) => n + 1), TYPE_MS);
    }, ENTER_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [done]);

  // Hide 7s after the words are all out, unless you're holding or hovering it.
  useEffect(() => {
    if (!done || leaving) return;
    let left = SHOW_MS;
    const id = window.setInterval(() => {
      if (held.current) return;
      left -= 250;
      if (left <= 0) onClose("timeout");
    }, 250);
    return () => window.clearInterval(id);
  }, [done, leaving, onClose]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose("dismiss");
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // When the exit is over, let the host move on.
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(onLeft, calm ? 160 : EXIT_MS);
    return () => window.clearTimeout(id);
  }, [leaving, calm, onLeft]);

  // Swipe down (on the bubble or the head) to dismiss. The finger can end anywhere.
  const swipeHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      const startY = e.clientY;
      held.current = true;
      const up = (ev: PointerEvent) => {
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        held.current = false;
        if (ev.type === "pointerup" && ev.clientY - startY > 40) onClose("dismiss");
      };
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
  };

  const shown = typedPieces(message.text, typed);

  const right = message.side === "right";
  const head = box?.head ?? 84;
  const tailX = box ? (right ? box.w - head / 2 : head / 2) : 0;
  const motion = calm ? (leaving ? "buddy-fade-out" : "buddy-fade-in") : "";
  const sideClass = right ? "right-4 lg:right-6" : "left-4 lg:left-[calc(16rem+1.5rem)]";

  return (
    <div className="buddy-peek" data-side={message.side}>
      {/* The head, rising from behind the tabs. Decorative. */}
      <div ref={well} aria-hidden className={`buddy-well fixed z-30 overflow-hidden ${sideClass} ${motion}`} {...swipeHandlers}>
        <div className={calm ? "" : leaving ? "buddy-head-out" : "buddy-head-in"}>
          <div className={calm ? "" : "buddy-head-look"}>
            <Avatar config={avatar} expression={message.face} crop="peek" alive className="buddy-head block w-full" />
          </div>
        </div>
      </div>

      {/* The speech bubble. */}
      <div
        ref={bubble}
        className={`buddy-bubble fixed z-50 w-max max-w-[min(300px,calc(100vw-32px))] ${sideClass} ${motion} ${calm ? "" : leaving ? "buddy-bubble-out" : "buddy-bubble-in"}`}
        style={{ transformOrigin: `${tailX}px ${(box?.h ?? 0) + TAIL}px` }}
        onPointerEnter={() => (held.current = true)}
        onPointerLeave={() => (held.current = false)}
        onFocus={() => (held.current = true)}
        onBlur={() => (held.current = false)}
        {...swipeHandlers}
      >
        {box && <BubbleShape w={box.w} h={box.h} tailX={tailX} lean={right ? 1 : -1} id={clipId} />}
        <div className="relative px-[18px] py-[14px] pr-9">
          <p className="sr-only">
            {message.title ? `${message.title}. ` : ""}
            {message.text}
          </p>
          <div aria-hidden onClick={() => setTyped(message.text.length)} className="cursor-default font-sans text-[15px] leading-[1.4] text-[#0F1F18]">
            {message.title && <p className="mb-0.5 font-display text-[13px] font-bold">{message.title}</p>}
            {/* The full text sits underneath, invisible, so the bubble never changes size while typing. */}
            <p className="grid">
              <span className="invisible col-start-1 row-start-1">
                {segments(message.text).map(({ part, bold }, i) => (bold ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
              </span>
              <span className="col-start-1 row-start-1">{shown}</span>
            </p>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {message.action && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex min-h-9 items-center rounded-full bg-[#0F1F18] px-4 text-[13px] font-semibold text-[#F5EFE3] outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#FFB81F]"
              >
                {message.action}
              </button>
            )}
            <button
              type="button"
              onClick={() => onClose("dismiss")}
              className="inline-flex min-h-9 items-center rounded-md px-1 text-[13px] font-semibold text-[#0F1F18] underline underline-offset-2 outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#FFB81F]"
            >
              Got it
            </button>
            {onMute && (
              <button
                type="button"
                onClick={onMute}
                className="inline-flex min-h-9 items-center rounded-md px-1 text-[12px] font-medium text-[#0F1F18]/70 outline-offset-2 hover:text-[#0F1F18] focus-visible:outline-2 focus-visible:outline-[#FFB81F]"
              >
                Stop comments
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose("dismiss")}
            aria-label="Close"
            className="absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full text-[#0F1F18] outline-offset-1 hover:bg-[#F5EFE3] focus-visible:outline-2 focus-visible:outline-[#FFB81F]"
          >
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
