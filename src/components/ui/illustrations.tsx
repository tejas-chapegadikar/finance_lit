// StockStreak's spot illustrations: flat, geometric, one shared palette, a
// soft disc behind each object. One per level (the journey's chapters) plus
// the path's trophy. Decorative, always paired with a text label.

const C = {
  violet: "#6c5ce7",
  violetDeep: "#4f3fd0",
  lavender: "#ebe7ff",
  lilac: "#cbc2ff",
  ink: "#2b2833",
  inkSoft: "#46424f",
  sand: "#f2ebe0",
  sandDeep: "#e1d5c3",
  green: "#1aa874",
  mint: "#d4f4e6",
  orange: "#f2801c",
  orangeDeep: "#d8650a",
  gold: "#ffb45e",
  apricot: "#ffd5b0",
  white: "#ffffff",
};

const rupee = { fontFamily: "var(--font-figtree), system-ui, sans-serif" } as const;

function Frame({ className, label, backdrop, children }: { className?: string; label: string; backdrop: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 160 128" role="img" aria-label={label} className={className}>
      <circle cx="80" cy="62" r="54" fill={backdrop} />
      <ellipse cx="80" cy="114" rx="48" ry="5" fill="#1e1c1a" opacity="0.08" />
      {children}
    </svg>
  );
}

function Coin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 7} rx="13" ry="4.5" fill={C.orangeDeep} />
      <rect x={x - 13} y={y} width="26" height="7" fill={C.orange} />
      <ellipse cx={x} cy={y} rx="13" ry="4.5" fill={C.gold} />
    </g>
  );
}

/** Level 1, Your first stipend: a wallet with a fresh ₹ note and coins. */
function FirstStipend({ className }: { className?: string }) {
  return (
    <Frame className={className} label="A wallet with a rupee note and coins" backdrop={C.sand}>
      <g transform="rotate(-10 80 44)">
        <rect x="48" y="24" width="66" height="38" rx="6" fill={C.mint} stroke={C.green} strokeWidth="2.5" />
        <circle cx="81" cy="43" r="10" fill={C.green} />
        <text x="81" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.white} style={rupee}>
          ₹
        </text>
      </g>
      <rect x="34" y="50" width="92" height="58" rx="12" fill={C.violet} />
      <path d="M34 62a12 12 0 0 1 12-12h68a12 12 0 0 1 12 12v3H34z" fill={C.violetDeep} />
      <rect x="98" y="70" width="34" height="22" rx="8" fill={C.violetDeep} />
      <circle cx="110" cy="81" r="4.5" fill={C.apricot} />
      <Coin x={36} y={98} />
      <Coin x={36} y={90} />
    </Frame>
  );
}

/** Level 2, Paying and banking safely: a phone with a shield, a bank behind. */
function BankingSafely({ className }: { className?: string }) {
  return (
    <Frame className={className} label="A phone showing a safety shield, with a bank behind it" backdrop={C.lavender}>
      <path d="M102 46 126 32l24 14z" fill={C.white} stroke={C.lilac} strokeWidth="2.5" strokeLinejoin="round" />
      {[107, 123, 139].map((x) => (
        <rect key={x} x={x} y="49" width="7" height="40" rx="2" fill={C.white} stroke={C.lilac} strokeWidth="2" />
      ))}
      <rect x="100" y="89" width="52" height="8" rx="3" fill={C.white} stroke={C.lilac} strokeWidth="2" />
      <rect x="46" y="16" width="52" height="94" rx="12" fill={C.ink} />
      <rect x="51" y="24" width="42" height="76" rx="7" fill={C.white} />
      <rect x="64" y="19.5" width="16" height="2.5" rx="1.25" fill={C.inkSoft} />
      <path d="M72 38l14 6v11c0 9-6 15-14 18-8-3-14-9-14-18V44z" fill={C.green} />
      <path d="M65.5 55.5l4.5 4.5 8-8" fill="none" stroke={C.white} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="60" y="82" width="24" height="4" rx="2" fill={C.lavender} />
      <rect x="64" y="89" width="16" height="4" rx="2" fill={C.lavender} />
      <g>
        <rect x="16" y="64" width="42" height="20" rx="10" fill={C.white} stroke={C.lilac} strokeWidth="2" />
        <circle cx="27" cy="74" r="5.5" fill={C.green} />
        <path d="M24.5 74l1.8 1.8 3.4-3.4" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="36" y="71.5" width="15" height="5" rx="2.5" fill={C.lilac} />
      </g>
    </Frame>
  );
}

