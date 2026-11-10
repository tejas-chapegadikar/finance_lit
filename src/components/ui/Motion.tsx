"use client";

import { useEffect, useSyncExternalStore } from "react";

// Two small site-wide effects, mounted once in the root layout. Both work by
// watching the page, so no page has to opt in, and both switch off for people
// who ask for less motion.

const TAPPABLE = 'a, button, summary, label, select, [role="button"], [role="radio"], [role="checkbox"], [role="tab"]';
const REVEALABLE = 'main section, main article, main h2, main li, main [class*="rounded-2xl"], main [class*="rounded-3xl"]';

const CALM_KEY = "rupli-calm";
const calmListeners = new Set<() => void>();

function storedCalm() {
  try {
    return window.localStorage.getItem(CALM_KEY) === "1";
  } catch {
    return false;
  }
}

function applyCalm(on: boolean) {
  if (on) document.documentElement.dataset.calm = "1";
  else delete document.documentElement.dataset.calm;
}

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || storedCalm();

/** Footer switch: stops every animation on the site, remembered on this device. */
export function MotionToggle({ className = "" }: { className?: string }) {
  const paused = useSyncExternalStore(
    (listener) => {
      calmListeners.add(listener);
      return () => calmListeners.delete(listener);
    },
    storedCalm,
    () => false,
  );
  function toggle() {
    try {
      if (paused) window.localStorage.removeItem(CALM_KEY);
      else window.localStorage.setItem(CALM_KEY, "1");
    } catch {
      /* private mode, fine */
    }
    applyCalm(!paused);
    calmListeners.forEach((listener) => listener());
  }
  return (
    <button type="button" onClick={toggle} className={`font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline ${className}`}>
      {paused ? "Play animations" : "Pause animations"}
    </button>
  );
}

/** Cards lean towards the pointer; the big purple cards get a glow that follows it. Mouse only. */
function usePointerEffects() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let current: HTMLElement | null = null;
    let frame = 0;
    function clear() {
      current?.style.removeProperty("--rx");
      current?.style.removeProperty("--ry");
      current = null;
    }
    function move(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = e.target as Element | null;
        const card = target?.closest?.<HTMLElement>(".tilt, .glow-follow") ?? null;
        if (card !== current) clear();
        if (!card || calm()) return;
        current = card;
        const box = card.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width;
        const y = (e.clientY - box.top) / box.height;
        card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        if (card.matches(".tilt")) {
          card.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
          card.style.setProperty("--ry", `${((x - 0.5) * 5).toFixed(2)}deg`);
        }
      });
    }
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", clear);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", clear);
      cancelAnimationFrame(frame);
    };
  }, []);
}

/** A soft ring where you tap or click anything interactive (mouse and touch). */
function useTapRings() {
  useEffect(() => {
    function tap(e: PointerEvent) {
      const target = e.target as Element | null;
      const hit = target?.closest?.(TAPPABLE) as HTMLElement | null;
      if (!hit || hit.matches(":disabled") || calm()) return;
      const ring = document.createElement("span");
      ring.className = "tap-ring";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      document.body.append(ring);
    }
    document.addEventListener("pointerdown", tap, { passive: true });
    return () => document.removeEventListener("pointerdown", tap);
  }, []);
}

/**
 * Cards, sections and headings below the fold ease in as you scroll to them.
 * Things already on screen are left alone, so nothing flickers. Uses the
 * browser's animation API rather than classes or attributes, so it never
 * disturbs React's HTML or an element's own hover transitions.
 */
function useScrollReveal() {
  useEffect(() => {
    if (calm() || !("IntersectionObserver" in window)) return;
    const seen = new WeakSet<Element>();
    const waiting = new Map<Element, Animation>();

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const animation = waiting.get(entry.target);
          io.unobserve(entry.target);
          waiting.delete(entry.target);
          if (!animation) continue;
          animation.effect?.updateTiming({ delay: Math.min(order++, 4) * 70 });
          animation.onfinish = () => animation.cancel();
          animation.play();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    function hasRevealingParent(node: Element) {
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        if (waiting.has(parent) || parent.matches('.reveal, [role="status"]')) return true;
      }
      return false;
    }

    function scan() {
      for (const node of document.querySelectorAll<HTMLElement>(REVEALABLE)) {
        if (seen.has(node)) continue;
        seen.add(node);
        if (node.matches(".reveal") || hasRevealingParent(node)) continue;
        if (node.getBoundingClientRect().top < window.innerHeight) continue;
        const animation = node.animate(
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
        );
        animation.pause();
        waiting.set(node, animation);
        io.observe(node);
      }
    }

    const showAll = () => waiting.forEach((animation) => animation.cancel());
    let frame = 0;
    const queue = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          scan();
        });
    };
    scan();
    const watcher = new MutationObserver(queue);
    watcher.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("beforeprint", showAll);
    return () => {
      watcher.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeprint", showAll);
      showAll();
    };
  }, []);
}

export function Motion() {
  useEffect(() => applyCalm(storedCalm()), []);
  useTapRings();
  useScrollReveal();
  usePointerEffects();
  return <div aria-hidden className="scroll-progress" />;
}
