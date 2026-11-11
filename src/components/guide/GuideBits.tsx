"use client";

import { useEffect, useRef } from "react";
import { guideSay, openPageGuide, type GuideTip } from "@/lib/guide/bus";
import { HelpIcon } from "@/components/ui/icons";

/** The "?" in the header: replays the guide for this page. */
export function GuideButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openPageGuide}
      aria-label="Help with this page"
      title="Help with this page"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 transition hover:ring-brand-500 ${className}`}
    >
      <HelpIcon className="h-[18px] w-[18px]" />
    </button>
  );
}

/** A locked stop: tapping it explains why, and points to what opens it. */
export function LockedStop({ tip, children }: { tip: GuideTip; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => guideSay(tip)}
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl py-1 pr-2 text-left transition hover:bg-white/70"
    >
      {children}
    </button>
  );
}

/** Says something once when a page opens (e.g. "what next" after a finished lesson). */
export function GuideOnMount({ tip }: { tip: GuideTip }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    const id = window.setTimeout(() => guideSay(tip), 1800);
    return () => window.clearTimeout(id);
  }, [tip]);
  return null;
}

/** A plain button that makes the avatar say something (e.g. "Show me" in an empty state). */
export function GuideSayButton({ tip, className, children }: { tip: GuideTip; className: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => guideSay(tip)} className={className}>
      {children}
    </button>
  );
}