/** Level 3, Saving and credit: a savings jar and a credit card. */
function SavingCredit({ className }: { className?: string }) {
  return (
    <Frame className={className} label="A jar of coins and a credit card" backdrop={C.sand}>
      <rect x="30" y="38" width="40" height="10" rx="4" fill={C.sandDeep} />
      <rect x="26" y="46" width="48" height="62" rx="12" fill={C.white} stroke={C.sandDeep} strokeWidth="3" />
      <Coin x={50} y={94} />
      <Coin x={50} y={86} />
      <Coin x={50} y={78} />
      <g transform="rotate(-12 106 76)">
        <rect x="68" y="52" width="78" height="50" rx="8" fill={C.violet} />
        <rect x="78" y="64" width="15" height="11" rx="2.5" fill={C.apricot} />
        <rect x="78" y="84" width="34" height="4" rx="2" fill={C.lilac} />
        <rect x="78" y="91" width="20" height="4" rx="2" fill={C.lilac} opacity="0.7" />
        <circle cx="126" cy="88" r="7" fill={C.white} opacity="0.4" />
        <circle cx="135" cy="88" r="7" fill={C.white} opacity="0.22" />
      </g>
    </Frame>
  );
}

/** Level 4, Your first salary: a payslip, a briefcase and rising bars. */
function FirstSalary({ className }: { className?: string }) {
  return (
    <Frame className={className} label="A payslip, a briefcase and a rising chart" backdrop={C.lavender}>
      <g transform="rotate(-8 60 50)">
        <rect x="32" y="16" width="54" height="68" rx="6" fill={C.white} stroke={C.lilac} strokeWidth="2.5" />
        <rect x="40" y="26" width="24" height="5" rx="2.5" fill={C.ink} />
        {[38, 46, 54].map((y) => (
          <rect key={y} x="40" y={y} width="38" height="4" rx="2" fill={C.lavender} />
        ))}
        <rect x="40" y="66" width="22" height="6" rx="3" fill={C.green} />
      </g>
      <rect x="112" y="62" width="12" height="40" rx="3" fill={C.mint} />
      <rect x="128" y="48" width="12" height="54" rx="3" fill={C.green} />
      <path d="M104 46l12-10 8 6 16-14" fill="none" stroke={C.green} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M131 28h9v9" fill="none" stroke={C.green} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 62v-6a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6" fill="none" stroke={C.ink} strokeWidth="5" />
      <rect x="50" y="62" width="68" height="46" rx="8" fill={C.ink} />
      <rect x="50" y="78" width="68" height="5" fill={C.inkSoft} />
      <rect x="80" y="74" width="8" height="12" rx="2" fill={C.apricot} />
    </Frame>
  );
}

const LEVELS = [FirstStipend, BankingSafely, SavingCredit, FirstSalary];

/** The illustration for level 1–4. */
export function LevelIllustration({ level, className }: { level: number; className?: string }) {
  const Art = LEVELS[(level - 1 + LEVELS.length) % LEVELS.length];
  return <Art className={className} />;
}

/** The trophy at the end of the path: gold once every level is done. */
export function TrophyIllustration({ won, className }: { won: boolean; className?: string }) {
  const cup = won ? C.gold : C.sandDeep;
  const deep = won ? C.orange : "#cfc3b0";
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={won ? "A gold trophy" : "A trophy still to be won"} className={className}>
      <circle cx="60" cy="56" r="48" fill={won ? "#fff1df" : C.sand} />
      <ellipse cx="60" cy="108" rx="34" ry="4" fill="#1e1c1a" opacity="0.08" />
      <path d="M36 30h-8a10 10 0 0 0 10 14M84 30h8a10 10 0 0 1-10 14" fill="none" stroke={deep} strokeWidth="5" strokeLinecap="round" />
      <path d="M36 22h48v18a24 24 0 0 1-48 0z" fill={cup} />
      <rect x="54" y="62" width="12" height="16" fill={deep} />
      <rect x="40" y="78" width="40" height="10" rx="4" fill={won ? C.ink : "#b9ad9b"} />
      <path d="M60 30l3.4 6.9 7.6 1.1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill={won ? C.white : "#f7f2ea"} />
    </svg>
  );
}
