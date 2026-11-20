import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, fill, hideAll, icon, label, move, person, pop, pose, recap, show, stamp } from "./kit";

// CIBIL SCORE · "Two siblings, one bike". Harpreet and her brother Gurdeep apply
// for the same bike loan. Metaphor: a score dial whose needle moves with
// every choice. Needle angle: (score − 300) / 600 × 180 − 90.
// Facts: 300–900; paying on time matters most; keep balance under 30% (₹30,000
// of ₹1,00,000); checking your own score is a soft enquiry; no history = no score.

const HARPREET: Look = { skin: "#E0AC82", hair: "long", hairColor: "#231712", top: "#C2410C", topStyle: "kurta", accent: "#FFB81F", bottom: "#2b2b38" };
const GURDEEP: Look = {
  skin: "#D9A27A",
  hair: "short",
  hairColor: "#16110e",
  top: "#2b3a55",
  topStyle: "jersey",
  accent: "#FFB81F",
  beard: "full",
  bottom: "#3a3a3a",
};
const angle = (score: number) => ((score - 300) / 600) * 180 - 90;

const actors: Actor[] = [
  icon("bike", "bike", 180, 210, 2.6),
  stamp("okH", "APPROVED", 110, 120, "#2f8a4a"),
  stamp("costlyG", "HIGHER RATE", 250, 150),
  { id: "gauge", kind: "gauge", x: 180, y: 250, scale: 1.1, opacity: 0 },
  { id: "needle", kind: "needle", x: 180, y: 250, scale: 1.1, rotate: -90, opacity: 0 },
  label("lRange", "300 to 900", 180, 290, 15, "#FFB81F"),
  icon("tick1", "check", 70, 110, 0.8),
  icon("tick2", "check", 110, 110, 0.8),
  icon("miss1", "cross", 250, 110, 0.8),
  icon("miss2", "cross", 290, 110, 0.8),
  label("lOnTime", "Paid on time", 90, 150, 12),
  label("lLate", "Missed dates", 270, 150, 12),
  { id: "util", kind: "bar", x: 180, y: 180, props: { w: 270, h: 30, color: "#5FA35A", fill: 0 }, opacity: 0 },
  label("lLimit", "Limit ₹1,00,000", 180, 140, 13),
  { id: "line30", kind: "box", x: 101, y: 222, props: { text: "30% = ₹30,000", w: 130, h: 34, size: 13, fill: "#FFB81F" }, opacity: 0 },
  { id: "checkPhone", kind: "screen", x: 280, y: 180, scale: 0.7, props: { title: "MY CREDIT SCORE", text: "780|Checked by you", tone: "#fff" }, opacity: 0 },
  box("bSoft", "Soft check:|no drop", 90, 150, { w: 140, h: 60, size: 14, fill: "#dff0dc" }),
  box("bNone", "No loans yet =|no score yet", 180, 130, { w: 180, h: 62, size: 15 }),
  label("lNotBad", "Not a bad score", 180, 290, 14, "#dff0dc"),
  person("harpreet", HARPREET, 72, "face:happy arms:down", 0.9),
  person("gurdeep", GURDEEP, 290, "face:neutral arms:down", 0.9),
];

const end = recap(
  [
    ["check", "Pay on time"],
    ["card", "Use under 30%"],
    ["shield", "Checking yours is safe"],
  ],
  ["harpreet", "gurdeep", "gauge", "needle", "bNone", "lNotBad"],
  "On time. Under 30%. Check freely.",
);

