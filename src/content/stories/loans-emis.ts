import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, fill, hideAll, icon, label, person, pop, pose, recap, shake, show, stamp } from "./kit";

// LOANS AND EMIs · "Canteen loan alert". Classmates Vikram and Neha in the
// college canteen: a loan-app ping, then a guarantor request.
// Metaphor: EMI bars split into interest (red) and principal (green).
// Facts: genuine lenders don't need contacts/photos (check RBI-regulated);
// EMI = interest + part of principal; early EMIs mostly interest; 10% flat ≈ 18%
// reducing, so 14% reducing costs less; a guarantor repays if the borrower doesn't.

const VIKRAM: Look = { skin: "#B5835A", hair: "curly", hairColor: "#16110e", top: "#5FA35A", topStyle: "tee", bottom: "#2b3a55" };
const NEHA: Look = {
  skin: "#C68B5E",
  hair: "long",
  hairColor: "#2b1d16",
  top: "#E0458C",
  topStyle: "kurta",
  accent: "#FFB81F",
  glasses: true,
  bottom: "#24304a",
};

const actors: Actor[] = [
  {
    id: "appScreen",
    kind: "screen",
    x: 180,
    y: 190,
    scale: 0.82,
    props: { title: "INSTANT LOAN", text: "Pre-approved|₹10,000|in 2 minutes!", button: "GET IT" },
    opacity: 0,
  },
  { id: "permScreen", kind: "screen", x: 110, y: 190, scale: 0.82, props: { title: "ALLOW ACCESS?", text: "Contacts|Photos", button: "ALLOW" }, opacity: 0 },
  icon("contacts", "contacts", 250, 150, 1.1),
  icon("gallery", "gallery", 300, 150, 1.1),
  stamp("redFlag", "RED FLAG", 270, 220),
  box("bRbi", "Check: RBI-regulated lender?", 260, 300, { w: 190, h: 44, size: 13, fill: "#FFB81F" }),
  { id: "emi", kind: "bar", x: 180, y: 180, props: { w: 270, h: 34, color: "#5FA35A", fill: 0 }, opacity: 0 },
  box("bEmi", "EMI = interest|+ part of principal", 180, 110, { w: 220, h: 62, size: 15 }),
  label("lInt", "interest", 80, 220, 12, "#fde0dc"),
  label("lPri", "principal", 260, 220, 12, "#dff0dc"),
  { id: "m1", kind: "bar", x: 200, y: 140, props: { w: 220, h: 26, color: "#E0453B", fill: 0 }, opacity: 0 },
  { id: "m12", kind: "bar", x: 200, y: 210, props: { w: 220, h: 26, color: "#E0453B", fill: 0 }, opacity: 0 },
  label("lM1", "Month 1", 50, 140, 12),
  label("lM12", "Month 12", 50, 210, 12),
  label("lMostly", "red = interest", 200, 260, 13, "#fde0dc"),
  box("lenderA", "Lender A|10% flat|≈ 18% reducing", 100, 170, { w: 140, h: 86, size: 14, fill: "#fde0dc" }),
  box("lenderB", "Lender B|14% reducing", 260, 170, { w: 140, h: 70, size: 14, fill: "#dff0dc" }),
  icon("winB", "check", 318, 126, 0.9),
  box("guar", "Guarantor form|₹80,000 bike loan", 180, 130, { w: 210, h: 62, size: 14 }),
  box("bRepay", "If Neha can't pay,|Vikram must", 180, 220, { w: 200, h: 62, size: 15, fill: "#FFB81F" }),
  label("lCredit", "and his credit score is hit", 180, 270, 12, "#fde0dc"),
  person("vikram", VIKRAM, 72, "face:neutral arms:phone", 0.9),
  person("neha", NEHA, 290, "face:happy arms:down", 0.9),
];

const extra: Actor[] = [
  box("kfs", "KEY FACT STATEMENT|APR: all-in yearly cost|EMI · instalments · fees", 180, 150, { w: 250, h: 88, size: 13, fill: "#fff" }),
  box("ad", "'Just ₹1,500 a month!'", 180, 260, { w: 210, h: 44, size: 14, fill: "#fde0dc" }),
  icon("xAd", "cross", 290, 246, 0.8),
];

const end = recap(
  [
    ["shield", "Check the lender"],
    ["rupee", "EMI: interest + principal"],
    ["doc", "Guarantor = you repay"],
  ],
  ["vikram", "neha", "guar", "bRepay", "lCredit"],
  "Check lenders. Compare reducing rates. Guarantee carefully.",
);

