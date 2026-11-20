// The two story characters, drawn as flat SVG with thick dark outlines in
// Rupli's colours. Origin (0, 0) is between the feet; they're about 200 units
// tall. Every face and arm pose is drawn as a named layer (data-layer); the
// story engine shows one face and one arm pose at a time.

const INK = "#0F1F18";
const GOLD = "#FFB81F";
const OUT = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const FACES = ["neutral", "happy", "excited", "confused", "worried", "thinking", "proud", "shocked"] as const;
export type Face = (typeof FACES)[number];

/** One face, centred on the head at (0, cy). */
function FaceLayer({ face, cy, show }: { face: Face; cy: number; show: boolean }) {
  const ey = cy - 2;
  const my = cy + 11;
  const dot = (x: number, r = 2.6) => <circle cx={x} cy={ey} r={r} fill={INK} />;
  const blush = (
    <g fill="#F08A8A" opacity={0.5}>
      <ellipse cx={-15} cy={cy + 6} rx={4.5} ry={2.6} />
      <ellipse cx={15} cy={cy + 6} rx={4.5} ry={2.6} />
    </g>
  );
  const arcUp = (x: number) => <path d={`M${x - 4.5} ${ey + 1.5} Q${x} ${ey - 5} ${x + 4.5} ${ey + 1.5}`} fill="none" {...OUT} strokeWidth={2.6} />;
  const arcDown = (x: number) => <path d={`M${x - 4.5} ${ey - 1} Q${x} ${ey + 4} ${x + 4.5} ${ey - 1}`} fill="none" {...OUT} strokeWidth={2.6} />;
  let art: React.ReactNode;
  switch (face) {
    case "neutral":
      art = (
        <>
          {dot(-9)}
          {dot(9)}
          <path d={`M-5 ${my} Q0 ${my + 3} 5 ${my}`} fill="none" {...OUT} strokeWidth={2.4} />
        </>
      );
      break;
    case "happy":
      art = (
        <>
          {arcUp(-9)}
          {arcUp(9)}
          <path d={`M-8 ${my - 1} Q0 ${my + 7} 8 ${my - 1}`} fill="none" {...OUT} strokeWidth={2.6} />
          {blush}
        </>
      );
      break;
    case "excited":
      art = (
        <>
          {dot(-9, 3.4)}
          {dot(9, 3.4)}
          <circle cx={-10} cy={ey - 1.2} r={1.1} fill="#fff" />
          <circle cx={8} cy={ey - 1.2} r={1.1} fill="#fff" />
          <path d={`M-8 ${my - 2} Q0 ${my + 10} 8 ${my - 2} Z`} fill={INK} />
          {blush}
        </>
      );
      break;
    case "confused":
      art = (
        <>
          {dot(-9)}
          {dot(9)}
          <path d={`M-14 ${ey - 9} Q-9 ${ey - 13} -4 ${ey - 9}`} fill="none" {...OUT} strokeWidth={2.2} />
          <path d={`M4 ${ey - 8} L14 ${ey - 8}`} fill="none" {...OUT} strokeWidth={2.2} />
          <path d={`M-6 ${my} Q-3 ${my - 3} 0 ${my} T6 ${my}`} fill="none" {...OUT} strokeWidth={2.4} />
        </>
      );
      break;
    case "worried":
      art = (
        <>
          {dot(-9)}
          {dot(9)}
          <path d={`M-14 ${ey - 6} L-5 ${ey - 10}`} {...OUT} strokeWidth={2.2} />
          <path d={`M14 ${ey - 6} L5 ${ey - 10}`} {...OUT} strokeWidth={2.2} />
          <path d={`M-6 ${my + 2} Q0 ${my - 4} 6 ${my + 2}`} fill="none" {...OUT} strokeWidth={2.4} />
        </>
      );
      break;
    case "thinking":
      art = (
        <>
          <circle cx={-7} cy={ey - 3} r={2.6} fill={INK} />
          <circle cx={11} cy={ey - 3} r={2.6} fill={INK} />
          <path d={`M-14 ${ey - 9} L-4 ${ey - 9}`} {...OUT} strokeWidth={2.2} />
          <path d={`M-4 ${my} L6 ${my - 1}`} {...OUT} strokeWidth={2.4} />
        </>
      );
      break;
    case "proud":
      art = (
        <>
          {arcDown(-9)}
          {arcDown(9)}
          <path d={`M-8 ${my - 1} Q0 ${my + 7} 8 ${my - 1}`} fill="none" {...OUT} strokeWidth={2.6} />
          {blush}
        </>
      );
      break;
    case "shocked":
      art = (
        <>
          <circle cx={-9} cy={ey} r={5} fill="#fff" {...OUT} strokeWidth={2} />
          <circle cx={9} cy={ey} r={5} fill="#fff" {...OUT} strokeWidth={2} />
          {dot(-9, 2)}
          {dot(9, 2)}
          <ellipse cx={0} cy={my + 1} rx={4} ry={5.5} fill={INK} />
        </>
      );
      break;
  }
  return (
    <g data-layer={`face:${face}`} opacity={show ? 1 : 0}>
      {art}
    </g>
  );
}

