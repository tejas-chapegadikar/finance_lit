import { CAMERA, type Actor, type Pose2D, type Scene, type Step } from "@/lib/story/types";
import type { Look } from "@/components/story/person";

// Small helpers so each story file reads like a script, not a pile of numbers.
// Times are inside a scene: 0 = scene starts, 1 = scene ends.

export const hidden = { opacity: 0 } as const;
const INK = "#0F1F18";

/** Pop in with a little bounce (to `scale`, default 1). */
export const pop = (actor: string, at: number, scale = 1): Step => ({ at, dur: 0.12, actor, to: { opacity: 1, scale }, ease: "back.out(2.2)" });
/** Fade in (and optionally move/scale). */
export const show = (actor: string, at: number, to: Pose2D = {}, dur = 0.12): Step => ({ at, dur, actor, to: { opacity: 1, ...to } });
/** Fade out. */
export const hide = (actor: string, at: number, dur = 0.1): Step => ({ at, dur, actor, to: { opacity: 0 } });
export const hideAll = (actors: string[], at: number) => actors.map((a) => hide(a, at));
export const move = (actor: string, at: number, to: Pose2D, dur = 0.25, ease?: string): Step => ({ at, dur, actor, to, ease });
/** Switch a face/arms ("face:happy arms:point") or a calendar page ("page:15th"). */
export const pose = (actor: string, at: number, layer: string): Step => ({ at, actor, layer });
export const count = (actor: string, at: number, dur: number, from: number, to: number): Step => ({ at, dur, actor, count: [from, to] });
export const fill = (actor: string, at: number, dur: number, from: number, to: number): Step => ({ at, dur, actor, fill: [from, to] });
export const shake = (actor: string, at: number, dur = 0.3, amount = 10): Step => ({ at, dur, actor, shake: amount });
/** Zoom / pan the whole scene. */
export const camera = (at: number, to: Pose2D, dur = 0.3): Step => ({ at, dur, actor: CAMERA, to, ease: "power2.inOut" });

/** Fade in, travel, fade out: a coin, note or icon flying somewhere. */
export const fly = (actor: string, at: number, to: { x: number; y: number }, extra: Pose2D = {}, dur = 0.2): Step[] => [
  { at, dur: 0.04, actor, to: { opacity: 1 } },
  { at: at + 0.02, dur, actor, to: { ...to, ...extra }, ease: "power2.in" },
  { at: at + dur + 0.01, dur: 0.04, actor, to: { opacity: 0 } },
];

/** A character standing on the floor (y is the floor line). */
export const person = (id: string, look: Look, x: number, layer = "face:neutral arms:down", scale = 0.92, y = 532): Actor => ({
  id,
  kind: "person",
  look,
  x,
  y,
  scale,
  layer,
});

export const box = (
  id: string,
  text: string,
  x: number,
  y: number,
  props: Record<string, string | number> = {},
  start: Pose2D = { ...hidden, scale: 0.6 },
): Actor => ({
  id,
  kind: "box",
  x,
  y,
  props: { text, ...props },
  ...start,
});
export const icon = (id: string, name: string, x: number, y: number, scale = 1, start: Pose2D = hidden, ring?: string): Actor => ({
  id,
  kind: "icon",
  x,
  y,
  scale,
  props: { name, ...(ring ? { ring } : {}) },
  ...start,
});
export const counter = (id: string, x: number, y: number, value = 0, size = 34, color = INK, format = "rupee"): Actor => ({
  id,
  kind: "counter",
  x,
  y,
  props: { value, size, color, format },
  ...hidden,
});
export const label = (id: string, text: string, x: number, y: number, size = 15, pill = "#fff", color = INK): Actor => ({
  id,
  kind: "label",
  x,
  y,
  props: { text, size, pill, color },
  ...hidden,
});
export const stamp = (id: string, text: string, x: number, y: number, color = "#D2342B"): Actor => ({
  id,
  kind: "stamp",
  x,
  y,
  props: { text, color },
  scale: 1.6,
  ...hidden,
});

/** The recap: three icon cards (3–5 words each), stacked at the top so the quiz button fits below. */
export function recap(cards: [icon: string, text: string][], castToHide: string[], caption = "Remember these three."): { actors: Actor[]; scene: Scene } {
  const actors = cards.map(([iconName, text], i): Actor => ({
    id: `recap${i}`,
    kind: "card",
    x: 180,
    y: 62 + i * 72,
    scale: 0.5,
    props: { icon: iconName, text },
    ...hidden,
  }));
  return {
    actors,
    scene: {
      caption,
      steps: [
        ...hideAll(castToHide, 0),
        ...cards.map((_, i): Step => ({ at: 0.08 + i * 0.12, dur: 0.12, actor: `recap${i}`, to: { opacity: 1, scale: 0.86 }, ease: "back.out(1.8)" })),
      ],
    },
  };
}

/** Indian-style amounts for captions and boxes: 10000 → ₹10,000. */
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
