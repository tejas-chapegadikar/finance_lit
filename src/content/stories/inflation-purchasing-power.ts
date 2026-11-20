import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, hideAll, icon, label, move, person, pop, pose, recap, show } from "./kit";

// INFLATION · "Chai at Balan's". Tara drinks chai at Mr. Balan's stall from first
// year to final year. Metaphor: a ₹100 note buying fewer and fewer cups.
// Numbers (quiz): ₹500 thali at 6% a year → about ₹895 in 10 years
// (500 × 1.06^10 ≈ 895); FD 7% − inflation 5% ≈ 2% real return.

const TARA: Look = { skin: "#C68B5E", hair: "curly", hairColor: "#231712", top: "#7cc3e8", topStyle: "sweater", accent: "#F5EFE3", bottom: "#2b2b38" };
const BALAN: Look = {
  skin: "#6F4A32",
  hair: "bald",
  hairColor: "#bcb6b0",
  top: "#fff",
  topStyle: "apron",
  accent: "#E9785B",
  beard: "moustache",
  old: true,
  bottom: "#5b4a3a",
};

const cups = (prefix: string, n: number): Actor[] =>
  Array.from({ length: n }, (_, i): Actor => icon(`${prefix}${i}`, "chai", 70 + (i % 5) * 55, 200 + Math.floor(i / 5) * 50, 0.7));

const actors: Actor[] = [
  label("price10", "Chai ₹10", 180, 100, 20, "#FFB81F"),
  label("price15", "Chai ₹15", 180, 100, 20, "#fde0dc"),
  { id: "note", kind: "note", x: 60, y: 140, scale: 2, opacity: 0 },
  ...cups("a", 10),
  label("l10cups", "₹100 = 10 chai", 240, 140, 14),
  label("l6cups", "₹100 = 6 chai", 240, 140, 14, "#fde0dc"),
  box("bPower", "Same ₹100,|less buying power", 180, 330, { w: 210, h: 62, size: 15, fill: "#FFB81F" }),
  icon("basket", "basket", 180, 200, 2.4),
  ...["thali", "bus", "building", "medical"].map((n, i): Actor => icon(`bk${i}`, n, 70 + i * 73, 300, 0.9)),
  label("lOwn", "your own costs (rent, fees) can rise faster", 180, 330, 11, "#fde0dc"),
  box("bCpi", "CPI tracks the prices|of everyday things", 180, 110, { w: 230, h: 62, size: 14 }),
  icon("thali", "thali", 100, 200, 2),
  counter("cThali", 250, 200, 500, 34, "#C2410C"),
  label("lYears", "6% a year, 10 years", 250, 250, 13),
  box("fd7", "FD 7%", 90, 150, { w: 100, h: 48, size: 18, fill: "#dff0dc" }),
  box("inf5", "− inflation 5%", 210, 150, { w: 150, h: 48, size: 16, fill: "#fde0dc" }),
  box("real2", "= about 2% real", 180, 230, { w: 200, h: 52, size: 18, fill: "#FFB81F" }),
  icon("vault", "vault", 100, 190, 2),
  icon("plant", "plant", 260, 190, 2),
  label("lSave", "SAVE: safe, ready", 100, 250, 12, "#dff0dc"),
  label("lInvest", "INVEST: grows, wobbles", 260, 250, 12, "#FFB81F"),
  { id: "wobble", kind: "chart", x: 260, y: 320, props: { points: "0,80 40,60 80,70 120,40 160,48 200,15", color: "#5FA35A", w: 120, h: 50 }, opacity: 0 },
  person("tara", TARA, 290, "face:happy arms:down", 0.9),
  person("balan", BALAN, 72, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["chai", "Prices up, power down"],
    ["rupee", "Real = return − inflation"],
    ["plant", "Save soon, invest later"],
  ],
  ["tara", "balan", "vault", "plant", "lSave", "lInvest", "wobble"],
  "Prices rise. Grow money faster than them.",
);

