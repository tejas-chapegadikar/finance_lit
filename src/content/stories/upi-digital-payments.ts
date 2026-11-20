import type { Actor, Story } from "@/lib/story/types";
import type { Look } from "@/components/story/person";
import { box, hideAll, icon, label, move, person, pop, pose, recap, shake, show, stamp } from "./kit";

// UPI AND DIGITAL PAYMENTS · "The cycle sale". Kunal sells his old cycle at
// the college cycle stand; his friend Ayesha spots the tricks. Metaphor: money
// arrows: every PIN and QR sends money OUT.
// Facts: PIN only to send; collect request = request to pay; QR is for paying;
// screen-share apps reveal PIN and OTPs; report on 1930 / cybercrime.gov.in + bank.

const KUNAL: Look = { skin: "#8D5A3B", hair: "spiky", hairColor: "#1a1210", top: "#3f6fb5", topStyle: "tee", bottom: "#2b2b38" };
const AYESHA: Look = {
  skin: "#D9A27A",
  hair: "braid",
  hairColor: "#2b1d16",
  top: "#FFB81F",
  topStyle: "kurta",
  accent: "#E9785B",
  glasses: true,
  bottom: "#5b4a7a",
};

const actors: Actor[] = [
  icon("cycle", "bike", 180, 290, 2),
  label("price", "₹5,000", 180, 340, 15),
  {
    id: "phone1",
    kind: "screen",
    x: 180,
    y: 175,
    scale: 0.85,
    props: { title: "COLLECT REQUEST", text: "Pay ₹5,000|from your account", button: "PAY" },
    ...{ opacity: 0 },
  },
  box("bCollect", "Collect request =|YOU pay", 290, 110, { w: 140, h: 62, size: 14, fill: "#fde0dc" }),
  {
    id: "phone2",
    kind: "screen",
    x: 180,
    y: 175,
    scale: 0.85,
    props: { title: "UPI PIN", text: "Enter PIN|to SEND money", button: "SEND" },
    ...{ opacity: 0 },
  },
  box("bPin", "PIN = money goes OUT", 180, 330, { w: 220, h: 44, size: 15, fill: "#FFB81F" }),
  icon("qr", "qr", 180, 190, 2.2),
  { id: "arrowOut", kind: "arrow", x: 180, y: 290, rotate: 90, props: { length: 70, color: "#D2342B" }, opacity: 0 },
  box("bQr", "Scan QR = PAY", 180, 100, { w: 180, h: 46, size: 17, fill: "#fde0dc" }),
  {
    id: "phone3",
    kind: "screen",
    x: 110,
    y: 185,
    scale: 0.8,
    props: { title: "'CUSTOMER CARE'", text: "Install|ScreenShare app", button: "INSTALL" },
    ...{ opacity: 0 },
  },
  icon("eyePin", "pin", 262, 140, 1.2),
  icon("eyeOtp", "otp", 262, 210, 1.2),
  label("lSee", "They see these", 262, 260, 13),
  stamp("noInstall", "DON'T", 110, 185),
  icon("call", "call", 90, 160, 1.4),
  label("l1930", "Call 1930", 90, 210, 15, "#FFB81F"),
  box("bCyber", "cybercrime.gov.in", 245, 150, { w: 180, h: 42, size: 14 }),
  icon("bank", "building", 245, 220, 1.1),
  label("lBank", "+ tell your bank", 245, 262, 13),
  person("kunal", KUNAL, 72, "face:happy arms:down", 0.9),
  person("ayesha", AYESHA, 290, "face:neutral arms:down", 0.9),
];

const end = recap(
  [
    ["pin", "PIN only to pay"],
    ["qr", "QR = paying"],
    ["call", "Report on 1930"],
  ],
  ["kunal", "ayesha", "call", "l1930", "bCyber", "bank", "lBank"],
  "PIN sends. QR pays. Report fast.",
);

