import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, fill, hideAll, icon, label, move, person, pop, pose, recap, shake, show } from "./kit";

// INDEX FUNDS AND THE LONG GAME · "Stay at the crease". Coach Shalini teaches
// her players Nikhil and Kavya that fees and impatience cost runs. Metaphor: a
// leaking bucket (fees) and a batter who walks off before the big over.
// Numbers: 1% of ₹50,000 ≈ ₹500 a year; ₹1 lakh for 20 years at an assumed
// 10%: 0.2% fee → about ₹6.5 lakh, 1.5% fee → about ₹5.1 lakh, gap ≈ ₹1.4 lakh.

const SHALINI: Look = {
  skin: "#A86B45",
  hair: "short",
  hairColor: "#231712",
  top: "#2f5d46",
  topStyle: "jersey",
  accent: "#FFB81F",
  cap: "#2f5d46",
  bottom: "#2b2b38",
};
const NIKHIL: Look = { skin: "#C68B5E", hair: "spiky", hairColor: "#16110e", top: "#F5EFE3", topStyle: "jersey", accent: "#3f6fb5", bottom: "#F5EFE3" };
const KAVYA: Look = { skin: "#B97A50", hair: "ponytail", hairColor: "#231712", top: "#F5EFE3", topStyle: "jersey", accent: "#C2410C", bottom: "#F5EFE3" };

const actors: Actor[] = [
  box("bSame", "₹1 lakh each|same Nifty 50 index", 180, 120, { w: 230, h: 62, size: 15 }),
  { id: "bucket", kind: "jar", x: 180, y: 220, scale: 0.9, props: { label: "Fund", color: "#5FA35A", fill: 0.9 }, opacity: 0 },
  ...[0, 1, 2].map((i): Actor => ({ id: `leak${i}`, kind: "coin", x: 214, y: 260, scale: 0.8, opacity: 0 })),
  box("bEr", "Expense ratio:|yearly fee, % of your money", 180, 100, { w: 250, h: 62, size: 14, fill: "#FFB81F" }),
  box("b50k", "1% of ₹50,000", 180, 120, { w: 180, h: 46, size: 17 }),
  counter("c500", 180, 210, 0, 40, "#C2410C"),
  label("lYear", "about, every year", 180, 250, 13),
  box("direct", "DIRECT|same fund|lower fee", 105, 200, { w: 130, h: 90, size: 14, fill: "#dff0dc" }),
  box("regular", "REGULAR|same fund|+ commission", 255, 200, { w: 130, h: 90, size: 14, fill: "#fde0dc" }),
  icon("okDirect", "check", 160, 160, 0.8),
  label("lN", "Nikhil: 0.2% fee", 100, 140, 12, "#dff0dc"),
  label("lK", "Kavya: 1.5% fee", 260, 140, 12, "#fde0dc"),
  counter("cN", 100, 200, 100000, 22, "#2f5d46"),
  counter("cK", 260, 200, 100000, 22, "#C2410C"),
  box("gap", "Gap ≈ ₹1.4 lakh", 180, 280, { w: 190, h: 46, size: 17, fill: "#FFB81F" }),
  label("l20", "20 years at 10%", 180, 100, 13),
  { id: "crash", kind: "chart", x: 180, y: 160, props: { points: "0,30 50,40 80,85 100,40 140,30 200,10", color: "#3f6fb5", w: 200, h: 90 }, opacity: 0 },
  label("lRebound", "best days come right after the worst", 180, 240, 11, "#FFB81F"),
  icon("bat", "bat", 300, 300, 1.4),
  person("shalini", SHALINI, 180, "face:happy arms:down", 0.8),
  person("nikhil", NIKHIL, 56, "face:neutral arms:down", 0.78),
  person("kavya", KAVYA, 304, "face:neutral arms:down", 0.78),
];

const end = recap(
  [
    ["rupee", "Fees compound too"],
    ["check", "Direct, low-cost plans"],
    ["bat", "Stay in the game"],
  ],
  ["shalini", "nikhil", "kavya", "crash", "lRebound", "bat"],
  "Cut fees. Stay invested. Win long.",
);

