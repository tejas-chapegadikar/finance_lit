"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { GuideTip } from "@/lib/guide/bus";
import type { AvatarConfig } from "@/lib/avatar";
import { MAP_W, layoutMap, type SlotKind } from "@/lib/learn/map-layout";
import { Avatar } from "@/components/avatar/Avatar";
import { LockedStop } from "@/components/guide/GuideBits";
import { Burst } from "@/components/ui/Burst";
import { CheckIcon, CompassIcon, LockIcon, RefreshIcon, StarIcon, TrendingUpIcon } from "@/components/ui/icons";
import { MapScenery } from "./MapScenery";

// The Learn map: one winding road from the start house up to the summit, a
// sign for each level and a stop for each lesson, practice, revision and
// simulator. Your avatar stands at the stop you're on. When you've moved on
// since your last visit (a lesson done, a level unlocked), it walks along the
// road to the new stop: the road lights up gold behind it, stops it passes pop
// into their new state, and the page follows it. Tap the map to skip. Reduced
// motion: no walk, it's simply there. The level chips glide to each level.

export type StopState = "done" | "current" | "open" | "locked";

export type PathStop = {
  key: string;
  kind: "lesson" | "practice" | "revision" | "tool";
  title: string;
  note: string;
  href: string | null;
  state: StopState;
  lockedTip?: GuideTip;
  /** Lessons: their number on the map, and stars (1-3) once done. */
  number?: number;
  stars?: number;
};

export type PathUnit = { id: string; eyebrow: string; title: string; state: StopState; done: number; total: number; stops: PathStop[] };

type Slot = { kind: "start"; key: string } | { kind: "banner"; key: string; unit: PathUnit } | { kind: "stop"; key: string; stop: PathStop };

/** The last place you saw your avatar stand, by stop key (survives stops moving). */
const POS_KEY = "rupli-map-pos";
const SUMMIT = "summit";

const NODE: Record<StopState, string> = {
  done: "bg-brand-500 text-brand-900",
  current: "bg-brand-900 text-brand-500 ring-4 ring-brand-500/70",
  open: "bg-white text-brand-900 ring-2 ring-brand-900",
  locked: "bg-slate-100 text-slate-500 ring-1 ring-slate-300",
};
const KIND_ICON = { practice: CompassIcon, revision: RefreshIcon, tool: TrendingUpIcon };
const STATE_WORD: Record<StopState, string> = { done: "Done", current: "You are here", open: "Open", locked: "Locked" };

const calmNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1";

function Stars({ count }: { count: number }) {
  return (
    <span className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 gap-px">
      {[0, 1, 2].map((i) => (
        <StarIcon key={i} className={`h-3.5 w-3.5 ${i < count ? "fill-brand-500 text-brand-700" : "fill-white text-slate-400"}`} />
      ))}
    </span>
  );
}

function StopNode({ stop, labelLeft }: { stop: PathStop; labelLeft: boolean }) {
  const lesson = stop.kind === "lesson";
  const Icon = stop.state === "done" ? CheckIcon : stop.state === "locked" ? LockIcon : lesson ? null : KIND_ICON[stop.kind as keyof typeof KIND_ICON];
  const body = (
    <>
      <span
        aria-hidden
        className={`map-node relative flex shrink-0 items-center justify-center border-[3px] border-white font-display font-bold shadow-[0_6px_14px_-6px_rgb(15_31_24/0.5)] ${lesson ? "h-14 w-14 rounded-full text-lg" : "h-11 w-11 rounded-2xl text-sm"} ${NODE[stop.state]} ${stop.state === "current" ? "path-pulse" : ""}`}
      >
        {Icon ? <Icon className={lesson ? "h-6 w-6" : "h-5 w-5"} /> : stop.number}
        {lesson && stop.state === "done" && stop.stars ? <Stars count={stop.stars} /> : null}
      </span>
      <span
        className={`absolute top-1/2 w-[8.25rem] -translate-y-1/2 rounded-xl bg-white/95 px-2 py-1 text-left shadow-sm ring-1 ring-slate-200 ${labelLeft ? "right-full mr-2" : "left-full ml-2"}`}
      >
        <span className="line-clamp-2 block text-xs leading-tight font-semibold text-slate-900">{stop.title}</span>
        <span className={`block text-[11px] leading-tight ${stop.state === "current" ? "font-semibold text-orange-700" : "text-slate-600"}`}>{stop.note}</span>
        <span className="sr-only">
          . {STATE_WORD[stop.state]}
          {lesson && stop.state === "done" && stop.stars ? `, ${stop.stars} of 3 stars` : ""}
        </span>
      </span>
    </>
  );
  const cls = "relative flex items-center rounded-full outline-offset-4 focus-visible:outline-3 focus-visible:outline-brand-600";
  if (stop.href)
    return (
      <Link href={stop.href} className={cls}>
        {body}
      </Link>
    );
  if (stop.lockedTip)
    return (
      <LockedStop tip={stop.lockedTip} className={cls}>
        {body}
      </LockedStop>
    );
  return <div className={cls}>{body}</div>;
}

