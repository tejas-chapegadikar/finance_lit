"use client";

import { forwardRef } from "react";
import { gsap } from "gsap";
import { CAMERA, STAGE_H, STAGE_W, type Actor, type Story } from "@/lib/story/types";
import { Person } from "./person";
import { Backdrop } from "./backdrops";
import { Arrow, Badge, Bar, Box, Chart, Gauge, MORE_ICONS, Needle, Screen, Stamp, Tree } from "./generic";
import { Mom, Riya } from "./characters";
import { Calendar, Card, Coin, Counter, Icon, Jar, Label, Lid, Lock, Note, Phone, Samosa, Sparkle, Wallet, formatCount } from "./props";

// Draws a story's cast on one SVG stage, and builds the timeline that plays it.
// The timeline is one unit long per scene; the engine scrubs it with scroll
// (or, for reduced motion, freezes it at the end of each scene).

const CHARACTERS = new Set(["riya", "mom", "person"]);
const num = (v: unknown, fallback: number) => (typeof v === "number" ? v : fallback);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

function Art({ actor }: { actor: Actor }) {
  const p = actor.props ?? {};
  switch (actor.kind) {
    case "riya":
      return <Riya layer={actor.layer} />;
    case "mom":
      return <Mom layer={actor.layer} />;
    case "wallet":
      return <Wallet />;
    case "note":
      return <Note />;
    case "coin":
      return <Coin />;
    case "samosa":
      return <Samosa />;
    case "jar":
      return <Jar label={str(p.label)} color={str(p.color, "#FFB81F")} fill={num(p.fill, 0)} />;
    case "lid":
      return <Lid />;
    case "lock":
      return <Lock />;
    case "calendar":
      return <Calendar pages={Array.isArray(p.pages) ? p.pages : ["1st"]} layer={actor.layer} />;
    case "phone":
      return <Phone />;
    case "icon":
      return str(p.name) in MORE_ICONS ? <Badge name={str(p.name)} ring={str(p.ring) || undefined} /> : <Icon name={str(p.name)} />;
    case "person":
      return actor.look ? <Person look={actor.look} layer={actor.layer} /> : null;
    case "box":
      return (
        <Box
          text={str(p.text)}
          w={num(p.w, 160)}
          h={num(p.h, 56)}
          fill={str(p.fill) || undefined}
          color={str(p.color) || undefined}
          size={num(p.size, 15)}
          depth={p.depth !== "no"}
        />
      );
    case "screen":
      return (
        <Screen
          title={str(p.title)}
          text={str(p.text)}
          button={str(p.button) || undefined}
          buttonColor={str(p.buttonColor) || undefined}
          tone={str(p.tone) || undefined}
        />
      );
    case "gauge":
      return <Gauge min={str(p.min, "300")} max={str(p.max, "900")} />;
    case "needle":
      return <Needle length={num(p.length, 66)} />;
    case "bar":
      return <Bar w={num(p.w, 200)} h={num(p.h, 22)} color={str(p.color) || undefined} fill={num(p.fill, 0)} />;
    case "tree":
      return <Tree leaf={str(p.leaf) || undefined} />;
    case "chart":
      return <Chart points={str(p.points)} color={str(p.color) || undefined} w={num(p.w, 200)} h={num(p.h, 110)} />;
    case "arrow":
      return <Arrow length={num(p.length, 80)} color={str(p.color) || undefined} />;
    case "stamp":
      return <Stamp text={str(p.text)} color={str(p.color) || undefined} />;
    case "backdrop":
      return <Backdrop place={str(p.place)} accent={str(p.accent) || undefined} />;
    case "counter":
      return <Counter value={num(p.value, 0)} size={num(p.size, 30)} color={str(p.color) || undefined} format={str(p.format, "rupee")} />;
    case "label":
      return <Label text={str(p.text)} size={num(p.size, 14)} color={str(p.color) || undefined} pill={str(p.pill, "") || undefined} />;
    case "card":
      return <Card icon={str(p.icon)} text={str(p.text)} />;
    case "sparkle":
      return <Sparkle color={str(p.color) || undefined} />;
  }
}

/** The SVG stage with every actor in its starting place. Decorative: the captions carry the meaning. */
export const StoryStage = forwardRef<SVGSVGElement, { story: Story; className?: string }>(function StoryStage({ story, className }, ref) {
  return (
    <svg ref={ref} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden className={className}>
      {story.backdrop && <Backdrop place={story.backdrop.place} accent={story.backdrop.accent} />}
      <g data-actor={CAMERA}>
        {story.actors.map((a) => (
          <g
            key={a.id}
            data-actor={a.id}
            opacity={a.opacity ?? 1}
            transform={`translate(${a.x ?? 0} ${a.y ?? 0}) rotate(${a.rotate ?? 0}) scale(${a.scale ?? 1})`}
          >
            <Art actor={a} />
          </g>
        ))}
      </g>
    </svg>
  );
});

