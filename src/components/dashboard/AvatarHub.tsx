"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AvatarConfig } from "@/lib/avatar";
import { POKE_LINES, fillName } from "@/lib/avatar/context-lines";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { subscribeHub } from "@/components/avatar/buddy-store";
import { usePointerGaze } from "@/components/avatar/use-gaze";
import { Burst } from "@/components/ui/Burst";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArrowRightIcon, BookIcon, TrendingUpIcon, WalletIcon } from "@/components/ui/icons";

// The dashboard: the student's avatar in the middle, the three pillars
// around it. Clicking a pillar makes the avatar react, then takes you there;
// clicking the avatar gets a comment about your real money (worked out on
// the server) or a joke. Its eyes follow your pointer.

export type HubBlock = {
  id: "money" | "iq" | "invest";
  href: string;
  title: string;
  kicker: string;
  headline: string;
  detail: string;
  progress?: { value: number; max: number; label: string };
  cta: string;
};

type Say = {
  expression: Expression;
  text: string;
  title?: string;
  celebrate?: boolean;
  key: number;
};

const BLOCK_LINES: Record<HubBlock["id"], { expression: Expression; text: string }[]> = {
  money: [
    {
      expression: "excited",
      text: "Oh wow, finally! Someone wants to know where their money disappears every month.",
    },
    {
      expression: "thinking",
      text: "Money Management? Brave. Let's open the crime scene.",
    },
    {
      expression: "shocked",
      text: "Bold move, looking at your own spending. I'll hold your hand.",
    },
    {
      expression: "happy",
      text: "Let's count every rupee. Even the ₹20 chai. Especially the ₹20 chai.",
    },
  ],
  iq: [
    {
      expression: "proud",
      text: "Let's see if your financial knowledge is better than your attendance.",
    },
    {
      expression: "thinking",
      text: "Brain time! Don't worry, I'll go easy. Mostly.",
    },
    {
      expression: "excited",
      text: "Knowledge is the only investment that never crashes. Let's go.",
    },
    {
      expression: "happy",
      text: "Ready to know more about CIBIL than your parents? Let's do this.",
    },
  ],
  invest: [
    {
      expression: "confused",
      text: "Investing already? First learn how to stop spending all your pocket money!",
    },
    {
      expression: "excited",
      text: "Virtual money, real lessons. Let's make your money work instead of disappearing.",
    },
    {
      expression: "thinking",
      text: "Remember: nobody can promise returns. Anyone who does is a red flag. Okay, let's play.",
    },
    {
      expression: "shocked",
      text: "Wait… money can make more money?! Let's find out how.",
    },
  ],
};

const ICONS = { money: WalletIcon, iq: BookIcon, invest: TrendingUpIcon };
const TONES = {
  money: "from-emerald-50 to-white text-emerald-700 ring-emerald-100",
  iq: "from-brand-50 to-white text-brand-700 ring-brand-100",
  invest: "from-sky-50 to-white text-sky-700 ring-sky-100",
};