const story: Story = {
  slug: "loans-emis",
  backdrop: { place: "canteen", accent: "#5FA35A" },
  actors: [...actors, ...extra, ...end.actors],
  meta: {
    title: "Canteen loan alert",
    concept: "Over chai in the canteen, Vikram nearly takes an instant app loan and Neha asks him to be her guarantor.",
    cast: "Vikram (20) and Neha (20)",
    relationship: "Classmates",
    setting: "The college canteen",
    facts: [
      "Loan apps that want contacts or photos are a red flag; check the lender is RBI-regulated",
      "An EMI pays interest plus part of the principal",
      "Early EMIs are mostly interest; later ones mostly principal",
      "A '10% flat' rate is roughly 18% on a reducing balance",
      "A guarantor must repay if the borrower doesn't, and it can affect their credit",
    ],
    coverage: [
      {
        q: "Your monthly EMI on a loan pays for…",
        scene: 3,
        how: "An EMI bar splits into red interest and green principal; box 'EMI = interest + part of principal'.",
      },
      {
        q: "Early in a reducing-balance loan, where does most of each EMI go?",
        scene: 4,
        how: "Month 1's bar is mostly red (interest); Month 12's is mostly green; label 'red = interest'.",
      },
      {
        q: "Lender A offers “10% flat” for 2 years. Lender B offers 14% on a reducing balance. Which usually costs less?",
        scene: 5,
        how: "Lender A: '10% flat ≈ 18% reducing' vs Lender B: '14% reducing', which gets the tick.",
      },
      {
        q: "An instant-loan app wants access to your contacts and photo gallery before approving ₹10,000. What's the safest view?",
        scene: 2,
        how: "The app asks for Contacts and Photos; stamp RED FLAG; box 'Check: RBI-regulated lender?'.",
      },
      {
        q: "A friend asks you to be the guarantor on their ₹80,000 bike loan. What are you agreeing to?",
        scene: 6,
        how: "Guarantor form for an ₹80,000 bike loan; box 'If Neha can't pay, Vikram must'; 'and his credit score is hit'.",
      },
    ],
  },
  scenes: [
    {
      caption: "Canteen break. Vikram's phone: 'Pre-approved ₹10,000 loan!'",
      steps: [pop("appScreen", 0.06, 0.82), pose("vikram", 0.2, "face:excited arms:phone"), pose("neha", 0.4, "face:confused arms:down")],
    },
    {
      caption: "Wants contacts and photos? Red flag. Check RBI regulation.",
      steps: [
        ...hideAll(["appScreen"], 0),
        pop("permScreen", 0.06, 0.82),
        pop("contacts", 0.2, 1.1),
        pop("gallery", 0.26, 1.1),
        pop("redFlag", 0.42, 1),
        pop("bRbi", 0.56),
        pose("neha", 0.4, "face:worried arms:point"),
        pose("vikram", 0.5, "face:shocked arms:down"),
      ],
    },
    {
      caption: "Every EMI = interest + part of the principal.",
      steps: [
        ...hideAll(["permScreen", "contacts", "gallery", "redFlag", "bRbi"], 0),
        pop("bEmi", 0.06),
        show("emi", 0.14),
        fill("emi", 0.2, 0.3, 0, 0.55),
        show("lInt", 0.3),
        show("lPri", 0.3),
        pose("vikram", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "Early EMIs are mostly interest. Later, mostly principal.",
      steps: [
        ...hideAll(["bEmi", "emi", "lInt", "lPri"], 0),
        show("m1", 0.06),
        show("lM1", 0.06),
        fill("m1", 0.1, 0.25, 0, 0.85),
        show("m12", 0.3),
        show("lM12", 0.3),
        fill("m12", 0.34, 0.25, 0, 0.1),
        show("lMostly", 0.6),
        pose("neha", 0.5, "face:neutral arms:point"),
      ],
    },
    {
      caption: "'10% flat' ≈ 18% reducing. 14% reducing costs less.",
      steps: [
        ...hideAll(["m1", "m12", "lM1", "lM12", "lMostly"], 0),
        pop("lenderA", 0.06),
        pop("lenderB", 0.18),
        shake("lenderA", 0.4, 0.2, 5),
        pop("winB", 0.5, 0.9),
        pose("vikram", 0.5, "face:happy arms:point"),
      ],
    },
    {
      caption: "Neha: 'Be my guarantor?' You'd repay if she doesn't.",
      steps: [
        ...hideAll(["lenderA", "lenderB", "winB"], 0),
        pose("neha", 0.04, "face:happy arms:give"),
        pop("guar", 0.08),
        pop("bRepay", 0.3),
        show("lCredit", 0.46),
        pose("vikram", 0.4, "face:worried arms:chin"),
      ],
    },
    {
      caption: "Compare the APR in the Key Fact Statement, not ads.",
      steps: [
        ...hideAll(["guar", "bRepay", "lCredit"], 0),
        pop("kfs", 0.06),
        pop("ad", 0.3),
        pop("xAd", 0.46, 0.8),
        pose("vikram", 0.3, "face:thinking arms:chin"),
        pose("neha", 0.5, "face:happy arms:thumb"),
      ],
    },
    { ...end.scene, steps: [...hideAll(["kfs", "ad", "xAd"], 0), ...end.scene.steps] },
  ],
};

export default story;
