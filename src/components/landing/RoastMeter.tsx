"use client";

import { useState } from "react";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { LANDING_ROASTS } from "@/content/buddy-messages";
import { Avatar, type Expression } from "@/components/avatar/Avatar";

const ROASTS = LANDING_ROASTS;

/** The strip of roasts running across the landing page. Decoration, so hidden from screen readers. */
export function RoastMarquee() {
  return (
    <div aria-hidden className="marquee overflow-hidden border-b border-slate-200 bg-slate-900 py-3">
      <div className="marquee-track">
        {[...ROASTS, ...ROASTS].map((line, i) => (
          <span key={i} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium whitespace-nowrap text-white">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function verdict(share: number): { expression: Expression; text: string } {
  if (share <= 10) return { expression: "confused", text: "Only " + share + "%? Either you're a monk or you're lying to me." };
  if (share <= 25) return { expression: "proud", text: "Not bad. Suspiciously not bad. I'd like to see your bank statement." };
  if (share <= 45) return { expression: "thinking", text: "Hmm. The delivery guy knows your gate code, doesn't he?" };
  if (share <= 70) return { expression: "shocked", text: "Over half?! Are you eating the money directly?" };
  return { expression: "facepalm", text: "At this point the restaurant should be paying you rent." };
}

/** A quick toy: drag the slider, get roasted. Nothing typed here is saved or sent anywhere. */
export function RoastMeter() {
  const [share, setShare] = useState(35);
  const { expression, text } = verdict(share);
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pt-16 sm:px-6 sm:pt-20" aria-labelledby="meter-heading">
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-white p-6 text-center shadow-[0_24px_60px_-30px_rgb(15_31_24/0.45)] ring-1 ring-slate-200 sm:p-9">
        <h2 id="meter-heading" className="text-2xl leading-tight text-slate-900 sm:text-3xl">
          Go on. Tell me how bad it is.
        </h2>
        <Avatar
          key={expression}
          config={DEFAULT_AVATAR}
          expression={expression}
          alive
          className="h-32 w-auto animate-bob sm:h-36"
          label="The Rupli avatar, reacting"
        />
        <p key={text} role="status" className="min-h-12 max-w-md animate-avatar-in text-lg font-medium text-slate-800">
          {text}
        </p>
        <div className="w-full max-w-md">
          <label htmlFor="roast-share" className="block text-sm font-semibold text-slate-700">
            Out of every ₹100 you get, how much goes on food delivery? <span className="text-brand-700 tabular-nums">₹{share}</span>
          </label>
          <input
            id="roast-share"
            type="range"
            min={0}
            max={100}
            value={share}
            onChange={(e) => setShare(Number(e.target.value))}
            className="mt-3 h-6 w-full cursor-pointer accent-brand-600"
          />
          <p className="mt-1 text-xs text-slate-500">Just for fun. This isn&apos;t saved anywhere.</p>
        </div>
      </div>
    </section>
  );
}
