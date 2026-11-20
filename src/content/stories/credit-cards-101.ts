import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, fill, hideAll, icon, label, move, person, pop, pose, recap, shake, show, stamp } from "./kit";

// CREDIT CARDS 101 · "The intern's first card". Zoya, an intern, gets her first
// credit card; Mr. Rao, her bank relationship manager, walks her through it.
// Metaphor: a bill that snowballs when only the minimum is paid.
// Facts: limit = max you can borrow; ~30-day billing cycle → one bill; full bill
// by due date = zero interest; minimum due avoids a late fee but the rest gets
// 3–4% a month; cash withdrawal = interest from day one + fee.

const ZOYA: Look = {
  skin: "#C68B5E",
  hair: "ponytail",
  hairColor: "#231712",
  top: "#fff",
  topStyle: "shirt",
  accent: "#7B4B94",
  bottom: "#24304a",
  badge: "#7B4B94",
};
const RAO: Look = {
  skin: "#8D5A3B",
  hair: "bald",
  hairColor: "#5b5b5b",
  top: "#24304a",
  topStyle: "blazer",
  beard: "moustache",
  glasses: true,
  old: true,
  bottom: "#24304a",
};

const days: Actor[] = Array.from({ length: 5 }, (_, i): Actor => icon(`spend${i}`, ["cafe", "bag", "ott", "bus", "mess"][i], 70 + i * 55, 210, 0.7));

const actors: Actor[] = [
  icon("card", "card", 180, 190, 3),
  label("lLimit", "Limit ₹1,00,000", 180, 250, 15, "#FFB81F"),
  box("bBorrow", "= the most you|can BORROW", 180, 110, { w: 190, h: 62, size: 15 }),
  label("lLoan", "Not your money", 180, 300, 14, "#fde0dc"),
  { id: "cycle", kind: "bar", x: 180, y: 150, props: { w: 270, h: 26, color: "#7B4B94", fill: 0 }, opacity: 0 },
  label("l30", "about 30 days", 180, 112, 13),
  ...days,
  box("bill", "1 BILL", 180, 290, { w: 120, h: 50, size: 20, fill: "#fff" }),
  box("bFull", "Full bill by due date", 180, 120, { w: 230, h: 48, size: 15, fill: "#dff0dc" }),
  counter("cZero", 180, 220, 0, 44, "#2f8a4a"),
  label("lInterest", "interest", 180, 262, 13),
  box("bMin", "Pay minimum only", 180, 110, { w: 200, h: 44, size: 15, fill: "#fde0dc" }),
  label("lNoFee", "No late fee, but...", 180, 158, 13),
  { id: "snow", kind: "coin", x: 180, y: 240, scale: 1.4, opacity: 0 },
  counter("cDebt", 180, 310, 11400, 28, "#C2410C"),
  label("lRate", "3–4% a month", 180, 348, 13, "#fde0dc"),
  icon("atm", "atm", 130, 200, 2),
  stamp("dayOne", "INTEREST DAY 1", 230, 140),
  label("lFee", "+ a cash fee", 230, 270, 14, "#fde0dc"),
  person("zoya", ZOYA, 72, "face:excited arms:down", 0.9),
  person("rao", RAO, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["card", "Limit isn't income"],
    ["check", "Pay in full: ₹0 interest"],
    ["atm", "No cash withdrawals"],
  ],
  ["zoya", "rao", "atm", "dayOne", "lFee"],
  "Borrowed, not yours. Pay in full.",
);

