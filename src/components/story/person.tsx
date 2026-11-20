import { Arm, ArmLayer, FACES, FaceLayer, parseLayer } from "./characters";

// A configurable story character: each lesson defines its own cast as a "look"
// (skin, hair, clothes, glasses, beard, age...). Same flat style as Riya and
// Mom: thick dark outlines, about 200 units tall, origin between the feet.
// Faces and arm poses are named layers ("face:happy arms:point"), so the
// story engine can switch them while you scroll.

const INK = "#0F1F18";
const OUT = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export type Look = {
  skin: string;
  hair: "short" | "long" | "bun" | "ponytail" | "curly" | "spiky" | "braid" | "bald" | "wavy";
  hairColor: string;
  top: string;
  topStyle?: "tee" | "kurta" | "shirt" | "hoodie" | "blazer" | "saree" | "jersey" | "apron" | "sweater";
  bottom?: string;
  bottomStyle?: "pants" | "skirt" | "shorts";
  accent?: string;
  glasses?: boolean;
  beard?: "stubble" | "full" | "moustache";
  old?: boolean;
  bindi?: boolean;
  cap?: string;
  /** An ID card on a lanyard (office, bank). */
  badge?: string;
};

const ARMS = {
  down: [
    [29, -122],
    [35, -96],
    [36, -72],
  ],
  up: [
    [29, -122],
    [42, -146],
    [48, -172],
  ],
  point: [
    [29, -122],
    [46, -142],
    [62, -168],
  ],
  give: [
    [29, -122],
    [42, -106],
    [60, -104],
  ],
  chin: [
    [29, -122],
    [24, -104],
    [8, -146],
  ],
  thumb: [
    [29, -122],
    [44, -110],
    [46, -138],
  ],
  wave: [
    [29, -122],
    [52, -128],
    [56, -160],
  ],
  phone: [
    [29, -122],
    [30, -98],
    [14, -112],
  ],
  pay: [
    [29, -122],
    [40, -100],
    [52, -116],
  ],
} as Record<string, [number, number][]>;
const POSES = Object.keys(ARMS);
const mirror = (p: [number, number][]) => p.map(([x, y]) => [-x, y] as [number, number]);

function HairBack({ look }: { look: Look }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "long":
    case "wavy":
      return <path d="M-30 -170 Q-38 -120 -26 -108 L26 -108 Q38 -120 30 -170 Z" fill={c} {...OUT} />;
    case "ponytail":
      return <ellipse cx={31} cy={-162} rx={9} ry={19} transform="rotate(18 31 -162)" fill={c} {...OUT} />;
    case "braid":
      return (
        <g fill={c} {...OUT} strokeWidth={2.4}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={-24 - i * 1.5} cy={-150 + i * 14} rx={7} ry={8} />
          ))}
        </g>
      );
    case "bun":
      return <circle cx={0} cy={-200} r={12} fill={c} {...OUT} />;
    default:
      return null;
  }
}

function HairFront({ look }: { look: Look }) {
  const c = look.hairColor;
  switch (look.hair) {
    case "bald":
      return <path d="M-27 -168 Q-30 -178 -24 -184 M27 -168 Q30 -178 24 -184" fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" />;
    case "short":
      return <path d="M-29 -166 C-32 -198 32 -198 29 -166 C26 -180 14 -186 0 -184 C-14 -186 -26 -180 -29 -166 Z" fill={c} {...OUT} />;
    case "spiky":
      return <path d="M-29 -166 L-26 -190 L-16 -184 L-10 -198 L0 -188 L9 -200 L15 -186 L26 -194 L29 -166 C20 -180 -20 -180 -29 -166 Z" fill={c} {...OUT} />;
    case "curly":
      return (
        <g fill={c} {...OUT} strokeWidth={2.4}>
          {[
            [-24, -178],
            [-12, -190],
            [2, -194],
            [16, -190],
            [26, -178],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={11} />
          ))}
        </g>
      );
    default:
      // long, wavy, ponytail, braid, bun: a centre parting
      return <path d="M-29 -162 C-33 -196 33 -196 29 -162 C24 -178 10 -184 0 -180 C-10 -184 -24 -178 -29 -162 Z" fill={c} {...OUT} />;
  }
}

