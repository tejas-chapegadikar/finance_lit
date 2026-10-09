"use client";

import { useEffect, useState } from "react";

export type LessonStep = { id: string; title: string };

/**
 * A sticky "Step 3 of 6 · Real-life example" bar that follows the student
 * through the lesson. `id` is the id of each part's heading.
 */
export function LessonProgressBar({ steps }: { steps: LessonStep[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const headings = steps.map((step) => document.getElementById(step.id));

    function update() {
      // The current part is the last one whose heading has scrolled into the
      // top 40% of the screen; at the very bottom it's the last part.
      const threshold = window.innerHeight * 0.4;
      let index = 0;
      headings.forEach((heading, i) => {
        if (heading && heading.getBoundingClientRect().top <= threshold) index = i;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        index = steps.length - 1;
      }
      setCurrent(index);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [steps]);

  if (steps.length === 0) return null;
  const step = steps[current];

  return (
    // The outer strip (page colour, edge to edge) hides lesson text scrolling
    // past between the top bar and the progress card.
    <div className="sticky top-14 z-20 -mx-4 bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5">
        <p className="shrink-0 text-xs font-bold text-slate-700 tabular-nums">
          Step {current + 1} of {steps.length}
          <span className="font-semibold text-slate-600"> · {step.title}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Progress through this lesson"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={current + 1}
          aria-valuetext={`Step ${current + 1} of ${steps.length}: ${step.title}`}
          className="h-2 min-w-12 flex-1 overflow-hidden rounded-full bg-brand-100"
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
