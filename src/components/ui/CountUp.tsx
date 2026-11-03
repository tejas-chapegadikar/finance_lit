"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 900;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const format = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * A number that ticks to its new value when it changes: it remembers (per
 * tab) the last value it showed, so coming back after earning XP counts the
 * total up from where it was, and spending counts a balance down. The real
 * value is rendered for screen readers and without JavaScript; reduced
 * motion skips the animation.
 */
export function CountUp({ value, id, className }: { value: number; id: string; className?: string }) {
  const digits = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = digits.current;
    if (!el) return;
    const key = `countup:${id}`;
    let from = value;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored !== null && Number.isFinite(Number(stored))) from = Number(stored);
      sessionStorage.setItem(key, String(value));
    } catch {
      // Storage blocked: just show the number.
    }
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from === value) {
      el.textContent = format(value);
      return;
    }
    // Set before the browser paints, so the new total never flashes first.
    el.textContent = format(from);
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / DURATION_MS);
      el.textContent = format(from + (value - from) * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [id, value]);

  return (
    <span className={className}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden ref={digits}>
        {format(value)}
      </span>
    </span>
  );
}
