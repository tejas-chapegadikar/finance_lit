import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, camera, hideAll, icon, label, move, person, pop, pose, recap, shake, show } from "./kit";

// HOW THE STOCK MARKET ACTUALLY WORKS · "Uncle Joseph's TV panic". The news
// says the Sensex fell; his niece Anika explains what that does (and doesn't)
// mean. Metaphor: the Sensex as a class average; the market as a bazaar.
// Facts: Sensex = average of 30 large companies; SEBI regulates; buying listed
// shares pays another investor; shares sit in a demat account; prices move with
// demand and supply, often after news.

const JOSEPH: Look = {
  skin: "#B97A50",
  hair: "bald",
  hairColor: "#9a948e",
  top: "#8a5a3b",
  topStyle: "sweater",
  accent: "#F5EFE3",
  beard: "moustache",
  glasses: true,
  old: true,
  bottom: "#3a3a3a",
};
const ANIKA: Look = { skin: "#E0AC82", hair: "bun", hairColor: "#3b2416", top: "#2f8a7d", topStyle: "tee", bottom: "#24304a", glasses: true };

const cos = ["+1%", "−3%", "−4%", "+2%", "−6%"];
const actors: Actor[] = [
  box("news", "SENSEX −2%!", 180, 110, { w: 190, h: 50, size: 20, fill: "#fde0dc" }),
  ...cos.map((t, i): Actor => box(`co${i}`, t, 60 + i * 60, 210, { w: 54, h: 40, size: 14, fill: t.startsWith("+") ? "#dff0dc" : "#fde0dc", depth: "no" })),
  box("bAvg", "Sensex = average|of 30 big companies", 180, 120, { w: 220, h: 62, size: 14 }),
  box("yours", "Your share: +1%", 180, 290, { w: 180, h: 46, size: 16, fill: "#FFB81F" }),
  icon("sebi", "shield", 180, 190, 3),
  label("lSebi", "SEBI", 180, 194, 20),
  box("bSebi", "regulates markets,|brokers, mutual funds", 180, 300, { w: 230, h: 62, size: 14 }),
  icon("anikaCoin", "rupee", 110, 200, 1.4),
  { id: "toSeller", kind: "arrow", x: 180, y: 200, props: { length: 90, color: "#2f5d46" }, opacity: 0 },
  icon("seller", "idcard", 260, 200, 1.4),
  label("lSeller", "another investor", 260, 250, 12),
  icon("company", "building", 180, 300, 1.2),
  icon("xCompany", "cross", 200, 284, 0.7),
  label("lNotCo", "not the company", 180, 340, 12, "#fde0dc"),
  label("lIpo", "(only an IPO sells new shares for the company)", 180, 374, 10),
  icon("demat", "vault", 180, 200, 2.6),
  label("lDemat", "DEMAT account", 180, 262, 15, "#FFB81F"),
  box("bElec", "your shares, held|electronically", 180, 110, { w: 200, h: 62, size: 14 }),
  box("goodNews", "Good news!", 180, 100, { w: 150, h: 44, size: 16, fill: "#dff0dc" }),
  label("lBuy", "BUYERS", 100, 160, 15, "#dff0dc"),
  label("lSell", "sellers", 260, 160, 11, "#fde0dc"),
  { id: "jump", kind: "chart", x: 180, y: 250, props: { points: "0,80 60,78 120,72 140,30 200,20", color: "#5FA35A", w: 200, h: 90 }, opacity: 0 },
  person("joseph", JOSEPH, 72, "face:neutral arms:down", 0.9),
  person("anika", ANIKA, 290, "face:happy arms:down", 0.9),
];

const end = recap(
  [
    ["shield", "SEBI watches the market"],
    ["vault", "Shares live in demat"],
    ["tv", "Index isn't your share"],
  ],
  ["joseph", "anika", "goodNews", "lBuy", "lSell", "jump"],
  "Index is an average. You're not.",
);

