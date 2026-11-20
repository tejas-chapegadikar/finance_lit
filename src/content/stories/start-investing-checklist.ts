import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, hideAll, icon, label, move, person, pop, pose, recap, shake, show, stamp } from "./kit";

// STARTING TO INVEST: A BEGINNER'S CHECKLIST · "A visit from Future Nisha".
// Late at night, Nisha (22) meets herself at 60, who walks her through a
// checklist. Metaphor: a checklist of ticks; a risk dial turned down.
// Facts: start with "what's this money for, and when?"; KYC needs PAN (plus
// ID like Aadhaar); mutual funds don't need demat (shares/ETFs do); paid advice
// only from SEBI-registered advisers; if a 30% fall would panic you, pick less risk.

const NISHA: Look = { skin: "#C68B5E", hair: "wavy", hairColor: "#231712", top: "#9ed2c6", topStyle: "sweater", accent: "#F5EFE3", bottom: "#4a6487" };
const FUTURE: Look = {
  skin: "#B97A50",
  hair: "bun",
  hairColor: "#d6d1cb",
  top: "#9ed2c6",
  topStyle: "sweater",
  accent: "#FFB81F",
  glasses: true,
  old: true,
  bottom: "#4a6487",
};

const actors: Actor[] = [
  icon("star", "clock", 180, 180, 1.6),
  box("goal1", "Bike|in 18 months", 105, 200, { w: 130, h: 64, size: 15 }),
  box("goal2", "Future me|20+ years", 255, 200, { w: 130, h: 64, size: 15 }),
  box("bWhy", "What is it for?|When do I need it?", 180, 110, { w: 220, h: 62, size: 15, fill: "#FFB81F" }),
  icon("pan", "idcard", 120, 200, 2),
  label("lPan", "PAN card", 120, 250, 14, "#FFB81F"),
  icon("aadhaar", "idcard", 250, 200, 1.6),
  label("lAad", "+ ID like Aadhaar", 250, 250, 12),
  box("bKyc", "KYC, done once", 180, 110, { w: 180, h: 44, size: 16 }),
  box("mf", "Mutual funds|no demat needed", 105, 200, { w: 140, h: 70, size: 14, fill: "#dff0dc" }),
  box("sh", "Shares, ETFs|need demat", 255, 200, { w: 140, h: 70, size: 14, fill: "#fff" }),
  icon("vault", "vault", 255, 130, 1.2),
  {
    id: "tipPhone",
    kind: "screen",
    x: 110,
    y: 190,
    scale: 0.78,
    props: { title: "@StockGuru", text: "Paid tips ₹999|'100% sure!'", button: "BUY PLAN" },
    opacity: 0,
  },
  stamp("noGuru", "NOT SEBI", 110, 190),
  icon("sebi", "shield", 260, 180, 1.8),
  box("bSebi", "Only SEBI-registered|advisers", 260, 260, { w: 170, h: 62, size: 13, fill: "#dff0dc" }),
  { id: "fall", kind: "chart", x: 180, y: 130, props: { points: "0,10 60,20 100,25 140,80 200,75", color: "#E0453B", w: 200, h: 80 }, opacity: 0 },
  label("l30", "−30%", 270, 100, 16, "#fde0dc"),
  { id: "riskDial", kind: "gauge", x: 180, y: 290, scale: 0.7, props: { min: "", max: "" }, opacity: 0 },
  { id: "riskNeedle", kind: "needle", x: 180, y: 290, scale: 0.7, rotate: 60, opacity: 0 },
  label("lLess", "less risk you'll hold", 180, 330, 12, "#FFB81F"),
  person("nisha", NISHA, 72, "face:neutral arms:down", 0.9),
  person("future", FUTURE, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["clock", "Goal and timeline first"],
    ["idcard", "PAN for KYC"],
    ["shield", "SEBI-registered only"],
  ],
  ["nisha", "future", "fall", "l30", "riskDial", "riskNeedle", "lLess"],
  "Know why. Do KYC. Pick risk you can hold.",
);

