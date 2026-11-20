import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, count, counter, fill, fly, hidden, hide, hideAll, icon, label, move, person, pop, pose, recap, shake, show } from "./kit";

// WHY YOU KEEP SPENDING LIKE THIS · "Exam week crash". Hostel roommates
// Meera and Tanvi; both laptops die before exams. Metaphor: an emergency-fund
// jar that catches surprises (and lets a sale bounce off).
// Numbers: 3–6 months of expenses; ₹2,999 watch; ₹30,000 phone on 6-month
// "no-cost" EMI = ₹5,000 × 6 + ₹199 fee = ₹30,199; pay ₹25,000 → ₹35,000.

const MEERA: Look = { skin: "#A86B45", hair: "ponytail", hairColor: "#1f1410", top: "#2f8a7d", topStyle: "kurta", accent: "#FFB81F", bottom: "#24304a" };
const TANVI: Look = {
  skin: "#E0AC82",
  hair: "curly",
  hairColor: "#4a2e1c",
  top: "#E0458C",
  topStyle: "hoodie",
  accent: "#ffd6e6",
  bottom: "#3b3b52",
  glasses: true,
};

const actors: Actor[] = [
  icon("lapM", "brokenlaptop", 110, 300, 1.1),
  icon("lapT", "brokenlaptop", 250, 300, 1.1),
  icon("lapFixed", "laptop", 110, 300, 1.1),
  { id: "fund", kind: "jar", x: 110, y: 170, scale: 0.8, props: { label: "Emergency", color: "#5FA35A", fill: 0.85 }, ...hidden },
  ...[0, 1].map((i): Actor => ({ id: `fc${i}`, kind: "coin", x: 110, y: 200, ...hidden })),
  icon("iMed", "medical", 200, 120, 0.8),
  icon("iRepair", "laptop", 245, 150, 0.8),
  icon("iSale", "sale", 290, 120, 0.8),
  icon("xSale", "cross", 306, 104, 0.8),
  label("lFor", "For surprises", 110, 92, 14),
  { id: "months", kind: "bar", x: 180, y: 200, props: { w: 260, h: 30, color: "#5FA35A", fill: 0 }, ...hidden },
  ...[1, 2, 3, 4, 5, 6].map((m): Actor => label(`m${m}`, `${m}`, 50 + m * 43 - 21, 240, 12, "#fff")),
  box("b36", "3–6 months|of expenses", 180, 110, { w: 190, h: 62, size: 16, fill: "#FFB81F" }),
  { id: "watchPhone", kind: "screen", x: 180, y: 190, scale: 0.85, props: { title: "FLASH DEAL", text: "₹2,999|Smart watch", button: "BUY NOW" }, ...hidden },
  icon("clock24", "clock", 290, 120, 1.3),
  label("l24", "24 hours", 290, 162, 14),
  box("bWant", "NEED IT!!", 90, 110, { w: 120, h: 46, size: 16, fill: "#fde0dc" }),
  {
    id: "emiPhone",
    kind: "screen",
    x: 95,
    y: 205,
    scale: 0.8,
    props: { title: "NO-COST EMI", text: "₹30,000 phone|6 months", button: "BUY", buttonColor: "#2f8a7d" },
    ...hidden,
  },
  box("e1", "₹5,000 × 6", 262, 120, { w: 150, h: 44, size: 17 }),
  box("e2", "+ ₹199 fee", 262, 176, { w: 150, h: 44, size: 17, fill: "#fde0dc" }),
  box("e3", "= ₹30,199", 262, 232, { w: 150, h: 44, size: 18, fill: "#FFB81F" }),
  label("lFit", "₹5,000/month fits?", 262, 280, 13),
  { id: "barPay", kind: "bar", x: 180, y: 140, props: { w: 250, h: 26, color: "#7cc3e8", fill: 0.62 }, ...hidden },
  { id: "barSave", kind: "bar", x: 180, y: 220, props: { w: 250, h: 26, color: "#5FA35A", fill: 0.15 }, ...hidden },
  label("lPay", "Pay", 40, 140, 13),
  label("lSave", "Savings", 40, 220, 12),
  counter("cPay", 280, 104, 25000, 22),
  icon("upgrade", "watch", 120, 290, 0.9),
  icon("xUp", "cross", 140, 274, 0.8),
  person("meera", MEERA, 72, "face:neutral arms:down", 0.9),
  person("tanvi", TANVI, 290, "face:neutral arms:down", 0.9),
];

const end = recap(
  [
    ["shield", "Fund for surprises"],
    ["clock", "Wait 24 hours"],
    ["rupee", "Raise savings with pay"],
  ],
  ["meera", "tanvi", "barPay", "barSave", "lPay", "lSave", "cPay", "upgrade", "xUp"],
  "Buffer up. Wait a day. Save raises.",
);