const story: Story = {
  slug: "credit-cards-101",
  backdrop: { place: "bankdesk", accent: "#7B4B94" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "The intern's first card",
    concept: "Zoya gets her first credit card; Mr. Rao shows how it works, and how the minimum-due trap grows.",
    cast: "Zoya (21, intern) and Mr. Rao (relationship manager)",
    relationship: "Intern and her bank relationship manager",
    setting: "The relationship manager's desk at the bank",
    facts: [
      "A credit limit is the most you can borrow, not your money",
      "A billing cycle is about 30 days of spends added into one bill",
      "Paying the full bill by the due date means zero interest",
      "Paying only the minimum avoids a late fee, but the rest is charged about 3–4% a month",
      "Cash withdrawals: interest from day one plus a fee",
    ],
    coverage: [
      {
        q: "Your first card comes with a ₹1,00,000 limit. What does that limit actually represent?",
        scene: 2,
        how: "The ₹1,00,000 limit gets a box '= the most you can BORROW' and a label 'Not your money'.",
      },
      {
        q: "If you pay your full credit card bill by the due date, how much interest do you pay?",
        scene: 4,
        how: "Box 'Full bill by due date'; the interest counter shows ₹0 in green.",
      },
      {
        q: "What happens if you pay only the minimum amount due?",
        scene: 5,
        how: "'Pay minimum only' → 'No late fee, but...' then the ₹11,400 balance snowballs at '3–4% a month'.",
      },
      {
        q: "Your card statement keeps mentioning a “billing cycle”. What is it?",
        scene: 3,
        how: "A bar fills over 'about 30 days' as spends drop in, then they all become '1 BILL'.",
      },
      { q: "Why is withdrawing cash from a credit card a bad idea?", scene: 6, how: "At an ATM: stamp 'INTEREST DAY 1' and label '+ a cash fee'." },
    ],
  },
  scenes: [
    {
      caption: "Zoya's first card: ₹1,00,000 limit. Is it her money?",
      steps: [pose("rao", 0.06, "face:happy arms:give"), pop("card", 0.1, 3), show("lLimit", 0.2), pose("zoya", 0.3, "face:excited arms:up")],
    },
    {
      caption: "Limit = the most you can borrow. Not your money.",
      steps: [
        pose("rao", 0.04, "face:neutral arms:point"),
        pop("bBorrow", 0.08),
        show("lLoan", 0.3),
        pose("zoya", 0.3, "face:thinking arms:chin"),
        shake("card", 0.5, 0.2, 6),
      ],
    },
    {
      caption: "Billing cycle: about 30 days of spends, one bill.",
      steps: [
        ...hideAll(["card", "lLimit", "bBorrow", "lLoan"], 0),
        show("cycle", 0.04),
        show("l30", 0.04),
        fill("cycle", 0.08, 0.5, 0, 1),
        ...days.map((d, i) => pop(d.id, 0.1 + i * 0.09, 0.7)),
        ...days.map((d) => move(d.id, 0.62, { x: 180, y: 290, scale: 0.3, opacity: 0 }, 0.14)),
        pop("bill", 0.72),
      ],
    },
    {
      caption: "Pay the full bill by the due date: zero interest.",
      steps: [
        ...hideAll(["cycle", "l30", "bill"], 0),
        pop("bFull", 0.06),
        show("cZero", 0.2),
        show("lInterest", 0.22),
        pose("zoya", 0.3, "face:proud arms:thumb"),
        pose("rao", 0.3, "face:happy arms:thumb"),
      ],
    },
    {
      caption: "Minimum only? No late fee, but heavy interest grows.",
      steps: [
        ...hideAll(["bFull", "cZero", "lInterest"], 0),
        pop("bMin", 0.04),
        show("lNoFee", 0.14),
        show("snow", 0.2),
        show("cDebt", 0.2),
        show("lRate", 0.24),
        move("snow", 0.26, { scale: 3.4 }, 0.5),
        count("cDebt", 0.26, 0.5, 11400, 11800),
        pose("zoya", 0.5, "face:shocked arms:down"),
        pose("rao", 0.5, "face:worried arms:point"),
      ],
    },
    {
      caption: "Cash from a card: interest from day one, plus fees.",
      steps: [
        ...hideAll(["bMin", "lNoFee", "snow", "cDebt", "lRate"], 0),
        pop("atm", 0.06, 2),
        pop("dayOne", 0.3, 1),
        show("lFee", 0.45),
        pose("zoya", 0.4, "face:worried arms:down"),
      ],
    },
    end.scene,
  ],
};

export default story;