const story: Story = {
  slug: "start-investing-checklist",
  backdrop: { place: "bedroom", accent: "#9ed2c6" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "A visit from Future Nisha",
    concept: "Late at night, Nisha meets herself at 60, who walks her through the checklist she wishes she'd had.",
    cast: "Nisha (22) and Future Nisha (60)",
    relationship: "A young woman and her future self",
    setting: "Nisha's bedroom, late at night",
    facts: [
      "First ask: what is this money for, and when will I need it?",
      "KYC needs your PAN, plus ID and address proof such as Aadhaar",
      "Mutual funds don't need a demat account; shares and ETFs do",
      "Only SEBI-registered investment advisers may charge for personal advice",
      "If a 30% fall would make you panic, choose a mix with less risk you'd actually hold",
    ],
    coverage: [
      {
        q: "Which document is essential for completing your investment KYC in India?",
        scene: 3,
        how: "A PAN card pops up labelled 'PAN card', with '+ ID like Aadhaar'; box 'KYC, done once'.",
      },
      {
        q: "Do you need a demat account to invest in a regular mutual fund?",
        scene: 4,
        how: "Two boxes: 'Mutual funds: no demat needed' vs 'Shares, ETFs: need demat'.",
      },
      {
        q: "Before choosing any investment, what's the most useful first question?",
        scene: 2,
        how: "Gold box 'What is it for? When do I need it?' with goals 'Bike in 18 months' and 'Future me 20+ years'.",
      },
      {
        q: "Someone offers to build you a personal investment plan for a fee. What should you check first?",
        scene: 5,
        how: "A '@StockGuru' paid-tips screen gets a 'NOT SEBI' stamp; box 'Only SEBI-registered advisers'.",
      },
      {
        q: "You realise you'd probably sell in a panic if your investments fell 30%. What does that suggest?",
        scene: 6,
        how: "A chart falls 30%; Nisha panics; the risk dial turns from riskier to safer: 'less risk you'll hold'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Late night. Nisha, 22, meets Future Nisha, 60.",
      steps: [pop("star", 0.06, 1.6), pose("nisha", 0.2, "face:shocked arms:up"), pose("future", 0.3, "face:happy arms:wave")],
    },
    {
      caption: "First question: what's this money for, and when?",
      steps: [
        ...hideAll(["star"], 0),
        pop("bWhy", 0.06),
        pop("goal1", 0.24),
        pop("goal2", 0.34),
        pose("future", 0.2, "face:neutral arms:point"),
        pose("nisha", 0.5, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "KYC needs your PAN card, plus ID like Aadhaar.",
      steps: [
        ...hideAll(["bWhy", "goal1", "goal2"], 0),
        pop("bKyc", 0.06),
        pop("pan", 0.16, 2),
        show("lPan", 0.2),
        pop("aadhaar", 0.3, 1.6),
        show("lAad", 0.34),
        pose("nisha", 0.4, "face:happy arms:thumb"),
      ],
    },
    {
      caption: "Mutual funds don't need demat. Shares and ETFs do.",
      steps: [
        ...hideAll(["bKyc", "pan", "lPan", "aadhaar", "lAad"], 0),
        pop("mf", 0.06),
        pop("sh", 0.18),
        pop("vault", 0.3, 1.2),
        pose("future", 0.3, "face:happy arms:point"),
      ],
    },
    {
      caption: "Paying for advice? Only SEBI-registered advisers.",
      steps: [
        ...hideAll(["mf", "sh", "vault"], 0),
        pop("tipPhone", 0.06, 0.78),
        pop("noGuru", 0.32, 1),
        pop("sebi", 0.44, 1.8),
        pop("bSebi", 0.52),
        pose("nisha", 0.4, "face:worried arms:down"),
        pose("future", 0.5, "face:proud arms:thumb"),
      ],
    },
    {
      caption: "Would a 30% fall make you panic? Pick less risk.",
      steps: [
        ...hideAll(["tipPhone", "noGuru", "sebi", "bSebi"], 0),
        show("fall", 0.04),
        { at: 0.06, dur: 0.35, actor: "fall", fill: [0, 1] },
        show("l30", 0.3),
        pose("nisha", 0.34, "face:shocked arms:up"),
        shake("l30", 0.38, 0.2, 6),
        show("riskDial", 0.5),
        show("riskNeedle", 0.5),
        move("riskNeedle", 0.56, { rotate: -45 }, 0.2),
        show("lLess", 0.66),
        pose("nisha", 0.72, "face:happy arms:down"),
      ],
    },
    end.scene,
  ],
};

export default story;
