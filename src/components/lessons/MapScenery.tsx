import type { MapLayout, MapPoint, SlotKind } from "@/lib/learn/map-layout";

// The Learn map's scenery, drawn in Rupli's colours: cream land with sage
// patches, deep-green trees, a river, one money landmark per level (college,
// bank, piggy bank, office, investing peaks), the start house and the summit
// flag. Decoration only (aria-hidden on the parent SVG). All original shapes.

const C = {
  sage: "#e8efd9",
  sage2: "#dfe9cc",
  leaf: "#2f5d46",
  leaf2: "#3e7356",
  leafHi: "#6e9b6f",
  pine: "#1d3a2c",
  pine2: "#24493a",
  trunk: "#8a6a43",
  cream: "#fbf6e9",
  ink: "#0f1f18",
  ink2: "#1d3a2c",
  gold: "#ffb81f",
  gold2: "#e09a00",
  goldSoft: "#ffdc8a",
  stone: "#cfc6b3",
  stone2: "#b8ae98",
  water: "#bfe3e0",
  water2: "#e6f5f3",
};

// A fixed "random" in [0, 1) per slot, made with whole-number maths so the
// server and every browser get exactly the same trees (Math.sin can differ in
// the last digits, which breaks hydration). Two decimals is plenty.
const rand = (i: number, salt = 0) => {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(salt + 7, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return Math.floor(((h >>> 0) / 4294967296) * 100) / 100;
};

function Tree({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={-6} width={4} height={12} rx={1.5} fill={C.trunk} />
      <circle cy={-16} r={12} fill={tone ? C.leaf2 : C.leaf} />
      <circle cx={-4} cy={-20} r={5} fill={C.leafHi} opacity={0.65} />
    </g>
  );
}

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1.5} y={-4} width={3} height={9} fill={C.trunk} />
      <path d="M0 -26 L12 -4 L-12 -4Z" fill={C.pine} />
      <path d="M0 -36 L9 -16 L-9 -16Z" fill={C.pine2} />
    </g>
  );
}

function Bush({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={-6} r={6} fill={C.leafHi} />
      <circle cx={3} cy={-2} r={8} fill={C.leaf2} />
      <circle cx={11} cy={1} r={5} fill={C.leafHi} />
    </g>
  );
}

function Coins({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cy={-i * 4} rx={7} ry={3} fill={C.gold} stroke={C.gold2} strokeWidth={1} />
      ))}
      <ellipse cx={12} cy={2} rx={6} ry={2.6} fill={C.gold} stroke={C.gold2} strokeWidth={1} />
    </g>
  );
}

function College({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-24} y={-26} width={48} height={26} rx={2} fill={C.cream} stroke={C.ink2} strokeWidth={1.5} />
      <path d="M-28 -26 L0 -42 L28 -26Z" fill={C.ink2} />
      {[-15, -3, 9].map((wx) => (
        <rect key={wx} x={wx} y={-20} width={6} height={8} rx={1} fill={C.goldSoft} />
      ))}
      <rect x={-4} y={-10} width={8} height={10} fill={C.gold} />
      <line x1={0} y1={-42} x2={0} y2={-54} stroke={C.ink} strokeWidth={1.5} />
      <path d="M0 -54 L10 -50 L0 -46Z" fill={C.gold} />
    </g>
  );
}

function Bank({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-26} y={-4} width={52} height={6} fill={C.stone2} />
      <rect x={-22} y={-26} width={44} height={22} fill={C.cream} />
      {[-17, -7, 3, 13].map((cx) => (
        <rect key={cx} x={cx} y={-26} width={4} height={22} fill={C.stone} />
      ))}
      <path d="M-27 -26 L0 -42 L27 -26Z" fill={C.ink2} />
      <text x={0} y={-29} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.gold}>
        ₹
      </text>
    </g>
  );
}

function Piggy({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-12} y={-6} width={5} height={8} rx={2} fill={C.gold2} />
      <rect x={7} y={-6} width={5} height={8} rx={2} fill={C.gold2} />
      <ellipse cy={-16} rx={20} ry={14} fill="#ffc94d" />
      <path d="M-6 -30 L-1 -24 L-10 -24Z" fill={C.gold2} />
      <circle cx={-19} cy={-15} r={5} fill={C.gold2} />
      <circle cx={-8} cy={-19} r={1.6} fill={C.ink} />
      <rect x={-2} y={-31} width={10} height={2.5} rx={1} fill={C.ink} />
      <ellipse cx={3} cy={-40} rx={5} ry={2.4} fill={C.gold} stroke={C.gold2} strokeWidth={1} />
    </g>
  );
}

function Office({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-16} y={-58} width={32} height={58} rx={2} fill={C.cream} stroke={C.ink2} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((r) =>
        [-9, 3].map((cx) => <rect key={`${r}${cx}`} x={cx} y={-52 + r * 10} width={6} height={6} rx={1} fill={r % 2 ? C.goldSoft : C.stone} />),
      )}
      <rect x={18} y={-30} width={16} height={30} rx={2} fill={C.stone} />
      <rect x={22} y={-24} width={8} height={5} fill={C.goldSoft} />
    </g>
  );
}

function Peaks({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-30 0 L-6 -46 L18 0Z" fill={C.stone} />
      <path d="M-6 -46 L4 -27 L-2 -30 L-8 -25 L-14 -30Z" fill="#fff" />
      <path d="M6 0 L24 -32 L42 0Z" fill={C.stone2} />
      <path d="M-26 -8 L-14 -16 L-4 -10 L10 -22" fill="none" stroke={C.gold} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 -22 L4 -21 L9 -16Z" fill={C.gold} />
    </g>
  );
}

