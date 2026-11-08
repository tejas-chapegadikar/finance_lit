"use client";

import { useEffect } from "react";

// Two small site-wide effects, mounted once in the root layout. Both work by
// watching the page, so no page has to opt in, and both switch off for people
// who ask for less motion.

const TAPPABLE = 'a, button, summary, label, select, [role="button"], [role="radio"], [role="checkbox"], [role="tab"]';
const REVEALABLE = 'main section, main article, main h2, main li, main [class*="rounded-2xl"], main [class*="rounded-3xl"]';

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  useTapRings();
  useScrollReveal();
  return null;
}
