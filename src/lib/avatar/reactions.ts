import type { Expression } from "@/components/avatar/Avatar";
import { EVENTS, fill, pick, seedOf } from "../../content/buddy-messages";

// Moments the buddy reacts to (recorded by the server as AvatarEvent rows):
// each kind's face and importance. The words live in
// src/content/buddy-messages.ts (EVENTS). Pure and client-safe.
//
// Priority: 0 ordinary, 1 important, 2 major milestone (shown first).

export type ReactionKind =
  | "greeting"
  | "welcome-back"
  | "expense"
  | "first-expense"
  | "no-spend"
  | "budget-near"
  | "budget-over"
  | "on-track"
  | "deposit"
  | "goal-half"
  | "goal-reached"
  | "lesson-complete"
  | "lesson-perfect"
  | "invest-lesson"
  | "invest-complete"
  | "level-up"
  | "path-complete"
  | "reality-check"
  | "daily-challenge"
  | "habit-step"
  | "habit-week"
  | "habit-done"
  | "challenge-done"
  | "streak"
  | "xp-milestone"
  | "badge"
  | "rank-up"
  | "item-unlocked"
  | "simulator"
  | "invest-first"
  | "invest-crash"
  | "invest-up"
  | "invest-allin"
  | "invest-diversified"
  | "invest-panic"
  | "quest-done"
  | "quests-all"
  | "xp-level";

export type ReactionData = Record<string, string | number | boolean | undefined>;

export type ReactionDef = { expression: Expression; priority: 0 | 1 | 2 };

export const REACTIONS: Record<ReactionKind, ReactionDef> = {
  "quest-done": { expression: "happy", priority: 1 },
  "quests-all": { expression: "proud", priority: 2 },
  "xp-level": { expression: "proud", priority: 2 },
  greeting: { expression: "happy", priority: 0 },
  "welcome-back": { expression: "happy", priority: 1 },
  expense: { expression: "happy", priority: 0 },
  "first-expense": { expression: "happy", priority: 1 },
  "no-spend": { expression: "proud", priority: 0 },
  "budget-near": { expression: "shocked", priority: 1 },
  "budget-over": { expression: "sad", priority: 1 },
  "on-track": { expression: "proud", priority: 0 },
  deposit: { expression: "proud", priority: 0 },
  "goal-half": { expression: "proud", priority: 1 },
  "goal-reached": { expression: "proud", priority: 2 },
  "lesson-complete": { expression: "proud", priority: 1 },
  "lesson-perfect": { expression: "proud", priority: 1 },
  "invest-lesson": { expression: "happy", priority: 1 },
  "invest-complete": { expression: "proud", priority: 2 },
  "level-up": { expression: "proud", priority: 2 },
  "path-complete": { expression: "proud", priority: 2 },
  "reality-check": { expression: "happy", priority: 0 },
  "daily-challenge": { expression: "proud", priority: 1 },
  "habit-step": { expression: "happy", priority: 0 },
  "habit-week": { expression: "proud", priority: 1 },
  "habit-done": { expression: "proud", priority: 2 },
  "challenge-done": { expression: "proud", priority: 2 },
  streak: { expression: "proud", priority: 2 },
  "xp-milestone": { expression: "proud", priority: 2 },
  badge: { expression: "proud", priority: 2 },
  "rank-up": { expression: "proud", priority: 2 },
  "item-unlocked": { expression: "happy", priority: 2 },
  simulator: { expression: "shocked", priority: 1 },
  "invest-first": { expression: "happy", priority: 1 },
  "invest-crash": { expression: "shocked", priority: 1 },
  "invest-up": { expression: "happy", priority: 0 },
  "invest-allin": { expression: "smirk", priority: 1 },
  "invest-diversified": { expression: "proud", priority: 1 },
  "invest-panic": { expression: "smirk", priority: 1 },
};

// Moments the buddy pops up for. Others (a logged spend, a finished lesson)
// already get a reply on the spot, so a second bubble would just repeat it.
const SHOWN: ReactionKind[] = [
  "quest-done",
  "quests-all",
  "xp-level",
  "streak",
  "badge",
  "level-up",
  "path-complete",
  "invest-complete",
  "goal-reached",
  "goal-half",
  "deposit",
  "no-spend",
  "on-track",
  "rank-up",
  "item-unlocked",
  "invest-first",
  "invest-crash",
  "invest-allin",
  "invest-panic",
];
export const buddyShows = (kind: string) => SHOWN.includes(kind as ReactionKind);

export const isReactionKind = (kind: string): kind is ReactionKind => kind in REACTIONS;

/** The buddy's words for a moment: a short title (some moments) and a line, varied by the event's id. */
export function reactionText(kind: ReactionKind, data: ReactionData, name: string, eventId: string) {
  const values: Record<string, string | number> = { name };
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") values[key] = value >= 1000 ? value.toLocaleString("en-IN") : value;
    else if (typeof value === "string") values[key] = value;
  }
  const def = EVENTS[kind];
  // Only lines whose blanks we can fill (older events may lack a newer detail).
  const usable = def.lines.filter((line) => [...line.matchAll(/\{(\w+)\}/g)].every(([, key]) => values[key] !== undefined && values[key] !== ""));
  return { title: def.title ? fill(def.title, values) : undefined, text: fill(pick(usable.length ? usable : def.lines, seedOf(eventId)), values) };
}
