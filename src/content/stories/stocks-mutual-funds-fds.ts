import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, hideAll, icon, label, move, person, pop, pose, recap, shake, show, stamp } from "./kit";

// STOCKS vs MUTUAL FUNDS vs FDs · "The trip fund". Ira, Dev and Samir plan a
// trip on the hostel terrace, each with ₹10,000. Metaphor: one basket vs many
// baskets; a fund manager is like a trip planner who spreads the money.
// Facts: a share is a small part of a company; diversification spreads risk
// (one hyped stock −40% → ₹6,000; an index fund −5% → ₹9,500); a Nifty 50 index
// fund copies the 50 companies; higher returns, higher risk; money needed in
// 6 months (₹50,000 fees) belongs somewhere safe like an FD.

const IRA: Look = { skin: "#E0AC82", hair: "wavy", hairColor: "#3b2416", top: "#FFB81F", topStyle: "tee", bottom: "#2b3a55", bottomStyle: "pants" };
const DEV: Look = {
  skin: "#A86B45",
  hair: "short",
  hairColor: "#16110e",
  top: "#3f6fb5",
  topStyle: "hoodie",
  accent: "#F5EFE3",
  bottom: "#2b2b38",
  glasses: true,
};
const SAMIR: Look = {
  skin: "#C68B5E",
  hair: "spiky",
  hairColor: "#231712",
  top: "#E9785B",
  topStyle: "kurta",
  accent: "#F5EFE3",
  beard: "stubble",
  bottom: "#24304a",
};

const actors: Actor[] = [
  box("b10k", "₹10,000 each", 180, 110, { w: 180, h: 46, size: 18 }),
  icon("plane", "plane", 180, 190, 1.8),
  icon("company", "building", 180, 190, 3),
  icon("piece", "building", 180, 190, 1),
  box("bShare", "1 share = a small|piece of the company", 180, 300, { w: 230, h: 62, size: 14 }),
  icon("oneStock", "rupee", 100, 200, 1.6),
  counter("cOne", 100, 260, 10000, 22, "#C2410C"),
  label("lOne", "one stock", 100, 140, 13),
  icon("basket", "basket", 260, 200, 1.6),
  counter("cMany", 260, 260, 10000, 22, "#2f5d46"),
  label("lMany", "many companies", 260, 140, 13),
  box("bDiv", "Diversify:|spread it out", 180, 320, { w: 180, h: 60, size: 15, fill: "#FFB81F" }),
  box("index", "NIFTY 50 INDEX FUND", 180, 110, { w: 250, h: 46, size: 15, fill: "#dff0dc" }),
  ...Array.from({ length: 10 }, (_, i): Actor => icon(`co${i}`, "building", 80 + (i % 5) * 50, 180 + Math.floor(i / 5) * 56, 0.7)),
  label("lCopies", "copies all 50 companies", 180, 310, 13),
  box("ret", "Higher possible return", 180, 130, { w: 220, h: 44, size: 14, fill: "#dff0dc" }),
  box("risk", "= higher risk", 180, 190, { w: 220, h: 44, size: 15, fill: "#fde0dc" }),
  stamp("guar", "'GUARANTEED HIGH'?", 180, 280),
  box("fees", "₹50,000 college fees|due in 6 months", 180, 120, { w: 230, h: 62, size: 14 }),
  icon("fd", "vault", 120, 220, 1.8),
  label("lFd", "FD: safe", 120, 270, 14, "#dff0dc"),
  icon("riskyPick", "rupee", 250, 220, 1.4),
  icon("xRisky", "cross", 270, 200, 0.8),
  label("lRisky", "a falling stock", 250, 270, 12, "#fde0dc"),
  person("ira", IRA, 60, "face:happy arms:down", 0.8),
  person("dev", DEV, 180, "face:neutral arms:down", 0.8),
  person("samir", SAMIR, 300, "face:excited arms:down", 0.8),
];

const end = recap(
  [
    ["building", "Share = piece of company"],
    ["basket", "Diversify"],
    ["vault", "Short goal? Stay safe"],
  ],
  ["ira", "dev", "samir", "fees", "fd", "lFd", "riskyPick", "xRisky", "lRisky"],
  "Own a piece. Spread it. Match the timeline.",
);

