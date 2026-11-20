import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, hideAll, icon, move, person, pop, pose, recap, shake, stamp } from "./kit";

// COMMON FINANCIAL SCAMS · "Metro ride, five traps". Cousins Sana and Imran
// on the evening metro; her phone keeps buzzing. Metaphor: red-flag stamps.
// Facts: pressure to act now is the biggest red flag; OTP goes to no one;
// ₹200-for-likes then "deposit ₹3,000" is a task scam; "digital arrest" doesn't
// exist; customer-care numbers from search can be fake.

const SANA: Look = { skin: "#C68B5E", hair: "long", hairColor: "#231712", top: "#7B4B94", topStyle: "tee", bottom: "#24304a", badge: "#FFB81F" };
const IMRAN: Look = {
  skin: "#B5835A",
  hair: "short",
  hairColor: "#16110e",
  top: "#E9785B",
  topStyle: "shirt",
  accent: "#2f5d46",
  beard: "stubble",
  bottom: "#3a3a3a",
};

const screen = (id: string, title: string, text: string, button?: string, x = 180): Actor => ({
  id,
  kind: "screen",
  x,
  y: 180,
  scale: 0.82,
  props: { title, text, ...(button ? { button } : {}) },
  opacity: 0,
});

const actors: Actor[] = [
  icon("buzz1", "warn", 120, 120, 0.9),
  icon("buzz2", "warn", 240, 100, 0.9),
  icon("buzz3", "warn", 200, 160, 0.9),
  screen("sKyc", "URGENT!", "KYC expires today|Pay ₹999 penalty", "ACT NOW"),
  icon("timer", "clock", 290, 110, 1.2),
  stamp("flag", "RED FLAG", 180, 330),
  screen("sOtp", "'YOUR BANK'", "Tell us the OTP|for KYC"),
  icon("otpLock", "shield", 290, 150, 1.4),
  box("bNoOne", "OTP → no one", 290, 220, { w: 140, h: 44, size: 15, fill: "#FFB81F" }),
  screen("sTask", "EASY JOB", "Liked videos: +₹200|Deposit ₹3,000|for bigger tasks", "DEPOSIT", 110),
  stamp("taskScam", "TASK SCAM", 250, 200),
  screen("sCbi", "VIDEO CALL", "'CBI officer'|You're under|digital arrest"),
  stamp("fake", "FAKE", 180, 200),
  box("bNoArrest", "No such thing as|digital arrest", 180, 330, { w: 200, h: 58, size: 14 }),
  box("search", "Search: 'bank customer care'", 180, 100, { w: 260, h: 40, size: 13, fill: "#fff" }),
  box("r1", "1800-XXX  (ad)", 180, 160, { w: 220, h: 40, size: 14, fill: "#fde0dc" }),
  box("r2", "Official app / website", 180, 214, { w: 220, h: 40, size: 14, fill: "#dff0dc" }),
  icon("warnR1", "warn", 306, 160, 0.8),
  icon("okR2", "check", 306, 214, 0.8),
  person("sana", SANA, 72, "face:neutral arms:phone", 0.9),
  person("imran", IMRAN, 290, "face:neutral arms:down", 0.9),
];

const end = recap(
  [
    ["otp", "OTP: share with no one"],
    ["warn", "Pressure = red flag"],
    ["shield", "No 'digital arrest'"],
  ],
  ["sana", "imran", "search", "r1", "r2", "warnR1", "okR2"],
  "Slow down. Share nothing. Check yourself.",
);

