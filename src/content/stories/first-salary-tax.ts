import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, hideAll, icon, label, move, person, pop, pose, recap, show } from "./kit";

// INCOME TAX FOR YOUR FIRST SALARY · "Arjun's first payslip". A fresher reads
// his offer and payslip with Lakshmi, a senior colleague. Metaphor: a big CTC
// box that shrinks into in-hand pay as lines peel off.
// Numbers (quiz): CTC ₹8.4 lakh includes a ₹60,000 yearly bonus →
// ₹7.8 lakh ÷ 12 = ₹65,000 a month (not ₹70,000).

const ARJUN: Look = {
  skin: "#8D5A3B",
  hair: "short",
  hairColor: "#16110e",
  top: "#fff",
  topStyle: "shirt",
  accent: "#D2342B",
  bottom: "#24304a",
  badge: "#3f6fb5",
};
const LAKSHMI: Look = {
  skin: "#B97A50",
  hair: "braid",
  hairColor: "#231712",
  top: "#7B4B94",
  topStyle: "kurta",
  accent: "#FFB81F",
  bindi: true,
  glasses: true,
  bottom: "#2b2b38",
  badge: "#3f6fb5",
};

const actors: Actor[] = [
  box("offer", "OFFER LETTER|CTC ₹8.4 lakh", 180, 120, { w: 210, h: 62, size: 16 }),
  box("guess", "÷ 12 = ₹70,000?", 180, 200, { w: 190, h: 46, size: 17, fill: "#fde0dc" }),
  icon("xGuess", "cross", 284, 186, 0.9),
  box("bonus", "− ₹60,000 bonus|(paid once a year)", 180, 200, { w: 210, h: 62, size: 14, fill: "#FFB81F" }),
  box("base", "₹7.8 lakh ÷ 12", 180, 270, { w: 180, h: 46, size: 17 }),
  counter("monthly", 180, 330, 0, 34, "#2f5d46"),
  { id: "ctc", kind: "box", x: 180, y: 190, props: { text: "CTC|total package", w: 220, h: 150, size: 18, fill: "#dfe8f6" }, opacity: 0 },
  box("inhand", "IN-HAND|reaches your bank", 180, 210, { w: 170, h: 70, size: 14, fill: "#dff0dc" }, { opacity: 0, scale: 1 }),
  label("cut1", "− deductions", 300, 140, 12, "#fde0dc"),
  box("slip", "PAYSLIP|Basic ...|EPF ...|TDS ...", 110, 200, { w: 150, h: 120, size: 14 }),
  box("bTds", "TDS = income tax|cut before you're paid", 262, 140, { w: 180, h: 62, size: 13, fill: "#FFB81F" }),
  icon("pf", "piggy", 270, 220, 1.8),
  label("lPf", "Arjun's EPF", 270, 266, 13, "#dff0dc"),
  ...[0, 1, 2].map((i): Actor => ({ id: `pfc${i}`, kind: "coin", x: 110, y: 200, opacity: 0 })),
  box("bRetire", "His own retirement savings", 180, 120, { w: 240, h: 44, size: 14 }),
  box("doorNew", "NEW regime|default", 105, 200, { w: 130, h: 90, size: 15, fill: "#dff0dc" }),
  box("doorOld", "OLD regime|if you choose", 255, 200, { w: 130, h: 90, size: 15, fill: "#fff" }),
  label("lNone", "chose nothing?", 105, 140, 12),
  person("arjun", ARJUN, 72, "face:excited arms:down", 0.9),
  person("lakshmi", LAKSHMI, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["doc", "CTC isn't in-hand"],
    ["tax", "TDS: tax cut upfront"],
    ["piggy", "EPF is yours"],
  ],
  ["arjun", "lakshmi", "doorNew", "doorOld", "lNone"],
  "Read the CTC. Know your payslip.",
);