const story: Story = {
  slug: "inflation-purchasing-power",
  backdrop: { place: "chaistall", accent: "#E9785B" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Chai at Balan's",
    concept: "Tara has had chai at Mr. Balan's stall since first year; the price keeps rising while her ₹100 stays the same.",
    cast: "Tara (student) and Mr. Balan (chai-stall owner)",
    relationship: "Regular customer and stall owner",
    setting: "Balan's chai stall outside college",
    facts: [
      "Inflation is prices rising; the same ₹100 buys less (its buying power falls)",
      "India's CPI tracks prices of a basket of everyday goods and services",
      "₹500 at 6% a year becomes about ₹895 in 10 years",
      "Real return ≈ return − inflation: 7% FD − 5% = about 2%",
      "Saving keeps money safe and ready; investing aims to grow it over years, with ups and downs",
    ],
    coverage: [
      {
        q: "A ₹100 note buys less today than it did five years ago. What has fallen?",
        scene: 2,
        how: "₹100 used to buy 10 chai, now 6 (₹10 → ₹15); box 'Same ₹100, less buying power'.",
      },
      {
        q: "What's the key difference between saving and investing?",
        scene: 6,
        how: "A vault 'SAVE: safe, ready' next to a plant 'INVEST: grows, wobbles' with a wobbly rising chart.",
      },
      {
        q: "Your FD pays 7% a year and inflation is 5%. Roughly what's your real return, before tax?",
        scene: 5,
        how: "Boxes 'FD 7%' '− inflation 5%' '= about 2% real'.",
      },
      {
        q: "What does India's Consumer Price Index (CPI) track?",
        scene: 3,
        how: "A basket fills with food, transport, rent and medicine icons; box 'CPI tracks the prices of everyday things'.",
      },
      {
        q: "A thali costs ₹500 today. If prices rise 6% every year, about how much will it cost in 10 years?",
        scene: 4,
        how: "Thali price counter climbs ₹500 → ₹895; label '6% a year, 10 years'.",
      },
    ],
  },
  scenes: [
    {
      caption: "First year: chai at Balan's stall cost ₹10.",
      steps: [pop("price10", 0.06, 1), pose("balan", 0.2, "face:happy arms:give"), pose("tara", 0.3, "face:happy arms:down")],
    },
    {
      caption: "Final year: chai is ₹15. Your ₹100 buys less.",
      steps: [
        ...hideAll(["price10"], 0),
        pop("price15", 0.04, 1),
        show("note", 0.08),
        ...Array.from({ length: 10 }, (_, i) => pop(`a${i}`, 0.12 + i * 0.02, 0.7)),
        show("l10cups", 0.16),
        ...[6, 7, 8, 9].map((i) => move(`a${i}`, 0.45 + (i - 6) * 0.04, { opacity: 0, y: 340 }, 0.1)),
        move("l10cups", 0.45, { opacity: 0 }, 0.05),
        show("l6cups", 0.5),
        pop("bPower", 0.66),
        pose("tara", 0.5, "face:shocked arms:down"),
      ],
    },
    {
      caption: "CPI tracks prices of an everyday basket.",
      steps: [
        ...hideAll(["price15", "note", "l6cups", "bPower", ...Array.from({ length: 10 }, (_, i) => `a${i}`)], 0),
        pop("bCpi", 0.06),
        show("lOwn", 0.72),
        pop("basket", 0.14, 2.4),
        ...[0, 1, 2, 3].map((i) => pop(`bk${i}`, 0.24 + i * 0.06, 0.9)),
        ...[0, 1, 2, 3].map((i) => move(`bk${i}`, 0.5 + i * 0.04, { x: 180, y: 210, scale: 0.3, opacity: 0 }, 0.12)),
        pose("balan", 0.3, "face:neutral arms:point"),
      ],
    },
    {
      caption: "₹500 thali at 6% a year: ~₹895 in 10 years.",
      steps: [
        ...hideAll(["bCpi", "basket", "lOwn"], 0),
        pop("thali", 0.06, 2),
        show("cThali", 0.1),
        show("lYears", 0.12),
        count("cThali", 0.16, 0.5, 500, 895),
        pose("tara", 0.6, "face:worried arms:down"),
      ],
    },
    {
      caption: "7% FD minus 5% inflation: about 2% real return.",
      steps: [
        ...hideAll(["thali", "cThali", "lYears"], 0),
        pop("fd7", 0.06),
        pop("inf5", 0.2),
        pop("real2", 0.4),
        pose("tara", 0.5, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "Save for soon. Invest for years: grows, but wobbles.",
      steps: [
        ...hideAll(["fd7", "inf5", "real2"], 0),
        pop("vault", 0.06, 2),
        show("lSave", 0.1),
        pop("plant", 0.2, 2),
        show("lInvest", 0.24),
        show("wobble", 0.3),
        { at: 0.32, dur: 0.4, actor: "wobble", fill: [0, 1] },
        pose("tara", 0.5, "face:happy arms:thumb"),
        pose("balan", 0.5, "face:proud arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
