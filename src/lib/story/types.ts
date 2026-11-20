// A lesson story is DATA: the cast (actors), then scenes. Each scene has a short
// caption and a list of steps that play as you scroll through it. The engine
// (components/story/StoryLesson.tsx) turns this into a scroll-scrubbed timeline,
// so a new lesson is just a new config file in src/content/stories/.
//
// Coordinates are in the stage's own units: 360 wide, 540 tall (portrait).
// Times inside a scene go from 0 (scene starts) to 1 (scene ends).

export type ActorKind =
  "riya" | "mom" | "wallet" | "note" | "coin" | "samosa" | "jar" | "lid" | "lock" | "calendar" | "phone" | "icon" | "counter" | "label" | "card" | "sparkle";

/** Where an actor is and how it looks: position, size, turn, see-through. */
export type Pose2D = { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };

export type Actor = Pose2D & {
  id: string;
  kind: ActorKind;
  /** Kind-specific details: a jar's label and colour, an icon's name, a counter's format, a calendar's pages... */
  props?: Record<string, string | number | string[]>;
  /** The layer showing at the start (a character's pose, a calendar page). */
  layer?: string;
};

export type Step =
  /** Move / scale / turn / fade an actor. */
  | { at: number; dur?: number; actor: string; to: Pose2D; ease?: string }
  /** Switch a character's pose or a calendar's page (a named layer). */
  | { at: number; actor: string; layer: string }
  /** Count a number up or down (counters). */
  | { at: number; dur: number; actor: string; count: [number, number] }
  /** Fill a jar from one level to another (0 empty, 1 full). */
  | { at: number; dur: number; actor: string; fill: [number, number] }
  /** A quick shake (a wallet that can't wait). */
  | { at: number; dur: number; actor: string; shake: number };

export type Scene = {
  /** Big, bold, at most about 12 words. Real text, read by screen readers. */
  caption: string;
  steps: Step[];
};

export type Story = {
  slug: string;
  actors: Actor[];
  scenes: Scene[];
};

export const STAGE_W = 360;
export const STAGE_H = 540;
