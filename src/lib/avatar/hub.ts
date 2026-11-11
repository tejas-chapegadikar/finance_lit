import { HUB_CLOSERS, HUB_LINES, fill, type HubOptionId, type HubState, type RoastLevel } from "../../content/avatar-lines";

// What the avatar says on Home, worked out from the student's real state.
// Pure, so every state is unit-tested (hub.test.ts).

export const ROAST_LEVELS: RoastLevel[] = ["mild", "spicy", "savage"];
export const readRoastLevel = (value: string | null | undefined): RoastLevel => (ROAST_LEVELS.includes(value as RoastLevel) ? (value as RoastLevel) : "spicy");

export type HubInput = {
  questsDone: number;
  questsTotal: number;
  /** Never finished a lesson, never logged a spend, never touched the simulator. */
  isNew: boolean;
  unfinishedLesson: { title: string; minutes: number } | null;
  nextLesson: { title: string; minutes: number } | null;
  /** The roast engine's verdict for this month, if it says spending is a problem. */
  spendingRoast: string | null;
  spentToday: boolean;
  investTouched: boolean;
};

export type HubMessage = { state: HubState; highlight: HubOptionId | null; text: string };

const HIGHLIGHT: Record<HubState, HubOptionId | null> = {
  new: "learn",
  unfinished: "learn",
  spent: "money",
  noExpense: "money",
  investIdle: "invest",
  nextLesson: "learn",
  done: null,
};

/** Which situation applies, most useful first. */
export function hubState(input: HubInput): HubState {
  if (input.questsTotal > 0 && input.questsDone >= input.questsTotal) return "done";
  if (input.isNew) return "new";
  if (input.unfinishedLesson) return "unfinished";
  if (input.spendingRoast) return "spent";
  if (!input.spentToday) return "noExpense";
  if (!input.investTouched) return "investIdle";
  if (input.nextLesson) return "nextLesson";
  return "done";
}

/** The full message: a line for the situation (rotating by `seed`), then which option to pick. */
export function hubMessage(input: HubInput, level: RoastLevel, seed: number): HubMessage {
  const state = hubState(input);
  const highlight = HIGHLIGHT[state];
  const lesson = state === "unfinished" ? input.unfinishedLesson : input.nextLesson;
  const lines = HUB_LINES[state][level];
  let line = fill(lines[Math.abs(seed) % lines.length], { lesson: lesson?.title ?? "", minutes: lesson?.minutes ?? 5 });
  // Your real numbers make the best roast, but Mild keeps it gentle.
  if (state === "spent" && level !== "mild" && input.spendingRoast) line = input.spendingRoast;
  return { state, highlight, text: `${line} ${HUB_CLOSERS[highlight ?? "none"]}` };
}

/** Roast-engine verdicts that mean "spending is a problem" (none of them mention income). */
export const SPENDING_ROAST_IDS = ["weeks-over", "over-budget", "food", "shopping", "entertainment"];