/** An outlined arm from the shoulder through `points`, ending in a hand. */
function Arm({ points, skin, sleeve }: { points: [number, number][]; skin: string; sleeve: string }) {
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const [hx, hy] = points[points.length - 1];
  const [sx, sy] = points[0];
  const [nx, ny] = points[1];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={skin} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      {/* the sleeve over the top of the arm */}
      <path d={`M${sx} ${sy} L${sx + (nx - sx) * 0.35} ${sy + (ny - sy) * 0.35}`} fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" />
      <path d={`M${sx} ${sy} L${sx + (nx - sx) * 0.35} ${sy + (ny - sy) * 0.35}`} fill="none" stroke={sleeve} strokeWidth={10} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={6.5} fill={skin} {...OUT} strokeWidth={2.6} />
    </g>
  );
}

function ArmLayer({ name, show, children }: { name: string; show: boolean; children: React.ReactNode }) {
  return (
    <g data-layer={`arms:${name}`} opacity={show ? 1 : 0}>
      {children}
    </g>
  );
}

/** "face:happy" → face is happy; "arms:up" → arms are up. A layer string can set both: "face:happy arms:up". */
function parse(layer: string | undefined, fallbackArms: string) {
  const parts = (layer ?? "").split(/\s+/);
  const face = (parts.find((p) => p.startsWith("face:"))?.slice(5) ?? "neutral") as Face;
  const arms = parts.find((p) => p.startsWith("arms:"))?.slice(5) ?? fallbackArms;
  return { face, arms };
}

const RIYA_SKIN = "#C68B5E";
const RIYA_ARMS: Record<string, [number, number][]> = {
  down: [
    [-29, -122],
    [-35, -96],
    [-36, -72],
  ],
  up: [
    [-29, -122],
    [-42, -146],
    [-48, -172],
  ],
  hold: [
    [29, -122],
    [38, -104],
    [50, -100],
  ],
  chin: [
    [29, -122],
    [24, -104],
    [8, -146],
  ],
};

/** Riya: a college student, gold kurta, ponytail. */
export function Riya({ layer }: { layer?: string }) {
  const { face, arms } = parse(layer, "down");
  const left = (name: string) => (name === "up" ? RIYA_ARMS.up : RIYA_ARMS.down);
  const right = (name: string): [number, number][] =>
    name === "up"
      ? RIYA_ARMS.up.map(([x, y]) => [-x, y])
      : name === "hold"
        ? RIYA_ARMS.hold
        : name === "chin"
          ? RIYA_ARMS.chin
          : RIYA_ARMS.down.map(([x, y]) => [-x, y]);
  return (
    <g>
      {/* legs and shoes */}
      <rect x={-17} y={-64} width={13} height={58} rx={5} fill="#1d3a2c" {...OUT} />
      <rect x={4} y={-64} width={13} height={58} rx={5} fill="#1d3a2c" {...OUT} />
      <ellipse cx={-12} cy={-4} rx={10} ry={5} fill={INK} />
      <ellipse cx={12} cy={-4} rx={10} ry={5} fill={INK} />
      {/* ponytail behind the head */}
      <ellipse cx={31} cy={-164} rx={9} ry={18} transform="rotate(18 31 -164)" fill="#2b1d16" {...OUT} />
      <circle cx={26} cy={-180} r={4} fill={GOLD} {...OUT} strokeWidth={2} />
      {/* arms behind the body */}
      {["down", "up", "hold", "chin"].map((name) => (
        <ArmLayer key={`l-${name}`} name={name} show={arms === name}>
          <Arm points={left(name)} skin={RIYA_SKIN} sleeve={GOLD} />
        </ArmLayer>
      ))}
      {/* kurta */}
      <path d="M-30 -128 Q0 -138 30 -128 L37 -58 Q0 -50 -37 -58 Z" fill={GOLD} {...OUT} />
      <path d="M-10 -132 L0 -118 L10 -132" fill="none" {...OUT} strokeWidth={2.4} />
      <rect x={-6} y={-145} width={12} height={14} fill={RIYA_SKIN} {...OUT} strokeWidth={2.4} />
      {/* head and hair */}
      <circle cx={0} cy={-166} r={28} fill={RIYA_SKIN} {...OUT} />
      <path d="M-29 -162 C-33 -196 33 -196 29 -162 C24 -178 10 -184 -3 -180 C-13 -186 -25 -178 -29 -162 Z" fill="#2b1d16" {...OUT} />
      {FACES.map((f) => (
        <FaceLayer key={f} face={f} cy={-166} show={face === f} />
      ))}
      {/* the arm in front (the right one) */}
      {["down", "up", "hold", "chin"].map((name) => (
        <ArmLayer key={`r-${name}`} name={name} show={arms === name}>
          <Arm points={right(name)} skin={RIYA_SKIN} sleeve={GOLD} />
        </ArmLayer>
      ))}
    </g>
  );
}