const story: Story = {
  slug: "stocks-mutual-funds-fds",
  backdrop: { place: "terrace", accent: "#FFB81F" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "The trip fund",
    concept: "Three friends planning a trip each try a different way to grow ₹10,000: one share, one hyped stock, or a fund.",
    cast: "Ira, Dev and Samir (21)",
    relationship: "A trio of friends",
    setting: "The hostel terrace at sunset",
    facts: [
      "A share is a small part of a company",
      "Diversification spreads money across many investments: one stock fell 40% (₹6,000), an index fund only 5% (₹9,500)",
      "A Nifty 50 index fund copies the 50 companies in the index",
      "Higher possible returns come with higher risk; guaranteed high returns are a red flag",
      "Money needed soon (₹50,000 fees in 6 months) belongs somewhere safe like an FD",
    ],
    coverage: [
      {
        q: "You buy one share of a company whose products you love. What do you actually own?",
        scene: 2,
        how: "A company building splits; Dev holds one piece; box '1 share = a small piece of the company'.",
      },
      {
        q: "A friend put all ₹10,000 into one stock “because it's going to the moon”. What would diversification look like instead?",
        scene: 3,
        how: "One stock falls ₹10,000 → ₹6,000 while 'many companies' only dips to ₹9,500; box 'Diversify: spread it out'.",
      },
      {
        q: "Which statement about risk and return is true?",
        scene: 5,
        how: "'Higher possible return' sits on '= higher risk'; a 'GUARANTEED HIGH?' stamp appears as the red flag.",
      },
      { q: "What does a Nifty 50 index fund do?", scene: 4, how: "'NIFTY 50 INDEX FUND' fills with company icons; label 'copies all 50 companies'." },
      {
        q: "You need ₹50,000 for college fees in 6 months. Which option fits that goal best?",
        scene: 6,
        how: "'₹50,000 college fees due in 6 months' → 'FD: safe' is chosen; a falling stock gets a cross.",
      },
    ],
  },
  scenes: [
    {
      caption: "Trip fund planning: Ira, Dev and Samir each have ₹10,000.",
      steps: [pop("b10k", 0.06), pop("plane", 0.2, 1.8), pose("samir", 0.3, "face:excited arms:up"), pose("ira", 0.4, "face:happy arms:point")],
    },
    {
      caption: "One share = a small piece of a company.",
      steps: [
        ...hideAll(["b10k", "plane"], 0),
        pop("company", 0.06, 3),
        show("piece", 0.3),
        move("piece", 0.32, { x: 180, y: 300, scale: 1 }, 0.01),
        move("piece", 0.34, { x: 200, y: 330, scale: 0.8 }, 0.25),
        pop("bShare", 0.5),
        pose("dev", 0.4, "face:happy arms:give"),
      ],
    },
    {
      caption: "All in one stock fell 40%. Diversify: spread it out.",
      steps: [
        ...hideAll(["company", "piece", "bShare"], 0),
        show("lOne", 0.04),
        show("lMany", 0.04),
        pop("oneStock", 0.06, 1.6),
        pop("basket", 0.1, 1.6),
        show("cOne", 0.12),
        show("cMany", 0.12),
        count("cOne", 0.2, 0.4, 10000, 6000),
        count("cMany", 0.2, 0.4, 10000, 9500),
        shake("oneStock", 0.3, 0.3, 14),
        pose("samir", 0.4, "face:shocked arms:down"),
        pop("bDiv", 0.66),
      ],
    },
    {
      caption: "A Nifty 50 index fund copies the 50 companies.",
      steps: [
        ...hideAll(["oneStock", "basket", "cOne", "cMany", "lOne", "lMany", "bDiv"], 0),
        pop("index", 0.06),
        ...Array.from({ length: 10 }, (_, i) => pop(`co${i}`, 0.12 + i * 0.04, 0.7)),
        show("lCopies", 0.6),
        pose("ira", 0.4, "face:proud arms:point"),
      ],
    },
    {
      caption: "Higher possible returns come with higher risk.",
      steps: [
        ...hideAll(["index", "lCopies", ...Array.from({ length: 10 }, (_, i) => `co${i}`)], 0),
        pop("ret", 0.06),
        pop("risk", 0.2),
        pop("guar", 0.45, 1),
        pose("dev", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "₹50,000 fees due in 6 months? Keep it safe: FD.",
      steps: [
        ...hideAll(["ret", "risk", "guar"], 0),
        pop("fees", 0.06),
        pop("fd", 0.2, 1.8),
        show("lFd", 0.24),
        pop("riskyPick", 0.32, 1.4),
        show("lRisky", 0.34),
        pop("xRisky", 0.5, 0.8),
        pose("ira", 0.5, "face:happy arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