const story: Story = {
  slug: "first-salary-tax",
  backdrop: { place: "office", accent: "#3f6fb5" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Arjun's first payslip",
    concept: "Arjun thinks his CTC means ₹70,000 a month; his senior Lakshmi walks him through the real numbers.",
    cast: "Arjun (22, fresher) and Lakshmi (senior colleague)",
    relationship: "Fresher and senior colleague",
    setting: "Arjun's first office",
    facts: [
      "CTC is the total package; in-hand is what reaches your bank after deductions",
      "A yearly bonus inside the CTC isn't monthly pay: ₹8.4 lakh − ₹60,000 = ₹7.8 lakh ÷ 12 = ₹65,000",
      "TDS is income tax your employer deducts before paying you",
      "EPF goes into your own retirement savings account",
      "The new tax regime applies by default",
    ],
    coverage: [
      {
        q: "What's the difference between CTC and in-hand salary?",
        scene: 3,
        how: "A big 'CTC total package' box shrinks as deductions peel off into 'IN-HAND reaches your bank'.",
      },
      {
        q: "Your first payslip has a line called “TDS”. What is it?",
        scene: 4,
        how: "The payslip's TDS line is highlighted: 'TDS = income tax cut before you're paid'.",
      },
      {
        q: "Which tax regime applies by default if you don't choose one?",
        scene: 6,
        how: "Two doors: 'NEW regime, default' (opens) and 'OLD regime, if you choose'; 'chose nothing?' points to NEW.",
      },
      {
        q: "Where does the EPF amount deducted from your salary go?",
        scene: 5,
        how: "Coins move from the payslip into a piggy bank labelled 'Arjun's EPF'; box 'His own retirement savings'.",
      },
      {
        q: "Arjun's CTC is ₹8.4 lakh, which includes a ₹60,000 performance bonus paid once a year. What's his monthly salary before deductions?",
        scene: 2,
        how: "'÷ 12 = ₹70,000?' gets a cross; '− ₹60,000 bonus (paid once a year)', '₹7.8 lakh ÷ 12', counter ₹65,000.",
      },
    ],
  },
  scenes: [
    {
      caption: "Arjun's offer: CTC ₹8.4 lakh. 'That's ₹70,000 a month!'",
      steps: [pop("offer", 0.06), pop("guess", 0.3), pose("arjun", 0.3, "face:excited arms:up"), pose("lakshmi", 0.5, "face:thinking arms:chin")],
    },
    {
      caption: "The ₹60,000 bonus is yearly. ₹7.8 lakh ÷ 12 = ₹65,000.",
      steps: [
        pop("xGuess", 0.04, 0.9),
        ...hideAll(["guess", "xGuess"], 0.2),
        pop("bonus", 0.24),
        pop("base", 0.4),
        show("monthly", 0.52),
        count("monthly", 0.54, 0.3, 0, 65000),
        pose("lakshmi", 0.2, "face:neutral arms:point"),
        pose("arjun", 0.6, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "CTC is the package. In-hand is what reaches your bank.",
      steps: [
        ...hideAll(["offer", "bonus", "base", "monthly"], 0),
        show("ctc", 0.06),
        show("cut1", 0.2),
        move("ctc", 0.24, { scale: 0.75, opacity: 0.4 }, 0.3),
        move("cut1", 0.24, { y: 100, opacity: 0 }, 0.3),
        pop("inhand", 0.5),
        pose("arjun", 0.6, "face:happy arms:down"),
      ],
    },
    {
      caption: "TDS: income tax your employer cuts before paying you.",
      steps: [
        ...hideAll(["ctc", "inhand"], 0),
        pop("slip", 0.06),
        pop("bTds", 0.3),
        pose("lakshmi", 0.2, "face:happy arms:point"),
        pose("arjun", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "EPF goes into YOUR retirement savings account.",
      steps: [
        ...hideAll(["bTds"], 0),
        pop("pf", 0.08, 1.8),
        show("lPf", 0.12),
        ...[0, 1, 2].flatMap((i) => [
          show(`pfc${i}`, 0.18 + i * 0.12, {}, 0.04),
          move(`pfc${i}`, 0.2 + i * 0.12, { x: 270, y: 210, opacity: 0 }, 0.16, "power2.in"),
        ]),
        pop("bRetire", 0.6),
        pose("arjun", 0.6, "face:proud arms:thumb"),
      ],
    },
    {
      caption: "No regime chosen? The new regime applies by default.",
      steps: [
        ...hideAll(["slip", "pf", "lPf", "bRetire"], 0),
        pop("doorNew", 0.08),
        pop("doorOld", 0.16),
        show("lNone", 0.3),
        move("doorNew", 0.44, { scale: 1.12 }, 0.12, "back.out(2)"),
        pose("lakshmi", 0.3, "face:happy arms:point"),
      ],
    },
    end.scene,
  ],
};

export default story;
