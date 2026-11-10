import type { Expression } from "@/components/avatar/Avatar";

// What the student's avatar says when something real happens. Each event
// kind has an expression, a priority and several lines; the student's own
// name appears in some lines, never all of them. Pure and client-safe, the
// pop-up manager picks a line, avoiding the one shown last time.
//
// Priority: 0 ordinary (cooldown applies, newest wins), 1 important (queued),
// 2 major milestone (queued first, with a celebration).

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

type Line = (name: string, d: ReactionData) => string;

export type ReactionDef = { expression: Expression; priority: 0 | 1 | 2; title?: (d: ReactionData) => string; lines: Line[] };

const n = (d: ReactionData, key: string, fallback = "") => String(d[key] ?? fallback);

const CELEBRATIONS: string[] = ["quest-done", "quests-all", "xp-level", "badge", "streak"];
/** Shown as a small celebration rather than the Today tip. */
export const isCelebration = (kind: string) => CELEBRATIONS.includes(kind);

export const REACTIONS: Record<ReactionKind, ReactionDef> = {
  "quest-done": {
    expression: "happy",
    priority: 1,
    title: (d) => `Quest done · +${n(d, "xp", "0")} XP`,
    lines: [() => "One down. Look at you, doing things.", () => "Done. Don't let it go to your head.", () => "Quest cleared. Mild applause."],
  },
  "quests-all": {
    expression: "celebrating",
    priority: 2,
    title: (d) => `All 3 quests done · +${n(d, "xp", "15")} XP bonus`,
    lines: [() => "All three? Who are you and what did you do with my student?", () => "Full set. I'll be telling everyone."],
  },
  "xp-level": {
    expression: "celebrating",
    priority: 2,
    title: (d) => `Level ${n(d, "level", "2")}!`,
    lines: [() => "You levelled up. I'd say I'm proud, but I have a reputation.", () => "New level. Same spending habits, but we're working on it."],
  },
  greeting: {
    expression: "welcoming",
    priority: 0,
    lines: [
      (name) => `Hey ${name}! What are we not overspending on today?`,
      () => "Morning check: wallet still exists. Good start.",
      (name) => `${name}! One small money thing today. That's the whole ask.`,
      () => "New day, new chance to not overspend on chai.",
    ],
  },
  "welcome-back": {
    expression: "welcoming",
    priority: 1,
    lines: [
      () => "You're back! Let's get that money sorted.",
      (name) => `${name}! I kept your spot warm. No judgement, just numbers.`,
      () => "Missed you. Your streak didn't, but we start fresh today.",
    ],
  },
  expense: {
    expression: "happy",
    priority: 0,
    lines: [
      () => "Logged. Future you appreciates the paperwork.",
      () => "Noted. Your wallet has been informed.",
      (name) => `Tracked, ${name}. Money can't hide from us now.`,
      () => "Another one in the books. Literally.",
    ],
  },
  "first-expense": {
    expression: "excited",
    priority: 1,
    lines: [
      () => "Finally, we know where the money goes!",
      (name) => `${name}, your first logged spend! The mystery novel is over.`,
      () => "First entry! This is how money stops disappearing.",
    ],
  },
  "no-spend": {
    expression: "proud",
    priority: 0,
    lines: [
      () => "A no-spend day? Your wallet is sending flowers.",
      (name) => `Zero spent. ${name}, that's elite behaviour.`,
      () => "Nothing spent today. Quietly iconic.",
    ],
  },
  "budget-near": {
    expression: "thinking",
    priority: 1,
    lines: [
      (_, d) => `Heads up, ${n(d, "label", "this budget")} is at ${n(d, "pct", "80")}%. Slow and steady from here?`,
      (name, d) => `${name}, ${n(d, "label", "a budget")} is nearly full. Maybe skip one treat this week?`,
      (_, d) => `${n(d, "label", "Budget")} at ${n(d, "pct", "80")}%. We can still land this month.`,
    ],
  },
  "budget-over": {
    expression: "shocked",
    priority: 1,
    lines: [
      (name) => `${name}, BRO! Where did all your money go?`,
      (_, d) => `Okay, that ${n(d, "label", "spending").toLowerCase()} spree was personal.`,
      (_, d) => `${n(d, "label", "A budget")} just went over. Deep breath. We adjust, we don't panic.`,
      () => "BROOO. The budget has left the chat.",
    ],
  },
  "on-track": {
    expression: "happy",
    priority: 0,
    lines: [
      () => "Halfway through the month and still under budget. Look at you.",
      (name) => `${name}, you're actually sticking to the plan!`,
    ],
  },
  deposit: {
    expression: "happy",
    priority: 0,
    lines: [
      () => "Look who's becoming financially responsible!",
      (name) => `${name}, look who's finally saving!`,
      (_, d) => `${n(d, "amount")} into “${n(d, "goal", "your goal")}”. Future you just smiled.`,
      () => "Saved! Small amounts, big energy.",
    ],
  },
  "goal-half": {
    expression: "excited",
    priority: 1,
    lines: [
      (_, d) => `Halfway to “${n(d, "goal", "your goal")}”! Don't stop now.`,
      (name, d) => `${name}, “${n(d, "goal", "the goal")}” is 50% done. We're cooking.`,
    ],
  },
  "goal-reached": {
    expression: "celebrating",
    priority: 2,
    title: (d) => `Goal reached: ${n(d, "goal", "Savings goal")}`,
    lines: [
      () => "LET'S GOOO! We actually did it!",
      (name) => `Let's go, ${name}! Savings goal completed!`,
      (_, d) => `“${n(d, "goal", "The goal")}”: DONE. Treat yourself. Responsibly.`,
    ],
  },
  "lesson-complete": {
    expression: "proud",
    priority: 1,
    lines: [
      () => "Brain upgraded. Wallet next?",
      (name) => `${name}, one more lesson and you're officially smarter!`,
      (_, d) => `“${n(d, "title", "That lesson")}”, done. Knowledge: acquired.`,
      () => "Lesson complete. I'd high-five you, but… tiny arms.",
    ],
  },
  "lesson-perfect": {
    expression: "excited",
    priority: 1,
    lines: [
      () => "Five out of five?! Who are you and what did you do with my wallet?",
      (name) => `Perfect score, ${name}! Showing off a little, aren't we?`,
      () => "No mistakes. Not even one. I'm emotional.",
    ],
  },
  "invest-lesson": {
    expression: "thinking",
    priority: 1,
    lines: [
      () => "Investing brain: loading… loaded.",
      (_, d) => `“${n(d, "title", "That lesson")}” done. You now know more than most finfluencers.`,
      (name) => `${name}, look at you understanding the stock market.`,
    ],
  },
  "invest-complete": {
    expression: "celebrating",
    priority: 2,
    title: () => "InvestSmart complete",
    lines: [
      () => "Every InvestSmart lesson done. You understand investing better than most adults.",
      (name) => `${name}, InvestSmart: finished. Time is now your best friend.`,
    ],
  },
  "level-up": {
    expression: "celebrating",
    priority: 2,
    title: (d) => `Level ${n(d, "level")} complete`,
    lines: [
      (_, d) => `Level ${n(d, "level")} done! ${d.next ? `${n(d, "next")} just unlocked.` : "On to the next."}`,
      (name) => `${name} levelled up! I'm doing a little dance. You can't see it, but I am.`,
    ],
  },
  "path-complete": {
    expression: "celebrating",
    priority: 2,
    title: () => "Money IQ path complete",
    lines: [
      () => "ALL FOUR LEVELS. You're officially a Financial Foundations graduate!",
      (name) => `${name}, you finished the whole path. Framing this moment.`,
    ],
  },
  "reality-check": {
    expression: "thinking",
    priority: 0,
    lines: [
      () => "Reality checked. Reality: slightly less scary now.",
      () => "One more money truth unlocked.",
      (name) => `Nice one, ${name}. Same time tomorrow?`,
    ],
  },
  "daily-challenge": {
    expression: "celebrating",
    priority: 1,
    lines: [
      () => "Another day, another financial W!",
      (name) => `Daily Challenge cleared, ${name}. Too easy?`,
      () => "Challenge done. You're making this look easy.",
    ],
  },
  "habit-step": {
    expression: "happy",
    priority: 0,
    lines: [
      (_, d) => `Day ${n(d, "day")} of 30, done. Tiny steps, real habits.`,
      () => "Habit step complete. Consistency is lowkey a superpower.",
      (name) => `${name}, another day in the books.`,
    ],
  },
  "habit-week": {
    expression: "proud",
    priority: 1,
    lines: [
      (_, d) => `Week ${n(d, "week")} of the 30-day challenge: complete!`,
      (name, d) => `${name}, that's week ${n(d, "week")} done. Halfway to a whole new you.`,
    ],
  },
  "habit-done": {
    expression: "celebrating",
    priority: 2,
    title: () => "30-day challenge complete",
    lines: [
      () => "30 DAYS. Thirty! I honestly had money on day 4.",
      (name) => `${name}, thirty days! That exclusive tracksuit is yours.`,
    ],
  },
  "challenge-done": {
    expression: "celebrating",
    priority: 2,
    title: (d) => `${n(d, "title", "Challenge")} complete`,
    lines: [
      (_, d) => `“${n(d, "title", "The challenge")}”, conquered!`,
      (name) => `${name} said “challenge accepted” and meant it.`,
    ],
  },
  streak: {
    expression: "excited",
    priority: 2,
    title: (d) => `${n(d, "days")}-day streak`,
    lines: [
      (_, d) => `${n(d, "days")} days in a row! Who even are you?`,
      (name, d) => `${name}, ${n(d, "days")}-day streak. Consistency looks good on you.`,
    ],
  },
  "xp-milestone": {
    expression: "excited",
    priority: 2,
    title: (d) => `${Number(d.xp ?? 0).toLocaleString("en-IN")} XP`,
    lines: [
      (_, d) => `${Number(d.xp ?? 0).toLocaleString("en-IN")} XP! That's a lot of learning.`,
      (name, d) => `${name} just crossed ${Number(d.xp ?? 0).toLocaleString("en-IN")} XP. Big brain energy.`,
    ],
  },
  badge: {
    expression: "excited",
    priority: 2,
    title: (d) => `New badge: ${n(d, "badge")}`,
    lines: [
      (_, d) => `New badge: ${n(d, "badge")}! ${d.item ? `And you unlocked ${n(d, "item")} for me to wear.` : "Shiny."}`,
      (name, d) => `${name}, you earned ${n(d, "badge")}. ${d.item ? `${n(d, "item")} is now in Avatar Studio!` : "Frame it."}`,
    ],
  },
  "rank-up": {
    expression: "proud",
    priority: 2,
    title: (d) => `New rank: ${n(d, "rank")}`,
    lines: [
      (_, d) => `New rank: ${n(d, "rank")}! The glow-up is real.`,
      (name, d) => `${name}, meet ${n(d, "rank")} ${name}. Fancy.`,
    ],
  },
  "item-unlocked": {
    expression: "excited",
    priority: 2,
    title: (d) => `Unlocked: ${n(d, "item")}`,
    lines: [
      (_, d) => `Ooh. You unlocked ${n(d, "item")}! Shall we try it on?`,
      (name, d) => `${name}, ${n(d, "item")} is waiting in Avatar Studio.`,
    ],
  },
  "invest-first": {
    expression: "excited",
    priority: 1,
    lines: [
      () => "Your first investment! Virtual money, real lessons. I'm so proud I could cry.",
      (name) => `${name} the investor. Has a nice ring to it. Now hit fast-forward and hold your nerve.`,
      () => "Look at you, putting money to work instead of into food delivery.",
    ],
  },
  "invest-crash": {
    expression: "shocked",
    priority: 1,
    lines: [
      (_, d) => `Markets just fell. Your portfolio is down ${String(d.pct ?? "")}% this month. Deep breath. This is normal. Selling now locks in the loss.`,
      () => "Ouch. Red everywhere. Real investors see this too. The ones who panic-sell are the ones who lose.",
      (name) => `${name}, don't touch that sell button. Falls like this are why we invest for years, not weeks.`,
    ],
  },
  "invest-up": {
    expression: "celebrating",
    priority: 0,
    lines: [
      (_, d) => `Up ${String(d.pct ?? "")}%! Don't get cocky. Markets humble everyone eventually.`,
      () => "Green month! Compounding is doing push-ups for you.",
    ],
  },
  "invest-allin": {
    expression: "facepalm",
    priority: 1,
    lines: [
      () => "All your money in ONE stock? Bold. Very bold. Have you heard of diversification? It's like a seatbelt.",
      (name) => `${name}, putting everything in one company is how people learn hard lessons. Luckily this money is virtual.`,
    ],
  },
  "invest-diversified": {
    expression: "proud",
    priority: 1,
    lines: [
      () => "Spread across different options. That's diversification, and that's what grown-up investors do.",
      (name) => `Okay ${name}, a balanced portfolio. I didn't expect this level of maturity.`,
    ],
  },
  "invest-panic": {
    expression: "facepalm",
    priority: 1,
    lines: [
      () => "Selling right after a crash? That's panic-selling: buying high, selling low. The classic.",
      (name) => `${name}, you sold in the dip. The market thanks you for your donation.`,
    ],
  },
  simulator: {
    expression: "shocked",
    priority: 1,
    lines: [
      () => "Wait… money can make more money?!",
      () => "Compounding is basically money doing push-ups.",
      (name) => `${name}, time is doing the heavy lifting here. Start early!`,
    ],
  },
};

export const isReactionKind = (kind: string): kind is ReactionKind => kind in REACTIONS;

/** Picks a line for an event: varied by the event, and never the same as `avoid`. */
export function pickLine(kind: ReactionKind, seed: string, avoid?: number): number {
  const count = REACTIONS[kind].lines.length;
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  let index = hash % count;
  if (count > 1 && index === avoid) index = (index + 1) % count;
  return index;
}