function Top({ look }: { look: Look }) {
  const c = look.top;
  const a = look.accent ?? "#F5EFE3";
  switch (look.topStyle ?? "tee") {
    case "kurta":
      return (
        <g>
          <path d="M-30 -128 Q0 -138 30 -128 L36 -50 Q0 -42 -36 -50 Z" fill={c} {...OUT} />
          <path d="M0 -132 L0 -96" stroke={a} strokeWidth={3} />
        </g>
      );
    case "shirt":
      return (
        <g>
          <path d="M-30 -128 Q0 -138 30 -128 L34 -60 Q0 -54 -34 -60 Z" fill={c} {...OUT} />
          <path d="M-9 -132 L0 -120 L9 -132" fill="#fff" {...OUT} strokeWidth={2} />
          <path d="M0 -120 L-4 -98 L0 -88 L4 -98 Z" fill={a} {...OUT} strokeWidth={1.8} />
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M-31 -128 Q0 -140 31 -128 L36 -58 Q0 -50 -36 -58 Z" fill={c} {...OUT} />
          <path d="M-18 -132 Q0 -116 18 -132" fill="none" stroke={a} strokeWidth={5} />
          <rect x={-16} y={-88} width={32} height={16} rx={5} fill={a} opacity={0.5} />
        </g>
      );
    case "blazer":
      return (
        <g>
          <path d="M-31 -128 Q0 -138 31 -128 L35 -58 Q0 -52 -35 -58 Z" fill={c} {...OUT} />
          <path d="M-8 -132 L0 -96 L8 -132 Z" fill="#fff" {...OUT} strokeWidth={2} />
          <path d="M-8 -132 L-14 -100 M8 -132 L14 -100" stroke={INK} strokeWidth={2} />
        </g>
      );
    case "saree":
      return (
        <g>
          <path d="M-29 -134 Q0 -144 29 -134 L42 -2 Q0 4 -42 -2 Z" fill={c} {...OUT} />
          <path d="M-40 -16 Q0 -10 40 -16" fill="none" stroke={a} strokeWidth={6} />
          <path d="M-24 -136 L30 -60" fill="none" stroke={a} strokeWidth={7} strokeLinecap="round" />
        </g>
      );
    case "jersey":
      return (
        <g>
          <path d="M-31 -128 Q0 -138 31 -128 L35 -58 Q0 -52 -35 -58 Z" fill={c} {...OUT} />
          <path d="M-31 -112 L31 -112" stroke={a} strokeWidth={5} />
          <text x={0} y={-80} textAnchor="middle" fontSize={18} fontWeight={800} fill={a} fontFamily="var(--font-display), sans-serif">
            7
          </text>
        </g>
      );
    case "apron":
      return (
        <g>
          <path d="M-30 -128 Q0 -138 30 -128 L34 -60 Q0 -54 -34 -60 Z" fill={c} {...OUT} />
          <path d="M-18 -116 L18 -116 L22 -54 L-22 -54 Z" fill={a} {...OUT} strokeWidth={2.4} />
        </g>
      );
    case "sweater":
      return (
        <g>
          <path d="M-31 -128 Q0 -138 31 -128 L35 -58 Q0 -52 -35 -58 Z" fill={c} {...OUT} />
          {[-100, -84, -68].map((y) => (
            <path key={y} d={`M-30 ${y} L30 ${y}`} stroke={a} strokeWidth={2} opacity={0.6} />
          ))}
        </g>
      );
    default:
      return (
        <g>
          <path d="M-30 -128 Q0 -138 30 -128 L34 -58 Q0 -50 -34 -58 Z" fill={c} {...OUT} />
          <path d="M-10 -132 Q0 -122 10 -132" fill="none" {...OUT} strokeWidth={2.4} />
        </g>
      );
  }
}

