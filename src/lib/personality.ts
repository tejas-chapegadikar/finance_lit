// The Money Personality Quiz: six quick, relatable questions and five
// playful results. It describes how someone's habits look *right now* and
// personalises suggestions, never a permanent label. Habits change, and the
// quiz can be retaken anytime (the newest result replaces the old one).
// Client-safe (the quiz UI imports it); the server re-scores answers itself.

export type PersonalityId = "impulse-buyer" | "weekend-millionaire" | "procrastinator" | "secret-saver" | "smart-planner";

export type Personality = {
  id: PersonalityId;
  name: string;
  /** One cheeky line. */
  line: string;
  description: string;
  strengths: string[];
  watchOut: string[];
  /** What StockStreak suggests first. */
  focus: { challengeId: string; lessonSlug: string; tool: { href: string; label: string }; tip: string };
};

export const PERSONALITIES: Record<PersonalityId, Personality> = {
  "impulse-buyer": {
    id: "impulse-buyer",
    name: "The Impulse Buyer",
    line: "Sees “70% off” and hears destiny.",
    description:
      "Your money has a mysterious ability to disappear before the month ends. You decide fast and you're generous with yourself and others, but flash sales and 2 a.m. carts get a vote they didn't earn.",
    strengths: ["Decisive", "Generous", "Knows a good deal (sometimes)"],
    watchOut: ["Countdown timers", "“Add to cart” at night", "Buying things to feel better"],
    focus: {
      challengeId: "impulse-blocker-5",
      lessonSlug: "saving-vs-spending",
      tool: { href: "/money", label: "Track your wants" },
      tip: "Try the 24-hour rule: anything non-essential waits a day. Most urges don't survive it.",
    },
  },
  "weekend-millionaire": {
    id: "weekend-millionaire",
    name: "The Weekend Millionaire",
    line: "CEO on Saturday. Maggi by Wednesday.",
    description: "You make plans happen and memories count. The catch: weekends spend the money the weekdays were relying on.",
    strengths: ["Social", "Makes things happen", "Values experiences"],
    watchOut: ["Unplanned Friday nights", "Splitting the bill for the whole table", "“It's just this once”, weekly"],
    focus: {
      challengeId: "delivery-detox-7",
      lessonSlug: "budgeting-basics",
      tool: { href: "/money#budgets", label: "Set a fun budget" },
      tip: "Give weekends their own budget on Monday, while you're still sensible.",
    },
  },
  procrastinator: {
    id: "procrastinator",
    name: "The Professional Procrastinator",
    line: "Will definitely start saving. Next month.",
    description: "You know what you should do. You've just scheduled it for future you. The catch: with money, waiting is the expensive part.",
    strengths: ["Optimistic", "Not an impulse spender", "Great at research tabs"],
    watchOut: ["“I'll start next month”", "Unchecked balances", "Letting money sit idle"],
    focus: {
      challengeId: "habit-30",
      lessonSlug: "sip-starting-early",
      tool: { href: "/invest/simulator", label: "See the cost of waiting" },
      tip: "Start tiny today. ₹100 counts. Time does more of the work than the amount.",
    },
  },
  "secret-saver": {
    id: "secret-saver",
    name: "The Secret Saver",
    line: "Has money. Has no plan for it.",
    description: "You're careful and steady. Your account is quietly healthy. The catch: money parked with no plan slowly loses to rising prices.",
    strengths: ["Disciplined", "Calm about money", "Rarely in debt"],
    watchOut: ["Idle savings losing to inflation", "Fear of starting to invest", "No goals for the money"],
    focus: {
      challengeId: "habit-30",
      lessonSlug: "inflation-purchasing-power",
      tool: { href: "/money#goals", label: "Give your savings a goal" },
      tip: "Name what your savings are for. Then learn why money that only sits still slowly buys less.",
    },
  },
  "smart-planner": {
    id: "smart-planner",
    name: "The Smart Planner",
    line: "Has a spreadsheet for the spreadsheet.",
    description:
      "You budget, you track, and you mostly stick to it. Honestly, impressive. The catch: careful can tip into rigid, and a plan that's all safety may still need a part that grows.",
    strengths: ["Organised", "Consistent", "Thinks ahead"],
    watchOut: ["Over-planning, under-living", "Keeping everything in a savings account", "Guilt over every treat"],
    focus: {
      challengeId: "habit-30",
      lessonSlug: "compound-interest",
      tool: { href: "/invest", label: "Explore InvestSmart" },
      tip: "Keep your system, and budget a guilt-free treat. Your next level is learning how long-term investing works.",
    },
  },
};

