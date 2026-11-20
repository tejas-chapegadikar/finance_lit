// Story props, drawn as flat SVG with thick dark outlines. Each is centred on
// (0, 0). Parts the engine animates are marked: data-fill (a jar's money
// level), data-count (a counter's number), data-layer="page:…" (calendar pages).

import { MORE_ICONS, fit } from "./generic";

const INK = "#0F1F18";
const GOLD = "#FFB81F";
const CREAM = "#F5EFE3";
const OUT = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const FONT = "var(--font-display), Poppins, sans-serif";

export function Wallet() {
  return (
    <g>
      <rect x={-28} y={-19} width={56} height={38} rx={7} fill="#1d3a2c" {...OUT} />
      <path d="M-28 -6 L10 -6 Q18 -6 18 2 Q18 10 10 10 L-28 10" fill="#24493a" {...OUT} strokeWidth={2.4} />
      <circle cx={10} cy={2} r={3.5} fill={GOLD} stroke={INK} strokeWidth={1.6} />
    </g>
  );
}

export function Note() {
  return (
    <g>
      <rect x={-18} y={-10} width={36} height={20} rx={3} fill="#A8D5A2" {...OUT} strokeWidth={2.4} />
      <circle cx={0} cy={0} r={6} fill="none" stroke={INK} strokeWidth={1.4} opacity={0.6} />
      <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill={INK} fontFamily={FONT}>
        ₹
      </text>
    </g>
  );
}

export function Coin() {
  return (
    <g>
      <circle r={10} fill={GOLD} {...OUT} strokeWidth={2.4} />
      <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill={INK} fontFamily={FONT}>
        ₹
      </text>
    </g>
  );
}

export function Samosa() {
  return (
    <g>
      <path d="M0 -13 L14 10 L-14 10 Z" fill="#E7A543" {...OUT} strokeWidth={2.4} />
      <path d="M-5 2 L0 -5 L5 2" fill="none" stroke="#B36F1F" strokeWidth={1.6} />
      <text x={0} y={23} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK} fontFamily={FONT}>
        ₹40
      </text>
    </g>
  );
}

/** A glass jar with a label; its money (data-fill) is scaled from the bottom by the engine. */
export function Jar({ label, color, fill = 0 }: { label: string; color: string; fill?: number }) {
  return (
    <g>
      <rect x={-30} y={-62} width={60} height={12} rx={4} fill="#fff" {...OUT} strokeWidth={2.6} />
      <rect x={-42} y={-52} width={84} height={108} rx={16} fill="#ffffff" fillOpacity={0.75} {...OUT} />
      <rect
        data-fill
        x={-38}
        y={-46}
        width={76}
        height={98}
        rx={12}
        fill={color}
        transform={`translate(0 52) scale(1 ${Math.max(fill, 0.0001)}) translate(0 -52)`}
      />
      <path d="M-30 -36 Q-33 -10 -30 18" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      <rect x={-30} y={-24} width={60} height={22} rx={6} fill={CREAM} {...OUT} strokeWidth={2.2} />
      <text x={0} y={-8.5} textAnchor="middle" fontSize={12} fontWeight={800} fill={INK} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );
}

export function Lid() {
  return (
    <g>
      <rect x={-34} y={-8} width={68} height={16} rx={5} fill="#1d3a2c" {...OUT} strokeWidth={2.6} />
      <rect x={-8} y={-14} width={16} height={7} rx={3} fill={GOLD} {...OUT} strokeWidth={2} />
    </g>
  );
}

