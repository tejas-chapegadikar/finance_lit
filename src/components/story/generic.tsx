import { useId } from "react";

// Shared story props used by more than one lesson: boxes and signs, a big
// phone screen, a score dial and needle, sideways bars, a coin tree, a line
// chart that draws itself, arrows, stamps, and a library of small icons.
// Animated parts are marked for the engine: data-fill (+ data-axis="x" for
// sideways), and the needle turns as a whole actor.

const INK = "#0F1F18";
const GOLD = "#FFB81F";
const CREAM = "#F5EFE3";
const OUT = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const FONT = "var(--font-display), Poppins, sans-serif";

/** A font size that keeps a line of bold text inside `width` (about 0.6 em per character). */
export const fit = (text: string, size: number, width: number) => Math.min(size, width / (Math.max(text.length, 1) * 0.6));

/** A rounded box with up to a few lines of text ("Line one|Line two"). Signs, slips, boards, labels. */
export function Box({
  text,
  w = 160,
  h = 56,
  fill = "#fff",
  color = INK,
  size = 15,
  depth = true,
}: {
  text: string;
  w?: number;
  h?: number;
  fill?: string;
  color?: string;
  size?: number;
  depth?: boolean;
}) {
  const lines = text.split("|");
  const lh = size * 1.25;
  const top = -((lines.length - 1) * lh) / 2 + size * 0.36;
  return (
    <g>
      {depth && <rect x={-w / 2 + 4} y={-h / 2 + 4} width={w} height={h} rx={14} fill={INK} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={fill} {...OUT} strokeWidth={2.6} />
      {lines.map((line, i) => (
        <text key={i} x={0} y={top + i * lh} textAnchor="middle" fontSize={fit(line, size, w - 18)} fontWeight={800} fill={color} fontFamily={FONT}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** A big phone with a screen: a title, a few lines, and a button. */
export function Screen({
  title,
  text = "",
  button,
  buttonColor = "#D2342B",
  tone = "#fff",
}: {
  title: string;
  text?: string;
  button?: string;
  buttonColor?: string;
  tone?: string;
}) {
  const lines = text ? text.split("|") : [];
  return (
    <g>
      <rect x={-62} y={-104} width={124} height={208} rx={18} fill="#1d3a2c" {...OUT} />
      <rect x={-54} y={-92} width={108} height={180} rx={8} fill={tone} />
      <rect x={-54} y={-92} width={108} height={30} rx={8} fill={GOLD} />
      <rect x={-54} y={-72} width={108} height={10} fill={GOLD} />
      <text x={0} y={-71} textAnchor="middle" fontSize={fit(title, 11.5, 100)} fontWeight={800} fill={INK} fontFamily={FONT}>
        {title}
      </text>
      {lines.map((line, i) => (
        <text key={i} x={0} y={-36 + i * 20} textAnchor="middle" fontSize={fit(line, i === 0 ? 17 : 12, 98)} fontWeight={800} fill={INK} fontFamily={FONT}>
          {line}
        </text>
      ))}
      {button && (
        <g>
          <rect x={-42} y={46} width={84} height={28} rx={14} fill={buttonColor} {...OUT} strokeWidth={2} />
          <text x={0} y={65} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily={FONT}>
            {button}
          </text>
        </g>
      )}
    </g>
  );
}

/** A score dial (semicircle), with optional end labels. The needle is a separate actor. */
export function Gauge({ min = "300", max = "900", r = 78 }: { min?: string; max?: string; r?: number }) {
  const arc = (from: number, to: number) => {
    const p = (a: number) => [Math.cos(Math.PI * (1 - a)) * r, -Math.sin(Math.PI * (1 - a)) * r];
    const [x1, y1] = p(from);
    const [x2, y2] = p(to);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  return (
    <g>
      <path d={arc(0, 1)} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d={arc(0, 0.34)} fill="none" stroke="#E0453B" strokeWidth={20} />
      <path d={arc(0.34, 0.66)} fill="none" stroke={GOLD} strokeWidth={20} />
      <path d={arc(0.66, 1)} fill="none" stroke="#5FA35A" strokeWidth={20} />
      <text x={-r} y={24} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} fontFamily={FONT}>
        {min}
      </text>
      <text x={r} y={24} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} fontFamily={FONT}>
        {max}
      </text>
      <circle r={9} fill={INK} />
    </g>
  );
}

/** The dial's needle, pivoting at its bottom (0, 0). Turn it with "rotate" (-90 left … 90 right). */
export function Needle({ length = 66 }: { length?: number }) {
  return (
    <g>
      <path d={`M-5 0 L0 ${-length} L5 0 Z`} fill={INK} />
      <circle r={6} fill={GOLD} stroke={INK} strokeWidth={2} />
    </g>
  );
}

/** A sideways bar that fills from the left (data-fill, axis x). */
export function Bar({ w = 200, h = 22, color = GOLD, fill = 0, track = "#fff" }: { w?: number; h?: number; color?: string; fill?: number; track?: string }) {
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={track} {...OUT} strokeWidth={2.4} />
      <rect
        data-fill
        data-axis="x"
        x={-w / 2 + 3}
        y={-h / 2 + 3}
        width={w - 6}
        height={h - 6}
        rx={(h - 6) / 2}
        fill={color}
        transform={`translate(${-w / 2 + 3} 0) scale(${Math.max(fill, 0.0001)} 1) translate(${w / 2 - 3} 0)`}
      />
    </g>
  );
}

/** A money tree (grow it with scale); coins are separate actors. */
export function Tree({ leaf = "#5FA35A" }: { leaf?: string }) {
  return (
    <g>
      <path d="M-8 0 L-6 -70 L6 -70 L8 0 Z" fill="#8a5a3b" {...OUT} />
      <circle cx={0} cy={-104} r={46} fill={leaf} {...OUT} />
      <circle cx={-30} cy={-82} r={26} fill={leaf} {...OUT} />
      <circle cx={30} cy={-82} r={26} fill={leaf} {...OUT} />
      <path d="M-14 -120 Q-6 -130 4 -126" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

/** A line chart in a frame that draws itself left to right (data-fill, axis x). Points: "x,y x,y ..." in a 200 × 100 box. */
export function Chart({ points, color = "#5FA35A", w = 200, h = 110 }: { points: string; color?: string; w?: number; h?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={12} fill="#fff" {...OUT} strokeWidth={2.4} />
      <defs>
        <clipPath id={`chart-${id}`}>
          <rect
            data-fill
            data-axis="x"
            x={-w / 2}
            y={-h / 2 - 4}
            width={w}
            height={h + 8}
            transform={`translate(${-w / 2} 0) scale(0.0001 1) translate(${w / 2} 0)`}
          />
        </clipPath>
      </defs>
      <path d={`M${-w / 2} ${h / 2} L${w / 2} ${h / 2}`} stroke={INK} strokeOpacity={0.3} strokeWidth={2} />
      <polyline
        clipPath={`url(#chart-${id})`}
        points={points
          .split(" ")
          .map((p) => {
            const [x, y] = p.split(",").map(Number);
            return `${-w / 2 + (x / 200) * w},${-h / 2 + (y / 100) * h}`;
          })
          .join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Arrow({ length = 80, color = INK }: { length?: number; color?: string }) {
  return (
    <g>
      <path d={`M${-length / 2} 0 L${length / 2 - 10} 0`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${length / 2 - 14} -11 L${length / 2} 0 L${length / 2 - 14} 11 Z`} fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
}

/** A rubber stamp: "REJECTED", "APPROVED", "SCAM"... */
export function Stamp({ text, color = "#D2342B" }: { text: string; color?: string }) {
  const w = text.length * 13 + 26;
  return (
    <g transform="rotate(-10)">
      <rect x={-w / 2} y={-22} width={w} height={44} rx={8} fill="#fff" fillOpacity={0.9} stroke={color} strokeWidth={4} />
      <text x={0} y={8} textAnchor="middle" fontSize={22} fontWeight={900} fill={color} fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
}

const S = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Small icons for every story. All fit inside a 30 × 30 box centred on (0, 0). */
export const MORE_ICONS: Record<string, React.ReactNode> = {
  laptop: (
    <g>
      <rect x={-12} y={-11} width={24} height={16} rx={2} fill="#bfe3e0" {...S} />
      <path d="M-15 8 L15 8 L13 11 L-13 11 Z" fill="#9aa9b8" {...S} />
    </g>
  ),
  brokenlaptop: (
    <g>
      <rect x={-12} y={-11} width={24} height={16} rx={2} fill="#9aa9b8" {...S} />
      <path d="M-4 -11 L0 -4 L-3 0 L2 5" fill="none" stroke="#D2342B" strokeWidth={2} />
      <path d="M-15 8 L15 8 L13 11 L-13 11 Z" fill="#9aa9b8" {...S} />
    </g>
  ),
  medical: (
    <g>
      <rect x={-12} y={-12} width={24} height={24} rx={5} fill="#fff" {...S} />
      <path d="M-3 -7 L3 -7 L3 -3 L7 -3 L7 3 L3 3 L3 7 L-3 7 L-3 3 L-7 3 L-7 -3 L-3 -3 Z" fill="#E0453B" />
    </g>
  ),
  watch: (
    <g>
      <rect x={-5} y={-14} width={10} height={28} rx={3} fill="#5f6b78" {...S} />
      <rect x={-9} y={-9} width={18} height={18} rx={5} fill="#1d3a2c" {...S} />
      <path d="M0 -4 L0 0 L3 2" stroke="#9ed2c6" strokeWidth={1.8} fill="none" />
    </g>
  ),
  sale: (
    <g>
      <path d="M-13 -6 L-2 -13 L13 -13 L13 13 L-2 13 L-13 6 Z" fill="#E0458C" {...S} />
      <text x={2} y={4} textAnchor="middle" fontSize={8} fontWeight={900} fill="#fff" fontFamily={FONT}>
        SALE
      </text>
    </g>
  ),
  qr: (
    <g>
      <rect x={-12} y={-12} width={24} height={24} rx={2} fill="#fff" {...S} />
      {[
        [-9, -9],
        [3, -9],
        [-9, 3],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width={6} height={6} fill={INK} />
      ))}
      <rect x={4} y={4} width={3} height={3} fill={INK} />
      <rect x={8} y={8} width={2} height={2} fill={INK} />
    </g>
  ),
  pin: (
    <g>
      <rect x={-13} y={-9} width={26} height={18} rx={4} fill="#fff" {...S} />
      {[-7, -2, 3, 8].map((x) => (
        <circle key={x} cx={x} cy={0} r={2} fill={INK} />
      ))}
    </g>
  ),
  otp: (
    <g>
      <path d="M-13 -9 L13 -9 L13 7 L-2 7 L-7 12 L-7 7 L-13 7 Z" fill="#fff" {...S} />
      <text x={0} y={2} textAnchor="middle" fontSize={8} fontWeight={900} fill={INK} fontFamily={FONT}>
        OTP
      </text>
    </g>
  ),
  shield: <path d="M0 -13 L11 -8 L11 1 Q11 9 0 13 Q-11 9 -11 1 L-11 -8 Z" fill="#5FA35A" {...S} />,
  warn: (
    <g>
      <path d="M0 -13 L13 11 L-13 11 Z" fill={GOLD} {...S} />
      <path d="M0 -4 L0 3" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={0} cy={7} r={1.4} fill={INK} />
    </g>
  ),
  check: (
    <g>
      <circle r={13} fill="#5FA35A" {...S} />
      <path d="M-6 0 L-2 5 L7 -5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  cross: (
    <g>
      <circle r={13} fill="#E0453B" {...S} />
      <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  bike: (
    <g fill="none" stroke={INK} strokeWidth={2.2}>
      <circle cx={-8} cy={5} r={6} />
      <circle cx={8} cy={5} r={6} />
      <path d="M-8 5 L-2 -5 L6 -5 L8 5 M-2 -5 L-4 -9 M6 -5 L9 -9" />
    </g>
  ),
  tv: (
    <g>
      <rect x={-14} y={-10} width={28} height={18} rx={3} fill="#1d3a2c" {...S} />
      <path d="M-10 4 L-4 -2 L1 1 L9 -6" fill="none" stroke="#E0453B" strokeWidth={2} />
      <path d="M-5 12 L5 12" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  ),
  thali: (
    <g>
      <ellipse rx={14} ry={10} fill="#d9dde3" {...S} />
      <circle cx={-6} cy={-2} r={4} fill="#E7A543" stroke={INK} strokeWidth={1.2} />
      <circle cx={4} cy={-3} r={4} fill="#7FB069" stroke={INK} strokeWidth={1.2} />
      <circle cx={0} cy={5} r={4} fill="#F3E1B6" stroke={INK} strokeWidth={1.2} />
    </g>
  ),
  basket: (
    <g>
      <path d="M-13 -2 L13 -2 L10 12 L-10 12 Z" fill="#d9b48a" {...S} />
      <circle cx={-5} cy={-5} r={4} fill="#E0453B" stroke={INK} strokeWidth={1.2} />
      <rect x={1} y={-11} width={6} height={9} rx={1} fill="#9ed2c6" stroke={INK} strokeWidth={1.2} />
      <path d="M-9 -2 Q0 -16 9 -2" fill="none" {...S} />
    </g>
  ),
  building: (
    <g>
      <rect x={-11} y={-13} width={22} height={26} fill="#c9cfd6" {...S} />
      {[-7, 1].map((x) => [-8, -1, 6].map((y) => <rect key={`${x}${y}`} x={x} y={y} width={5} height={4} fill="#fff" />))}
    </g>
  ),
  doc: (
    <g>
      <path d="M-10 -13 L5 -13 L10 -8 L10 13 L-10 13 Z" fill="#fff" {...S} />
      {[-5, 0, 5].map((y) => (
        <path key={y} d={`M-6 ${y} L6 ${y}`} stroke={INK} strokeWidth={1.6} opacity={0.6} />
      ))}
    </g>
  ),
  clock: (
    <g>
      <circle r={13} fill="#fff" {...S} />
      <path d="M0 -7 L0 0 L5 3" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  ),
  plant: (
    <g>
      <path d="M-8 4 L8 4 L6 13 L-6 13 Z" fill="#c98b5e" {...S} />
      <path d="M0 4 Q-10 -4 -6 -12 Q2 -8 0 4 Q6 -10 12 -8 Q10 0 0 4" fill="#5FA35A" {...S} />
    </g>
  ),
  vault: (
    <g>
      <rect x={-13} y={-12} width={26} height={24} rx={3} fill="#9aa9b8" {...S} />
      <circle r={6} fill="#d9dde3" {...S} />
      <path d="M0 -3 L0 3 M-3 0 L3 0" stroke={INK} strokeWidth={1.6} />
    </g>
  ),
  call: <path d="M-10 -10 Q-12 -2 -4 6 Q4 14 12 10 L10 4 L4 4 L1 7 Q-5 3 -7 -3 L-4 -6 L-4 -12 Z" fill="#5FA35A" {...S} />,
  contacts: (
    <g>
      <rect x={-11} y={-13} width={22} height={26} rx={3} fill="#fff" {...S} />
      <circle cx={0} cy={-3} r={4} fill="#9ed2c6" stroke={INK} strokeWidth={1.4} />
      <path d="M-6 8 Q0 1 6 8" fill="none" stroke={INK} strokeWidth={1.6} />
    </g>
  ),
  gallery: (
    <g>
      <rect x={-13} y={-10} width={26} height={20} rx={3} fill="#fff" {...S} />
      <path d="M-10 7 L-3 -1 L2 4 L6 0 L10 7 Z" fill="#7cc3e8" />
      <circle cx={6} cy={-5} r={2.4} fill={GOLD} />
    </g>
  ),
  tax: (
    <g>
      <rect x={-12} y={-12} width={24} height={24} rx={4} fill="#fff" {...S} />
      <text x={0} y={4} textAnchor="middle" fontSize={9} fontWeight={900} fill="#D2342B" fontFamily={FONT}>
        TAX
      </text>
    </g>
  ),
  plane: <path d="M-13 1 L-2 -2 L4 -12 L7 -12 L5 -2 L12 -1 L13 2 L5 3 L6 12 L3 12 L-2 4 L-13 3 Z" fill="#7cc3e8" {...S} />,
  hospital: (
    <g>
      <rect x={-12} y={-11} width={24} height={23} fill="#fff" {...S} />
      <path d="M-2 -6 L2 -6 L2 -2 L6 -2 L6 2 L2 2 L2 6 L-2 6 L-2 2 L-6 2 L-6 -2 L-2 -2 Z" fill="#E0453B" />
    </g>
  ),
  chai: (
    <g>
      <path d="M-8 -6 L8 -6 L6 12 L-6 12 Z" fill="#E9C9A0" {...S} />
      <path d="M-3 -10 Q-1 -14 -3 -18 M3 -10 Q5 -14 3 -18" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  rupee: (
    <g>
      <circle r={13} fill={GOLD} {...S} />
      <text x={0} y={5} textAnchor="middle" fontSize={14} fontWeight={900} fill={INK} fontFamily={FONT}>
        ₹
      </text>
    </g>
  ),
  card: (
    <g>
      <rect x={-14} y={-9} width={28} height={18} rx={3} fill="#3f6fb5" {...S} />
      <rect x={-14} y={-5} width={28} height={4} fill={INK} />
      <rect x={-10} y={3} width={8} height={3} rx={1} fill={GOLD} />
    </g>
  ),
  atm: (
    <g>
      <rect x={-12} y={-13} width={24} height={26} rx={3} fill="#c9cfd6" {...S} />
      <rect x={-8} y={-9} width={16} height={8} fill="#bfe3e0" />
      <rect x={-6} y={4} width={12} height={3} fill={INK} />
    </g>
  ),
  piggy: (
    <g>
      <ellipse rx={13} ry={10} fill="#F4A3B4" {...S} />
      <circle cx={-6} cy={-2} r={1.4} fill={INK} />
      <rect x={-3} y={-12} width={7} height={2.4} rx={1} fill={INK} />
    </g>
  ),
  weed: <path d="M0 13 Q-4 0 -12 -6 M0 13 Q2 -2 10 -10 M0 13 Q0 0 0 -12" fill="none" stroke="#7a4b2a" strokeWidth={3} strokeLinecap="round" />,
  dumbbell: (
    <g>
      <rect x={-10} y={-2} width={20} height={4} fill="#5f6b78" />
      <rect x={-14} y={-8} width={6} height={16} rx={2} fill={INK} />
      <rect x={8} y={-8} width={6} height={16} rx={2} fill={INK} />
    </g>
  ),
  bat: (
    <g transform="rotate(-30)">
      <rect x={-4} y={-14} width={8} height={20} rx={3} fill="#e8d9a8" {...S} />
      <rect x={-1.5} y={6} width={3} height={8} fill="#8a5a3b" />
    </g>
  ),
  idcard: (
    <g>
      <rect x={-13} y={-9} width={26} height={18} rx={3} fill="#fff" {...S} />
      <circle cx={-6} cy={-1} r={4} fill="#9ed2c6" stroke={INK} strokeWidth={1.2} />
      <path d="M1 -3 L9 -3 M1 2 L7 2" stroke={INK} strokeWidth={1.6} />
    </g>
  ),
};

/** An icon on a round badge (for icons from MORE_ICONS); ring "none" draws the icon alone. */
export function Badge({ name, ring = "#fff" }: { name: string; ring?: string }) {
  if (ring === "none") return <g>{MORE_ICONS[name]}</g>;
  return (
    <g>
      <circle r={22} fill={ring} {...OUT} strokeWidth={2.4} />
      {MORE_ICONS[name]}
    </g>
  );
}

export { CREAM };
