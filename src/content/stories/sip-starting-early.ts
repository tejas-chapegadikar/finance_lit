import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, hideAll, icon, label, person, pop, pose, recap, show } from "./kit";

// SIPs AND STARTING EARLY · "Gym buddies". Aisha (21) and Rohan (31) train at
// the same gym. Metaphor: a SIP is like showing up to the gym every month.
// Numbers (lesson + quiz): ₹3,000 a month to 60 at an assumed 10% → Aisha
// (from 21) about ₹1.7 crore, Rohan (from 31) about ₹62 lakh. A 15% fall with a
// 10-year goal: keep going.

const AISHA: Look = { skin: "#B97A50", hair: "ponytail", hairColor: "#231712", top: "#E0458C", topStyle: "tee", bottom: "#2b2b38", bottomStyle: "shorts" };
const ROHAN: Look = {
  skin: "#D9A27A",
  hair: "short",
  hairColor: "#16110e",
  top: "#3f8a7a",
  topStyle: "tee",
  beard: "full",
  bottom: "#24304a",
  bottomStyle: "shorts",
};

const coins: Actor[] = Array.from({ length: 6 }, (_, i): Actor => ({ id: `mc${i}`, kind: "coin", x: 70 + i * 44, y: 120, scale: 1.2, opacity: 0 }));
const units = (prefix: string, n: number, y: number): Actor[] =>
  Array.from({ length: n }, (_, i): Actor => icon(`${prefix}${i}`, "plant", 90 + i * 34, y, 0.5));

const actors: Actor[] = [
  icon("dumb", "dumbbell", 180, 190, 2),
  box("bSip", "SIP = fixed ₹3,000|into a mutual fund|every month", 180, 210, { w: 230, h: 84, size: 14, fill: "#dff0dc" }),
  ...coins,
  { id: "dip", kind: "chart", x: 180, y: 140, props: { points: "0,30 50,40 100,85 150,70 200,40", color: "#E0453B", w: 200, h: 80 }, opacity: 0 },
  label("lHigh", "price high: 3 units", 110, 220, 12),
  ...units("u", 3, 250),
  label("lLow", "price low: 5 units", 110, 290, 12),
  ...units("v", 5, 320),
  { id: "recover", kind: "chart", x: 180, y: 150, props: { points: "0,40 50,75 100,60 150,30 200,10", color: "#5FA35A", w: 200, h: 90 }, opacity: 0 },
  label("l15", "−15% in year 2", 120, 230, 13, "#fde0dc"),
  box("bKeep", "Goal 10 years away:|keep going", 180, 290, { w: 210, h: 62, size: 14, fill: "#FFB81F" }),
  counter("cAisha", 100, 200, 0, 22, "#2f5d46"),
  counter("cRohan", 260, 200, 0, 22, "#C2410C"),
  label("lA", "Aisha, from 21", 100, 150, 12),
  label("lR", "Rohan, from 31", 260, 150, 12),
  { id: "barA", kind: "bar", x: 100, y: 250, props: { w: 130, h: 20, color: "#5FA35A", fill: 0 }, opacity: 0 },
  { id: "barR", kind: "bar", x: 260, y: 250, props: { w: 130, h: 20, color: "#E9785B", fill: 0 }, opacity: 0 },
  label("l10", "10 extra years to compound", 180, 300, 13, "#FFB81F"),
  icon("shield", "shield", 120, 200, 1.8),
  icon("hosp", "hospital", 240, 200, 1.8),
  label("lEf", "Emergency fund", 120, 250, 12),
  label("lHi", "Health insurance", 240, 250, 12),
  box("bFirst", "THEN start the SIP", 180, 120, { w: 200, h: 44, size: 15 }),
  person("aisha", AISHA, 72, "face:happy arms:down", 0.9),
  person("rohan", ROHAN, 290, "face:neutral arms:down", 0.9),
];

const end = recap(
  [
    ["clock", "Same amount, every month"],
    ["plant", "Dips buy more units"],
    ["shield", "Buffer first, then SIP"],
  ],
  ["aisha", "rohan", "shield", "hosp", "lEf", "lHi", "bFirst"],
  "Show up monthly. Start early. Don't quit.",
);

