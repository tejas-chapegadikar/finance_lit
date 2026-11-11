import { useId } from "react";
import type { AvatarConfig } from "@/lib/avatar";

// The student's avatar: a soft, rounded, 3D-style character drawn as layered
// SVG, a radial-gradient body lit from the top left, a soft ground shadow,
// stubby arms and legs, and clothes clipped to the body's outline so they
// always fit. Gradients are namespaced with useId, so any number of avatars
// can share a page. Works in server and client components.
//
// `expression` (for reactions) temporarily overrides the face and arms;
// without it the avatar wears the face the student chose in Avatar Studio.

export type Expression =
  "happy" | "excited" | "shocked" | "confused" | "sad" | "proud" | "thinking" | "celebrating" | "facepalm" | "sleepy" | "welcoming" | "smirk";

export const EXPRESSIONS: { id: Expression; label: string }[] = [
  { id: "happy", label: "Happy" },
  { id: "excited", label: "Excited" },
  { id: "shocked", label: "Shocked" },
  { id: "confused", label: "Confused" },
  { id: "sad", label: "Sad" },
  { id: "proud", label: "Proud" },
  { id: "thinking", label: "Thinking" },
  { id: "celebrating", label: "Celebrating" },
  { id: "facepalm", label: "Facepalm" },
  { id: "sleepy", label: "Sleepy" },
  { id: "welcoming", label: "Waving" },
  { id: "smirk", label: "Smirk" },
];

type Eyes = "brow" | "dot" | "happy" | "wink" | "calm" | "sparkle" | "wide" | "sad" | "closed" | "up" | "sleepy";
type Mouth = "smile" | "grin" | "smirk" | "small" | "tongue" | "o" | "frown" | "squiggle" | "flat" | "open";
type Pose = "rest" | "up" | "wave" | "chin" | "face";
type Extra = "sparkles" | "sweat" | "question" | "tear" | "zzz" | "confetti" | "star";

const LOOK: Record<Expression, { eyes: Eyes; mouth: Mouth; pose: Pose; extras: Extra[] }> = {
  happy: { eyes: "happy", mouth: "grin", pose: "rest", extras: [] },
  excited: { eyes: "sparkle", mouth: "open", pose: "up", extras: ["sparkles"] },
  shocked: { eyes: "wide", mouth: "o", pose: "rest", extras: ["sweat"] },
  confused: { eyes: "dot", mouth: "squiggle", pose: "chin", extras: ["question"] },
  sad: { eyes: "sad", mouth: "frown", pose: "rest", extras: ["tear"] },
  proud: { eyes: "happy", mouth: "smile", pose: "rest", extras: ["star"] },
  thinking: { eyes: "up", mouth: "flat", pose: "chin", extras: [] },
  celebrating: { eyes: "happy", mouth: "open", pose: "up", extras: ["confetti"] },
  facepalm: { eyes: "closed", mouth: "flat", pose: "face", extras: [] },
  sleepy: { eyes: "sleepy", mouth: "small", pose: "rest", extras: ["zzz"] },
  welcoming: { eyes: "happy", mouth: "smile", pose: "wave", extras: [] },
  smirk: { eyes: "brow", mouth: "smirk", pose: "rest", extras: [] },
};

const EYES_FOR: Record<string, Eyes> = { "eyes-classic": "dot", "eyes-happy": "happy", "eyes-wink": "wink", "eyes-calm": "calm", "eyes-sparkle": "sparkle" };
const MOUTH_FOR: Record<string, Mouth> = {
  "mouth-smile": "smile",
  "mouth-grin": "grin",
  "mouth-smirk": "smirk",
  "mouth-small": "small",
  "mouth-tongue": "tongue",
};

