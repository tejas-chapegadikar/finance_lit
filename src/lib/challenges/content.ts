// Practice challenges: the 30-day money habit challenge and shorter saving
// challenges. Ids and step order are permanent once live (check-ins store
// step numbers) — reword freely, but don't reorder or delete steps.
//
// A step is one small thing for one day:
//   "do"   — the student does it and taps "Done" (we trust them)
//   "log"  — needs today's money check-in in Money Manager first
//   "quiz" — a quick question; any answer completes it, the explanation teaches
//
// The no-repeats rule applies here too: a step never re-asks a lesson's quiz
// question. When a day is about a concept a lesson teaches, the step sends the
// student to that lesson (or a tool) and asks them to *do* something with it.

export type ChallengeStep = {
  title: string;
  body: string;
  task: string;
  kind: "do" | "log" | "quiz";
  quiz?: { prompt: string; options: string[]; correct: number; explanation: string };
  link?: { href: string; label: string };
};

export type Challenge = {
  id: string;
  kind: "habit" | "saving";
  title: string;
  tagline: string;
  summary: string;
  /** Icon key (see ChallengeIcon). */
  icon: "habit" | "delivery" | "jar" | "impulse" | "tracker";
  stepXp: number;
  finishXp: number;
  phases?: { from: number; title: string; goal: string }[];
  steps: ChallengeStep[];
};

const SIMULATOR = { href: "/invest/simulator", label: "Open the simulator" };
const MONEY = { href: "/money", label: "Open Money Manager" };
const INSIGHTS = { href: "/money#insights", label: "See your insights" };
const BUDGETS = { href: "/money#budgets", label: "Set a budget" };
const GOALS = { href: "/money#goals", label: "Open your goals" };
const lesson = (slug: string, label: string) => ({ href: `/lessons/${slug}`, label });

