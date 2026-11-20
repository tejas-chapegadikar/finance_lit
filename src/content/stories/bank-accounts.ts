import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, fill, hideAll, icon, label, move, person, pop, pose, recap, shake, show, stamp } from "./kit";

// SAVINGS AND CURRENT ACCOUNTS · "Freshers' bank desk". Aditya opens his first
// account with Mrs. Fernandes, the bank officer at the freshers' desk.
// Metaphor: a balance bar that must stay above a minimum line.
// Facts: savings for individuals, current for businesses/freelancers; nominee;
// average monthly balance (₹6,000 × 10 days + ₹0 × 20 days ÷ 30 = ₹2,000, below a
// ₹5,000 minimum); savings interest (~2.5–3%) can trail rising prices; DICGC ₹5 lakh.

const ADITYA: Look = { skin: "#A86B45", hair: "short", hairColor: "#16110e", top: "#7cc3e8", topStyle: "shirt", accent: "#2f5d46", bottom: "#2b2b38" };
const FERNANDES: Look = {
  skin: "#D9A27A",
  hair: "wavy",
  hairColor: "#3b302b",
  top: "#2f5d46",
  topStyle: "blazer",
  glasses: true,
  badge: "#FFB81F",
  bottom: "#2f5d46",
  bottomStyle: "skirt",
};

const actors: Actor[] = [
  box("aSav", "SAVINGS|for you", 105, 150, { w: 140, h: 70, size: 16, fill: "#dff0dc" }),
  box("aCur", "CURRENT|businesses,|freelancers", 255, 150, { w: 140, h: 84, size: 14, fill: "#fff" }),
  icon("okSav", "check", 160, 112, 0.9),
  box("form", "Nominee:|Dad", 180, 150, { w: 170, h: 74, size: 18 }),
  icon("money", "rupee", 90, 250, 1.2),
  { id: "arrowNom", kind: "arrow", x: 180, y: 250, props: { length: 90, color: "#2f5d46" }, opacity: 0 },
  icon("heir", "idcard", 270, 250, 1.2),
  label("lNom", "gets your money if something happens", 180, 300, 11),
  { id: "bal", kind: "bar", x: 180, y: 200, props: { w: 260, h: 30, color: "#7cc3e8", fill: 0 }, opacity: 0 },
  label("lMin", "Minimum ₹5,000", 250, 160, 12, "#FFB81F"),
  label("lZero", "Fix: a zero-balance account", 180, 350, 12, "#dff0dc"),
  box("avg", "₹6,000 × 10 days|+ ₹0 × 20 days|÷ 30 = ₹2,000", 180, 290, { w: 210, h: 84, size: 15 }),
  stamp("fee", "FEE!", 290, 236),
  icon("coinRace", "rupee", 60, 200, 1),
  icon("priceRace", "sale", 60, 280, 1),
  label("l3", "Savings ~3%", 60, 160, 13),
  label("lPrices", "Prices", 60, 320, 13),
  box("bShrink", "Value slowly shrinks", 180, 100, { w: 210, h: 46, size: 15, fill: "#fde0dc" }),
  icon("bank", "building", 180, 230, 2.2),
  icon("shield", "shield", 180, 190, 3, { opacity: 0, scale: 0.5 }),
  counter("c5", 180, 310, 0, 32, "#2f5d46"),
  label("lPer", "per person, per bank", 180, 345, 12),
  person("aditya", ADITYA, 72, "face:happy arms:down", 0.9),
  person("fern", FERNANDES, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["vault", "Savings, not current"],
    ["idcard", "Add a nominee"],
    ["shield", "₹5 lakh insured"],
  ],
  ["aditya", "fern", "bank", "shield", "c5", "lPer"],
  "Right account. Nominee. ₹5 lakh cover.",
);