const MOM_SKIN = "#B97A50";
const SAREE = "#2f5d46";
const MOM_RIGHT: Record<string, [number, number][]> = {
  down: [
    [28, -128],
    [36, -100],
    [37, -76],
  ],
  give: [
    [28, -128],
    [42, -110],
    [60, -108],
  ],
  point: [
    [28, -128],
    [44, -146],
    [60, -172],
  ],
  thumb: [
    [28, -128],
    [44, -112],
    [46, -140],
  ],
};

/** Mom: a green saree with a gold border, a bun, glasses and a bindi. */
export function Mom({ layer }: { layer?: string }) {
  const { face, arms } = parse(layer, "down");
  return (
    <g>
      {/* bun behind the head */}
      <circle cx={-22} cy={-196} r={12} fill="#3b302b" {...OUT} />
      {/* left arm, always down */}
      <Arm
        points={[
          [-28, -128],
          [-36, -100],
          [-37, -76],
        ]}
        skin={MOM_SKIN}
        sleeve={GOLD}
      />
      {/* saree */}
      <path d="M-29 -134 Q0 -144 29 -134 L42 -2 Q0 4 -42 -2 Z" fill={SAREE} {...OUT} />
      <path d="M-40 -16 Q0 -10 40 -16" fill="none" stroke={GOLD} strokeWidth={6} />
      <path d="M-24 -136 L30 -60" fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
      <rect x={-6} y={-151} width={12} height={14} fill={MOM_SKIN} {...OUT} strokeWidth={2.4} />
      {/* head, hair, bindi */}
      <circle cx={0} cy={-172} r={27} fill={MOM_SKIN} {...OUT} />
      <path d="M-28 -170 C-30 -202 30 -202 28 -170 C22 -186 8 -190 0 -186 C-8 -190 -22 -186 -28 -170 Z" fill="#3b302b" {...OUT} />
      <path d="M-6 -194 Q0 -190 4 -196" fill="none" stroke="#9a8f88" strokeWidth={2} />
      <circle cx={0} cy={-181} r={2.4} fill="#D2342B" />
      {FACES.map((f) => (
        <FaceLayer key={f} face={f} cy={-172} show={face === f} />
      ))}
      {/* glasses */}
      <g fill="none" stroke={INK} strokeWidth={2}>
        <circle cx={-9} cy={-174} r={7} />
        <circle cx={9} cy={-174} r={7} />
        <path d="M-2 -174 L2 -174" />
      </g>
      {/* right arm poses: down, give (hand out), point, thumb (thumbs-up) */}
      {Object.entries(MOM_RIGHT).map(([name, points]) => (
        <ArmLayer key={name} name={name} show={arms === name}>
          <Arm points={points} skin={MOM_SKIN} sleeve={GOLD} />
          {name === "point" && <path d="M60 -172 L66 -184" {...OUT} strokeWidth={4} />}
          {name === "thumb" && (
            // A clear thumbs-up: a wide fist with knuckle lines, and the thumb angled up and out from its side.
            <g>
              <rect x={37} y={-147} width={17} height={14} rx={4.5} fill={MOM_SKIN} {...OUT} strokeWidth={2.4} />
              <path d="M44 -143 L53 -143 M44 -138.5 L53 -138.5" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
              <rect x={34} y={-161} width={7} height={16} rx={3.5} transform="rotate(-18 37.5 -153)" fill={MOM_SKIN} {...OUT} strokeWidth={2.2} />
            </g>
          )}
        </ArmLayer>
      ))}
    </g>
  );
}
