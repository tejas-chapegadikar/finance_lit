import type { AvatarConfig } from "@/lib/avatar";

// Draws an avatar as flat, layered SVG — no gradients or ids, so any number
// can share a page. Works in server and client components.

const SKIN: Record<string, { base: string; shade: string }> = {
  "skin-1": { base: "#f8dcc8", shade: "#ecc1a6" },
  "skin-2": { base: "#efc39d", shade: "#dfa77d" },
  "skin-3": { base: "#d9a273", shade: "#c48858" },
  "skin-4": { base: "#b87e51", shade: "#a1683e" },
  "skin-5": { base: "#8b5a36", shade: "#754726" },
  "skin-6": { base: "#5e3b24", shade: "#4b2d1a" },
};

const HAIR_COLOR: Record<string, string> = {
  "hc-black": "#1f1a17",
  "hc-darkbrown": "#3b2416",
  "hc-brown": "#6b4226",
  "hc-auburn": "#8a3b1e",
  "hc-blue": "#2563eb",
  "hc-pink": "#db2777",
};

const INK = "#1f2937";
const PANTS = "#28406b";

type Top = { body: string; sleeve: string; long: boolean; length: number; trim?: string };

const TOPS: Record<string, Top> = {
  "top-tee-sky": { body: "#229ad8", sleeve: "#229ad8", long: false, length: 204 },
  "top-tee-white": { body: "#f8fafc", sleeve: "#f8fafc", long: false, length: 204, trim: "#cbd5e1" },
  "top-kurta": { body: "#f4e3c3", sleeve: "#f4e3c3", long: true, length: 222, trim: "#c9a86a" },
  "top-hoodie-orange": { body: "#ea580c", sleeve: "#ea580c", long: true, length: 206, trim: "#c2410c" },
  "top-hoodie-navy": { body: "#14416e", sleeve: "#14416e", long: true, length: 206, trim: "#0c2f52" },
  "top-blazer-gold": { body: "#d4a017", sleeve: "#d4a017", long: true, length: 206, trim: "#a87d0a" },
  "top-hoodie-flame": { body: "#dc2626", sleeve: "#dc2626", long: true, length: 206, trim: "#991b1b" },
  "top-varsity": { body: "#0966a3", sleeve: "#f8fafc", long: true, length: 206, trim: "#f8fafc" },
  "top-gown": { body: "#1e293b", sleeve: "#1e293b", long: true, length: 228, trim: "#f59e0b" },
};