const story: Story = {
  slug: "upi-digital-payments",
  backdrop: { place: "parking", accent: "#3f6fb5" },
  actors: [...actors, ...end.actors],
  meta: {
    title: "The cycle sale",
    concept: "Kunal sells his old cycle; a fake buyer tries every UPI trick and Ayesha spots each one.",
    cast: "Kunal (20, selling his cycle) and his friend Ayesha",
    relationship: "College friends",
    setting: "The college cycle stand",
    facts: [
      "You never need your UPI PIN to receive money: PIN = money leaving",
      "A collect request asks you to pay",
      "Scanning a QR code is for paying, not receiving",
      "Screen-sharing apps let scammers see your PIN and OTPs",
      "If tricked: report on 1930 or cybercrime.gov.in and inform your bank, fast",
    ],
    coverage: [
      {
        q: "A buyer on a resale app says, “Just enter your PIN to receive the money.” When do you actually need your UPI PIN?",
        scene: 3,
        how: "The phone shows 'Enter PIN to SEND money'; box 'PIN = money goes OUT'.",
      },
      {
        q: "A stranger sends you a QR code and says scanning it will credit ₹1,000 to your account. What's really going on?",
        scene: 4,
        how: "A QR code with a red arrow of money going out; box 'Scan QR = PAY'.",
      },
      {
        q: "A “refund” pops up on your UPI app as a collect request. What is a collect request, really?",
        scene: 2,
        how: "Screen 'COLLECT REQUEST · Pay ₹5,000 from your account'; box 'Collect request = YOU pay'.",
      },
      {
        q: "You were tricked into a fraudulent UPI payment. What should you do first?",
        scene: 6,
        how: "Call 1930, 'cybercrime.gov.in' and '+ tell your bank' pop up together.",
      },
      {
        q: 'Someone "from customer care" asks you to install a screen-sharing app so they can fix a failed UPI refund. What\'s the risk?',
        scene: 5,
        how: "'Customer care' screen asks to install ScreenShare; PIN and OTP icons appear under 'They see these'; stamp: DON'T.",
      },
    ],
  },
  scenes: [
    {
      caption: "Kunal sells his cycle. A 'buyer' sends a request.",
      steps: [pop("cycle", 0.06, 2), show("price", 0.12), pose("kunal", 0.2, "face:happy arms:phone"), pose("ayesha", 0.4, "face:confused arms:down")],
    },
    {
      caption: "A collect request asks YOU to pay.",
      steps: [
        ...hideAll(["cycle", "price"], 0),
        pop("phone1", 0.06, 0.85),
        pop("bCollect", 0.3),
        shake("phone1", 0.5, 0.25, 6),
        pose("ayesha", 0.3, "face:worried arms:point"),
        pose("kunal", 0.3, "face:shocked arms:phone"),
      ],
    },
    {
      caption: "UPI PIN is only for sending. Never to receive.",
      steps: [
        ...hideAll(["phone1", "bCollect"], 0),
        pop("phone2", 0.06, 0.85),
        pop("bPin", 0.3),
        pose("ayesha", 0.2, "face:neutral arms:point"),
        pose("kunal", 0.4, "face:thinking arms:chin"),
      ],
    },
    {
      caption: "QR codes are for paying, never receiving.",
      steps: [
        ...hideAll(["phone2", "bPin"], 0),
        pop("qr", 0.06, 2.2),
        pop("bQr", 0.2),
        show("arrowOut", 0.3),
        move("arrowOut", 0.36, { y: 320 }, 0.3),
        pose("kunal", 0.4, "face:shocked arms:down"),
      ],
    },
    {
      caption: "Install a screen-share app? They'd see your PIN, OTPs.",
      steps: [
        ...hideAll(["qr", "bQr", "arrowOut"], 0),
        pose("kunal", 0.04, "face:confused arms:phone"),
        pop("phone3", 0.06, 0.8),
        pop("eyePin", 0.24, 1.2),
        pop("eyeOtp", 0.32, 1.2),
        show("lSee", 0.36),
        pop("noInstall", 0.56, 1),
        pose("ayesha", 0.5, "face:worried arms:point"),
      ],
    },
    {
      caption: "Tricked? Report on 1930, cybercrime.gov.in, and your bank.",
      steps: [
        ...hideAll(["phone3", "eyePin", "eyeOtp", "lSee", "noInstall"], 0),
        pop("call", 0.06, 1.4),
        show("l1930", 0.1),
        pop("bCyber", 0.24),
        pop("bank", 0.38, 1.1),
        show("lBank", 0.42),
        pose("kunal", 0.3, "face:happy arms:phone"),
        pose("ayesha", 0.3, "face:proud arms:thumb"),
      ],
    },
    end.scene,
  ],
};

export default story;