const story: Story = {
  slug: "index-funds-long-term",
  backdrop: { place: "cricket", accent: "#2f5d46" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Stay at the crease",
    concept: "Coach Shalini shows two players that fees leak runs and walking off early misses the big over.",
    cast: "Coach Shalini with players Nikhil and Kavya",
    relationship: "Coach and her players",
    setting: "The college cricket ground",
    facts: [
      "The expense ratio is a yearly fee, as a percentage of what you've invested",
      "1% on ₹50,000 is about ₹500 a year",
      "Direct plans hold the same investments as regular plans but cost less (no distributor commission)",
      "₹1 lakh for 20 years at 10%: 0.2% fee → about ₹6.5 lakh, 1.5% → about ₹5.1 lakh (≈ ₹1.4 lakh gap)",
      "Big rebound days often follow big falls; people who step out miss them",
    ],
    coverage: [
      {
        q: "What is a mutual fund's expense ratio?",
        scene: 2,
        how: "Coins leak from the fund bucket every year; box 'Expense ratio: yearly fee, % of your money'.",
      },
      {
        q: "A fund has a direct plan and a regular plan. What's the difference?",
        scene: 4,
        how: "'DIRECT: same fund, lower fee' (ticked) vs 'REGULAR: same fund + commission'.",
      },
      {
        q: "You have ₹50,000 in a fund with a 1% expense ratio. Roughly what does that cost you this year?",
        scene: 3,
        how: "'1% of ₹50,000' and the counter shows about ₹500, every year.",
      },
      {
        q: "Why does trying to time the market often backfire?",
        scene: 6,
        how: "The chart crashes then rebounds sharply; label 'best days come right after the worst'; the player who walks off misses it.",
      },
      {
        q: "Two index funds track the same index. One charges 0.2% a year, the other 1.5%. You invest ₹1 lakh in one for 20 years. Assuming the index grows 10% a year, about how much more does the cheaper one leave you?",
        scene: 5,
        how: "Nikhil (0.2%) climbs to ₹6.5 lakh, Kavya (1.5%) to ₹5.1 lakh over '20 years at 10%'; box 'Gap ≈ ₹1.4 lakh'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Nikhil and Kavya each invest ₹1 lakh, same index.",
      steps: [
        pop("bSame", 0.06),
        pose("shalini", 0.2, "face:happy arms:point"),
        pose("nikhil", 0.3, "face:happy arms:thumb"),
        pose("kavya", 0.35, "face:happy arms:thumb"),
      ],
    },
    {
      caption: "Expense ratio: a yearly fee, as % of your money.",
      steps: [
        ...hideAll(["bSame"], 0),
        pop("bucket", 0.06, 0.9),
        pop("bEr", 0.14),
        ...[0, 1, 2].flatMap((i) => [
          show(`leak${i}`, 0.24 + i * 0.14, {}, 0.04),
          move(`leak${i}`, 0.25 + i * 0.14, { y: 330, opacity: 0 }, 0.14, "power2.in"),
        ]),
        fill("bucket", 0.24, 0.4, 0.9, 0.7),
        pose("kavya", 0.4, "face:worried arms:down"),
      ],
    },
    {
      caption: "1% fee on ₹50,000 = about ₹500 a year.",
      steps: [
        ...hideAll(["bucket", "bEr"], 0),
        pop("b50k", 0.06),
        show("c500", 0.16),
        count("c500", 0.2, 0.3, 0, 500),
        show("lYear", 0.3),
        pose("nikhil", 0.5, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "Direct plan: same fund, lower fee. No commission.",
      steps: [
        ...hideAll(["b50k", "c500", "lYear"], 0),
        pop("direct", 0.06),
        pop("regular", 0.16),
        pop("okDirect", 0.4, 0.8),
        shake("regular", 0.5, 0.2, 5),
        pose("shalini", 0.3, "face:neutral arms:point"),
      ],
    },
    {
      caption: "20 years at 10%: low fee leaves ~₹1.4 lakh more.",
      steps: [
        ...hideAll(["direct", "regular", "okDirect"], 0),
        show("l20", 0.04),
        show("lN", 0.06),
        show("lK", 0.06),
        show("cN", 0.08),
        show("cK", 0.08),
        count("cN", 0.12, 0.45, 100000, 650000),
        count("cK", 0.12, 0.45, 100000, 510000),
        pop("gap", 0.62),
        pose("nikhil", 0.6, "face:excited arms:up"),
        pose("kavya", 0.6, "face:shocked arms:down"),
      ],
    },
    {
      caption: "Step out during falls? You miss the big rebounds.",
      steps: [
        ...hideAll(["l20", "lN", "lK", "cN", "cK", "gap"], 0),
        show("crash", 0.04),
        { at: 0.06, dur: 0.5, actor: "crash", fill: [0, 1] },
        pose("kavya", 0.2, "face:worried arms:down"),
        move("kavya", 0.24, { x: 380 }, 0.2),
        pop("bat", 0.3, 1.4),
        show("lRebound", 0.5),
        pose("nikhil", 0.55, "face:proud arms:up"),
        move("kavya", 0.7, { x: 304 }, 0.2),
      ],
    },
    end.scene,
  ],
};

export default story;