function House({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={14} y={-38} width={7} height={12} fill={C.ink2} />
      <rect x={-20} y={-24} width={40} height={24} rx={2} fill={C.cream} stroke={C.ink2} strokeWidth={1.5} />
      <path d="M-25 -22 L0 -42 L25 -22Z" fill={C.ink2} />
      <rect x={-5} y={-13} width={10} height={13} rx={2} fill={C.gold} />
      <rect x={-16} y={-17} width={7} height={7} rx={1} fill={C.goldSoft} />
      <rect x={9} y={-17} width={7} height={7} rx={1} fill={C.goldSoft} />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
      <ellipse rx={18} ry={7} />
      <ellipse cx={-8} cy={-5} rx={9} ry={7} />
      <ellipse cx={6} cy={-7} rx={10} ry={8} />
    </g>
  );
}

const LANDMARKS = [College, Bank, Piggy, Office, Peaks];

/** Which side of the road is free at this point: the far margin from the road. */
const margin = (p: MapPoint) => (p.x >= 180 ? { side: 1, x: 322 } : { side: -1, x: 38 });

export function MapScenery({ layout, kinds }: { layout: MapLayout; kinds: SlotKind[] }) {
  const { points, height, summit } = layout;
  const banners = kinds.flatMap((k, i) => (k === "banner" ? [i] : []));
  const riverAt = banners[1] !== undefined ? points[banners[1]].y + 52 : null;

  return (
    <g>
      <rect width={360} height={height} fill="#f7f2e8" />
      {/* Big soft land patches, one per level */}
      {banners.map((b, n) => {
        const p = points[b];
        return <ellipse key={`land-${b}`} cx={p.x >= 180 ? 70 : 290} cy={p.y - 120} rx={150} ry={170} fill={n % 2 ? C.sage2 : C.sage} />;
      })}
      <ellipse cx={180} cy={height - 20} rx={220} ry={90} fill={C.sage} />
      {/* A river across the second level; the road crosses it like a bridge */}
      {riverAt !== null && (
        <g>
          <path
            d={`M-10 ${riverAt} C 70 ${riverAt - 34}, 120 ${riverAt + 30}, 190 ${riverAt} S 300 ${riverAt - 26}, 370 ${riverAt + 6}`}
            fill="none"
            stroke={C.water}
            strokeWidth={18}
            strokeLinecap="round"
          />
          <path
            d={`M-10 ${riverAt} C 70 ${riverAt - 34}, 120 ${riverAt + 30}, 190 ${riverAt} S 300 ${riverAt - 26}, 370 ${riverAt + 6}`}
            fill="none"
            stroke={C.water2}
            strokeWidth={3}
            strokeDasharray="10 14"
            strokeLinecap="round"
          />
        </g>
      )}
      {/* Summit: peaks, a flag, clouds */}
      <path d={`M60 ${summit.y + 70} L130 ${summit.y - 20} L200 ${summit.y + 70}Z`} fill={C.stone} />
      <path d={`M130 ${summit.y - 20} L146 ${summit.y + 8} L136 ${summit.y + 2} L126 ${summit.y + 10} L116 ${summit.y + 2}Z`} fill="#fff" />
      <path d={`M170 ${summit.y + 70} L240 ${summit.y - 34} L310 ${summit.y + 70}Z`} fill={C.stone2} />
      <path d={`M240 ${summit.y - 34} L257 ${summit.y - 8} L246 ${summit.y - 14} L236 ${summit.y - 6} L224 ${summit.y - 12}Z`} fill="#fff" />
      <line x1={summit.x} y1={summit.y} x2={summit.x} y2={summit.y - 38} stroke={C.ink} strokeWidth={2} />
      <path d={`M${summit.x} ${summit.y - 38} L${summit.x + 22} ${summit.y - 31} L${summit.x} ${summit.y - 24}Z`} fill={C.gold} />
      <Cloud x={48} y={46} s={1.1} />
      <Cloud x={312} y={34} />
      <Cloud x={300} y={summit.y + 110} s={0.8} />
      {/* Trees, bushes and coins beside the road, on whichever side is free */}
      {points.map((p, i) => {
        if (kinds[i] === "banner") return null;
        const m = margin(p);
        const r = rand(i);
        const x = m.x + (rand(i, 1) - 0.5) * 30;
        const y = p.y + 18 + rand(i, 2) * 30;
        return (
          <g key={`flora-${i}`}>
            {r < 0.4 ? (
              <Tree x={x} y={y} s={0.9 + rand(i, 3) * 0.4} tone={i % 2} />
            ) : r < 0.75 ? (
              <Pine x={x} y={y} s={0.9 + rand(i, 3) * 0.4} />
            ) : (
              <Bush x={x - 4} y={y} />
            )}
            {rand(i, 4) > 0.55 && <Tree x={x + m.side * -14} y={y - 34} s={0.7} tone={(i + 1) % 2} />}
            {rand(i, 5) > 0.78 && <Coins x={m.side > 0 ? 300 : 52} y={p.y - 30} />}
          </g>
        );
      })}
      {/* One landmark per level, beside its sign on the side away from the road */}
      {banners.map((b, n) => {
        const Landmark = LANDMARKS[Math.min(n, LANDMARKS.length - 1)];
        const p = points[b];
        return <Landmark key={`mark-${b}`} x={p.x >= 180 ? 50 : 310} y={p.y + 34} />;
      })}
      {points[0] && <House x={points[0].x >= 180 ? 300 : 60} y={points[0].y + 26} />}
    </g>
  );
}