/** A story character made from a look. */
export function Person({ look, layer }: { look: Look; layer?: string }) {
  const { face, arms } = parseLayer(layer, "down");
  const sleeve = look.topStyle === "saree" ? look.skin : look.top;
  const legs = look.bottom ?? "#1d3a2c";
  const saree = look.topStyle === "saree";
  return (
    <g>
      {/* legs */}
      {!saree &&
        (look.bottomStyle === "skirt" ? (
          <g>
            <rect x={-14} y={-40} width={10} height={34} rx={4} fill={look.skin} {...OUT} strokeWidth={2.4} />
            <rect x={4} y={-40} width={10} height={34} rx={4} fill={look.skin} {...OUT} strokeWidth={2.4} />
            <path d="M-34 -64 L34 -64 L40 -30 L-40 -30 Z" fill={legs} {...OUT} />
          </g>
        ) : look.bottomStyle === "shorts" ? (
          <g>
            <rect x={-15} y={-40} width={11} height={34} rx={4} fill={look.skin} {...OUT} strokeWidth={2.4} />
            <rect x={4} y={-40} width={11} height={34} rx={4} fill={look.skin} {...OUT} strokeWidth={2.4} />
            <path d="M-32 -64 L32 -64 L32 -36 L2 -36 L0 -46 L-2 -36 L-32 -36 Z" fill={legs} {...OUT} />
          </g>
        ) : (
          <g>
            <rect x={-17} y={-64} width={13} height={58} rx={5} fill={legs} {...OUT} />
            <rect x={4} y={-64} width={13} height={58} rx={5} fill={legs} {...OUT} />
          </g>
        ))}
      {!saree && (
        <g>
          <ellipse cx={-12} cy={-4} rx={10} ry={5} fill={INK} />
          <ellipse cx={12} cy={-4} rx={10} ry={5} fill={INK} />
        </g>
      )}
      <HairBack look={look} />
      {/* the far arm */}
      {["down", "up"].map((name) => (
        <ArmLayer key={`l-${name}`} name={name} show={(arms === "up" ? "up" : "down") === name}>
          <Arm points={mirror(ARMS[name])} skin={look.skin} sleeve={sleeve} />
        </ArmLayer>
      ))}
      <Top look={look} />
      {look.badge && (
        <g>
          <path d="M-12 -132 L0 -100 L12 -132" fill="none" stroke={look.badge} strokeWidth={2.4} />
          <rect x={-7} y={-102} width={14} height={18} rx={2} fill="#fff" {...OUT} strokeWidth={2} />
          <rect x={-4} y={-98} width={8} height={4} fill={look.badge} />
        </g>
      )}
      <rect x={-6} y={-145} width={12} height={14} fill={look.skin} {...OUT} strokeWidth={2.4} />
      <circle cx={0} cy={-166} r={28} fill={look.skin} {...OUT} />
      <HairFront look={look} />
      {look.old && (
        <g fill="none" stroke={INK} strokeWidth={1.4} opacity={0.5} strokeLinecap="round">
          <path d="M-20 -178 Q-14 -180 -8 -178 M8 -178 Q14 -180 20 -178" />
          <path d="M-22 -158 Q-20 -154 -22 -150 M22 -158 Q20 -154 22 -150" />
        </g>
      )}
      {look.beard === "full" && (
        <path d="M-26 -160 Q-26 -132 0 -130 Q26 -132 26 -160 Q20 -146 0 -148 Q-20 -146 -26 -160 Z" fill={look.hairColor} {...OUT} strokeWidth={2.4} />
      )}
      {look.beard === "stubble" && (
        <path d="M-22 -156 Q0 -132 22 -156" fill="none" stroke={look.hairColor} strokeWidth={7} opacity={0.35} strokeLinecap="round" />
      )}
      {FACES.map((f) => (
        <FaceLayer key={f} face={f} cy={-166} show={face === f} />
      ))}
      {look.beard === "moustache" && (
        <path d="M-10 -157 Q-5 -161 0 -157 Q5 -161 10 -157 Q5 -153 0 -156 Q-5 -153 -10 -157 Z" fill={look.hairColor} stroke={INK} strokeWidth={1.4} />
      )}
      {look.bindi && <circle cx={0} cy={-176} r={2.4} fill="#D2342B" />}
      {look.glasses && (
        <g fill="none" stroke={INK} strokeWidth={2}>
          <circle cx={-9} cy={-168} r={7} />
          <circle cx={9} cy={-168} r={7} />
          <path d="M-2 -168 L2 -168" />
        </g>
      )}
      {look.cap && (
        <g>
          <path d="M-27 -176 Q0 -206 27 -176 Z" fill={look.cap} {...OUT} />
          <path d="M14 -178 L42 -176 Q40 -170 14 -172 Z" fill={look.cap} {...OUT} strokeWidth={2.4} />
        </g>
      )}
      {/* the near arm: every pose */}
      {POSES.map((name) => (
        <ArmLayer key={`r-${name}`} name={name} show={arms === name}>
          <Arm points={ARMS[name]} skin={look.skin} sleeve={sleeve} />
          {name === "point" && <path d="M62 -168 L67 -180" {...OUT} strokeWidth={4} />}
          {name === "thumb" && (
            <g>
              <rect x={37} y={-145} width={17} height={14} rx={4.5} fill={look.skin} {...OUT} strokeWidth={2.4} />
              <path d="M44 -141 L53 -141 M44 -136.5 L53 -136.5" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
              <rect x={34} y={-159} width={7} height={16} rx={3.5} transform="rotate(-18 37.5 -151)" fill={look.skin} {...OUT} strokeWidth={2.2} />
            </g>
          )}
          {name === "phone" && <rect x={6} y={-128} width={14} height={24} rx={3} fill="#1d3a2c" {...OUT} strokeWidth={2} />}
        </ArmLayer>
      ))}
    </g>
  );
}
