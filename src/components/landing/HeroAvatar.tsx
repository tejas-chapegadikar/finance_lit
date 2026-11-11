"use client";

import { useRef, useState } from "react";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { LANDING_HERO } from "@/content/buddy-messages";
import { Avatar } from "@/components/avatar/Avatar";
import { usePointerGaze } from "@/components/avatar/use-gaze";

// The landing page's star: the Rupli avatar, blinking, watching your
// pointer, and roasting you a little every time you poke it.

const LINES = LANDING_HERO;

export function HeroAvatar() {
  const stage = useRef<HTMLDivElement>(null);
  const gaze = usePointerGaze(stage);
  const [i, setI] = useState(0);
  const line = LINES[i];

  return (
    <div ref={stage} className="relative mx-auto flex w-full max-w-md flex-col items-center">
      <span
        aria-hidden
        className="pointer-events-none absolute top-16 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_184_31/0.42),transparent_68%)] sm:h-96 sm:w-96"
      />
      <div
        key={i}
        role="status"
        aria-live="polite"
        className="relative z-10 mb-3 min-h-[4.5rem] w-full max-w-xs animate-avatar-in rounded-3xl bg-white px-5 py-3.5 text-center text-[15px] leading-snug font-medium text-slate-800 shadow-[0_14px_36px_-14px_rgb(28_26_38/0.35)] ring-1 ring-slate-200"
      >
        {line.text}
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        />
      </div>
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % LINES.length)}
        aria-label="Poke the Rupli avatar for another line"
        className="group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      >
        <Avatar
          key={i}
          config={DEFAULT_AVATAR}
          expression={line.expression}
          alive
          gaze={gaze}
          className="h-64 w-auto animate-bob drop-shadow-[0_18px_26px_rgb(15_31_24/0.28)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-80"
          label="The Rupli avatar"
        />
      </button>
      <p className="mt-2 text-xs font-medium text-slate-500">Go on, poke it.</p>
    </div>
  );
}
