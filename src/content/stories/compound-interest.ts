import type { Actor, Step, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, hidden, hide, hideAll, icon, label, move, person, pop, pose, recap, shake, show } from "./kit";

// COMPOUND INTEREST · "The two money trees". Kamala Dadi and her grandson
// Kabir plant money in the garden. Metaphor: trees whose coins grow coins.
// Numbers: ₹10,000 at 10% simple = ₹1,000 a year → ₹3,000 in 3 years;
// Rule of 72 at 8% → 9 years; ₹50,000 once at 20 → ₹22.6 lakh, at 30 → ₹8.7 lakh;
// card debt compounds at 36–45% a year.

const DADI: Look = {
  skin: "#B97A50",
  hair: "bun",
  hairColor: "#c9c4be",
  top: "#7B4B94",
  topStyle: "saree",
  accent: "#FFB81F",
  glasses: true,
  bindi: true,
  old: true,
};
const KABIR: Look = { skin: "#C68B5E", hair: "curly", hairColor: "#2b1d16", top: "#3f8a7a", topStyle: "hoodie", accent: "#F5EFE3", bottom: "#2b3a55" };

const coins = (prefix: string, spots: [number, number][]): Actor[] =>
  spots.map(([x, y], i) => ({ id: `${prefix}${i}`, kind: "coin", x, y, scale: 0.2, ...hidden }));

const actors: Actor[] = [
  { id: "treeS", kind: "tree", x: 128, y: 318, scale: 0.15, props: { leaf: "#9cc98a" } },
  { id: "treeC", kind: "tree", x: 236, y: 318, scale: 0.15, props: { leaf: "#5FA35A" } },
  label("lS", "Simple", 128, 336, 13),
  label("lC", "Compound", 236, 336, 13),
  counter("cSeed", 180, 90, 0, 40),
  ...coins("s", [
    [103, 224],
    [129, 210],
    [155, 224],
  ]),
  ...coins("c", [
    [203, 224],
    [233, 202],
    [265, 224],
    [217, 250],
    [251, 250],
    [235, 228],
  ]),
  box("bSimple", "₹1,000 × 3 years|= ₹3,000", 95, 110, { w: 150, h: 62, size: 14 }),
  counter("cSimple", 95, 160, 0, 20),
  box("bCompound", "Interest earns|interest", 265, 110, { w: 150, h: 62, size: 14, fill: "#FFB81F" }),
  box("b72", "72 ÷ 8 = 9 years", 180, 110, { w: 200, h: 56, size: 20 }),
  icon("dbl1", "rupee", 150, 200, 1.1),
  icon("dbl2", "rupee", 210, 200, 1.1),
  box("b20", "Start at 20|₹22.6 lakh", 265, 100, { w: 140, h: 60, size: 14, fill: "#FFB81F" }),
  box("b30", "Start at 30|₹8.7 lakh", 95, 100, { w: 140, h: 60, size: 14 }),
  label("l50", "₹50,000 once, each", 180, 160, 13),
  icon("debtCard", "card", 180, 200, 1.6),
  ...[0, 1, 2].map((i): Actor => icon(`vine${i}`, "weed", 150 + i * 30, 230, 0.3, hidden, "none")),
  box("bDebt", "Card debt|36–45% a year", 180, 100, { w: 170, h: 60, size: 15, fill: "#fde0dc" }),
  person("dadi", DADI, 56, "face:happy arms:down", 0.84),
  person("kabir", KABIR, 306, "face:neutral arms:down", 0.86),
];

const end = recap(
  [
    ["plant", "Interest on interest"],
    ["clock", "72 ÷ rate = years"],
    ["check", "Start early, clear debt"],
  ],
  ["dadi", "kabir", "treeS", "treeC", "lS", "lC", "debtCard", "vine0", "vine1", "vine2", "bDebt", ...["s0", "s1", "s2", "c0", "c1", "c2", "c3", "c4", "c5"]],
  "Grow it. Know 72. Start early.",
);