/** A fill level: jars fill upwards, bars and charts fill to the right (data-axis="x"). */
function fillVars(el: SVGElement, level: number) {
  const v = Math.max(level, 0.0001);
  return el.dataset.axis === "x" ? { scaleX: v, transformOrigin: "0% 50%" } : { scaleY: v, transformOrigin: "50% 100%" };
}

/**
 * Builds the story's timeline on a rendered stage: one unit per scene. Captions
 * (real text, outside the SVG) fade in and out with their scenes. Everything is
 * reversible, so scrolling up plays the story backwards.
 */
export function buildTimeline(svg: SVGSVGElement, story: Story, captions: (HTMLElement | null)[] = []) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } });
  const node = (id: string) => svg.querySelector<SVGGElement>(`[data-actor="${id}"]`);

  for (const a of story.actors) {
    const el = node(a.id);
    if (!el) continue;
    gsap.set(el, {
      x: a.x ?? 0,
      y: a.y ?? 0,
      scale: a.scale ?? 1,
      rotation: a.rotate ?? 0,
      opacity: a.opacity ?? 1,
      // characters scale from their feet; a dial needle turns on its base
      transformOrigin: CHARACTERS.has(a.kind) ? "50% 100%" : a.kind === "needle" ? "50% 91.7%" : "50% 50%",
    });
    const fill = el.querySelector<SVGElement>("[data-fill]");
    if (fill) gsap.set(fill, fillVars(fill, num(a.props?.fill, 0)));
  }

  // The camera zooms and pans around the middle of the stage.
  const camera = node(CAMERA);
  if (camera) gsap.set(camera, { x: 0, y: 0, scale: 1, svgOrigin: "180 300" });

  story.scenes.forEach((scene, i) => {
    for (const step of scene.steps) {
      const el = node(step.actor);
      if (!el) continue;
      const t = i + step.at;
      if ("to" in step) {
        const { x, y, scale, rotate, opacity } = step.to;
        tl.to(el, { x, y, scale, rotation: rotate, opacity, duration: step.dur ?? 0.25, ease: step.ease ?? "power1.inOut" }, t);
      } else if ("layer" in step) {
        // "face:happy arms:up" sets two groups; a value may contain spaces ("page:Month 6").
        for (const token of step.layer.split(/\s+(?=[\w-]+:)/)) {
          const group = token.split(":")[0];
          const all = el.querySelectorAll(`[data-layer^="${group}:"]`);
          const these = el.querySelectorAll(`[data-layer="${token}"]`); // both arms share a pose name
          if (all.length) tl.set(all, { opacity: 0 }, t);
          if (these.length) tl.set(these, { opacity: 1 }, t);
        }
      } else if ("count" in step) {
        const text = el.querySelector<SVGTextElement>("[data-count]");
        if (!text) continue;
        const format = text.dataset.count ?? "rupee";
        const value = { v: step.count[0] };
        const paint = () => (text.textContent = formatCount(value.v, format));
        tl.to(value, { v: step.count[1], duration: step.dur, ease: "power1.out", onUpdate: paint, onReverseComplete: paint }, t);
      } else if ("fill" in step) {
        const fill = el.querySelector("[data-fill]");
        if (fill)
          tl.fromTo(
            fill,
            fillVars(fill as SVGElement, step.fill[0]),
            { ...fillVars(fill as SVGElement, step.fill[1]), duration: step.dur, ease: "power1.inOut", immediateRender: false },
            t,
          );
      } else if ("shake" in step) {
        const a = step.shake;
        tl.to(el, { keyframes: { rotation: [0, -a, a, -a * 0.7, a * 0.7, -a * 0.4, 0] }, duration: step.dur, ease: "none" }, t);
      }
    }
  });

  // Captions: each fades in at its scene's start and out at its end (the first starts showing, the last stays).
  const last = story.scenes.length - 1;
  captions.forEach((cap, i) => {
    if (!cap) return;
    if (i > 0) {
      gsap.set(cap, { opacity: 0, y: 14 });
      tl.to(cap, { opacity: 1, y: 0, duration: 0.12 }, i + 0.02);
    }
    if (i < last) tl.to(cap, { opacity: 0, y: -14, duration: 0.12 }, i + 0.86);
  });

  tl.set({}, {}, story.scenes.length); // exactly one unit per scene
  return tl;
}