// Body colours: a light, a base and a shade, for the 3D look.
const BODY: Record<string, { light: string; base: string; shade: string }> = {
  "skin-1": { light: "#ffffff", base: "#f6f5fb", shade: "#d9d5e6" },
  "skin-2": { light: "#fffdf8", base: "#fbf1e1", shade: "#e3cfae" },
  "skin-3": { light: "#ffffff", base: "#f9ecec", shade: "#e2c4c6" },
  "skin-4": { light: "#fff6ef", base: "#ffdcc6", shade: "#eeae8c" },
  "skin-5": { light: "#f6fffb", base: "#d9f5e8", shade: "#9fd8bd" },
  "skin-6": { light: "#fbf9ff", base: "#e6e0ff", shade: "#b9acf0" },
};

const TUFT: Record<string, string> = {
  "hc-black": "#25222c",
  "hc-darkbrown": "#4a2e1c",
  "hc-brown": "#7a4b2a",
  "hc-auburn": "#9a3f1f",
  "hc-blue": "#2f6fe4",
  "hc-pink": "#e0458c",
};

type Top = {
  body: string;
  sleeve?: string;
  long?: boolean;
  trim?: string;
  kind: "tee" | "hoodie" | "jacket" | "shirt" | "kurta" | "blazer" | "gown" | "varsity" | "tracksuit";
};

const TOPS: Record<string, Top> = {
  "top-tee-sky": { kind: "tee", body: "#3b9be0" },
  "top-tee-white": { kind: "tee", body: "#fbfbfe", trim: "#d6d3e2" },
  "top-tee-five": { kind: "tee", body: "#6d54ea", trim: "#ffd166" },
  "top-kurta": { kind: "kurta", body: "#f2e0bd", long: true, trim: "#c9a15c" },
  "top-shirt-check": { kind: "shirt", body: "#cfe3fb", trim: "#7aa9e0" },
  "top-hoodie-orange": { kind: "hoodie", body: "#f2762e", long: true, trim: "#d2591a" },
  "top-hoodie-navy": { kind: "hoodie", body: "#1f3f6e", long: true, trim: "#142c50" },
  "top-hoodie-flame": { kind: "hoodie", body: "#e03b3b", long: true, trim: "#ffb02e" },
  "top-jacket-denim": { kind: "jacket", body: "#4f7fbf", long: true, trim: "#fbfbfe" },
  "top-blazer-gold": { kind: "blazer", body: "#d9a520", long: true, trim: "#9c7410" },
  "top-varsity": { kind: "varsity", body: "#155fa8", sleeve: "#f7f7fb", long: true, trim: "#f7f7fb" },
  "top-tracksuit": { kind: "tracksuit", body: "#6d54ea", long: true, trim: "#ffffff" },
  "top-gown": { kind: "gown", body: "#252338", long: true, trim: "#f2b630" },
};

// The body outline: a soft egg, a little wider at the bottom.
const BODY_PATH =
  "M100 26 C136 26 147 58 150 90 C154 118 171 146 167 170 C162 194 132 200 100 200 C68 200 38 194 33 170 C29 146 46 118 50 90 C53 58 64 26 100 26 Z";

const ARMS: Record<Pose, { left: string; right: string }> = {
  rest: { left: "50,126 34,150 32,164", right: "150,126 168,144 156,162" },
  up: { left: "52,118 36,96 30,78", right: "148,118 164,96 170,78" },
  wave: { left: "52,118 32,98 28,80", right: "148,124 164,142 152,160" },
  chin: { left: "52,124 38,148 36,162", right: "148,124 136,118 118,104" },
  face: { left: "52,124 38,148 36,162", right: "148,122 132,100 114,76" },
};

