import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, fill, hideAll, icon, label, move, person, pop, pose, recap, shake, show } from "./kit";

// FIXED AND RECURRING DEPOSITS · "Saving for the trip". Neel wants a trip next
// year; Mrs. Kapoor at the travel agency plans the money with him.
// Metaphor: a locked safe (FD) and a monthly staircase of coins (RD).
// Numbers (quiz): ₹1,000 a month for 12 months at about 6.5% → about ₹12,420.

const NEEL: Look = { skin: "#C68B5E", hair: "spiky", hairColor: "#231712", top: "#E9785B", topStyle: "hoodie", accent: "#F5EFE3", bottom: "#24304a" };
const KAPOOR: Look = { skin: "#B97A50", hair: "bun", hairColor: "#2a1f1a", top: "#2f8a7d", topStyle: "saree", accent: "#FFB81F", bindi: true, glasses: true };

const steps: Actor[] = Array.from({ length: 6 }, (_, i): Actor => ({ id: `st${i}`, kind: "coin", x: 70 + i * 44, y: 300 - i * 30, scale: 1.2, opacity: 0 }));

const actors: Actor[] = [
  icon("plane", "plane", 180, 200, 2),
  label("lTrip", "Trip next year", 180, 250, 14),
  icon("safe", "vault", 120, 200, 2.4),
  { id: "lockFd", kind: "lock", x: 120, y: 140, scale: 1.4, opacity: 0 },
  box("bFd", "FD|lump sum, locked|fixed rate, fixed time", 265, 200, { w: 160, h: 86, size: 13, fill: "#FFB81F" }),
  ...steps,
  box("bRd", "RD|same amount|every month", 110, 120, { w: 150, h: 76, size: 14, fill: "#dff0dc" }),
  label("l1000", "₹1,000 a month", 270, 120, 14),
  counter("cIn", 180, 130, 0, 24),
  label("lIn", "you put in", 180, 165, 12),
  counter("cMat", 180, 250, 0, 40, "#2f5d46"),
  label("lMat", "at maturity (~6.5%)", 180, 290, 12),
  { id: "lockBreak", kind: "lock", x: 120, y: 200, scale: 2, opacity: 0 },
  { id: "rate", kind: "bar", x: 260, y: 200, props: { w: 140, h: 26, color: "#5FA35A", fill: 0.9 }, opacity: 0 },
  box("bLess", "Slightly lower|interest", 260, 130, { w: 150, h: 60, size: 14, fill: "#fde0dc" }),
  icon("tax", "tax", 110, 190, 1.6),
  box("bTax", "FD interest|+ your income|→ taxed by slab", 250, 190, { w: 160, h: 84, size: 14 }),
  person("neel", NEEL, 72, "face:excited arms:down", 0.9),
  person("kapoor", KAPOOR, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["vault", "FD: lump sum, locked"],
    ["clock", "RD: every month"],
    ["tax", "Interest is taxable"],
  ],
  ["neel", "kapoor", "tax", "bTax"],
  "FD locks a lump sum. RD builds monthly.",
);

const story: Story = {
  slug: "fd-rd",
  backdrop: { place: "travel", accent: "#2f8a7d" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Saving for the trip",
    concept: "Neel wants a trip next year; the travel agent shows him how an FD and an RD would fund it.",
    cast: "Neel (19) and Mrs. Kapoor (travel agent)",
    relationship: "Customer and travel agent",
    setting: "A small travel agency",
    facts: [
      "FD: a lump sum locked for a fixed period at a fixed rate",
      "RD: a fixed amount deposited every month",
      "₹1,000 a month for 12 months at about 6.5% matures at about ₹12,420",
      "Breaking an FD early usually means a slightly lower interest rate",
      "FD interest is added to your income and taxed as per your slab",
    ],
    coverage: [
      {
        q: "Your mom says, “Just put it in an FD.” What is a Fixed Deposit?",
        scene: 2,
        how: "A safe gets locked; box 'FD: lump sum, locked, fixed rate, fixed time'.",
      },
      {
        q: "You want to put aside ₹1,000 every month for a trip next year. Which one lets you deposit a fixed amount every month?",
        scene: 3,
        how: "Coins climb a staircase one step per month; box 'RD: same amount every month'; '₹1,000 a month'.",
      },
      {
        q: "What usually happens if you break an FD before it matures?",
        scene: 5,
        how: "The FD lock breaks open; the interest bar shrinks a little; box 'Slightly lower interest'.",
      },
      { q: "Is the interest you earn on an FD taxable?", scene: 6, how: "Tax badge and box 'FD interest + your income → taxed by slab'." },
      {
        q: "Neel puts ₹1,000 a month into a 12-month RD at about 6.5% interest. Which is closest to his maturity amount?",
        scene: 4,
        how: "Counters: ₹12,000 put in, ₹12,420 at maturity (~6.5%).",
      },
    ],
  },
  scenes: [
    {
      caption: "Neel wants a trip next year. Time to plan.",
      steps: [
        pop("plane", 0.06, 2),
        show("lTrip", 0.1),
        move("plane", 0.2, { x: 230, y: 170, rotate: -10 }, 0.4),
        pose("kapoor", 0.3, "face:happy arms:point"),
      ],
    },
    {
      caption: "FD: one lump sum, locked at a fixed rate.",
      steps: [
        ...hideAll(["plane", "lTrip"], 0),
        pop("safe", 0.06, 2.4),
        show("lockFd", 0.2),
        move("lockFd", 0.2, { y: 168, scale: 1 }, 0.18, "bounce.out"),
        pop("bFd", 0.4),
        pose("neel", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "RD: the same amount every month. ₹1,000 each.",
      steps: [
        ...hideAll(["safe", "lockFd", "bFd"], 0),
        pop("bRd", 0.04),
        show("l1000", 0.08),
        ...steps.map((s, i) => pop(s.id, 0.14 + i * 0.1, 1.2)),
        pose("neel", 0.5, "face:happy arms:point"),
      ],
    },
    {
      caption: "12 months: ₹12,000 in. Matures at about ₹12,420.",
      steps: [
        ...hideAll(["bRd", "l1000", ...steps.map((s) => s.id)], 0),
        show("cIn", 0.04),
        show("lIn", 0.04),
        count("cIn", 0.06, 0.3, 0, 12000),
        show("cMat", 0.36),
        show("lMat", 0.36),
        count("cMat", 0.4, 0.3, 12000, 12420),
        pose("neel", 0.7, "face:excited arms:up"),
      ],
    },
    {
      caption: "Break an FD early? You get slightly less interest.",
      steps: [
        ...hideAll(["cIn", "lIn", "cMat", "lMat"], 0),
        pop("safe", 0.04, 2.4),
        show("lockBreak", 0.1),
        shake("lockBreak", 0.2, 0.2, 18),
        move("lockBreak", 0.42, { y: 300, rotate: 40, opacity: 0 }, 0.2),
        show("rate", 0.4),
        fill("rate", 0.5, 0.2, 0.9, 0.7),
        pop("bLess", 0.6),
        pose("neel", 0.5, "face:worried arms:down"),
      ],
    },
    {
      caption: "FD interest is added to income, taxed by your slab.",
      steps: [
        ...hideAll(["safe", "rate", "bLess"], 0),
        pop("tax", 0.06, 1.6),
        pop("bTax", 0.2),
        pose("kapoor", 0.2, "face:neutral arms:point"),
        pose("neel", 0.4, "face:thinking arms:chin"),
      ],
    },
    end.scene,
  ],
};

export default story;