const ORDER: PersonalityId[] = ["impulse-buyer", "weekend-millionaire", "procrastinator", "secret-saver", "smart-planner"];

/** Each option maps to one personality, in ORDER. */
export const PERSONALITY_QUESTIONS: { prompt: string; options: [string, string, string, string, string] }[] = [
  {
    prompt: "Your ₹10,000 stipend lands on the 1st. It's now the 8th. Your balance is…",
    options: [
      "Half gone. Those sneakers weren't going to buy themselves.",
      "Mostly there, but this weekend's trip is about to fix that.",
      "No idea. I'll check… eventually.",
      "Almost untouched. It just sits there, safe and slightly bored.",
      "Right where my plan said it would be. Yes, I have a plan.",
    ],
  },
  {
    prompt: "“FLASH SALE, ends in 10 minutes!” You…",
    options: [
      "Already checked out. Didn't even need it.",
      "Add to cart, buy it on Saturday when I “deserve it”.",
      "Think about it, forget, and the sale ends.",
      "Close the tab. My wallet sends its thanks.",
      "Check if it's on my list. Planned? Bought. Not planned? Bye.",
    ],
  },
  {
    prompt: "A friend says, “You should start a SIP.” You think…",
    options: [
      "Is that a new app? Is there a sale?",
      "Sure, after this month's plans.",
      "Definitely. Next month. Or the one after.",
      "I've read about it. I just haven't started.",
      "Already did the maths. It's in next payday's plan.",
    ],
  },
  {
    prompt: "Friday plans cost ₹1,500. Your budget for the week says ₹500.",
    options: [
      "Budget? I'm going.",
      "I'll eat light on weekdays to balance it out.",
      "I'll sort out the budget later.",
      "I'll go, but suggest a cheaper plan.",
      "Saw this coming. There's a fun fund for exactly this.",
    ],
  },
  {
    prompt: "Scrolling through this month's UPI history makes you feel…",
    options: [
      "Personally attacked.",
      "Fine Monday to Thursday. Weekends are a crime scene.",
      "I'll look at it later.",
      "Calm. Mildly boring, even.",
      "Satisfied. Every entry matches my tracker.",
    ],
  },
  {
    prompt: "Your money superpower is…",
    options: [
      "Finding amazing deals on things I didn't need.",
      "Making memories (expensive ones).",
      "Unshakeable optimism about future me.",
      "Not spending. Ever.",
      "A budget for everything, including fun.",
    ],
  },
];

export const PERSONALITY_OPTIONS = ORDER.length;

/** Scores answers (option index per question). Ties go to the most recent answer's type. */
export function scorePersonality(answers: number[]): PersonalityId | null {
  if (
    answers.length !== PERSONALITY_QUESTIONS.length ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a >= PERSONALITY_OPTIONS)
  ) {
    return null;
  }
  const counts = new Map<PersonalityId, number>();
  answers.forEach((a) => counts.set(ORDER[a], (counts.get(ORDER[a]) ?? 0) + 1));
  const best = Math.max(...counts.values());
  const tied = new Set([...counts].filter(([, n]) => n === best).map(([id]) => id));
  for (let i = answers.length - 1; i >= 0; i--) {
    if (tied.has(ORDER[answers[i]])) return ORDER[answers[i]];
  }
  return null;
}

export function findPersonality(id: string | null | undefined): Personality | null {
  return id && id in PERSONALITIES ? PERSONALITIES[id as PersonalityId] : null;
}

export const PERSONALITY_XP = 10;