function star(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const INK = "#2a2533";

function Eye({ kind, cx, cy, side }: { kind: Eyes; cx: number; cy: number; side: "l" | "r" }) {
  switch (kind) {
    case "brow":
      // One eyebrow up (left), the other eye half-shut under a flat brow.
      return side === "l" ? (
        <g>
          <ellipse cx={cx} cy={cy} rx={4} ry={5.5} fill={INK} />
          <path d={`M${cx - 7} ${cy - 10} Q${cx} ${cy - 17} ${cx + 7} ${cy - 11}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d={`M${cx - 6} ${cy + 1} L${cx + 6} ${cy + 1}`} stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
          <path d={`M${cx - 7} ${cy - 7} L${cx + 7} ${cy - 8}`} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      );
    case "dot":
      return <ellipse cx={cx} cy={cy} rx={4} ry={5.5} fill={INK} />;
    case "happy":
      return <path d={`M${cx - 6} ${cy + 2} Q${cx} ${cy - 6} ${cx + 6} ${cy + 2}`} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    case "wink":
      return side === "l" ? (
        <ellipse cx={cx} cy={cy} rx={4} ry={5.5} fill={INK} />
      ) : (
        <path d={`M${cx - 6} ${cy} Q${cx} ${cy + 4} ${cx + 6} ${cy}`} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      );
    case "calm":
      return <path d={`M${cx - 6} ${cy} L${cx + 6} ${cy}`} stroke={INK} strokeWidth={3.2} strokeLinecap="round" />;
    case "sparkle":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={5.5} ry={6.5} fill={INK} />
          <circle cx={cx - 1.8} cy={cy - 2.4} r={2} fill="white" />
          <circle cx={cx + 2} cy={cy + 2} r={1} fill="white" />
        </g>
      );
    case "wide":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={7} ry={8} fill="white" stroke={INK} strokeWidth={2} />
          <circle cx={cx} cy={cy + 1} r={3} fill={INK} />
        </g>
      );
    case "sad":
      return (
        <g>
          <ellipse cx={cx} cy={cy + 1} rx={3.6} ry={4.6} fill={INK} />
          <path
            d={side === "l" ? `M${cx - 7} ${cy - 6} L${cx + 4} ${cy - 10}` : `M${cx - 4} ${cy - 10} L${cx + 7} ${cy - 6}`}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </g>
      );
    case "closed":
      return <path d={`M${cx - 6} ${cy} Q${cx} ${cy + 5} ${cx + 6} ${cy}`} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    case "up":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={5} ry={6} fill="white" stroke={INK} strokeWidth={1.6} />
          <circle cx={cx + 1.5} cy={cy - 2.5} r={2.6} fill={INK} />
        </g>
      );
    case "sleepy":
      return <path d={`M${cx - 6} ${cy + 1} Q${cx} ${cy + 4} ${cx + 6} ${cy + 1}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />;
  }
}

function MouthShape({ kind }: { kind: Mouth }) {
  switch (kind) {
    case "smile":
      return <path d="M80 86 Q100 102 120 86" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />;
    case "grin":
      return <path d="M82 85 Q100 106 118 85 Z" fill={INK} />;
    case "smirk":
      return <path d="M86 90 Q102 98 118 85" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    case "small":
      return <path d="M93 89 Q100 94 107 89" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case "tongue":
      return (
        <g>
          <path d="M84 86 Q100 102 116 86" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          <path d="M98 94 Q99 104 106 103 Q110 101 108 93 Z" fill="#f07a8c" />
        </g>
      );
    case "o":
      return <ellipse cx={100} cy={92} rx={7} ry={9} fill={INK} />;
    case "frown":
      return <path d="M86 96 Q100 84 114 96" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    case "squiggle":
      return <path d="M84 92 Q90 86 96 92 T108 92 T118 90" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case "flat":
      return <path d="M88 91 L112 91" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />;
    case "open":
      return (
        <g>
          <path d="M80 84 Q100 112 120 84 Z" fill={INK} />
          <path d="M90 99 Q100 106 110 99 Q100 95 90 99 Z" fill="#f07a8c" />
        </g>
      );
  }
}

function Tuft({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "hair-short":
      return <path d="M98 26 C92 14 104 6 110 12 C104 12 100 18 104 26 Z" fill={color} />;
    case "hair-curly":
      return (
        <g fill={color}>
          {[
            [84, 26, 8],
            [96, 20, 9],
            [109, 21, 9],
            [119, 28, 7],
          ].map(([cx, cy, r]) => (
            <circle key={cx} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      );
    case "hair-bun":
      return (
        <g fill={color}>
          <circle cx={100} cy={14} r={11} />
          <ellipse cx={100} cy={26} rx={15} ry={5} />
        </g>
      );
    case "hair-long":
      return <path d="M70 40 C78 18 112 10 132 30 C118 24 98 26 86 40 Z" fill={color} />;
    case "hair-spiky":
      return <path d="M80 30 L86 12 L93 26 L100 6 L107 26 L114 12 L120 30 Z" fill={color} />;
    case "hair-ponytail":
      return (
        <g>
          <path d="M100 24 C100 14 96 8 100 4" stroke="#3f8a4f" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M100 8 C88 2 84 12 98 12 Z M100 8 C112 0 118 10 102 12 Z" fill="#59b36a" />
        </g>
      );
    default:
      return null;
  }
}

function Outfit({ top, clip }: { top: Top; clip: string }) {
  const neck = "M0 118 L74 118 Q100 134 126 118 L200 118 L200 240 L0 240 Z";
  const long = top.kind === "kurta" || top.kind === "gown";
  return (
    <g clipPath={`url(#${clip})`}>
      <path d={neck} fill={top.body} />
      {top.kind === "tee" && top.trim && <path d="M74 118 Q100 134 126 118" stroke={top.trim} strokeWidth={4} fill="none" />}
      {top.kind === "hoodie" && (
        <g>
          <path d="M66 114 Q100 146 134 114" stroke={top.trim} strokeWidth={9} fill="none" strokeLinecap="round" />
          <rect x={78} y={158} width={44} height={22} rx={9} fill={top.trim} opacity={0.55} />
          <path d="M94 128 L92 146 M106 128 L108 146" stroke="#fbfbfe" strokeWidth={2.2} strokeLinecap="round" />
          {top.trim === "#ffb02e" && (
            <path d="M58 200 Q64 176 72 188 Q76 168 86 184 Q92 164 100 182 Q108 164 114 184 Q124 168 128 188 Q136 176 142 200 Z" fill="#ffb02e" />
          )}
        </g>
      )}
      {top.kind === "jacket" && (
        <g>
          <path d="M86 120 L100 150 L114 120 L114 240 L86 240 Z" fill="#fbfbfe" />
          <path d="M86 120 L100 150 L114 120" stroke={top.trim} strokeWidth={1.6} fill="none" opacity={0.6} />
          <path d="M86 120 L86 240 M114 120 L114 240" stroke="#2f5a91" strokeWidth={2.4} />
          <circle cx={78} cy={160} r={2.4} fill="#c9a15c" />
          <circle cx={122} cy={160} r={2.4} fill="#c9a15c" />
        </g>
      )}
      {top.kind === "shirt" && (
        <g>
          {[70, 90, 110, 130].map((x) => (
            <path key={x} d={`M${x} 118 L${x} 240`} stroke={top.trim} strokeWidth={2} opacity={0.5} />
          ))}
          {[138, 158, 178].map((y) => (
            <path key={y} d={`M0 ${y} L200 ${y}`} stroke={top.trim} strokeWidth={2} opacity={0.5} />
          ))}
          <path d="M80 116 L100 132 L94 142 Z M120 116 L100 132 L106 142 Z" fill="#fbfbfe" />
          {[146, 162, 178].map((y) => (
            <circle key={y} cx={100} cy={y} r={2} fill={top.trim} />
          ))}
        </g>
      )}
      {top.kind === "kurta" && (
        <g>
          <path d="M100 126 L100 168" stroke={top.trim} strokeWidth={2.4} />
          {[136, 148, 160].map((y) => (
            <circle key={y} cx={100} cy={y} r={2} fill={top.trim} />
          ))}
          <path d="M74 118 Q100 134 126 118" stroke={top.trim} strokeWidth={3} fill="none" />
        </g>
      )}
      {top.kind === "blazer" && (
        <g>
          <path d="M84 118 L100 166 L116 118 L116 240 L84 240 Z" fill="#fbfbfe" />
          <path d="M76 118 L100 168 L88 128 Z M124 118 L100 168 L112 128 Z" fill={top.trim} />
          <path d="M96 124 L100 132 L104 124 L102 148 L100 152 L98 148 Z" fill="#6d54ea" />
        </g>
      )}
      {top.kind === "varsity" && (
        <g>
          <path d="M74 118 Q100 134 126 118" stroke={top.trim} strokeWidth={5} fill="none" />
          <text x={78} y={162} fontSize={20} fontWeight={800} fill={top.trim} fontFamily="system-ui, sans-serif">
            S
          </text>
          <path d="M0 188 L200 188" stroke={top.trim} strokeWidth={4} />
        </g>
      )}
      {top.kind === "tracksuit" && (
        <g>
          <path d="M100 122 L100 240" stroke="#d8d1ff" strokeWidth={2} />
          <path d="M62 118 L62 240 M138 118 L138 240" stroke={top.trim} strokeWidth={4} />
          <text x={112} y={150} fontSize={11} fontWeight={800} fill={top.trim} fontFamily="system-ui, sans-serif">
            30
          </text>
        </g>
      )}
      {top.kind === "gown" && (
        <g>
          <path d="M60 118 L140 200" stroke={top.trim} strokeWidth={8} />
          <path d="M74 118 Q100 134 126 118" stroke={top.trim} strokeWidth={3} fill="none" />
        </g>
      )}
      {top.kind === "tee" && top.body === "#6d54ea" && (
        <text x={100} y={166} textAnchor="middle" fontSize={26} fontWeight={800} fill={top.trim} fontFamily="system-ui, sans-serif">
          5
        </text>
      )}
      {long && <path d="M0 200 L200 200" stroke="black" strokeOpacity={0.06} strokeWidth={6} />}
    </g>
  );
}

function Headwear({ id }: { id: string }) {
  switch (id) {
    case "hw-cap":
      return (
        <g>
          <path d="M62 44 C66 16 134 16 138 44 Z" fill="#3b9be0" />
          <path d="M134 42 Q160 42 166 50 Q148 52 132 48 Z" fill="#2c7fc0" />
          <circle cx={100} cy={20} r={3.5} fill="#2c7fc0" />
        </g>
      );
    case "hw-beanie":
      return (
        <g>
          <path d="M60 50 C60 14 140 14 140 50 Z" fill="#e0458c" />
          <rect x={56} y={40} width={88} height={14} rx={7} fill="#c2306f" />
          <circle cx={100} cy={14} r={8} fill="#f6a3c8" />
        </g>
      );
    case "hw-headphones":
      return (
        <g>
          <path d="M46 78 C44 22 156 22 154 78" stroke="#2a2533" strokeWidth={7} fill="none" strokeLinecap="round" />
          <rect x={34} y={64} width={20} height={30} rx={9} fill="#6d54ea" />
          <rect x={146} y={64} width={20} height={30} rx={9} fill="#6d54ea" />
        </g>
      );
    case "hw-party":
      return (
        <g>
          <path d="M84 30 L104 -6 L120 30 Z" fill="#ffd166" />
          <path d="M88 22 L114 18 M92 12 L110 9" stroke="#e0458c" strokeWidth={3} strokeLinecap="round" />
          <circle cx={104} cy={-6} r={5} fill="#6d54ea" />
        </g>
      );
    case "hw-gradcap":
      return (
        <g>
          <path d="M60 26 L100 10 L140 26 L100 42 Z" fill="#252338" />
          <rect x={80} y={28} width={40} height={14} rx={3} fill="#252338" />
          <path d="M136 28 L140 52" stroke="#f2b630" strokeWidth={2.6} />
          <circle cx={140} cy={54} r={3.5} fill="#f2b630" />
        </g>
      );
    case "hw-crown":
      return (
        <g>
          <path d="M72 34 L76 10 L88 24 L100 4 L112 24 L124 10 L128 34 Z" fill="#f2b630" stroke="#c98d10" strokeWidth={1.5} />
          <circle cx={100} cy={22} r={3.2} fill="#e0458c" />
        </g>
      );
    default:
      return null;
  }
}

function Glasses({ id }: { id: string }) {
  const frame = "#2a2533";
  switch (id) {
    case "gl-round":
      return (
        <g fill="none" stroke={frame} strokeWidth={2.4}>
          <circle cx={84} cy={72} r={11} />
          <circle cx={116} cy={72} r={11} />
          <path d="M95 72 Q100 68 105 72" />
        </g>
      );
    case "gl-square":
      return (
        <g fill="none" stroke={frame} strokeWidth={2.4}>
          <rect x={72} y={63} width={24} height={18} rx={4} />
          <rect x={104} y={63} width={24} height={18} rx={4} />
          <path d="M96 71 L104 71" />
        </g>
      );
    case "gl-shades":
      return (
        <g>
          <path d="M70 64 L98 64 L96 80 Q84 86 72 78 Z M102 64 L130 64 L128 78 Q116 86 104 80 Z" fill="#1f1c27" />
          <path d="M98 66 L102 66" stroke="#1f1c27" strokeWidth={3} />
          <path d="M76 68 L84 68" stroke="white" strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "gl-star":
      return (
        <g fill="#ffd166" stroke="#e09a1a" strokeWidth={1.2}>
          <polygon points={star(84, 72, 13, 6)} />
          <polygon points={star(116, 72, 13, 6)} />
        </g>
      );
    default:
      return null;
  }
}

function Shoes({ id }: { id: string }) {
  const pair = (fill: string, sole: string, tall = false) => (
    <g>
      {[80, 120].map((cx) => (
        <g key={cx}>
          <path
            d={`M${cx - 17} ${tall ? 198 : 204} Q${cx - 17} ${tall ? 190 : 196} ${cx} ${tall ? 190 : 196} Q${cx + 18} ${tall ? 192 : 198} ${cx + 18} 208 L${cx - 17} 208 Z`}
            fill={fill}
          />
          <rect x={cx - 18} y={206} width={37} height={6} rx={3} fill={sole} />
        </g>
      ))}
    </g>
  );
  switch (id) {
    case "sh-canvas":
      return pair("#fbfbfe", "#d6d3e2");
    case "sh-sneakers":
      return pair("#3b9be0", "#fbfbfe");
    case "sh-hightops":
      return pair("#e03b3b", "#fbfbfe", true);
    case "sh-gold":
      return pair("#f2b630", "#fbfbfe");
    default:
      return null;
  }
}

function Backpack({ id, front }: { id: string; front: boolean }) {
  if (id === "bp-none") return null;
  const color = id === "bp-explorer" ? "#3f8a4f" : "#6d54ea";
  if (!front) return <rect x={140} y={108} width={34} height={60} rx={12} fill={color} opacity={0.95} />;
  return (
    <g stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
      <path d="M66 112 Q70 140 64 166" />
      <path d="M134 112 Q130 140 136 166" />
    </g>
  );
}

function Special({ id, front }: { id: string; front: boolean }) {
  if (id === "sp-cape" && !front) return <path d="M58 104 Q40 170 46 206 L154 206 Q160 170 142 104 Z" fill="#6d54ea" />;
  if (!front) return null;
  switch (id) {
    case "sp-sparkles":
      return (
        <g fill="#ffd166">
          <polygon points={star(30, 50, 8, 3)} />
          <polygon points={star(172, 40, 6, 2.4)} />
          <polygon points={star(178, 120, 7, 2.8)} />
          <polygon points={star(20, 120, 5, 2)} />
        </g>
      );
    case "sp-confetti":
      return (
        <g>
          {[
            [24, 40, "#e0458c"],
            [44, 18, "#ffd166"],
            [160, 20, "#3b9be0"],
            [178, 54, "#59b36a"],
            [18, 90, "#6d54ea"],
            [184, 96, "#e0458c"],
          ].map(([x, y, c]) => (
            <rect
              key={`${x}-${y}`}
              x={x as number}
              y={y as number}
              width={7}
              height={4}
              rx={1}
              fill={c as string}
              transform={`rotate(${(x as number) % 50} ${x} ${y})`}
            />
          ))}
        </g>
      );
    case "sp-medal":
      return (
        <g>
          <path d="M84 114 L100 140 L116 114" stroke="#e0458c" strokeWidth={6} fill="none" />
          <circle cx={100} cy={146} r={11} fill="#f2b630" stroke="#c98d10" strokeWidth={2} />
          <polygon points={star(100, 146, 6, 2.6)} fill="#fff4cc" />
        </g>
      );
    case "sp-trophy":
      return (
        <g>
          <path d="M14 140 L44 140 L41 160 Q29 172 17 160 Z" fill="#f2b630" stroke="#c98d10" strokeWidth={1.5} />
          <rect x={25} y={170} width={8} height={8} fill="#c98d10" />
          <rect x={18} y={178} width={22} height={6} rx={2} fill="#9c7410" />
        </g>
      );
    case "sp-cape":
      return <path d="M66 112 L100 124 L134 112" stroke="#5a43d6" strokeWidth={6} fill="none" strokeLinecap="round" />;
    default:
      return null;
  }
}

function Extras({ extras }: { extras: Extra[] }) {
  return (
    <g>
      {extras.includes("sparkles") && (
        <g fill="#ffd166">
          <polygon points={star(28, 40, 9, 3.4)} />
          <polygon points={star(174, 34, 7, 2.8)} />
          <polygon points={star(182, 112, 6, 2.4)} />
        </g>
      )}
      {extras.includes("star") && <polygon points={star(160, 30, 9, 3.6)} fill="#ffd166" />}
      {extras.includes("sweat") && <path d="M140 46 Q134 58 140 62 Q146 58 140 46 Z" fill="#8fd0ff" stroke="#5aa9e0" strokeWidth={1} />}
      {extras.includes("tear") && <path d="M80 80 Q75 92 80 96 Q85 92 80 80 Z" fill="#8fd0ff" />}
      {extras.includes("question") && (
        <text x={150} y={42} fontSize={30} fontWeight={800} fill="#6d54ea" fontFamily="system-ui, sans-serif">
          ?
        </text>
      )}
      {extras.includes("zzz") && (
        <g fill="#6d54ea" fontWeight={800} fontFamily="system-ui, sans-serif">
          <text x={140} y={40} fontSize={16}>
            z
          </text>
          <text x={154} y={26} fontSize={20}>
            z
          </text>
        </g>
      )}
      {extras.includes("confetti") && (
        <g>
          {[
            [26, 30, "#e0458c"],
            [50, 10, "#ffd166"],
            [154, 8, "#3b9be0"],
            [176, 40, "#59b36a"],
            [14, 76, "#6d54ea"],
            [186, 82, "#e0458c"],
            [100, 0, "#59b36a"],
          ].map(([x, y, c]) => (
            <rect
              key={`${x}-${y}`}
              x={x as number}
              y={y as number}
              width={8}
              height={4}
              rx={1}
              fill={c as string}
              transform={`rotate(${((x as number) * 7) % 90} ${x} ${y})`}
            />
          ))}
        </g>
      )}
    </g>
  );
}

export function Avatar({
  config,
  crop = "full",
  className,
  label,
  expression,
  alive = false,
  gaze,
}: {
  config: AvatarConfig;
  /** "head" shows a close-up of the face; "peek" is the head alone (no body, arms or clothes), for the buddy pop-up. */
  crop?: "full" | "head" | "peek";
  className?: string;
  /** Accessible name; leave out when the avatar is decorative. */
  label?: string;
  /** A reaction's expression, overriding the chosen face for a moment. */
  expression?: Expression;
  /** Blinks now and then (respects reduced motion). */
  alive?: boolean;
  /** Where the eyes look, from -1 to 1 on each axis (e.g. towards the pointer). */
  gaze?: { x: number; y: number };
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bodyId = `av-body-${uid}`;
  const clipId = `av-clip-${uid}`;
  const shineId = `av-shine-${uid}`;
  const colors = BODY[config.skin] ?? BODY["skin-3"];
  const look = expression
    ? LOOK[expression]
    : { eyes: EYES_FOR[config.eyes] ?? "dot", mouth: MOUTH_FOR[config.mouth] ?? "smile", pose: "rest" as Pose, extras: [] as Extra[] };
  const top = TOPS[config.top];
  const armColor = top?.long ? (top.sleeve ?? top.body) : `url(#${bodyId})`;
  const arms = ARMS[look.pose];
  const peek = crop === "peek";
  const viewBox = crop === "head" ? "28 4 144 140" : peek ? "30 -4 140 128" : "0 -12 200 236";

  return (
    <svg viewBox={viewBox} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <radialGradient id={bodyId} gradientUnits="userSpaceOnUse" cx={78} cy={58} r={170}>
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="45%" stopColor={colors.base} />
          <stop offset="100%" stopColor={colors.shade} />
        </radialGradient>
        <radialGradient id={shineId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="white" stopOpacity={0.9} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${bodyId}-fold`} gradientUnits="userSpaceOnUse" cx={78} cy={58} r={175}>
          <stop offset="0%" stopColor="white" stopOpacity={0.22} />
          <stop offset="55%" stopColor="white" stopOpacity={0} />
          <stop offset="100%" stopColor="#1c1430" stopOpacity={0.22} />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      {!peek && (
        <g>
          <ellipse cx={100} cy={214} rx={54} ry={7} fill="#2a1f5c" opacity={0.14} />
          <Special id={config.special} front={false} />
          <Backpack id={config.backpack} front={false} />
          {/* legs */}
          <ellipse cx={80} cy={202} rx={16} ry={11} fill={`url(#${bodyId})`} />
          <ellipse cx={120} cy={202} rx={16} ry={11} fill={`url(#${bodyId})`} />
          <Shoes id={config.shoes} />
        </g>
      )}

      {/* body, belly button and a soft shine */}
      <path d={BODY_PATH} fill={`url(#${bodyId})`} />
      <path d={BODY_PATH} fill="none" stroke={colors.shade} strokeOpacity={0.5} strokeWidth={1} />
      {!top && <path d="M99 158 Q100 161 101 158" stroke={colors.shade} strokeWidth={2} fill="none" strokeLinecap="round" />}
      {top && !peek && <Outfit top={top} clip={clipId} />}
      {top && !peek && <path d={BODY_PATH} fill={`url(#${bodyId}-fold)`} />}
      <ellipse cx={78} cy={52} rx={20} ry={14} fill={`url(#${shineId})`} opacity={0.8} />

      {!peek && <Backpack id={config.backpack} front />}
      {!peek && <Special id={config.special} front />}

      {/* face */}
      {expression !== "facepalm" && (
        <g
          className={alive ? "avatar-blink" : undefined}
          style={{ transformOrigin: "100px 72px", ...(gaze ? { translate: `${(gaze.x * 4).toFixed(1)}px ${(gaze.y * 3).toFixed(1)}px` } : {}) }}
        >
          <Eye kind={look.eyes} cx={84} cy={72} side="l" />
          <Eye kind={look.eyes} cx={116} cy={72} side="r" />
        </g>
      )}
      {expression === "facepalm" && <Eye kind="closed" cx={84} cy={72} side="l" />}
      <MouthShape kind={look.mouth} />
      {(look.eyes === "happy" || look.mouth === "open" || look.mouth === "grin") && (
        <g fill="#f4a3b4" opacity={0.45}>
          <ellipse cx={70} cy={86} rx={7} ry={4} />
          <ellipse cx={130} cy={86} rx={7} ry={4} />
        </g>
      )}
      <Glasses id={config.glasses} />
      <Tuft style={config.hair} color={TUFT[config.hairColor] ?? TUFT["hc-black"]} />
      <Headwear id={config.headwear} />

      {/* arms, in front of the body */}
      {!peek &&
        [arms.left, arms.right].map((points) => (
          <g key={points}>
            <polyline points={points} fill="none" stroke={colors.shade} strokeOpacity={0.35} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={points} fill="none" stroke={armColor} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

      <Extras extras={look.extras} />
    </svg>
  );
}