function Block({ block, onPick, active }: { block: HubBlock; onPick: (b: HubBlock) => void; active: boolean }) {
  const Icon = ICONS[block.id];
  return (
    <Link
      href={block.href}
      onClick={(e) => {
        e.preventDefault();
        onPick(block);
      }}
      className={`group relative flex h-full flex-col rounded-3xl bg-gradient-to-br p-5 ring-1 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgb(91_69_224/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:p-6 ${TONES[block.id]} ${active ? "-translate-y-1 shadow-[0_18px_40px_-18px_rgb(91_69_224/0.45)]" : "shadow-[0_8px_24px_-14px_rgb(28_26_38/0.25)]"}`}
    >
      <span className="flex items-center gap-2 text-[13px] font-semibold">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {block.title}
      </span>
      <span className="mt-1 text-xs text-slate-500">{block.kicker}</span>
      <span className="mt-3 font-display text-xl leading-snug font-bold text-slate-900">{block.headline}</span>
      <span className="mt-1 text-sm text-slate-600">{block.detail}</span>
      {block.progress && (
        <span className="mt-4 block">
          <ProgressBar value={block.progress.value} max={Math.max(1, block.progress.max)} label={block.progress.label} size="sm" />
        </span>
      )}
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700">
        {block.cta}
        <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

const FLOATERS = [
  {
    className: "top-[8%] left-[6%] h-7 w-7 bg-amber-300",
    delay: "0s",
    label: "₹",
  },
  {
    className: "top-[18%] right-[4%] h-5 w-5 bg-brand-300",
    delay: "1.2s",
    label: "",
  },
  {
    className: "bottom-[22%] left-[2%] h-4 w-4 bg-emerald-300",
    delay: "0.6s",
    label: "",
  },
  {
    className: "bottom-[10%] right-[10%] h-6 w-6 bg-amber-300",
    delay: "1.8s",
    label: "₹",
  },
  {
    className: "top-[45%] right-[-2%] h-3 w-3 bg-pink-300",
    delay: "2.4s",
    label: "",
  },
];

export function AvatarHub({
  avatar,
  name,
  greeting,
  roast,
  blocks,
}: {
  avatar: AvatarConfig;
  name: string;
  greeting: { expression: Expression; text: string };
  roast: { expression: Expression; lines: string[] };
  blocks: HubBlock[];
}) {
  const router = useRouter();
  const [say, setSay] = useState<Say>({ ...greeting, key: 0 });
  const [active, setActive] = useState<HubBlock["id"] | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gaze = usePointerGaze(stage);
  const pokes = useRef(0);

  // Messages the peeking avatar hands over (real events, milestones).
  useEffect(
    () =>
      subscribeHub((m) =>
        setSay({
          expression: m.expression,
          text: m.text,
          title: m.title,
          celebrate: m.celebrate,
          key: Date.now(),
        }),
      ),
    [],
  );

  function pick(block: HubBlock) {
    const lines = BLOCK_LINES[block.id];
    const line = lines[(pokes.current++ + block.id.length) % lines.length];
    setActive(block.id);
    setSay({ ...line, key: Date.now() });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push(block.href), reduce ? 700 : 1500);
  }

  function poke() {
    pokes.current += 1;
    // Odd pokes: what your money says (real data). Even pokes: a joke.
    if (pokes.current % 2 === 1 && roast.lines.length) {
      const text = roast.lines[Math.floor(pokes.current / 2) % roast.lines.length];
      setSay({ expression: roast.expression, text, key: Date.now() });
    } else {
      const p = POKE_LINES[pokes.current % POKE_LINES.length];
      setSay({
        expression: p.expression,
        text: fillName(p.text, name),
        key: Date.now(),
      });
    }
  }

  const [money, iq, invest] = blocks;

  return (
    <div ref={stage} className="relative grid grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)_minmax(0,1fr)] lg:gap-8">
      {/* The avatar, centre stage */}
      <div className="relative order-first flex flex-col items-center lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <span
          aria-hidden
          className="pointer-events-none absolute top-6 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(150_130_255/0.35),transparent_68%)] sm:h-80 sm:w-80"
        />
        {FLOATERS.map((f) => (
          <span
            key={f.className}
            aria-hidden
            className={`pointer-events-none absolute flex animate-float items-center justify-center rounded-full text-[11px] font-bold text-amber-900/70 shadow-sm ${f.className}`}
            style={{ animationDelay: f.delay }}
          >
            {f.label}
          </span>
        ))}
        {/* Speech bubble */}
        <div
          key={say.key}
          role="status"
          aria-live="polite"
          className="relative z-10 mb-2 w-full max-w-sm animate-avatar-in rounded-3xl bg-white px-5 py-4 text-center shadow-[0_14px_36px_-14px_rgb(28_26_38/0.35)] ring-1 ring-slate-200"
        >
          {say.title && <p className="mb-1 text-[11px] font-bold tracking-wide text-brand-700 uppercase">{say.title}</p>}
          <p className="text-[15px] leading-snug font-medium text-slate-800">{say.text}</p>
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
          />
        </div>
        <button
          type="button"
          onClick={poke}
          aria-label={`${name}'s avatar — click for a comment about your money`}
          className="group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
        >
          {say.celebrate && <Burst />}
          <Avatar
            key={say.key}
            config={avatar}
            expression={say.expression}
            alive
            gaze={gaze}
            className={`h-56 w-auto drop-shadow-[0_16px_24px_rgb(60_40_150/0.25)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-64 ${say.celebrate ? "animate-hop" : "animate-bob"}`}
            label={`${name}'s avatar`}
          />
        </button>
        <p className="mt-1 text-xs text-slate-500">Tap me. I have opinions.</p>
      </div>

      <div className="lg:col-start-1 lg:row-start-1">
        <Block block={money} onPick={pick} active={active === "money"} />
      </div>
      <div className="lg:col-start-3 lg:row-start-1">
        <Block block={iq} onPick={pick} active={active === "iq"} />
      </div>
      <div className="lg:col-span-3 lg:mx-auto lg:w-full lg:max-w-md lg:row-start-3">
        <Block block={invest} onPick={pick} active={active === "invest"} />
      </div>
    </div>
  );
}
