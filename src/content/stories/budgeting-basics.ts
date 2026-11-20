import type { Actor, Step, Story } from "@/lib/story/types";

// BUDGETING, as a scroll story. Same facts as the lesson text (prisma/content/
// level1.ts): ₹8,000 a month, 50/30/20 (₹4,000 / ₹2,400 / ₹1,600), pay yourself
// first, ₹40 samosas × 30 = ₹1,200, ₹9,600 saved after 6 months.
//
// Stage is 360 × 540. Times inside a scene run 0 → 1. Captions: max ~12 words.

const NEEDS = { x: 70, y: 232 };
const WANTS = { x: 180, y: 232 };
const SAVINGS = { x: 290, y: 232 };
const WALLET = { x: 262, y: 452 };
const MOM_HAND = { x: 134, y: 428 };

const hidden = { opacity: 0 };

const actors: Actor[] = [
  // Jars (they slide in from above in scene 3)
  { id: "jarNeeds", kind: "jar", x: NEEDS.x, y: -110, props: { label: "Needs", color: "#7FB069", fill: 0 } },
  { id: "jarWants", kind: "jar", x: WANTS.x, y: -110, props: { label: "Wants", color: "#E9785B", fill: 0 } },
  { id: "jarSavings", kind: "jar", x: SAVINGS.x, y: -110, props: { label: "Savings", color: "#FFB81F", fill: 0 } },
  { id: "lid", kind: "lid", x: SAVINGS.x, y: 110, ...hidden },
  { id: "lock", kind: "lock", x: SAVINGS.x, y: 190, scale: 1.7, ...hidden },
  // What drops into the Needs jar
  { id: "iconMess", kind: "icon", x: 52, y: 120, scale: 0.55, props: { name: "mess" }, ...hidden },
  { id: "iconBus", kind: "icon", x: 88, y: 120, scale: 0.55, props: { name: "bus" }, ...hidden },
  { id: "iconRecharge", kind: "icon", x: 70, y: 120, scale: 0.55, props: { name: "recharge" }, ...hidden },
  // Jar numbers and shares
  { id: "pNeeds", kind: "label", x: NEEDS.x, y: 152, props: { text: "50%", size: 15, pill: "#fff" }, ...hidden },
  { id: "pWants", kind: "label", x: WANTS.x, y: 152, props: { text: "30%", size: 15, pill: "#fff" }, ...hidden },
  { id: "pSavings", kind: "label", x: SAVINGS.x, y: 152, props: { text: "20%", size: 15, pill: "#fff" }, ...hidden },
  { id: "cNeeds", kind: "counter", x: NEEDS.x, y: 316, props: { value: 0, size: 18 }, ...hidden },
  { id: "cWants", kind: "counter", x: WANTS.x, y: 316, props: { value: 0, size: 18 }, ...hidden },
  { id: "cSavings", kind: "counter", x: SAVINGS.x, y: 316, props: { value: 0, size: 18 }, ...hidden },
  // The calendar
  {
    id: "calendar",
    kind: "calendar",
    x: 300,
    y: 76,
    scale: 0.6,
    props: { pages: ["1st", "15th", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"] },
    ...hidden,
  },
  // The big counter (payday)
  { id: "cMain", kind: "counter", x: 180, y: 120, props: { value: 0, size: 46 }, ...hidden },
  // The cast
  { id: "mom", kind: "mom", x: 78, y: 532, scale: 0.95, layer: "face:happy arms:down" },
  { id: "riya", kind: "riya", x: 282, y: 532, scale: 0.92, layer: "face:neutral arms:down" },
  { id: "wallet", kind: "wallet", x: WALLET.x, y: WALLET.y },
  // Notes from Mom to the wallet
  ...[0, 1, 2, 3].map((i): Actor => ({ id: `note${i}`, kind: "note", x: MOM_HAND.x, y: MOM_HAND.y, scale: 0.85, ...hidden })),
  // Temptations around Riya's head
  { id: "tCafe", kind: "icon", x: 214, y: 340, scale: 0.3, props: { name: "cafe" }, ...hidden },
  { id: "tSneaker", kind: "icon", x: 330, y: 300, scale: 0.3, props: { name: "sneaker" }, ...hidden },
  { id: "tOtt", kind: "icon", x: 262, y: 272, scale: 0.3, props: { name: "ott" }, ...hidden },
  { id: "tBag", kind: "icon", x: 196, y: 400, scale: 0.3, props: { name: "bag" }, ...hidden },
  // Coins from the wallet into the jars
  ...[0, 1, 2, 3, 4, 5].map((i): Actor => ({ id: `coin${i}`, kind: "coin", x: WALLET.x, y: WALLET.y, ...hidden })),
  // Small leaks
  ...[0, 1, 2, 3, 4].map((i): Actor => ({ id: `samosa${i}`, kind: "samosa", x: WANTS.x + 40, y: 262, scale: 0.8, ...hidden })),
  { id: "cLeak", kind: "counter", x: 180, y: 150, props: { value: 0, size: 30, color: "#C2410C" }, ...hidden },
  { id: "chai", kind: "icon", x: 196, y: 420, scale: 0.4, props: { name: "chai" }, ...hidden },
  // Payoff sparkles
  ...[
    [246, 150],
    [338, 176],
    [252, 300],
    [334, 290],
  ].map(([x, y], i): Actor => ({ id: `spark${i}`, kind: "sparkle", x, y, scale: 0.2, ...hidden })),
  // Recap cards
  { id: "card0", kind: "card", x: 180, y: 110, scale: 0.6, props: { icon: "jar", text: "Split 50/30/20" }, ...hidden },
  { id: "card1", kind: "card", x: 180, y: 210, scale: 0.6, props: { icon: "lock", text: "Pay yourself first" }, ...hidden },
  { id: "card2", kind: "card", x: 180, y: 310, scale: 0.6, props: { icon: "drop", text: "Watch small leaks" }, ...hidden },
];

/** Fade in, travel, fade out: a note or coin flying from one place to another. */
const fly = (actor: string, at: number, to: { x: number; y: number }, extra: { rotate?: number; scale?: number } = {}): Step[] => [
  { at, dur: 0.04, actor, to: { opacity: 1 } },
  { at: at + 0.02, dur: 0.2, actor, to: { ...to, ...extra }, ease: "power2.in" },
  { at: at + 0.21, dur: 0.04, actor, to: { opacity: 0 } },
];

const story: Story = {
  slug: "budgeting-basics",
  actors,
  scenes: [
    {
      caption: "Day 1. Mom sends ₹8,000 for the month.",
      steps: [
        { at: 0.04, actor: "mom", layer: "face:happy arms:give" },
        { at: 0.06, dur: 0.12, actor: "cMain", to: { opacity: 1 } },
        { at: 0.14, dur: 0.66, actor: "cMain", count: [0, 8000] },
        ...fly("note0", 0.14, WALLET, { rotate: 25, scale: 0.5 }),
        ...fly("note1", 0.28, WALLET, { rotate: -20, scale: 0.5 }),
        ...fly("note2", 0.42, WALLET, { rotate: 15, scale: 0.5 }),
        ...fly("note3", 0.56, WALLET, { rotate: -10, scale: 0.5 }),
        { at: 0.3, actor: "riya", layer: "face:happy" },
        { at: 0.82, dur: 0.12, actor: "wallet", to: { scale: 1.15 } },
        { at: 0.88, actor: "mom", layer: "face:happy arms:down" },
      ],
    },
    {
      caption: "Riya wants everything. Right now.",
      steps: [
        { at: 0, dur: 0.12, actor: "cMain", to: { opacity: 0, y: 100 } },
        { at: 0.04, dur: 0.1, actor: "wallet", to: { scale: 1 } },
        { at: 0.12, actor: "riya", layer: "face:excited arms:up" },
        { at: 0.1, dur: 0.14, actor: "tCafe", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.2, dur: 0.14, actor: "tSneaker", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.3, dur: 0.14, actor: "tOtt", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.4, dur: 0.14, actor: "tBag", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.5, dur: 0.4, actor: "tCafe", to: { y: 326, rotate: -8 } },
        { at: 0.5, dur: 0.4, actor: "tSneaker", to: { y: 288, rotate: 10 } },
        { at: 0.5, dur: 0.4, actor: "tOtt", to: { y: 262, rotate: 6 } },
        { at: 0.5, dur: 0.4, actor: "tBag", to: { y: 388, rotate: -6 } },
        { at: 0.5, dur: 0.38, actor: "wallet", shake: 14 },
      ],
    },
    {
      caption: "Mom: Split it before you spend it.",
      steps: [
        { at: 0, dur: 0.12, actor: "tCafe", to: { opacity: 0, scale: 0.4 } },
        { at: 0, dur: 0.12, actor: "tSneaker", to: { opacity: 0, scale: 0.4 } },
        { at: 0, dur: 0.12, actor: "tOtt", to: { opacity: 0, scale: 0.4 } },
        { at: 0, dur: 0.12, actor: "tBag", to: { opacity: 0, scale: 0.4 } },
        { at: 0.08, actor: "riya", layer: "face:confused arms:down" },
        { at: 0.1, actor: "mom", layer: "face:neutral arms:point" },
        { at: 0.2, dur: 0.24, actor: "jarNeeds", to: { y: NEEDS.y }, ease: "back.out(1.4)" },
        { at: 0.32, dur: 0.24, actor: "jarWants", to: { y: WANTS.y }, ease: "back.out(1.4)" },
        { at: 0.44, dur: 0.24, actor: "jarSavings", to: { y: SAVINGS.y }, ease: "back.out(1.4)" },
        { at: 0.72, actor: "riya", layer: "face:thinking arms:chin" },
      ],
    },
    {
      caption: "50% needs. 30% wants. 20% savings.",
      steps: [
        { at: 0.04, actor: "mom", layer: "face:happy arms:down" },
        { at: 0.04, actor: "riya", layer: "face:happy arms:down" },
        { at: 0.06, dur: 0.1, actor: "pNeeds", to: { opacity: 1 } },
        { at: 0.1, dur: 0.1, actor: "pWants", to: { opacity: 1 } },
        { at: 0.14, dur: 0.1, actor: "pSavings", to: { opacity: 1 } },
        { at: 0.1, dur: 0.1, actor: "cNeeds", to: { opacity: 1 } },
        { at: 0.1, dur: 0.1, actor: "cWants", to: { opacity: 1 } },
        { at: 0.1, dur: 0.1, actor: "cSavings", to: { opacity: 1 } },
        ...fly("coin0", 0.12, { x: NEEDS.x, y: 190 }),
        ...fly("coin1", 0.2, { x: WANTS.x, y: 190 }),
        ...fly("coin2", 0.28, { x: SAVINGS.x, y: 190 }),
        ...fly("coin3", 0.38, { x: NEEDS.x, y: 190 }),
        ...fly("coin4", 0.46, { x: WANTS.x, y: 190 }),
        ...fly("coin5", 0.54, { x: SAVINGS.x, y: 190 }),
        { at: 0.15, dur: 0.6, actor: "jarNeeds", fill: [0, 1] },
        { at: 0.2, dur: 0.55, actor: "jarWants", fill: [0, 0.6] },
        { at: 0.25, dur: 0.5, actor: "jarSavings", fill: [0, 0.4] },
        { at: 0.15, dur: 0.6, actor: "cNeeds", count: [0, 4000] },
        { at: 0.2, dur: 0.55, actor: "cWants", count: [0, 2400] },
        { at: 0.25, dur: 0.5, actor: "cSavings", count: [0, 1600] },
        { at: 0.3, dur: 0.06, actor: "iconMess", to: { opacity: 1 } },
        { at: 0.31, dur: 0.18, actor: "iconMess", to: { y: 266 }, ease: "bounce.out" },
        { at: 0.42, dur: 0.06, actor: "iconBus", to: { opacity: 1 } },
        { at: 0.43, dur: 0.18, actor: "iconBus", to: { y: 266 }, ease: "bounce.out" },
        { at: 0.54, dur: 0.06, actor: "iconRecharge", to: { opacity: 1 } },
        { at: 0.55, dur: 0.18, actor: "iconRecharge", to: { y: 252 }, ease: "bounce.out" },
        { at: 0.72, dur: 0.18, actor: "wallet", to: { opacity: 0, scale: 0.6 } },
      ],
    },
    {
      caption: "Savings go first. Then spend the rest.",
      steps: [
        { at: 0.02, dur: 0.1, actor: "pNeeds", to: { opacity: 0 } },
        { at: 0.02, dur: 0.1, actor: "pWants", to: { opacity: 0 } },
        { at: 0.02, dur: 0.1, actor: "pSavings", to: { opacity: 0 } },
        { at: 0.06, dur: 0.16, actor: "calendar", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.28, dur: 0.06, actor: "lid", to: { opacity: 1 } },
        { at: 0.28, dur: 0.24, actor: "lid", to: { y: 167 }, ease: "bounce.out" },
        { at: 0.52, dur: 0.06, actor: "lock", to: { opacity: 1 } },
        { at: 0.52, dur: 0.14, actor: "lock", to: { scale: 1 }, ease: "back.out(3)" },
        { at: 0.66, dur: 0.08, actor: "jarSavings", to: { scale: 1.06 } },
        { at: 0.74, dur: 0.08, actor: "jarSavings", to: { scale: 1 } },
        { at: 0.6, actor: "riya", layer: "face:proud" },
      ],
    },
    {
      caption: "₹40 samosas. 30 of them = ₹1,200.",
      steps: [
        { at: 0.04, dur: 0.1, actor: "cLeak", to: { opacity: 1 } },
        { at: 0.1, dur: 0.75, actor: "cLeak", count: [0, 1200] },
        ...[0, 1, 2, 3, 4].flatMap((i): Step[] => [
          { at: 0.1 + i * 0.15, dur: 0.04, actor: `samosa${i}`, to: { opacity: 1 } },
          { at: 0.11 + i * 0.15, dur: 0.22, actor: `samosa${i}`, to: { y: 352, x: WANTS.x + 58, rotate: i % 2 ? 50 : -30 }, ease: "power2.in" },
          { at: 0.29 + i * 0.15, dur: 0.05, actor: `samosa${i}`, to: { opacity: 0 } },
        ]),
        { at: 0.1, dur: 0.75, actor: "jarWants", fill: [0.6, 0.3] },
        { at: 0.1, dur: 0.75, actor: "cWants", count: [2400, 1200] },
        { at: 0.3, actor: "riya", layer: "face:shocked" },
        { at: 0.3, actor: "mom", layer: "face:worried" },
      ],
    },
    {
      caption: "Wants ran out? Wait. Don't touch savings.",
      steps: [
        { at: 0, dur: 0.1, actor: "cLeak", to: { opacity: 0 } },
        { at: 0.04, actor: "calendar", layer: "page:15th" },
        { at: 0.06, dur: 0.25, actor: "jarWants", fill: [0.3, 0.05] },
        { at: 0.06, dur: 0.25, actor: "cWants", count: [1200, 100] },
        { at: 0.1, actor: "riya", layer: "face:worried arms:down" },
        { at: 0.1, actor: "mom", layer: "face:neutral" },
        { at: 0.24, dur: 0.14, actor: "riya", to: { x: 300 } },
        { at: 0.32, actor: "riya", layer: "face:thinking arms:chin" },
        { at: 0.38, dur: 0.08, actor: "lock", to: { scale: 1.25 } },
        { at: 0.46, dur: 0.08, actor: "lock", to: { scale: 1 } },
        { at: 0.56, dur: 0.18, actor: "riya", to: { x: 232 } },
        { at: 0.7, actor: "riya", layer: "face:happy arms:down" },
        { at: 0.7, dur: 0.12, actor: "chai", to: { opacity: 1, scale: 1 }, ease: "back.out(2)" },
        { at: 0.72, actor: "mom", layer: "face:happy" },
      ],
    },
    {
      caption: "6 months later: ₹9,600 saved. Never felt broke.",
      steps: [
        { at: 0, dur: 0.1, actor: "chai", to: { opacity: 0, scale: 0.4 } },
        { at: 0.02, dur: 0.14, actor: "riya", to: { x: 282 } },
        { at: 0.06, actor: "calendar", layer: "page:Month 1" },
        { at: 0.14, actor: "calendar", layer: "page:Month 2" },
        { at: 0.22, actor: "calendar", layer: "page:Month 3" },
        { at: 0.3, actor: "calendar", layer: "page:Month 4" },
        { at: 0.38, actor: "calendar", layer: "page:Month 5" },
        { at: 0.46, actor: "calendar", layer: "page:Month 6" },
        { at: 0.06, dur: 0.48, actor: "jarSavings", fill: [0.4, 1] },
        { at: 0.06, dur: 0.48, actor: "cSavings", count: [1600, 9600] },
        { at: 0.56, dur: 0.12, actor: "jarSavings", to: { scale: 1.12 }, ease: "back.out(2)" },
        { at: 0.56, dur: 0.12, actor: "cSavings", to: { scale: 1.35 } },
        { at: 0.6, actor: "riya", layer: "face:excited arms:up" },
        { at: 0.6, actor: "mom", layer: "face:proud arms:thumb" },
        ...[0, 1, 2, 3].map((i): Step => ({
          at: 0.62 + i * 0.05,
          dur: 0.12,
          actor: `spark${i}`,
          to: { opacity: 1, scale: 1, rotate: 45 },
          ease: "back.out(3)",
        })),
      ],
    },
    {
      caption: "Split 50/30/20. Pay yourself first. Watch small leaks.",
      steps: [
        ...[
          "jarNeeds",
          "jarWants",
          "jarSavings",
          "lid",
          "lock",
          "cNeeds",
          "cWants",
          "cSavings",
          "calendar",
          "iconMess",
          "iconBus",
          "iconRecharge",
          "wallet",
          "spark0",
          "spark1",
          "spark2",
          "spark3",
        ].map((actor): Step => ({ at: 0, dur: 0.12, actor, to: { opacity: 0 } })),
        { at: 0.08, actor: "riya", layer: "face:happy arms:down" },
        { at: 0.08, actor: "mom", layer: "face:happy arms:down" },
        { at: 0.16, dur: 0.14, actor: "card0", to: { opacity: 1, scale: 1 }, ease: "back.out(1.8)" },
        { at: 0.36, dur: 0.14, actor: "card1", to: { opacity: 1, scale: 1 }, ease: "back.out(1.8)" },
        { at: 0.56, dur: 0.14, actor: "card2", to: { opacity: 1, scale: 1 }, ease: "back.out(1.8)" },
      ],
    },
    {
      caption: "Your turn. Show what you learned.",
      steps: [
        { at: 0.04, dur: 0.12, actor: "card0", to: { opacity: 0, y: 90 } },
        { at: 0.04, dur: 0.12, actor: "card1", to: { opacity: 0, y: 190 } },
        { at: 0.04, dur: 0.12, actor: "card2", to: { opacity: 0, y: 290 } },
        { at: 0.2, actor: "riya", layer: "face:excited arms:up" },
        { at: 0.2, actor: "mom", layer: "face:happy arms:point" },
      ],
    },
  ],
};

export default story;