const story: Story = {
  slug: "cibil-score",
  backdrop: { place: "showroom", accent: "#C2410C" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Two siblings, one bike",
    concept: "A sister and brother apply for the same bike loan; their credit scores decide who gets the better deal.",
    cast: "Harpreet (24) and her brother Gurdeep (22)",
    relationship: "Sister and brother",
    setting: "A bike showroom",
    facts: [
      "A credit score runs from 300 to 900; banks check it before lending",
      "Paying EMIs and bills on time is the biggest factor",
      "Keep card balances under 30% of the limit: ₹30,000 on ₹1,00,000",
      "Checking your own score is a soft enquiry and doesn't lower it",
      "No credit history means no score yet, not a bad score",
    ],
    coverage: [
      {
        q: "A friend brags about a CIBIL score of 1,200. What's the actual range of a CIBIL score?",
        scene: 2,
        how: "A dial sweeps from 300 to 900; label '300 to 900'.",
      },
      {
        q: "Which of these matters most for your credit score?",
        scene: 3,
        how: "Harpreet's on-time ticks push the needle up; Gurdeep's missed dates (crosses) pull it down.",
      },
      {
        q: "Your card limit is ₹1,00,000. To keep utilisation healthy, your balance should usually stay under:",
        scene: 4,
        how: "A ₹1,00,000 limit bar turns red at 80%, then drops to the gold '30% = ₹30,000' mark.",
      },
      {
        q: "Does checking your own credit score lower it?",
        scene: 5,
        how: "Harpreet checks her own score on her phone; the needle doesn't move; box 'Soft check: no drop'.",
      },
      {
        q: "You've never had a loan or a credit card. What does your credit report most likely show?",
        scene: 6,
        how: "The dial goes blank; box 'No loans yet = no score yet'; label 'Not a bad score'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Same bike, same loan. Different deals for two siblings.",
      steps: [
        pop("bike", 0.06, 2.6),
        pop("okH", 0.3, 1),
        pop("costlyG", 0.42, 1),
        pose("harpreet", 0.36, "face:happy arms:thumb"),
        pose("gurdeep", 0.48, "face:confused arms:down"),
      ],
    },
    {
      caption: "Credit score: 300 to 900. Banks check it first.",
      steps: [
        ...hideAll(["bike", "okH", "costlyG"], 0),
        show("gauge", 0.06),
        show("needle", 0.06),
        move("needle", 0.14, { rotate: 90 }, 0.3),
        move("needle", 0.46, { rotate: angle(600) }, 0.2),
        show("lRange", 0.3),
      ],
    },
    {
      caption: "Biggest factor: paying EMIs and bills on time.",
      steps: [
        move("lRange", 0, { opacity: 0 }, 0.05),
        pop("tick1", 0.08, 0.8),
        pop("tick2", 0.16, 0.8),
        show("lOnTime", 0.2),
        move("needle", 0.2, { rotate: angle(780) }, 0.2),
        pose("harpreet", 0.24, "face:proud arms:thumb"),
        pop("miss1", 0.5, 0.8),
        pop("miss2", 0.58, 0.8),
        show("lLate", 0.6),
        move("needle", 0.62, { rotate: angle(640) }, 0.2),
        pose("gurdeep", 0.62, "face:worried arms:down"),
      ],
    },
    {
      caption: "₹1,00,000 limit? Keep your balance under ₹30,000.",
      steps: [
        ...hideAll(["gauge", "needle", "tick1", "tick2", "miss1", "miss2", "lOnTime", "lLate"], 0),
        show("util", 0.04),
        show("lLimit", 0.04),
        fill("util", 0.1, 0.25, 0, 0.8),
        fill("util", 0.45, 0.2, 0.8, 0.3),
        show("line30", 0.55),
        pose("gurdeep", 0.6, "face:happy arms:point"),
      ],
    },
    {
      caption: "Checking your own score? A soft check. No drop.",
      steps: [
        ...hideAll(["util", "lLimit", "line30"], 0),
        show("gauge", 0.04),
        show("needle", 0.04),
        move("needle", 0.04, { rotate: angle(780) }, 0.1),
        move("gauge", 0.04, { x: 120, scale: 0.8 }, 0.1),
        move("needle", 0.04, { x: 120, scale: 0.8 }, 0.1),
        pose("harpreet", 0.12, "face:thinking arms:phone"),
        pop("checkPhone", 0.18, 0.7),
        pop("bSoft", 0.5),
        move("bSoft", 0.5, { x: 120, y: 120 }, 0.01),
      ],
    },
    {
      caption: "Never borrowed? No score yet. That's not bad.",
      steps: [
        ...hideAll(["checkPhone", "bSoft"], 0),
        move("gauge", 0.04, { x: 180, scale: 1.1 }, 0.12),
        move("needle", 0.04, { x: 180, scale: 1.1, opacity: 0 }, 0.12),
        pop("bNone", 0.2),
        show("lNotBad", 0.4),
        pose("gurdeep", 0.3, "face:thinking arms:chin"),
        pose("harpreet", 0.4, "face:happy arms:point"),
      ],
    },
    end.scene,
  ],
};

export default story;