const story: Story = {
  slug: "sip-starting-early",
  backdrop: { place: "gym", accent: "#E0458C" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Gym buddies",
    concept: "Two gym buddies, ten years apart, start the same ₹3,000 SIP: showing up every month is the whole trick.",
    cast: "Aisha (21) and Rohan (31)",
    relationship: "Gym buddies",
    setting: "The neighbourhood gym",
    facts: [
      "A SIP invests a fixed amount in a mutual fund regularly",
      "When prices fall, the same amount buys more units",
      "In a dip, with a goal years away, keep the SIP going",
      "₹3,000 a month from 21 vs from 31 (10% assumed): about ₹1.7 crore vs about ₹62 lakh, because of 10 more years of compounding",
      "Emergency fund and health insurance come first",
    ],
    coverage: [
      {
        q: "Everyone on finance Instagram says “start a SIP”. What is a SIP?",
        scene: 2,
        how: "Box 'SIP = fixed ₹3,000 into a mutual fund every month' as a coin drops in for each month.",
      },
      {
        q: "With a fixed monthly SIP, what happens when market prices fall?",
        scene: 3,
        how: "Price high: 3 units; price falls on the chart: 5 units for the same money.",
      },
      {
        q: "Aisha starts a ₹3,000 monthly SIP at 21. Rohan starts the same SIP at 31. Assuming the same returns, why does Aisha end up with much more at 60?",
        scene: 5,
        how: "Counters: Aisha ₹1.7 crore vs Rohan ₹62 lakh; label '10 extra years to compound'.",
      },
      { q: "What should usually come before starting a SIP?", scene: 6, how: "Emergency fund and health insurance shields pop up; box 'THEN start the SIP'." },
      {
        q: "Your SIP's value drops 15% in its second year because the market fell. Your goal is 10 years away. What does this lesson suggest?",
        scene: 4,
        how: "Chart dips '−15% in year 2' then recovers; Rohan wants to stop, Aisha keeps going; box 'Goal 10 years away: keep going'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Gym buddies Aisha, 21, and Rohan, 31, talk money.",
      steps: [pop("dumb", 0.06, 2), pose("aisha", 0.2, "face:happy arms:wave"), pose("rohan", 0.4, "face:happy arms:thumb")],
    },
    {
      caption: "SIP: a fixed amount into a mutual fund, monthly.",
      steps: [...hideAll(["dumb"], 0), pop("bSip", 0.06), ...coins.map((c, i) => pop(c.id, 0.18 + i * 0.08, 1.2)), pose("aisha", 0.3, "face:proud arms:point")],
    },
    {
      caption: "Prices fall? Your same ₹3,000 buys more units.",
      steps: [
        ...hideAll(["bSip", ...coins.map((c) => c.id)], 0),
        show("dip", 0.04),
        { at: 0.06, dur: 0.4, actor: "dip", fill: [0, 1] },
        show("lHigh", 0.1),
        ...[0, 1, 2].map((i) => pop(`u${i}`, 0.12 + i * 0.04, 0.5)),
        show("lLow", 0.42),
        ...[0, 1, 2, 3, 4].map((i) => pop(`v${i}`, 0.46 + i * 0.05, 0.5)),
        pose("rohan", 0.5, "face:shocked arms:down"),
      ],
    },
    {
      caption: "Down 15%, goal 10 years away? Keep the SIP going.",
      steps: [
        ...hideAll(["dip", "lHigh", "lLow", "u0", "u1", "u2", "v0", "v1", "v2", "v3", "v4"], 0),
        show("recover", 0.04),
        { at: 0.06, dur: 0.5, actor: "recover", fill: [0, 1] },
        show("l15", 0.1),
        pose("rohan", 0.14, "face:worried arms:down"),
        pose("aisha", 0.3, "face:happy arms:thumb"),
        pop("bKeep", 0.5),
        pose("rohan", 0.7, "face:happy arms:down"),
      ],
    },
    {
      caption: "At 60: Aisha ~₹1.7 crore, Rohan ~₹62 lakh.",
      steps: [
        ...hideAll(["recover", "l15", "bKeep"], 0),
        show("lA", 0.04),
        show("lR", 0.04),
        show("barA", 0.06),
        show("barR", 0.06),
        { at: 0.1, dur: 0.5, actor: "barA", fill: [0, 1] },
        { at: 0.1, dur: 0.5, actor: "barR", fill: [0, 0.36] },
        show("cAisha", 0.08),
        show("cRohan", 0.08),
        count("cAisha", 0.1, 0.5, 0, 17000000),
        count("cRohan", 0.1, 0.5, 0, 6200000),
        show("l10", 0.6),
        pose("aisha", 0.6, "face:excited arms:up"),
        pose("rohan", 0.6, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "First: an emergency fund and health insurance.",
      steps: [
        ...hideAll(["lA", "lR", "barA", "barR", "cAisha", "cRohan", "l10"], 0),
        pop("shield", 0.08, 1.8),
        show("lEf", 0.12),
        pop("hosp", 0.22, 1.8),
        show("lHi", 0.26),
        pop("bFirst", 0.45),
        pose("rohan", 0.4, "face:happy arms:point"),
      ],
    },
    end.scene,
  ],
};

export default story;
