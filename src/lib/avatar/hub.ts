import { HOME, HOME_CLOSERS, fill, pick, type HubOptionId, type HubState, type RoastLevel } from "../../content/buddy-messages";

// What the avatar says on Home, worked out from the student's real state.
// Words live in src/content/buddy-messages.ts. Pure, so every state is
// unit-tested (hub.test.ts).

export const ROAST_LEVELS: RoastLevel[] = ["mild", "spicy", "savage"];
export const readRoastLevel = (value: string | null | undefined): RoastLevel => (ROAST_LEVELS.includes(value as RoastLevel) ? (value as RoastLevel) : "spicy");

export type HubInput = {
  questsDone: number;
  questsTotal: number;
  /** Never finished a lesson, never logged a spend, never touched the simulator. */
  isNew: boolean;
  unfinishedLesson: { title: string; minutes: number } | null;
  nextLesson: { title: string; minutes: number } | null;
  /** A roast about this week's real spending (already in the student's roast level), if there is one. */
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

/** The full message: a line for the situation (rotating by `seed`), then which bubble to tap. */
export function hubMessage(input: HubInput, level: RoastLevel, seed: number): HubMessage {
  const state = hubState(input);
  const highlight = HIGHLIGHT[state];
  const lesson = state === "unfinished" ? input.unfinishedLesson : input.nextLesson;
  // Your real numbers make the best roast.
  const line =
    state === "spent" && input.spendingRoast
      ? input.spendingRoast
      : fill(pick(HOME[state][level], seed), { lesson: lesson?.title ?? "", minutes: lesson?.minutes ?? 5 });
  return { state, highlight, text: `${line} ${pick(HOME_CLOSERS[highlight ?? "none"], seed)}` };
}