const story: Story = {
  slug: "saving-vs-spending",
  backdrop: { place: "hostel", accent: "#E0458C" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Exam week crash",
    concept: "Both roommates' laptops die before exams; only one has an emergency fund.",
    cast: "Meera and Tanvi (20, hostel roommates)",
    relationship: "Hostel roommates",
    setting: "Their hostel room, exam week",
    facts: [
      "An emergency fund is for surprises (repairs, medical bills), not sales",
      "Aim for 3–6 months of expenses",
      "The 24-hour rule beats impulse buys",
      "'No-cost' EMI: check fees and whether the monthly amount fits",
      "When pay rises, raise savings too (avoid lifestyle creep)",
    ],
    coverage: [
      {
        q: "Your laptop dies a week before exams. What's an emergency fund actually for?",
        scene: 2,
        how: "Meera's Emergency jar pays the laptop repair; repair and medical icons go in, a SALE tag bounces off with a cross.",
      },
      { q: "Over time, how big should an emergency fund ideally be?", scene: 3, how: "A six-month bar fills; gold box '3–6 months of expenses'." },
      {
        q: "Your salary rises from ₹25,000 to ₹35,000. What's a smart way to avoid lifestyle creep?",
        scene: 6,
        how: "Pay counter goes ₹25,000 → ₹35,000 and the Savings bar rises with it; the gadget upgrade gets a cross.",
      },
      {
        q: "You spotted a ₹2,999 smartwatch five minutes ago and you NEED it. What does waiting 24 hours help you avoid?",
        scene: 4,
        how: "Tanvi's '₹2,999 smart watch' flash deal; a 24-hour clock spins and the 'NEED IT!!' urge shrinks away.",
      },
      {
        q: 'A ₹30,000 phone is offered on 6-month "no-cost EMI" with a ₹199 processing fee. What should you check first?',
        scene: 5,
        how: "Boxes '₹5,000 × 6', '+ ₹199 fee', '= ₹30,199' and '₹5,000/month fits?'; caption: check the total and if ₹5,000 a month fits.",
      },
    ],
  },
  scenes: [
    {
      caption: "Exam week. Both laptops die.",
      steps: [
        pop("lapM", 0.06),
        pop("lapT", 0.12),
        shake("lapM", 0.3, 0.3, 12),
        shake("lapT", 0.34, 0.3, 12),
        pose("meera", 0.3, "face:shocked arms:down"),
        pose("tanvi", 0.3, "face:shocked arms:up"),
      ],
    },
    {
      caption: "Meera's emergency fund pays the repair. It's for surprises.",
      steps: [
        pop("fund", 0.05),
        show("lFor", 0.08),
        ...fly("fc0", 0.14, { x: 110, y: 300 }),
        ...fly("fc1", 0.24, { x: 110, y: 300 }),
        fill("fund", 0.14, 0.3, 0.85, 0.55),
        hide("lapM", 0.42),
        pop("lapFixed", 0.42),
        pose("meera", 0.44, "face:happy arms:thumb"),
        pose("tanvi", 0.44, "face:worried arms:down"),
        pop("iMed", 0.5, 0.8),
        move("iMed", 0.58, { x: 120, y: 180, opacity: 0 }, 0.14),
        pop("iRepair", 0.56, 0.8),
        move("iRepair", 0.64, { x: 110, y: 180, opacity: 0 }, 0.14),
        pop("iSale", 0.66, 0.8),
        move("iSale", 0.74, { x: 150, y: 150 }, 0.08),
        move("iSale", 0.82, { x: 320, y: 60, rotate: 40 }, 0.1),
        pop("xSale", 0.84, 0.8),
      ],
    },
    {
      caption: "Aim for 3–6 months of expenses.",
      steps: [
        ...hideAll(["fund", "lFor", "lapFixed", "lapT", "iSale", "xSale"], 0),
        pose("meera", 0.04, "face:happy arms:point"),
        pose("tanvi", 0.04, "face:thinking arms:chin"),
        show("months", 0.08),
        ...[1, 2, 3, 4, 5, 6].map((m) => show(`m${m}`, 0.08 + m * 0.02)),
        fill("months", 0.2, 0.5, 0, 1),
        pop("b36", 0.45),
      ],
    },
    {
      caption: "₹2,999 watch? Wait 24 hours. Impulse buys fade.",
      steps: [
        ...hideAll(["months", "b36", "m1", "m2", "m3", "m4", "m5", "m6"], 0),
        pose("tanvi", 0.04, "face:excited arms:phone"),
        pop("watchPhone", 0.06),
        pop("bWant", 0.16),
        pop("clock24", 0.3),
        show("l24", 0.32),
        { at: 0.34, dur: 0.4, actor: "clock24", to: { rotate: 720 }, ease: "power1.inOut" },
        move("bWant", 0.4, { scale: 0.2, opacity: 0 }, 0.3),
        pose("tanvi", 0.72, "face:proud arms:down"),
        pose("meera", 0.72, "face:happy arms:thumb"),
      ],
    },
    {
      caption: "Check the total (₹30,199) and if ₹5,000/month fits.",
      steps: [
        ...hideAll(["watchPhone", "clock24", "l24", "bWant"], 0),
        pose("meera", 0.04, "face:thinking arms:phone"),
        pose("tanvi", 0.04, "face:neutral arms:down"),
        pop("emiPhone", 0.06),
        pop("e1", 0.2),
        pop("e2", 0.34),
        pop("e3", 0.48),
        show("lFit", 0.62),
        pose("meera", 0.7, "face:happy arms:point"),
      ],
    },
    {
      caption: "Pay rises ₹25,000 → ₹35,000? Raise savings too.",
      steps: [
        ...hideAll(["emiPhone", "e1", "e2", "e3", "lFit"], 0),
        show("barPay", 0.04),
        show("barSave", 0.04),
        show("lPay", 0.04),
        show("lSave", 0.04),
        show("cPay", 0.06),
        count("cPay", 0.12, 0.4, 25000, 35000),
        fill("barPay", 0.12, 0.4, 0.62, 0.9),
        fill("barSave", 0.3, 0.4, 0.15, 0.4),
        pop("upgrade", 0.5, 0.9),
        pop("xUp", 0.62, 0.8),
        pose("meera", 0.4, "face:proud arms:thumb"),
        pose("tanvi", 0.4, "face:happy arms:down"),
      ],
    },
    end.scene,
  ],
};

export default story;