export function LearnMap({ units, avatar }: { units: PathUnit[]; avatar: AvatarConfig }) {
  const slots = useMemo<Slot[]>(
    () => [
      { kind: "start", key: "start" },
      ...units.flatMap((unit) => [
        { kind: "banner" as const, key: `banner-${unit.id}`, unit },
        ...unit.stops.map((stop) => ({ kind: "stop" as const, key: stop.key, stop })),
      ]),
    ],
    [units],
  );
  const kinds = useMemo(() => slots.map((s) => s.kind) as SlotKind[], [slots]);
  const layout = useMemo(() => layoutMap(kinds), [kinds]);

  // Where the avatar belongs: the stop you're on, else the first open lesson, else the summit.
  const target = useMemo(() => {
    const current = slots.findIndex((s) => s.kind === "stop" && s.stop.state === "current");
    if (current >= 0) return current;
    const open = slots.findIndex((s) => s.kind === "stop" && s.stop.state === "open" && s.stop.kind === "lesson");
    return open >= 0 ? open : slots.length;
  }, [slots]);

  const pointOf = (i: number) => (i >= slots.length ? layout.summit : layout.points[i]);
  const lengthOf = (i: number) => (i >= slots.length ? layout.summitLength : layout.lengths[i]);
  const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / MAP_W) * 100}%`, top: `${(p.y / layout.height) * 100}%` });

  const mapRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const skip = useRef(false);
  const walkFrom = useRef<number | null>(null);
  // The walk: where it started, how far it's got. Null when there's no walk.
  const [walk, setWalk] = useState<{ from: number; at: number } | null>(null);
  const [cheer, setCheer] = useState(false);

  // Before the first paint: decide whether to walk, and if so, stand the
  // avatar (and the gold line) where you were last time, so nothing jumps.
  useLayoutEffect(() => {
    const marker = avatarRef.current;
    const glow = glowRef.current;
    if (!marker || !glow) return;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(POS_KEY);
    } catch {
      /* private mode, fine */
    }
    // First visit: walk from the start house. Later: from where you were.
    const from = stored === null ? 0 : stored === SUMMIT ? slots.length : slots.findIndex((s) => s.key === stored);
    if (calmNow() || from < 0 || from >= target) return;
    walkFrom.current = from;
    mapRef.current?.querySelectorAll<HTMLElement>("[data-slot]").forEach((el) => {
      const i = Number(el.dataset.slot);
      if (i > from && i <= target) el.classList.add("map-pending");
    });
    const p = pointOf(from);
    marker.style.left = `${(p.x / MAP_W) * 100}%`;
    marker.style.top = `${(p.y / layout.height) * 100}%`;
    glow.style.strokeDashoffset = String(layout.total - lengthOf(from));
    // Runs once per visit; the map only changes on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const road = roadRef.current;
    const map = mapRef.current;
    const glow = glowRef.current;
    const marker = avatarRef.current;
    if (!road || !map || !glow || !marker) return;
    const save = () => {
      try {
        window.localStorage.setItem(POS_KEY, target >= slots.length ? SUMMIT : slots[target].key);
      } catch {
        /* private mode, fine */
      }
    };
    const placeCamera = (y: number, smooth = false) => {
      const box = map.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + box.top + (y / layout.height) * box.height - window.innerHeight * 0.55,
        behavior: smooth ? "smooth" : "instant",
      });
    };
    const from = walkFrom.current;
    if (from === null) {
      // No walk: just bring your stop into view.
      const id = requestAnimationFrame(() => placeCamera(pointOf(target).y));
      save();
      return () => cancelAnimationFrame(id);
    }

    const L0 = lengthOf(from);
    const L1 = lengthOf(target);
    const scale = road.getTotalLength() / layout.total;
    const duration = Math.min(2800, 900 + (target - from) * 260);
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    let follow = true;
    let start = 0;
    let frame = 0;
    let last = from;
    const stopFollowing = () => (follow = false);
    window.addEventListener("wheel", stopFollowing, { passive: true });
    window.addEventListener("touchmove", stopFollowing, { passive: true });
    window.addEventListener("keydown", stopFollowing);

    const step = (now: number) => {
      if (!start) start = now;
      const t = skip.current ? 1 : Math.min(1, (now - start) / duration);
      const L = L0 + (L1 - L0) * ease(t);
      const pt = road.getPointAtLength(L * scale);
      marker.style.left = `${(pt.x / MAP_W) * 100}%`;
      marker.style.top = `${(pt.y / layout.height) * 100}%`;
      glow.style.strokeDashoffset = String(layout.total - L);
      let at = last;
      for (let i = last + 1; i <= target && i < slots.length; i++) if (L >= layout.lengths[i] - 0.5) at = i;
      if (t >= 1) at = target;
      if (at !== last) {
        last = at;
        setWalk({ from, at });
      }
      if (follow) placeCamera(pt.y);
      if (t < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      setCheer(true);
      save();
      window.removeEventListener("wheel", stopFollowing);
      window.removeEventListener("touchmove", stopFollowing);
      window.removeEventListener("keydown", stopFollowing);
    };
    let beat = 0;
    frame = requestAnimationFrame(() => {
      setWalk({ from, at: from });
      placeCamera(pointOf(from).y);
      // A short beat so you see where you were before it sets off.
      beat = window.setTimeout(() => (frame = requestAnimationFrame(step)), 450);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(beat);
      window.removeEventListener("wheel", stopFollowing);
      window.removeEventListener("touchmove", stopFollowing);
      window.removeEventListener("keydown", stopFollowing);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToLevel(unitId: string) {
    const el = document.getElementById(`unit-${unitId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: calmNow() ? "auto" : "smooth", block: "center" });
    const sign = el.querySelector(".map-node");
    sign?.classList.remove("map-flash");
    void (sign as HTMLElement | null)?.offsetWidth;
    sign?.classList.add("map-flash");
  }

  const walking = walk !== null && walk.at < target;
  // Stops still ahead of the avatar wait in their old look; ones it has passed pop.
  const motion = (i: number) => (walk === null || i <= walk.from || i > target ? "" : i > walk.at ? "map-pending" : "map-pop");

  return (
    <div className="flex flex-col gap-3">
      <nav
        aria-label="Jump to a level"
        className="sticky top-14 z-20 -mx-4 flex gap-1.5 overflow-x-auto bg-slate-50/90 px-4 py-2 backdrop-blur-md sm:mx-0 sm:px-0 lg:top-0"
      >
        {units.map((unit, n) => (
          <button
            key={unit.id}
            type="button"
            onClick={() => goToLevel(unit.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ring-1 transition active:scale-95 ${unit.state === "done" ? "bg-brand-500 text-brand-900 ring-brand-500" : unit.state === "locked" ? "bg-white text-slate-600 ring-slate-200" : unit.state === "current" ? "bg-brand-900 text-white ring-brand-900" : "bg-white text-brand-900 ring-2 ring-brand-900"}`}
          >
            {unit.state === "done" ? (
              <CheckIcon aria-hidden className="h-4 w-4" />
            ) : unit.state === "locked" ? (
              <LockIcon aria-hidden className="h-4 w-4" />
            ) : null}
            {unit.id === "investsmart" ? "Invest" : `Level ${n + 1}`}
            <span className="sr-only">
              : {unit.title}, {unit.state === "done" ? "done" : unit.state === "locked" ? "locked" : `${unit.done} of ${unit.total} done`}
            </span>
          </button>
        ))}
      </nav>

      <div
        ref={mapRef}
        data-guide="learn-path"
        data-no-reveal
        onPointerDown={() => (skip.current = true)}
        className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-3xl ring-1 ring-slate-200"
        style={{ aspectRatio: `${MAP_W} / ${layout.height}` }}
      >
        <svg viewBox={`0 0 ${MAP_W} ${layout.height}`} aria-hidden className="absolute inset-0 h-full w-full">
          <MapScenery layout={layout} kinds={kinds} />
          <path d={layout.d} fill="none" stroke="#e6d29b" strokeWidth={42} strokeLinecap="round" />
          <path d={layout.d} fill="none" stroke="#fbf1d6" strokeWidth={34} strokeLinecap="round" />
          <path
            ref={glowRef}
            d={layout.d}
            fill="none"
            stroke="#ffb81f"
            strokeWidth={10}
            strokeLinecap="round"
            pathLength={layout.total}
            strokeDasharray={`${layout.total} ${layout.total}`}
            strokeDashoffset={layout.total - lengthOf(target)}
          />
          <path ref={roadRef} d={layout.d} fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray="7 9" strokeLinecap="round" />
        </svg>

        <ol className="absolute inset-0">
          {slots.map((slot, i) => {
            const p = layout.points[i];
            if (slot.kind === "start")
              return (
                <li key={slot.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(p)}>
                  <span className="rounded-full bg-brand-900 px-3 py-1 text-xs font-bold text-white shadow">Start</span>
                </li>
              );
            if (slot.kind === "banner") {
              const u = slot.unit;
              // Signs sit on the road, nudged in so they never touch the edge.
              const left = `${Math.min(66, Math.max(34, (p.x / MAP_W) * 100))}%`;
              return (
                <li
                  key={slot.key}
                  id={`unit-${u.id}`}
                  data-guide={`unit-${u.id}`}
                  data-slot={i}
                  className={`absolute w-max max-w-[11.5rem] -translate-x-1/2 -translate-y-1/2 scroll-mt-32 ${motion(i)}`}
                  style={{ left, top: pct(p).top }}
                >
                  <h2
                    className={`map-node flex items-center gap-2 rounded-2xl px-3 py-1.5 shadow-[0_8px_18px_-8px_rgb(15_31_24/0.45)] ring-2 ${u.state === "locked" ? "bg-white text-slate-600 ring-slate-200" : u.state === "done" ? "bg-brand-500 text-brand-900 ring-white" : "bg-brand-900 text-white ring-brand-500"}`}
                  >
                    {u.state === "locked" ? (
                      <LockIcon aria-hidden className="h-4 w-4 shrink-0" />
                    ) : u.state === "done" ? (
                      <CheckIcon aria-hidden className="h-4 w-4 shrink-0" />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold tracking-wide uppercase">
                        {u.eyebrow} · {u.done}/{u.total}
                        <span className="sr-only"> done{u.state === "locked" ? ", locked" : ""}:</span>
                      </span>
                      <span className="line-clamp-2 block font-display text-sm leading-tight font-bold">{u.title}</span>
                    </span>
                  </h2>
                </li>
              );
            }
            return (
              <li
                key={slot.key}
                data-slot={i}
                data-guide={i === target ? "learn-current" : undefined}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${motion(i)}`}
                style={pct(p)}
              >
                <StopNode stop={slot.stop} labelLeft={p.x >= 180} />
              </li>
            );
          })}
          {target >= slots.length && (
            <li data-guide="learn-current" className="absolute -translate-x-1/2 translate-y-3" style={pct(layout.summit)}>
              <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold whitespace-nowrap text-brand-900 shadow">Summit reached</span>
            </li>
          )}
        </ol>

        {/* You */}
        <div ref={avatarRef} aria-hidden className="pointer-events-none absolute z-10" style={pct(pointOf(target))}>
          <div className="relative -translate-x-1/2 -translate-y-[112%]">
            {cheer && <Burst />}
            <div className={walking ? "map-walk" : "animate-bob"}>
              <Avatar
                config={avatar}
                expression={walking ? "excited" : cheer ? "celebrating" : "happy"}
                crop="head"
                className="h-14 w-14 drop-shadow-[0_6px_8px_rgb(15_31_24/0.35)]"
              />
            </div>
            <span className="absolute -bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-brand-900/20 blur-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