function star(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function BackHair({ style, color }: { style: string; color: string }) {
  if (style === "hair-long") {
    return <path d="M50 80 Q46 18 100 16 Q154 18 150 80 L154 146 Q153 156 142 152 L136 112 L64 112 L58 152 Q47 156 46 146 Z" fill={color} />;
  }
  if (style === "hair-bun") {
    return <circle cx="100" cy="18" r="16" fill={color} />;
  }
  if (style === "hair-ponytail") {
    return <path d="M132 54 Q174 64 166 122 Q162 138 150 130 Q160 96 136 76 Z" fill={color} />;
  }
  return null;
}

function FrontHair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "hair-buzz":
      return <path d="M58 72 Q58 30 100 28 Q142 30 142 72 Q138 50 100 47 Q62 50 58 72 Z" fill={color} />;
    case "hair-long":
      return <path d="M54 94 Q48 22 100 20 Q152 22 146 94 Q142 60 128 48 Q104 60 84 48 Q62 58 54 94 Z" fill={color} />;
    case "hair-curly":
      return (
        <g fill={color}>
          {[
            [62, 62, 15],
            [76, 44, 16],
            [96, 34, 17],
            [116, 36, 17],
            [134, 48, 16],
            [142, 66, 13],
            [57, 80, 10],
            [144, 82, 10],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      );
    case "hair-bun":
    case "hair-ponytail":
      return <path d="M56 74 Q56 26 100 24 Q144 26 144 74 Q134 46 100 44 Q66 46 56 74 Z" fill={color} />;
    case "hair-spiky":
      return <path d="M54 74 L58 38 L70 50 L74 22 L88 40 L100 12 L112 40 L126 22 L130 50 L142 38 L146 74 Q132 50 100 48 Q68 50 54 74 Z" fill={color} />;
    default: // short
      return <path d="M55 76 Q52 24 100 22 Q148 24 145 76 Q140 52 124 47 Q110 58 88 50 Q68 54 55 76 Z" fill={color} />;
  }
}

function Eyes({ style }: { style: string }) {
  const open = (x: number) => (
    <g key={`open-${x}`}>
      <ellipse cx={x} cy="82" rx="5" ry="6.5" fill={INK} />
      <circle cx={x + 2} cy="79" r="1.8" fill="#fff" />
    </g>
  );
  const arc = (x: number, up: boolean) => (
    <path
      key={`arc-${x}`}
      d={up ? `M${x - 6} 84 Q${x} 76 ${x + 6} 84` : `M${x - 6} 81 Q${x} 87 ${x + 6} 81`}
      fill="none"
      stroke={INK}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  );
  if (style === "eyes-happy") return <>{[arc(84, true), arc(116, true)]}</>;
  if (style === "eyes-wink") return <>{[open(84), arc(116, true)]}</>;
  if (style === "eyes-calm") return <>{[arc(84, false), arc(116, false)]}</>;
  return <>{[open(84), open(116)]}</>;
}

function Glasses({ style }: { style: string }) {
  const temples = <path d="M72 80 L57 77 M128 80 L143 77" stroke={INK} strokeWidth="3" strokeLinecap="round" />;
  switch (style) {
    case "gl-round":
      return (
        <g>
          {temples}
          <circle cx="84" cy="82" r="12" fill="#fff" fillOpacity="0.18" stroke={INK} strokeWidth="3" />
          <circle cx="116" cy="82" r="12" fill="#fff" fillOpacity="0.18" stroke={INK} strokeWidth="3" />
          <path d="M96 81 Q100 77 104 81" fill="none" stroke={INK} strokeWidth="3" />
        </g>
      );
    case "gl-square":
      return (
        <g>
          {temples}
          <rect x="71" y="72" width="26" height="20" rx="5" fill="#fff" fillOpacity="0.18" stroke={INK} strokeWidth="3" />
          <rect x="103" y="72" width="26" height="20" rx="5" fill="#fff" fillOpacity="0.18" stroke={INK} strokeWidth="3" />
          <path d="M97 81 L103 81" stroke={INK} strokeWidth="3" />
        </g>
      );
    case "gl-shades":
      return (
        <g>
          {temples}
          <path d="M70 74 L98 74 L96 88 Q95 94 88 94 L78 94 Q71 94 70 88 Z" fill="#0f172a" />
          <path d="M102 74 L130 74 L130 88 Q129 94 122 94 L112 94 Q105 94 104 88 Z" fill="#0f172a" />
          <path d="M98 77 L102 77" stroke="#0f172a" strokeWidth="3" />
          <path d="M75 78 L82 78" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "gl-star":
      return (
        <g>
          {temples}
          <polygon points={star(84, 82, 15, 7)} fill="#fbbf24" fillOpacity="0.92" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={star(116, 82, 15, 7)} fill="#fbbf24" fillOpacity="0.92" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
          <path d="M97 80 L103 80" stroke="#b45309" strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}

function Headwear({ style }: { style: string }) {
  switch (style) {
    case "hw-cap":
      return (
        <g>
          <path d="M54 66 Q54 18 100 16 Q146 18 146 66 Q100 56 54 66 Z" fill="#007aba" />
          <path d="M96 60 Q130 54 170 62 Q174 70 164 72 Q130 66 98 70 Z" fill="#0c528a" />
          <circle cx="100" cy="18" r="4" fill="#0c528a" />
        </g>
      );
    case "hw-beanie":
      return (
        <g>
          <path d="M54 64 Q54 14 100 12 Q146 14 146 64 Z" fill="#ea580c" />
          <rect x="51" y="52" width="98" height="17" rx="8.5" fill="#c2410c" />
          <circle cx="100" cy="10" r="9" fill="#fdba74" />
        </g>
      );
    case "hw-gradcap":
      return (
        <g>
          <path d="M68 46 L68 62 Q100 72 132 62 L132 46 Z" fill="#1e293b" />
          <path d="M34 40 L100 18 L166 40 L100 62 Z" fill="#0f172a" />
          <circle cx="100" cy="40" r="3.5" fill="#f59e0b" />
          <path d="M100 40 L148 48 L148 72" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <rect x="144" y="70" width="8" height="12" rx="2" fill="#f59e0b" />
        </g>
      );
    case "hw-crown":
      return (
        <g>
          <path d="M62 36 L68 8 L84 24 L100 4 L116 24 L132 8 L138 36 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="100" cy="26" r="4" fill="#ef4444" />
          <circle cx="80" cy="30" r="3" fill="#3b82f6" />
          <circle cx="120" cy="30" r="3" fill="#22c55e" />
        </g>
      );
    default:
      return null;
  }
}

function Shoes({ style }: { style: string }) {
  const pair = (x: number) => {
    switch (style) {
      case "sh-sneakers":
        return (
          <g key={x}>
            <rect x={x} y="222" width="30" height="16" rx="8" fill="#ea580c" />
            <rect x={x} y="233" width="30" height="6" rx="3" fill="#fff" />
            <path d={`M${x + 8} 228 Q${x + 16} 232 ${x + 24} 226`} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case "sh-hightops":
        return (
          <g key={x}>
            <rect x={x + 2} y="212" width="27" height="26" rx="8" fill="#0966a3" />
            <rect x={x} y="233" width="31" height="6" rx="3" fill="#fff" />
            <path d={`M${x + 10} 218 L${x + 20} 218 M${x + 10} 224 L${x + 20} 224`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case "sh-gold":
        return (
          <g key={x}>
            <rect x={x} y="222" width="30" height="16" rx="8" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <rect x={x} y="233" width="30" height="6" rx="3" fill="#fff" />
          </g>
        );
      default: // canvas
        return (
          <g key={x}>
            <rect x={x} y="222" width="30" height="16" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
            <path d={`M${x + 3} 233 L${x + 27} 233`} stroke="#94a3b8" strokeWidth="2" />
          </g>
        );
    }
  };
  return <>{[pair(69), pair(101)]}</>;
}

function Outfit({ id, skin, skinShade }: { id: string; skin: string; skinShade: string }) {
  const top = TOPS[id] ?? TOPS["top-tee-sky"];
  const bottom = top.length;
  const torso = `M68 152 Q68 130 90 128 L110 128 Q132 130 132 152 L132 ${bottom - 4} Q132 ${bottom} 128 ${bottom} L72 ${bottom} Q68 ${bottom} 68 ${bottom - 4} Z`;
  const isHoodie = id.startsWith("top-hoodie");
  return (
    <g>
      {/* Arms: sleeve, then hand */}
      {[50, 132].map((x) => (
        <g key={x}>
          <rect x={x} y="134" width="18" height="52" rx="9" fill={top.long ? top.sleeve : skin} />
          {!top.long && <rect x={x} y="134" width="18" height="22" rx="9" fill={top.sleeve} />}
          <circle cx={x + 9} cy="190" r="8.5" fill={skin} />
        </g>
      ))}
      {isHoodie && <path d="M74 138 Q74 114 100 112 Q126 114 126 138 Z" fill={top.trim} />}
      <path d={torso} fill={top.body} stroke={top.trim && id === "top-tee-white" ? top.trim : "none"} strokeWidth="2" />
      {/* Neckline */}
      {(id.startsWith("top-tee") || id === "top-varsity") && <path d="M88 128 Q100 142 112 128 Z" fill={skinShade} />}
      {id === "top-kurta" && (
        <g>
          <path d="M92 128 L100 136 L108 128 Z" fill={skinShade} />
          <path d="M100 136 L100 172" stroke={top.trim} strokeWidth="2.5" />
          {[146, 156, 166].map((y) => (
            <circle key={y} cx="100" cy={y} r="2" fill={top.trim} />
          ))}
        </g>
      )}
      {isHoodie && (
        <g>
          <path d="M94 130 L93 152 M106 130 L107 152" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="80" y="172" width="40" height="18" rx="7" fill={top.trim} />
        </g>
      )}
      {id === "top-hoodie-flame" && (
        <path d="M100 140 Q90 152 94 162 Q96 168 100 170 Q104 168 106 162 Q110 152 100 140 Z" fill="#fbbf24" />
      )}
      {id === "top-blazer-gold" && (
        <g>
          <path d="M90 128 L100 154 L110 128 Z" fill="#f8fafc" />
          <path d="M100 130 L86 128 L94 172 L100 152 Z M100 130 L114 128 L106 172 L100 152 Z" fill={top.trim} />
          {[176, 188].map((y) => (
            <circle key={y} cx="100" cy={y} r="2.5" fill={top.trim} />
          ))}
        </g>
      )}
      {id === "top-varsity" && <polygon points={star(100, 164, 12, 5)} fill="#f8fafc" />}
      {id === "top-gown" && (
        <g>
          <path d="M92 128 L100 140 L108 128 Z" fill={skinShade} />
          <path d="M94 136 L94 226 M106 136 L106 226" stroke={top.trim} strokeWidth="4" />
        </g>
      )}
    </g>
  );
}

function Backpack({ style, front }: { style: string; front: boolean }) {
  if (style === "bp-none") return null;
  const main = style === "bp-explorer" ? "#c2410c" : "#007aba";
  const strap = style === "bp-explorer" ? "#7c2d12" : "#0c528a";
  if (!front) return <rect x="54" y="132" width="92" height="74" rx="18" fill={main} />;
  return (
    <g>
      <path d="M77 131 L81 200 M123 131 L119 200" stroke={strap} strokeWidth="6" strokeLinecap="round" />
      {style === "bp-explorer" && <circle cx="81" cy="160" r="5" fill="#fbbf24" />}
    </g>
  );
}

export function Avatar({
  config,
  crop = "full",
  className,
  label,
}: {
  config: AvatarConfig;
  /** "head" shows a close-up of the head and shoulders. */
  crop?: "full" | "head";
  className?: string;
  /** Accessible name; leave out when the avatar is decorative. */
  label?: string;
}) {
  const skin = SKIN[config.skin] ?? SKIN["skin-3"];
  const hair = HAIR_COLOR[config.hairColor] ?? HAIR_COLOR["hc-black"];
  const showHair = config.headwear !== "hw-beanie";

  return (
    <svg
      viewBox={crop === "head" ? "22 -6 156 156" : "0 0 200 244"}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Backpack style={config.backpack} front={false} />
      {showHair && <BackHair style={config.hair} color={hair} />}
      <rect x="78" y="198" width="20" height="30" rx="6" fill={PANTS} />
      <rect x="102" y="198" width="20" height="30" rx="6" fill={PANTS} />
      <Shoes style={config.shoes} />
      <rect x="90" y="110" width="20" height="24" rx="6" fill={skin.shade} />
      <Outfit id={config.top} skin={skin.base} skinShade={skin.shade} />
      <Backpack style={config.backpack} front />
      <circle cx="57" cy="82" r="9" fill={skin.base} />
      <circle cx="143" cy="82" r="9" fill={skin.base} />
      <ellipse cx="100" cy="74" rx="44" ry="46" fill={skin.base} />
      <ellipse cx="72" cy="96" rx="7" ry="4.5" fill="#f472b6" fillOpacity="0.28" />
      <ellipse cx="128" cy="96" rx="7" ry="4.5" fill="#f472b6" fillOpacity="0.28" />
      <path d="M76 66 Q84 61 92 65 M108 65 Q116 61 124 66" fill="none" stroke={hair} strokeWidth="3.5" strokeLinecap="round" />
      <Eyes style={config.eyes} />
      {config.eyes === "eyes-happy" ? (
        <path d="M89 99 Q100 114 111 99 Z" fill="#7c2d12" />
      ) : (
        <path d="M90 100 Q100 109 110 100" fill="none" stroke="#7c2d12" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {showHair && <FrontHair style={config.hair} color={hair} />}
      <Glasses style={config.glasses} />
      <Headwear style={config.headwear} />
    </svg>
  );
}