const story: Story = {
  slug: "how-stock-market-works",
  backdrop: { place: "living", accent: "#E9785B" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "Uncle Joseph's TV panic",
    concept: "The TV says the Sensex fell; Uncle Joseph panics and his niece Anika explains how the market really works.",
    cast: "Uncle Joseph (60s) and his niece Anika (22)",
    relationship: "Uncle and niece",
    setting: "The family living room, TV on",
    facts: [
      "The Sensex is an average of 30 large companies; one share can move differently",
      "SEBI regulates the stock market, brokers and mutual funds",
      "Buying listed shares pays another investor, not the company",
      "Shares are held electronically in a demat account",
      "Prices rise when more people want to buy than sell, often after news",
    ],
    coverage: [
      {
        q: "Who regulates India's stock market, brokers and mutual funds?",
        scene: 3,
        how: "A big shield labelled SEBI; box 'regulates markets, brokers, mutual funds'.",
      },
      { q: "What's a demat account for?", scene: 5, how: "A vault labelled 'DEMAT account'; box 'your shares, held electronically'." },
      {
        q: "You buy shares of a company that listed five years ago, through your broker app. Who gets your money?",
        scene: 4,
        how: "Anika's money arrows to 'another investor'; the company icon gets a cross: 'not the company'.",
      },
      {
        q: "A company's share price jumps 8% in a day. What usually explains it?",
        scene: 6,
        how: "'Good news!' → BUYERS outnumber sellers and the price line jumps up.",
      },
      {
        q: "The Sensex falls 2% today. What does that tell you about the one company's shares you own?",
        scene: 2,
        how: "Five company boxes move differently (+1%, −3%, −4%...); box 'Sensex = average of 30 big companies'; 'Your share: +1%'.",
      },
    ],
  },
  scenes: [
    {
      caption: "TV: 'Sensex falls 2%!' Uncle Joseph panics.",
      steps: [
        pop("news", 0.06),
        shake("news", 0.2, 0.3, 8),
        pose("joseph", 0.2, "face:shocked arms:up"),
        pose("anika", 0.4, "face:thinking arms:chin"),
        camera(0.1, { scale: 1.08, y: 10 }, 0.4),
      ],
    },
    {
      caption: "Sensex = average of 30 big companies. Yours may differ.",
      steps: [
        camera(0, { scale: 1, y: 0 }, 0.2),
        ...hideAll(["news"], 0),
        pop("bAvg", 0.06),
        ...cos.map((_, i) => pop(`co${i}`, 0.16 + i * 0.06)),
        pop("yours", 0.52),
        move("co0", 0.56, { y: 250, scale: 1.2 }, 0.14),
        pose("anika", 0.5, "face:happy arms:point"),
      ],
    },
    {
      caption: "SEBI regulates the market, brokers and mutual funds.",
      steps: [
        ...hideAll(["bAvg", "yours", ...cos.map((_, i) => `co${i}`)], 0),
        pop("sebi", 0.06, 3),
        show("lSebi", 0.14),
        pop("bSebi", 0.3),
        pose("joseph", 0.4, "face:neutral arms:down"),
      ],
    },
    {
      caption: "Buying listed shares? Your money goes to another investor.",
      steps: [
        ...hideAll(["sebi", "lSebi", "bSebi"], 0),
        pop("anikaCoin", 0.06, 1.4),
        show("toSeller", 0.16),
        pop("seller", 0.22, 1.4),
        show("lSeller", 0.26),
        move("anikaCoin", 0.3, { x: 250 }, 0.2),
        pop("company", 0.5, 1.2),
        pop("xCompany", 0.58, 0.7),
        show("lNotCo", 0.6),
        show("lIpo", 0.72),
        pose("anika", 0.3, "face:happy arms:phone"),
      ],
    },
    {
      caption: "Your shares live in a demat account, electronically.",
      steps: [
        ...hideAll(["anikaCoin", "toSeller", "seller", "lSeller", "company", "xCompany", "lNotCo", "lIpo"], 0),
        pop("demat", 0.06, 2.6),
        show("lDemat", 0.14),
        pop("bElec", 0.3),
        pose("joseph", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "Good news, more buyers than sellers: price jumps.",
      steps: [
        ...hideAll(["demat", "lDemat", "bElec"], 0),
        pop("goodNews", 0.06),
        show("lBuy", 0.18),
        show("lSell", 0.18),
        move("lBuy", 0.2, { scale: 1.4 }, 0.15),
        show("jump", 0.3),
        { at: 0.32, dur: 0.4, actor: "jump", fill: [0, 1] },
        pose("joseph", 0.5, "face:happy arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