const story: Story = {
  slug: "compound-interest",
  backdrop: { place: "garden", accent: "#5FA35A" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "The two money trees",
    concept: "Dadi plants two money trees with Kabir: one simple, one compound, and shows why time wins.",
    cast: "Kamala Dadi (70s) and her grandson Kabir (20)",
    relationship: "Grandmother and grandson",
    setting: "Dadi's backyard garden",
    facts: [
      "Simple interest is paid only on the original amount; compound interest is paid on interest too",
      "₹10,000 at 10% simple interest = ₹1,000 a year, ₹3,000 in 3 years",
      "Rule of 72: 72 ÷ rate ≈ years to double; at 8%, about 9 years",
      "₹50,000 once at 10%: started at 20 → about ₹22.6 lakh at 60; at 30 → about ₹8.7 lakh",
      "Unpaid credit-card debt compounds at 36–45% a year",
    ],
    coverage: [
      {
        q: "Your friend calls compound interest “interest on steroids”. What actually makes it different from simple interest?",
        scene: 3,
        how: "On the Compound tree, coins sprout new coins; box: 'Interest earns interest'.",
      },
      {
        q: "Using the Rule of 72, roughly how long does money take to double at 8% a year?",
        scene: 4,
        how: "Dadi's board: '72 ÷ 8 = 9 years'; one coin becomes two.",
      },
      {
        q: "Two people invest the same amount at the same rate. Who usually ends up with more?",
        scene: 5,
        how: "Same ₹50,000 once: the tree started at 20 towers (₹22.6 lakh) over the one started at 30 (₹8.7 lakh).",
      },
      {
        q: "₹10,000 earns 10% simple interest a year. How much interest does it earn in 3 years?",
        scene: 2,
        how: "The Simple tree drops one ₹1,000 coin a year; counter reaches ₹3,000; box '₹1,000 × 3 years = ₹3,000'.",
      },
      {
        q: "Why is unpaid credit card debt so dangerous?",
        scene: 6,
        how: "A thorny vine (card debt) grows fast around a credit card; box 'Card debt 36–45% a year'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Dadi plants ₹10,000. 'Watch it grow, Kabir.'",
      steps: [
        pose("dadi", 0.05, "face:happy arms:give"),
        show("cSeed", 0.06),
        count("cSeed", 0.1, 0.35, 0, 10000),
        move("treeS", 0.4, { scale: 0.45 }, 0.3, "back.out(1.6)"),
        move("treeC", 0.46, { scale: 0.45 }, 0.3, "back.out(1.6)"),
        pose("kabir", 0.5, "face:excited arms:up"),
        pose("dadi", 0.7, "face:happy arms:down"),
      ],
    },
    {
      caption: "Simple interest: 10% = ₹1,000 a year. 3 years: ₹3,000.",
      steps: [
        hide("cSeed", 0),
        pose("kabir", 0.04, "face:thinking arms:chin"),
        show("lS", 0.06),
        pop("bSimple", 0.1),
        show("cSimple", 0.14),
        ...[0, 1, 2].flatMap((i): Step[] => [pop(`s${i}`, 0.22 + i * 0.16, 1)]),
        count("cSimple", 0.22, 0.5, 0, 3000),
        move("treeS", 0.22, { scale: 0.62 }, 0.5),
      ],
    },
    {
      caption: "Compound: your interest earns interest too.",
      steps: [
        ...hideAll(["bSimple", "cSimple"], 0),
        show("lC", 0.06),
        pop("bCompound", 0.08),
        move("treeC", 0.12, { scale: 0.9 }, 0.6, "power1.in"),
        ...[0, 1, 2, 3, 4, 5].map((i): Step => pop(`c${i}`, 0.16 + i * 0.1)),
        pose("kabir", 0.3, "face:shocked arms:down"),
        pose("dadi", 0.4, "face:proud arms:point"),
      ],
    },
    {
      caption: "Rule of 72: at 8%, money doubles in 9 years.",
      steps: [
        hide("bCompound", 0),
        pose("dadi", 0.04, "face:happy arms:point"),
        pop("b72", 0.08),
        pop("dbl1", 0.3),
        pop("dbl2", 0.5),
        move("dbl1", 0.5, { x: 150 }, 0.1),
        pose("kabir", 0.6, "face:happy arms:down"),
      ],
    },
    {
      caption: "Same ₹50,000: start at 20, end far richer.",
      steps: [
        ...hideAll(["b72", "dbl1", "dbl2"], 0),
        show("l50", 0.04),
        pop("b30", 0.1),
        pop("b20", 0.22),
        move("treeS", 0.12, { scale: 0.55 }, 0.3),
        move("treeC", 0.22, { scale: 1.05 }, 0.4),
        move("lS", 0.06, { opacity: 0 }, 0.08),
        move("lC", 0.06, { opacity: 0 }, 0.08),
        pose("kabir", 0.4, "face:excited arms:up"),
        pose("dadi", 0.4, "face:proud arms:down"),
      ],
    },
    {
      caption: "Card debt compounds too: 36–45% a year.",
      steps: [
        ...hideAll(["b20", "b30", "l50"], 0),
        move("treeS", 0.04, { opacity: 0.25 }, 0.1),
        move("treeC", 0.04, { opacity: 0.25 }, 0.1),
        ...["s0", "s1", "s2", "c0", "c1", "c2", "c3", "c4", "c5"].map((c) => hide(c, 0.04)),
        pop("debtCard", 0.1),
        pop("bDebt", 0.14),
        ...[0, 1, 2].flatMap((i): Step[] => [show(`vine${i}`, 0.2 + i * 0.1, { scale: 1.6, y: 210 - i * 6 }, 0.3)]),
        shake("debtCard", 0.5, 0.3, 10),
        pose("kabir", 0.3, "face:worried arms:down"),
        pose("dadi", 0.3, "face:worried arms:point"),
      ],
    },
    end.scene,
  ],
};

export default story;
