import type { Actor, Step, Story } from "@/lib/story/types";
import { box, count, counter, fill, fly, hidden, hide, hideAll, icon, move, pop, pose, recap, shake, show } from "./kit";

// BUDGETING · Riya and her mom, at home on payday.
// Facts: 50/30/20 (needs, wants, savings), pay yourself first, small leaks.
// Numbers: ₹8,000 → ₹4,000 / ₹2,400 / ₹1,600; ₹9,600 after 6 months;
// the quiz's own ₹12,000 → ₹2,400 savings and 30 × ₹80 = ₹2,400.

const NEEDS = { x: 70, y: 232 };
const WANTS = { x: 180, y: 232 };
const SAVINGS = { x: 290, y: 232 };
const WALLET = { x: 262, y: 452 };
const MOM_HAND = { x: 134, y: 428 };

const base: Actor[] = [
  { id: "jarNeeds", kind: "jar", x: NEEDS.x, y: -110, props: { label: "Needs", color: "#7FB069", fill: 0 } },
  { id: "jarWants", kind: "jar", x: WANTS.x, y: -110, props: { label: "Wants", color: "#E9785B", fill: 0 } },
  { id: "jarSavings", kind: "jar", x: SAVINGS.x, y: -110, props: { label: "Savings", color: "#FFB81F", fill: 0 } },
  { id: "lid", kind: "lid", x: SAVINGS.x, y: 110, ...hidden },
  { id: "lock", kind: "lock", x: SAVINGS.x, y: 190, scale: 1.7, ...hidden },
  { id: "pNeeds", kind: "label", x: NEEDS.x, y: 152, props: { text: "50%", size: 15, pill: "#fff" }, ...hidden },
  { id: "pWants", kind: "label", x: WANTS.x, y: 152, props: { text: "30%", size: 15, pill: "#fff" }, ...hidden },
  { id: "pSavings", kind: "label", x: SAVINGS.x, y: 152, props: { text: "20%", size: 15, pill: "#fff" }, ...hidden },
  counter("cNeeds", NEEDS.x, 316, 0, 18),
  counter("cWants", WANTS.x, 316, 0, 18),
  counter("cSavings", SAVINGS.x, 316, 0, 18),
  {
    id: "calendar",
    kind: "calendar",
    x: 300,
    y: 76,
    scale: 0.6,
    props: { pages: ["1st", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"] },
    ...hidden,
  },
  counter("cMain", 180, 110, 0, 46),
  // needs vs wants: what lands in which jar
  icon("iRent", "building", 70, 120, 0.55),
  icon("iMess", "mess", 70, 120, 0.55),
  icon("iBus", "bus", 70, 120, 0.55),
  icon("iOtt", "ott", 180, 120, 0.55),
  { id: "mom", kind: "mom", x: 78, y: 532, scale: 0.95, layer: "face:happy arms:down" },
  { id: "riya", kind: "riya", x: 282, y: 532, scale: 0.92, layer: "face:neutral arms:down" },
  { id: "wallet", kind: "wallet", x: WALLET.x, y: WALLET.y },
  ...[0, 1, 2].map((i): Actor => ({ id: `note${i}`, kind: "note", x: MOM_HAND.x, y: MOM_HAND.y, scale: 0.85, ...hidden })),
  icon("tCafe", "cafe", 214, 340, 0.3),
  icon("tSneaker", "sneaker", 330, 300, 0.3),
  icon("tOtt", "ott", 262, 272, 0.3),
  icon("tBag", "bag", 196, 400, 0.3),
  ...[0, 1, 2].map((i): Actor => ({ id: `coin${i}`, kind: "coin", x: WALLET.x, y: WALLET.y, ...hidden })),
  // the wrong way: spend first, save what's left
  box("bLeft", "Spend first,|save what's left?", 140, 120, { w: 200, h: 62, size: 15 }),
  icon("xLeft", "cross", 228, 100, 1.2),
  // small leaks: 30 snacks × ₹80
  ...[0, 1, 2, 3, 4].map((i): Actor => icon(`chai${i}`, "chai", WANTS.x + 40, 262, 0.55)),
  box("bLeak", "30 × ₹80", 180, 136, { w: 130, h: 44, size: 18 }),
  counter("cLeak", 180, 380, 0, 30, "#C2410C"),
  box("bLimit", "SET A LIMIT", 180, 136, { w: 150, h: 44, size: 16, fill: "#FFB81F" }),
  ...[
    [246, 150],
    [338, 176],
    [252, 300],
    [334, 290],
  ].map(([x, y], i): Actor => ({ id: `spark${i}`, kind: "sparkle", x, y, scale: 0.2, ...hidden })),
  // next term: ₹12,000 split again
  box("b12", "₹12,000 a month", 180, 120, { w: 210, h: 54, size: 20 }),
  box("s12n", "Needs|₹6,000", 70, 250, { w: 96, h: 70, size: 15 }),
  box("s12w", "Wants|₹3,600", 180, 250, { w: 96, h: 70, size: 15 }),
  box("s12s", "Savings 20%|₹2,400", 290, 250, { w: 116, h: 70, size: 14, fill: "#FFB81F" }),
];

const jarsAndBits = [
  "jarNeeds",
  "jarWants",
  "jarSavings",
  "lid",
  "lock",
  "cNeeds",
  "cWants",
  "cSavings",
  "calendar",
  "iRent",
  "iMess",
  "iBus",
  "iOtt",
  "spark0",
  "spark1",
  "spark2",
  "spark3",
];
const end = recap(
  [
    ["jar", "Split 50/30/20"],
    ["lock", "Pay yourself first"],
    ["drop", "Cap small leaks"],
  ],
  ["b12", "s12n", "s12w", "s12s", "mom", "riya"],
  "Split it. Save first. Watch small leaks.",
);

const drop = (id: string, at: number, x: number, y: number): Step[] => [show(id, at, {}, 0.05), move(id, at + 0.01, { x, y }, 0.18, "bounce.out")];

const story: Story = {
  slug: "budgeting-basics",
  backdrop: { place: "home" },
  actors: [...base, ...end.actors],
  meta: {
    title: "Riya's first month",
    concept: "Mom sends Riya ₹8,000 and teaches her to split it before she spends it.",
    cast: "Riya (19, college student) and her mom",
    relationship: "Mother and daughter",
    setting: "Home, on payday",
    facts: [
      "50/30/20: 50% needs, 30% wants, 20% savings",
      "Needs: rent, mess, transport, recharge. Wants: OTT, cafés, shopping",
      "Pay yourself first: move savings out the day money arrives",
      "Small, frequent spends add up: 30 × ₹80 = ₹2,400",
      "₹8,000 → ₹4,000 / ₹2,400 / ₹1,600; ₹1,600 × 6 = ₹9,600; ₹12,000 × 20% = ₹2,400",
    ],
    coverage: [
      {
        q: `In the 50/30/20 rule, what share of your income goes to "needs"?`,
        scene: 2,
        how: "The Needs jar is labelled 50% and fills to ₹4,000 of ₹8,000; caption: 50% needs.",
      },
      {
        q: `Which of these is a "want", not a "need"?`,
        scene: 3,
        how: "Rent (hostel), mess and bus pass drop into Needs; the OTT icon drops into Wants; caption: OTT is a want.",
      },
      {
        q: `What does "pay yourself first" mean?`,
        scene: 4,
        how: "Calendar says 1st; savings are locked before anything is spent. 'Spend first, save what's left?' gets a red cross.",
      },
      {
        q: "Riya gets ₹12,000 a month. Following 50/30/20, how much should go to savings?",
        scene: 7,
        how: "₹12,000 splits into ₹6,000 / ₹3,600 / ₹2,400; the gold 'Savings 20%' box says ₹2,400; caption repeats it.",
      },
      {
        q: "Your UPI history shows 30 payments of about ₹80 each on snacks and chai this month. What's the best takeaway?",
        scene: 5,
        how: "Chai cups drip out of Wants; '30 × ₹80' counts up to ₹2,400 and empties the Wants jar; then 'SET A LIMIT'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Day 1. Mom sends ₹8,000. Riya wants everything.",
      steps: [
        pose("mom", 0.04, "face:happy arms:give"),
        show("cMain", 0.04),
        count("cMain", 0.08, 0.4, 0, 8000),
        ...fly("note0", 0.08, WALLET, { rotate: 25, scale: 0.5 }),
        ...fly("note1", 0.2, WALLET, { rotate: -20, scale: 0.5 }),
        ...fly("note2", 0.32, WALLET, { rotate: 15, scale: 0.5 }),
        pose("mom", 0.52, "face:happy arms:down"),
        pose("riya", 0.5, "face:excited arms:up"),
        pop("tCafe", 0.55),
        pop("tSneaker", 0.6),
        pop("tOtt", 0.65),
        pop("tBag", 0.7),
        shake("wallet", 0.62, 0.3, 14),
      ],
    },
    {
      caption: "Split it: 50% needs, 30% wants, 20% savings.",
      steps: [
        ...hideAll(["tCafe", "tSneaker", "tOtt", "tBag", "cMain"], 0),
        pose("riya", 0.06, "face:confused arms:down"),
        pose("mom", 0.06, "face:neutral arms:point"),
        move("jarNeeds", 0.1, { y: NEEDS.y }, 0.2, "back.out(1.4)"),
        move("jarWants", 0.16, { y: WANTS.y }, 0.2, "back.out(1.4)"),
        move("jarSavings", 0.22, { y: SAVINGS.y }, 0.2, "back.out(1.4)"),
        show("pNeeds", 0.36),
        show("pWants", 0.4),
        show("pSavings", 0.44),
        show("cNeeds", 0.4),
        show("cWants", 0.4),
        show("cSavings", 0.4),
        ...fly("coin0", 0.42, { x: NEEDS.x, y: 190 }),
        ...fly("coin1", 0.5, { x: WANTS.x, y: 190 }),
        ...fly("coin2", 0.58, { x: SAVINGS.x, y: 190 }),
        fill("jarNeeds", 0.42, 0.45, 0, 1),
        fill("jarWants", 0.46, 0.42, 0, 0.6),
        fill("jarSavings", 0.5, 0.4, 0, 0.4),
        count("cNeeds", 0.42, 0.45, 0, 4000),
        count("cWants", 0.46, 0.42, 0, 2400),
        count("cSavings", 0.5, 0.4, 0, 1600),
        pose("riya", 0.6, "face:happy arms:down"),
        pose("mom", 0.6, "face:happy arms:down"),
        hide("wallet", 0.8),
      ],
    },
    {
      caption: "Rent, mess, bus pass: needs. OTT is a want.",
      steps: [
        ...hideAll(["pNeeds", "pWants", "pSavings"], 0),
        pose("riya", 0.05, "face:thinking arms:chin"),
        ...drop("iRent", 0.08, 52, 266),
        ...drop("iMess", 0.22, 88, 266),
        ...drop("iBus", 0.36, 70, 252),
        ...drop("iOtt", 0.55, 180, 262),
        pose("riya", 0.75, "face:happy arms:down"),
      ],
    },
    {
      caption: "Pay yourself first: savings go out on day 1.",
      steps: [
        show("calendar", 0.04, { scale: 1 }),
        show("lid", 0.12, {}, 0.05),
        move("lid", 0.12, { y: 167 }, 0.2, "bounce.out"),
        show("lock", 0.32, {}, 0.05),
        move("lock", 0.32, { scale: 1 }, 0.14, "back.out(3)"),
        pose("riya", 0.3, "face:proud"),
        pop("bLeft", 0.5),
        pop("xLeft", 0.66),
        ...hideAll(["bLeft", "xLeft"], 0.9),
      ],
    },
    {
      caption: "30 snacks × ₹80 on UPI = ₹2,400. Set a limit.",
      steps: [
        pop("bLeak", 0.04),
        show("cLeak", 0.06),
        count("cLeak", 0.08, 0.6, 0, 2400),
        ...[0, 1, 2, 3, 4].flatMap((i): Step[] => [
          show(`chai${i}`, 0.08 + i * 0.12, {}, 0.04),
          move(`chai${i}`, 0.09 + i * 0.12, { x: WANTS.x + 58, y: 352, rotate: i % 2 ? 30 : -20 }, 0.2, "power2.in"),
          hide(`chai${i}`, 0.27 + i * 0.12, 0.04),
        ]),
        fill("jarWants", 0.08, 0.62, 0.6, 0.0001),
        count("cWants", 0.08, 0.62, 2400, 0),
        pose("riya", 0.25, "face:shocked"),
        pose("mom", 0.25, "face:worried"),
        hide("bLeak", 0.74),
        pop("bLimit", 0.78),
      ],
    },
    {
      caption: "6 months later: ₹9,600 saved. Savings untouched.",
      steps: [
        ...hideAll(["bLimit", "cLeak"], 0),
        fill("jarWants", 0.04, 0.12, 0.0001, 0.6),
        count("cWants", 0.04, 0.12, 0, 2400),
        pose("riya", 0.04, "face:happy"),
        pose("mom", 0.04, "face:happy"),
        pose("calendar", 0.06, "page:Month 1"),
        pose("calendar", 0.14, "page:Month 2"),
        pose("calendar", 0.22, "page:Month 3"),
        pose("calendar", 0.3, "page:Month 4"),
        pose("calendar", 0.38, "page:Month 5"),
        pose("calendar", 0.46, "page:Month 6"),
        fill("jarSavings", 0.06, 0.46, 0.4, 1),
        count("cSavings", 0.06, 0.46, 1600, 9600),
        move("jarSavings", 0.56, { scale: 1.12 }, 0.12, "back.out(2)"),
        move("cSavings", 0.56, { scale: 1.35 }, 0.12),
        pose("riya", 0.58, "face:excited arms:up"),
        pose("mom", 0.58, "face:proud arms:thumb"),
        ...[0, 1, 2, 3].map((i): Step => ({
          at: 0.6 + i * 0.05,
          dur: 0.12,
          actor: `spark${i}`,
          to: { opacity: 1, scale: 1, rotate: 45 },
          ease: "back.out(3)",
        })),
      ],
    },
    {
      caption: "Next term: ₹12,000. Savings: 20% = ₹2,400.",
      steps: [
        ...hideAll(jarsAndBits, 0),
        pose("riya", 0.06, "face:happy arms:down"),
        pose("mom", 0.06, "face:happy arms:give"),
        pop("b12", 0.1),
        pop("s12n", 0.3),
        pop("s12w", 0.4),
        pop("s12s", 0.5, 1.08),
        shake("s12s", 0.66, 0.2, 6),
        pose("mom", 0.6, "face:proud arms:down"),
      ],
    },
    end.scene,
  ],
};

export default story;
