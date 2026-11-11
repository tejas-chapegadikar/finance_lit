"use client";

import { useEffect, useState, ViewTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AvatarConfig } from "@/lib/avatar";
import type { HubOptionId } from "@/content/avatar-lines";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { BookIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";

// Home: the avatar in the middle, its message in a speech cloud, and three
// option bubbles around it. The suggested one glows. On first load each
// session the avatar pops up, the cloud appears and the bubbles fly out
// (about 1.2s, skipped by a tap). Tapping a bubble expands it into the next
// page (a view transition where the browser supports it). Only transform and
// opacity animate; reduced motion turns it all off.

export type HubOption = { id: HubOptionId; href: string; title: string; subtitle: string };

const ICON = { learn: BookIcon, money: WalletIcon, invest: TrendingUpIcon };
const TINT = { learn: "bg-brand-50 text-brand-900", money: "bg-emerald-50 text-emerald-800", invest: "bg-sky-50 text-sky-800" };
// Where each bubble flies out from (towards the avatar), and how it floats.
const MOTION: Record<HubOptionId, string> = {
  learn: "[--fx:70px] [--fy:90px] md:[--fx:150px] md:[--fy:20px] [--fd:3.6s] [--dx:2px] [--dy:-5px] [animation-delay:0.4s]",
  money: "[--fx:-70px] [--fy:90px] md:[--fx:-150px] md:[--fy:20px] [--fd:4.4s] [--dx:-2px] [--dy:-6px] [animation-delay:0.52s]",
  invest: "[--fx:0px] [--fy:-110px] md:[--fy:-120px] [--fd:5s] [--dx:3px] [--dy:-4px] [animation-delay:0.64s]",
};
const AREA = { learn: "[grid-area:learn]", money: "[grid-area:money]", invest: "[grid-area:invest] justify-self-center w-full max-w-[16rem]" };
// The avatar looks (eyes and a small head turn) towards the bubble you hover or press.
const LOOK: Record<HubOptionId, { gaze: { x: number; y: number }; turn: string }> = {
  learn: { gaze: { x: -0.9, y: -0.4 }, turn: "-6deg" },
  money: { gaze: { x: 0.9, y: -0.4 }, turn: "6deg" },
  invest: { gaze: { x: 0, y: 0.9 }, turn: "0deg" },
};
const INTRO_KEY = "rupli-hub-intro";

/** The message, typed out quickly. Screen readers get the whole thing at once. */
function Typed({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1";
    const step = calm ? text.length : Math.max(1, Math.ceil(text.length / 45));
    let n = 0;
    const id = window.setInterval(() => {
      n = Math.min(text.length, n + step);
      setCount(n);
      if (n >= text.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <span className="relative block">
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {text.slice(0, count)}
      </span>
    </span>
  );
}

export function AvatarHub({
  avatar,
  expression,
  message,
  highlight,
  options,
}: {
  avatar: AvatarConfig;
  expression: Expression;
  message: string;
  highlight: HubOptionId | null;
  options: HubOption[];
}) {
  const router = useRouter();
  const [look, setLook] = useState<HubOptionId | null>(null);
  const [leaving, setLeaving] = useState<HubOptionId | null>(null);

  // The three places you can go are ready before you tap.
  useEffect(() => {
    options.forEach((o) => router.prefetch(o.href));
  }, [options, router]);

  // The intro plays once a session; after it, coming back to Home is instant.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* private mode, fine */
    }
    const id = window.setTimeout(() => (document.documentElement.dataset.hubSeen = "1"), 1300);
    return () => window.clearTimeout(id);
  }, []);

  const skipIntro = () => (document.documentElement.dataset.hubSeen = "1");
  const gaze = look ? LOOK[look].gaze : { x: 0, y: 0 };

  return (
    <section
      aria-label="Pick what to do"
      data-guide="hub"
      onPointerDown={skipIntro}
      className={`hub-intro relative mx-auto grid w-full max-w-md grid-cols-2 items-center gap-x-3 gap-y-3 [grid-template-areas:'learn_money'_'hero_hero'_'invest_invest'] md:max-w-4xl md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] md:gap-x-8 md:[grid-template-areas:'learn_hero_money'_'._invest_.'] ${leaving ? "hub-leaving" : ""}`}
    >
      <div className="flex items-center gap-2 [grid-area:hero] md:flex-col-reverse md:gap-3">
        <div className="hub-pop shrink-0">
          <div className="transition-[rotate] duration-300" style={{ rotate: look ? LOOK[look].turn : "0deg" }}>
            <div className="hub-breathe">
              <Avatar
                config={avatar}
                expression={leaving ? "welcoming" : expression}
                alive
                gaze={gaze}
                className={`h-40 w-auto drop-shadow-[0_14px_20px_rgb(15_31_24/0.18)] md:h-56 ${leaving ? "" : "animate-bob"}`}
                label="Your avatar"
              />
            </div>
          </div>
        </div>
        <div className="hub-cloud relative min-w-0 flex-1 rounded-3xl bg-white px-4 py-3 text-[15px] leading-snug font-medium text-slate-900 shadow-[0_12px_30px_-14px_rgb(15_31_24/0.35)] ring-1 ring-slate-200 md:w-full md:text-center">
          <span
            aria-hidden
            className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(0_0,0_100%,100%_100%)] md:top-auto md:-bottom-1.5 md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:[clip-path:polygon(100%_0,100%_100%,0_100%)]"
          />
          <p role="status" aria-live="polite" className="sr-only">
            {message}
          </p>
          <Typed text={message} />
        </div>
      </div>

      {options.map((o) => {
        const Icon = ICON[o.id];
        const suggested = highlight === o.id;
        return (
          <div key={o.id} className={`hub-fly h-full md:h-auto ${AREA[o.id]} ${MOTION[o.id]}`}>
            <div className="hub-float h-full md:h-auto">
              <ViewTransition name={`hub-${o.id}`} share="morph" default="none">
                <Link
                  href={o.href}
                  data-guide={suggested ? "hub-suggested" : undefined}
                  onPointerEnter={() => setLook(o.id)}
                  onPointerLeave={() => setLook(null)}
                  onPointerDown={() => setLook(o.id)}
                  onFocus={() => setLook(o.id)}
                  onBlur={() => setLook(null)}
                  onClick={() => setLeaving(o.id)}
                  className={`hub-bubble relative flex h-full min-h-[6.25rem] md:h-auto flex-col justify-center gap-1 rounded-3xl bg-white p-3.5 shadow-[0_10px_26px_-14px_rgb(15_31_24/0.4)] ring-1 ring-slate-200 transition-[scale,opacity] duration-200 hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:min-h-[8rem] md:p-5 ${suggested ? "hub-glow ring-2 ring-brand-500" : ""} ${leaving === o.id ? "is-going" : leaving ? "is-fading" : ""}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span aria-hidden className={`flex h-9 w-9 items-center justify-center rounded-xl ${TINT[o.id]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    {suggested && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-brand-900">Suggested</span>}
                  </span>
                  <span className="font-display text-base leading-tight font-bold text-slate-900 md:text-lg">{o.title}</span>
                  <span className="text-xs leading-snug text-slate-600 md:text-sm">{o.subtitle}</span>
                </Link>
              </ViewTransition>
            </div>
          </div>
        );
      })}
    </section>
  );
}