export function Lock() {
  return (
    <g>
      <path d="M-8 -4 L-8 -12 Q-8 -21 0 -21 Q8 -21 8 -12 L8 -4" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <rect x={-13} y={-5} width={26} height={21} rx={5} fill={GOLD} {...OUT} strokeWidth={2.6} />
      <circle cx={0} cy={4} r={2.6} fill={INK} />
      <path d="M0 5 L0 10" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** A desk calendar; each page is a layer the engine flips to. */
export function Calendar({ pages, layer }: { pages: string[]; layer?: string }) {
  const showing = layer?.startsWith("page:") ? layer.slice(5) : pages[0];
  return (
    <g>
      <rect x={-34} y={-30} width={68} height={64} rx={8} fill="#fff" {...OUT} />
      <rect x={-34} y={-30} width={68} height={18} rx={8} fill="#D2342B" {...OUT} />
      <rect x={-34} y={-20} width={68} height={8} fill="#D2342B" />
      <circle cx={-16} cy={-30} r={3} fill={INK} />
      <circle cx={16} cy={-30} r={3} fill={INK} />
      {pages.map((page) => (
        <text
          key={page}
          data-layer={`page:${page}`}
          opacity={page === showing ? 1 : 0}
          x={0}
          y={page.length > 4 ? 18 : 22}
          textAnchor="middle"
          fontSize={page.length > 4 ? 14 : 22}
          fontWeight={800}
          fill={INK}
          fontFamily={FONT}
        >
          {page}
        </text>
      ))}
    </g>
  );
}

export function Phone() {
  return (
    <g>
      <rect x={-16} y={-28} width={32} height={56} rx={6} fill="#1d3a2c" {...OUT} />
      <rect x={-11} y={-21} width={22} height={38} rx={2} fill="#bfe3e0" />
      <circle cx={0} cy={22} r={2} fill={CREAM} />
    </g>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  mess: (
    <g>
      <circle r={13} fill="#fff" {...OUT} strokeWidth={2.2} />
      <circle cx={-5} cy={-4} r={4} fill="#E7A543" stroke={INK} strokeWidth={1.4} />
      <circle cx={5} cy={-3} r={4} fill="#7FB069" stroke={INK} strokeWidth={1.4} />
      <circle cx={0} cy={6} r={4} fill="#F3E1B6" stroke={INK} strokeWidth={1.4} />
    </g>
  ),
  bus: (
    <g>
      <rect x={-14} y={-10} width={28} height={20} rx={3} fill="#bfe3e0" {...OUT} strokeWidth={2.2} />
      <rect x={-10} y={-6} width={9} height={6} fill="#fff" stroke={INK} strokeWidth={1.4} />
      <path d="M2 -4 L10 -4 M2 1 L8 1" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  ),
  recharge: (
    <g>
      <rect x={-8} y={-14} width={16} height={28} rx={3} fill="#1d3a2c" {...OUT} strokeWidth={2.2} />
      <path d="M1 -8 L-4 1 L1 1 L-1 9 L5 -1 L0 -1 Z" fill={GOLD} />
    </g>
  ),
  cafe: (
    <g>
      <path d="M-10 -8 L10 -8 L8 12 L-8 12 Z" fill="#fff" {...OUT} strokeWidth={2.2} />
      <rect x={-12} y={-13} width={24} height={6} rx={2} fill="#8a5a3b" {...OUT} strokeWidth={2} />
      <rect x={-9} y={0} width={18} height={6} fill="#c9a07a" />
    </g>
  ),
  chai: (
    <g>
      <path d="M-9 -6 L9 -6 L7 12 L-7 12 Z" fill="#E9C9A0" {...OUT} strokeWidth={2.2} />
      <path d="M-4 -10 Q-2 -14 -4 -18 M3 -10 Q5 -14 3 -18" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  ott: (
    <g>
      <rect x={-15} y={-11} width={30} height={20} rx={3} fill="#1d3a2c" {...OUT} strokeWidth={2.2} />
      <path d="M-3 -5 L5 -1 L-3 3 Z" fill="#D2342B" />
      <path d="M-6 13 L6 13" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  ),
  bag: (
    <g>
      <path d="M-6 -8 Q-6 -16 0 -16 Q6 -16 6 -8" fill="none" stroke={INK} strokeWidth={2.4} />
      <path d="M-12 -8 L12 -8 L14 13 L-14 13 Z" fill="#E0458C" {...OUT} strokeWidth={2.2} />
    </g>
  ),
  sneaker: (
    <g>
      <path d="M-15 6 L-15 -6 Q-8 -6 -4 -2 L8 2 Q15 4 15 8 L15 10 L-15 10 Z" fill="#fff" {...OUT} strokeWidth={2.2} />
      <path d="M-15 10 L15 10" stroke={INK} strokeWidth={3} />
      <path d="M-7 -3 L-3 1 M-3 -4 L1 0" stroke="#3b9be0" strokeWidth={1.8} />
    </g>
  ),
};

/** A small icon on a round white badge: mess, bus, recharge, cafe, chai, ott, bag, sneaker. */
export function Icon({ name }: { name: string }) {
  return (
    <g>
      <circle r={22} fill="#fff" {...OUT} strokeWidth={2.4} />
      {ICONS[name]}
    </g>
  );
}

/** A number the engine counts up or down (data-count). */
export function Counter({ value, size = 30, color = INK, format = "rupee" }: { value: number; size?: number; color?: string; format?: string }) {
  return (
    <text
      data-count={format}
      textAnchor="middle"
      y={size * 0.35}
      fontSize={size}
      fontWeight={800}
      fill={color}
      fontFamily={FONT}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {formatCount(value, format)}
    </text>
  );
}

export function formatCount(value: number, format: string) {
  const n = Math.round(value);
  if (format === "percent") return `${n}%`;
  if (format === "plain") return n.toLocaleString("en-IN");
  return `₹${n.toLocaleString("en-IN")}`;
}

export function Label({ text, size = 14, color = INK, pill }: { text: string; size?: number; color?: string; pill?: string }) {
  const w = text.length * size * 0.62 + 16;
  return (
    <g>
      {pill && <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.95} fill={pill} {...OUT} strokeWidth={2} />}
      <text textAnchor="middle" y={size * 0.35} fontSize={size} fontWeight={800} fill={color} fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
}

// Small drawn icons for recap cards (emoji like 🫙 don't exist on older phones).
const CARD_ICONS: Record<string, React.ReactNode> = {
  jar: (
    <g>
      <rect x={-6} y={-12} width={12} height={4} rx={1.5} fill="#fff" stroke={INK} strokeWidth={1.8} />
      <rect x={-9} y={-8} width={18} height={20} rx={5} fill="#fff" stroke={INK} strokeWidth={2} />
      <rect x={-7} y={0} width={14} height={10} rx={3} fill={GOLD} />
    </g>
  ),
  lock: (
    <g transform="scale(0.75)">
      <Lock />
    </g>
  ),
  drop: <path d="M0 -12 Q9 0 9 5 A9 9 0 0 1 -9 5 Q-9 0 0 -12 Z" fill="#7cc3e8" stroke={INK} strokeWidth={2} strokeLinejoin="round" />,
};

/** A recap card: an icon and a few words, with the chunky 3D edge of the buddy bubble. */
export function Card({ icon, text }: { icon: string; text: string }) {
  return (
    <g>
      <rect x={-126} y={-29} width={260} height={66} rx={18} fill={INK} />
      <rect x={-130} y={-33} width={260} height={66} rx={18} fill="#fff" {...OUT} strokeWidth={2.6} />
      <circle cx={-98} cy={0} r={20} fill={CREAM} {...OUT} strokeWidth={2.2} />
      <g transform="translate(-98 0)">
        {CARD_ICONS[icon] ?? (MORE_ICONS[icon] ? <g transform="scale(0.95)">{MORE_ICONS[icon]}</g> : null) ?? (
          <text y={8} textAnchor="middle" fontSize={22}>
            {icon}
          </text>
        )}
      </g>
      <text x={-68} y={6} fontSize={fit(text, 17, 186)} fontWeight={800} fill={INK} fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
}

export function Sparkle({ color = GOLD }: { color?: string }) {
  return <path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill={color} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
}