const story: Story = {
  slug: "bank-accounts",
  backdrop: { place: "orientation", accent: "#FFB81F" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Freshers' bank desk",
    concept: "Aditya opens his first account at the freshers' desk; Mrs. Fernandes explains each line of the form.",
    cast: "Aditya (18, fresher) and Mrs. Fernandes (bank officer)",
    relationship: "Student and bank officer",
    setting: "The freshers' bank desk at orientation",
    facts: [
      "Savings accounts are for individuals; current accounts for businesses and freelancers with many transactions",
      "A nominee receives your money if something happens to you",
      "Average monthly balance averages every day: ₹6,000 × 10 days + ₹0 × 20 days = ₹2,000",
      "Savings interest (about 2.5–3%) is often below price rises",
      "DICGC insures deposits up to ₹5 lakh per person, per bank",
    ],
    coverage: [
      {
        q: "Your account-opening form asks for a “nominee”. Who is that?",
        scene: 3,
        how: "The form says 'Nominee: Dad'; an arrow carries the money to him; label 'gets your money if something happens'.",
      },
      {
        q: "A friend says you should open a current account for your pocket money. Who are current accounts actually designed for?",
        scene: 2,
        how: "Two boxes: SAVINGS for you (ticked) vs CURRENT for businesses and freelancers.",
      },
      {
        q: "How much of your deposits in one bank are insured by DICGC?",
        scene: 6,
        how: "A shield covers the bank; counter rises to ₹5,00,000 'per person, per bank'.",
      },
      {
        q: "Why can keeping all your money in a savings account for many years be a problem?",
        scene: 5,
        how: "A race: the ~3% savings coin falls behind the rising price tag; box 'Value slowly shrinks'.",
      },
      {
        q: "Your account needs a ₹5,000 average monthly balance. In a 30-day month, you keep ₹6,000 for 10 days and ₹0 for the other 20. What's your average monthly balance?",
        scene: 4,
        how: "The balance bar sits above the ₹5,000 line for 10 days, then empties; box '₹6,000 × 10 days + ₹0 × 20 days ÷ 30 = ₹2,000'; stamp FEE!",
      },
    ],
  },
  scenes: [
    {
      caption: "Freshers' week. Aditya opens his first bank account.",
      steps: [pose("fern", 0.1, "face:happy arms:wave"), pose("aditya", 0.3, "face:excited arms:down")],
    },
    {
      caption: "Savings account for you. Current: businesses, many payments.",
      steps: [
        pose("fern", 0.04, "face:neutral arms:point"),
        pop("aSav", 0.08),
        pop("aCur", 0.2),
        pop("okSav", 0.45, 0.9),
        pose("aditya", 0.5, "face:happy arms:thumb"),
      ],
    },
    {
      caption: "Nominee: who gets your money if something happens.",
      steps: [
        ...hideAll(["aSav", "aCur", "okSav"], 0),
        pop("form", 0.06),
        pop("money", 0.2, 1.2),
        show("arrowNom", 0.3),
        pop("heir", 0.4, 1.2),
        move("money", 0.5, { x: 250 }, 0.2),
        show("lNom", 0.55),
        pose("aditya", 0.3, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "₹6,000 for 10 days, ₹0 for 20: average ₹2,000.",
      steps: [
        ...hideAll(["form", "money", "arrowNom", "heir", "lNom"], 0),
        show("bal", 0.04),
        show("lMin", 0.06),
        fill("bal", 0.08, 0.2, 0, 0.6),
        fill("bal", 0.34, 0.16, 0.6, 0.0001),
        pop("avg", 0.5),
        pop("fee", 0.7, 1),
        show("lZero", 0.82),
        pose("aditya", 0.7, "face:shocked arms:down"),
        pose("fern", 0.5, "face:neutral arms:point"),
      ],
    },
    {
      caption: "Savings earn ~3%. Prices rise faster. Value shrinks.",
      steps: [
        ...hideAll(["bal", "lMin", "avg", "fee", "lZero"], 0),
        show("coinRace", 0.04),
        show("priceRace", 0.04),
        show("l3", 0.04),
        show("lPrices", 0.04),
        move("coinRace", 0.1, { x: 200 }, 0.6, "none"),
        move("priceRace", 0.1, { x: 300 }, 0.6, "none"),
        move("l3", 0.1, { x: 200 }, 0.6, "none"),
        move("lPrices", 0.1, { x: 300 }, 0.6, "none"),
        pop("bShrink", 0.6),
        pose("aditya", 0.5, "face:worried arms:down"),
      ],
    },
    {
      caption: "DICGC insures up to ₹5 lakh per bank.",
      steps: [
        ...hideAll(["coinRace", "priceRace", "l3", "lPrices", "bShrink"], 0),
        pop("bank", 0.06, 2.2),
        { at: 0.2, dur: 0.16, actor: "shield", to: { opacity: 0.9, scale: 3.4 }, ease: "back.out(2)" },
        show("c5", 0.3),
        count("c5", 0.32, 0.4, 0, 500000),
        show("lPer", 0.5),
        shake("bank", 0.7, 0.2, 4),
        pose("aditya", 0.6, "face:proud arms:thumb"),
        pose("fern", 0.6, "face:happy arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