export const HABIT_CHALLENGE: Challenge = {
  id: "habit-30",
  kind: "habit",
  title: "30-day money habit challenge",
  tagline: "From “where did it all go?” to “I've got a plan.”",
  summary:
    "One small task a day for 30 days: understand your spending, cut what you don't need, build a saving habit, then get to know investing.",
  icon: "habit",
  stepXp: 5,
  finishXp: 100,
  phases: [
    { from: 1, title: "Week 1 · Understand your spending", goal: "See where your money actually goes." },
    { from: 8, title: "Week 2 · Control unnecessary expenses", goal: "Spot avoidable spends and make better calls." },
    { from: 15, title: "Week 3 · Build a saving habit", goal: "Set a realistic goal and save consistently." },
    { from: 22, title: "Week 4 · Understand investing", goal: "Meet compounding, the market and long-term thinking." },
  ],
  steps: [
    // ── Week 1 · Understand your spending
    {
      title: "Meet your money",
      body: "You can't fix what you can't see. No judgement here — just numbers.",
      task: "Add this month's pocket money, stipend or salary in Money Manager.",
      kind: "log",
      link: MONEY,
    },
    {
      title: "Log every rupee",
      body: "Today, nothing escapes. Not the ₹20 chai, not the ₹49 “it's basically free” add-on.",
      task: "Log everything you spend today.",
      kind: "log",
      link: MONEY,
    },
    {
      title: "Your fixed costs",
      body: "Rent, mess, recharge, bus pass — the things you pay every month whether you think about them or not. They're the floor your budget stands on.",
      task: "Write down your fixed monthly costs, and log any you haven't added this month.",
      kind: "do",
      link: MONEY,
    },
    {
      title: "The UPI blur",
      body: "UPI makes paying so easy that small spends stop feeling like spending. Your payment history remembers what you don't.",
      task: "Scroll this week's UPI history and log anything you missed.",
      kind: "log",
      link: MONEY,
    },
    {
      title: "Autopilot spends",
      body: "Most impulse spends have a trigger: boredom, stress, a friend's story, 11 pm scrolling. Knowing yours is half the fix.",
      task: "Notice one spend today that happened on autopilot — and write down what triggered it.",
      kind: "do",
    },
    {
      title: "Your biggest category",
      body: "Money Manager's report sorts your spending by category. The biggest bar is where small changes make the biggest difference.",
      task: "Open your monthly report and note your biggest category so far.",
      kind: "do",
      link: { href: "/money#report", label: "Open the report" },
    },
    {
      title: "Week 1 review",
      body: "A week of data is enough to see patterns — weekends, late nights, payday splurges.",
      task: "Read your insights and note one pattern you didn't expect.",
      kind: "do",
      link: INSIGHTS,
    },
    // ── Week 2 · Control unnecessary expenses
    {
      title: "The 24-hour rule",
      body: "Wanting something now is a feeling. Wanting it tomorrow is a decision.",
      task: "Use the 24-hour rule on one thing you wanted to buy today.",
      kind: "do",
      link: lesson("saving-vs-spending", "Revisit the lesson"),
    },
    {
      title: "Unsubscribe day",
      body: "Subscriptions are designed to be forgotten. ₹149 here, ₹199 there — it adds up to thousands a year.",
      task: "List your subscriptions and cancel one you haven't used this month.",
      kind: "do",
    },
    {
      title: "No-delivery day",
      body: "Mess, canteen, cooking, or picking it up yourself all count. Notice how much you'd normally have spent.",
      task: "Skip food delivery today, then log what you spent instead.",
      kind: "log",
      link: MONEY,
    },
    {
      title: "Mute the sale",
      body: "“Only 2 left!” “Ends tonight!” Sale notifications are built to make you spend on their schedule, not yours.",
      task: "Turn off promotional notifications from one shopping or delivery app.",
      kind: "do",
    },
    {
      title: "Cart audit",
      body: "Carts and wishlists are where impulse buys wait for a weak moment.",
      task: "Open your shopping carts and wishlists, and remove anything you wouldn't buy at full price.",
      kind: "do",
    },
    {
      title: "Give your wants a budget",
      body: "Budgets aren't about saying no. They're about deciding in advance, so you don't decide at the checkout.",
      task: "Set a monthly budget for your biggest “want” category in Money Manager.",
      kind: "do",
      link: BUDGETS,
    },
    {
      title: "Leak check",
      body: "Two weeks in. Compare today with day 2 — has anything shifted?",
      task: "Log today's spending and compare it with the start of the challenge.",
      kind: "log",
      link: MONEY,
    },
    // ── Week 3 · Build a saving habit
    {
      title: "Pay yourself first",
      body: "Saving what's left at the end of the month rarely works — there's never anything left. Save first, spend the rest.",
      task: "Create a savings goal in Money Manager. Even ₹500 counts.",
      kind: "do",
      link: GOALS,
    },
    {
      title: "The first deposit",
      body: "The amount doesn't matter today. Starting does.",
      task: "Put any amount into your savings goal today.",
      kind: "do",
      link: GOALS,
    },
    {
      title: "Pick your saving day",
      body: "Habits stick when they're automatic. The best day to save is the day money arrives — before anything else can claim it.",
      task: "Choose a fixed saving day each month (the day your money lands) and set a phone reminder for it.",
      kind: "do",
    },
    {
      title: "Start a safety buffer",
      body: "Laptops break, phones fall, trains get missed. A small buffer turns an emergency into an inconvenience.",
      task: "Create a second goal called “Emergency buffer” with a first target of one month's fixed costs (from day 3).",
      kind: "do",
      link: GOALS,
    },
    {
      title: "Round it up",
      body: "Spent ₹130? Save ₹20 to make it ₹150. Small enough to ignore, big enough to add up.",
      task: "For each spend today, round up to the next ₹50 and save the difference.",
      kind: "do",
      link: GOALS,
    },
    {
      title: "A no-spend day",
      body: "One day, zero spending (planned costs like rent don't count). It's a reset, not a punishment.",
      task: "Try a no-spend day, and mark it in Money Manager tonight.",
      kind: "log",
      link: MONEY,
    },
    {
      title: "Consistency beats size",
      body: "₹200 every week beats ₹2,000 once and then never again.",
      task: "Add to your savings goal again today.",
      kind: "do",
      link: GOALS,
    },
    // ── Week 4 · Understand investing
    {
      title: "Why money has to grow",
      body: "Saving keeps money safe. But prices rise every year — so money that only sits still slowly buys less.",
      task: "Finish the inflation lesson (quiz included), then estimate what your monthly costs might be in 10 years.",
      kind: "do",
      link: lesson("inflation-purchasing-power", "Open the lesson"),
    },
    {
      title: "Meet compounding",
      body: "Compounding is growth on growth. It feels slow at first — then it doesn't.",
      task: "Open the simulator and try ₹1,000 a month for 10 years.",
      kind: "do",
      link: SIMULATOR,
    },
    {
      title: "The cost of waiting",
      body: "“I'll start next year” is one of the most expensive sentences in personal finance.",
      task: "In the simulator, compare starting today with starting 5 years later.",
      kind: "do",
      link: SIMULATOR,
    },
    {
      title: "Inflation in your life",
      body: "Official inflation is an average. Yours depends on what you buy — rent, food, data, travel.",
      task: "Find one thing you buy regularly whose price went up in the last year, and work out by what percentage.",
      kind: "do",
    },
    {
      title: "How the market works",
      body: "Exchanges, SEBI, demat accounts, the Sensex — the words everyone uses and few explain.",
      task: "Learn how exchanges, SEBI and demat accounts fit together — then find today's Nifty 50 level in the news.",
      kind: "do",
      link: lesson("how-stock-market-works", "Open the lesson"),
    },
    {
      title: "The long game",
      body: "Costs and patience matter more than picking winners.",
      task: "Read up on expense ratios and direct plans, then look up the expense ratio of any one index fund.",
      kind: "do",
      link: lesson("index-funds-long-term", "Open the lesson"),
    },
    {
      title: "Your investing rules",
      body: "Rules you write when you're calm protect you when markets aren't.",
      task: "Write three personal investing rules — for example: emergency buffer first; only money I won't need for 5+ years; no tips from strangers.",
      kind: "do",
    },
    {
      title: "Your starter checklist",
      body: "Before anyone invests a rupee: paperwork, a goal, and a risk you can live with.",
      task: "Finish the “Starting to invest” lesson and tick off what you've already done on its checklist.",
      kind: "do",
      link: lesson("start-investing-checklist", "Open the lesson"),
    },
    {
      title: "Your money plan",
      body: "Thirty days ago you started tracking. Look at you now.",
      task: "Write your plan: one budget you'll keep, one goal you'll fund, one topic you'll learn next.",
      kind: "do",
      link: MONEY,
    },
  ],
};