const story: Story = {
  slug: "financial-scams",
  backdrop: { place: "metro", accent: "#5b8bc9" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Metro ride, five traps",
    concept: "On the evening metro, Sana's and Imran's phones serve up five classic scams, and they spot each one.",
    cast: "Sana (21) and her cousin Imran (23)",
    relationship: "Cousins",
    setting: "An evening metro ride",
    facts: [
      "Scams use urgency, fear or greed; pressure to act now is the biggest red flag",
      "Never share an OTP, UPI PIN, CVV or password with anyone",
      "Paid 'likes' followed by a deposit request is a task scam",
      "'Digital arrest' doesn't exist; real officials never demand money on a call",
      "Customer-care numbers from search results or ads can be fake",
    ],
    coverage: [
      {
        q: "“Sir, calling from your bank, please tell the OTP for KYC.” Who should you share an OTP with?",
        scene: 3,
        how: "'Your bank' asks for the OTP; the OTP gets a shield and the box 'OTP → no one'.",
      },
      {
        q: "Which of these is the biggest red flag in a message?",
        scene: 2,
        how: "'URGENT! KYC expires today, pay penalty, ACT NOW' with a ticking timer; stamp: RED FLAG.",
      },
      {
        q: "A part-time job pays you ₹200 for liking videos, then asks you to deposit ₹3,000 to unlock higher-paying tasks. This is most likely:",
        scene: 4,
        how: "Imran's 'EASY JOB' screen: +₹200 for likes, then deposit ₹3,000; stamp: TASK SCAM.",
      },
      {
        q: "Someone on a video call says they're a CBI officer and you're under \"digital arrest\". What's true?",
        scene: 5,
        how: "Video call from a 'CBI officer'; stamp: FAKE; box 'No such thing as digital arrest'.",
      },
      {
        q: 'You need help with a failed payment, so you search online and call the first "customer care" number you see. What\'s the risk?',
        scene: 6,
        how: "Search results: the top '1800 (ad)' number gets a warning; 'Official app / website' gets a tick.",
      },
    ],
  },
  scenes: [
    {
      caption: "On the metro, Sana's phone won't stop buzzing.",
      steps: [
        pop("buzz1", 0.08, 0.9),
        pop("buzz2", 0.18, 0.9),
        pop("buzz3", 0.28, 0.9),
        pose("sana", 0.2, "face:confused arms:phone"),
        pose("imran", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "Pressure to act now? That's the biggest red flag.",
      steps: [
        ...hideAll(["buzz1", "buzz2", "buzz3"], 0),
        pop("sKyc", 0.06, 0.82),
        pop("timer", 0.2, 1.2),
        shake("timer", 0.3, 0.4, 14),
        pop("flag", 0.5, 1),
        pose("sana", 0.3, "face:worried arms:phone"),
      ],
    },
    {
      caption: "'Bank' asks for your OTP? Share it with no one.",
      steps: [
        ...hideAll(["sKyc", "timer", "flag"], 0),
        pop("sOtp", 0.06, 0.82),
        move("sOtp", 0.25, { x: 110 }, 0.15),
        pop("otpLock", 0.35, 1.4),
        pop("bNoOne", 0.45),
        pose("sana", 0.5, "face:proud arms:down"),
      ],
    },
    {
      caption: "₹200 for likes, then 'deposit ₹3,000'? A task scam.",
      steps: [
        ...hideAll(["sOtp", "otpLock", "bNoOne"], 0),
        pose("imran", 0.04, "face:excited arms:phone"),
        pop("sTask", 0.08, 0.82),
        pop("taskScam", 0.45, 1),
        pose("imran", 0.5, "face:shocked arms:down"),
        pose("sana", 0.5, "face:neutral arms:point"),
      ],
    },
    {
      caption: "'Digital arrest' doesn't exist. Police never video-call for money.",
      steps: [
        ...hideAll(["sTask", "taskScam"], 0),
        pose("sana", 0.04, "face:shocked arms:phone"),
        pop("sCbi", 0.08, 0.82),
        pop("fake", 0.4, 1),
        pop("bNoArrest", 0.55),
        pose("sana", 0.6, "face:proud arms:down"),
      ],
    },
    {
      caption: "Customer care number from search? It could be fake.",
      steps: [
        ...hideAll(["sCbi", "fake", "bNoArrest"], 0),
        pose("imran", 0.04, "face:thinking arms:phone"),
        pop("search", 0.06),
        pop("r1", 0.18),
        pop("r2", 0.28),
        pop("warnR1", 0.42, 0.8),
        shake("r1", 0.46, 0.25, 4),
        pop("okR2", 0.56, 0.8),
        pose("imran", 0.6, "face:happy arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