function repeat(count: number, make: (day: number) => ChallengeStep): ChallengeStep[] {
  return Array.from({ length: count }, (_, i) => make(i + 1));
}

const DELIVERY_TIPS = [
  "Day one is the hardest. Tell a friend you're doing this — it's easier with a witness.",
  "Hungry at midnight? Keep Maggi, fruit or peanut butter around — the cheapest delivery is your own shelf.",
  "Mess food is already paid for. Skipping it to order in is paying twice.",
  "Plan tomorrow's dinner tonight. Decisions made hungry are expensive.",
  "Cook with friends — split the groceries, skip the fees.",
  "Craving it anyway? Pick it up yourself and skip the delivery charges.",
  "Last day. Check Money Manager: how much did eating out cost this week compared with last?",
];

const JAR_TIPS = [
  "Move ₹20 into a savings goal (or a real jar). Same time every day makes it automatic.",
  "Pick a trigger: the moment you pay for lunch, ₹20 goes in. Attach the new habit to an old one.",
  "Use a real jar? Make it see-through. Watching it fill is half the fun.",
  "Name the jar after what it's for. “Goa fund” is harder to raid than “jar”.",
  "Missed yesterday? Just do today's ₹20. No catching up, no guilt.",
  "Tell a friend you're doing this. Better: get them to start a jar too.",
  "A week in — ₹140 saved. That's a movie ticket you didn't have to find later.",
  "Paid by UPI all day? Transfer ₹20 to your savings goal before bed.",
  "Halfway point. Notice how ₹20 doesn't feel like a loss any more?",
  "Got change from a cash payment? Coins count. Into the jar.",
  "Try skipping one small spend today — and see if you can drop that in too.",
  "Twelve days in. Saving ₹20 is starting to feel normal, isn't it?",
  "Tomorrow's the last day. Decide now where the money goes next.",
  "That's ₹280 saved — and a habit. Keep going and it's over ₹7,000 a year.",
];

const IMPULSE_TIPS = [
  "Unsure? Put it in the cart and walk away for 24 hours.",
  "Unfollow one shopping account that always makes you want things.",
  "Move one shopping app off your home screen. Out of sight, out of cart.",
  "Remove a saved card from one app. A little friction saves a lot.",
  "Final stretch. Add up what you didn't buy — it's all still in your account.",
];

export const SAVING_CHALLENGES: Challenge[] = [
  {
    id: "delivery-detox-7",
    kind: "saving",
    title: "7-day delivery detox",
    tagline: "Your wallet, minus the delivery fees.",
    summary: "Seven days without food-delivery apps. Mess, canteen, cooking and picking up yourself all count.",
    icon: "delivery",
    stepXp: 5,
    finishXp: 30,
    steps: repeat(7, (d) => ({
      title: `Day ${d} without delivery`,
      body: DELIVERY_TIPS[d - 1],
      task: "Skip food-delivery apps today.",
      kind: "do",
    })),
  },
  {
    id: "chai-jar-14",
    kind: "saving",
    title: "₹20-a-day jar",
    tagline: "One chai's worth, saved daily.",
    summary: "Put ₹20 aside every day for 14 days — ₹280 that would otherwise vanish. Track it in a savings goal.",
    icon: "jar",
    stepXp: 5,
    finishXp: 30,
    steps: repeat(14, (d) => ({
      title: `Day ${d}: ₹20 in`,
      body: JAR_TIPS[d - 1],
      task: "Put ₹20 aside today.",
      kind: "do",
      link: { href: "/money#goals", label: "Add to a goal" },
    })),
  },
  {
    id: "impulse-blocker-5",
    kind: "saving",
    title: "5-day impulse blocker",
    tagline: "Add to cart, sleep on it, probably don't.",
    summary: "Five days of the 24-hour rule on every non-essential buy.",
    icon: "impulse",
    stepXp: 5,
    finishXp: 30,
    steps: repeat(5, (d) => ({
      title: `Day ${d}: wait 24 hours`,
      body: IMPULSE_TIPS[d - 1],
      task: "No impulse buys today — anything non-essential waits 24 hours.",
      kind: "do",
    })),
  },
  // "track-it-7" (Log-it-all week) was retired on 2026-11-04: it repeated
  // week 1 of the 30-day challenge and the daily money check-in mission.
];

export const CHALLENGES: Challenge[] = [HABIT_CHALLENGE, ...SAVING_CHALLENGES];

export function findChallenge(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
