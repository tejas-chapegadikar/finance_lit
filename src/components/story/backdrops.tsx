// Story settings: one soft, low-contrast background per place, so every lesson
// happens somewhere different. Drawn across the whole 360 × 540 stage; the
// cast stands on the floor line near the bottom. Decorative only.

const INK = "#0F1F18";
const LINE = { stroke: INK, strokeWidth: 2, strokeOpacity: 0.25, strokeLinejoin: "round" as const };

function Floor({ color, y = 470 }: { color: string; y?: number }) {
  return <rect x={0} y={y} width={360} height={540 - y} fill={color} />;
}
function Window({ x, y, w = 70, h = 60, sky = "#cfe8f3" }: { x: number; y: number; w?: number; h?: number; sky?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={sky} {...LINE} />
      <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} {...LINE} />
    </g>
  );
}
function Sign({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = text.length * 7.4 + 20;
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={6} fill={color} opacity={0.85} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff" fontFamily="var(--font-display), sans-serif">
        {text}
      </text>
    </g>
  );
}

export function Backdrop({ place, accent = "#FFB81F" }: { place: string; accent?: string }) {
  switch (place) {
    case "home":
      return (
        <g opacity={0.9}>
          <rect width={360} height={540} fill="#F5EFE3" />
          <Floor color="#eadfca" />
        </g>
      );
    case "garden":
      return (
        <g>
          <rect width={360} height={540} fill="#dff0f5" />
          <circle cx={300} cy={60} r={26} fill="#FFE08A" />
          <path d="M0 400 Q90 370 180 392 T360 380 L360 540 L0 540 Z" fill="#cfe5b4" />
          {[20, 70, 120, 170, 220, 270, 320].map((x) => (
            <rect key={x} x={x} y={388} width={8} height={40} fill="#f7f2e8" {...LINE} />
          ))}
          <path d="M0 404 L360 404" stroke="#f7f2e8" strokeWidth={6} />
          <Floor color="#b9d79a" y={480} />
        </g>
      );
    case "hostel":
      return (
        <g>
          <rect width={360} height={540} fill="#ece6f5" />
          <Window x={140} y={70} />
          <rect x={14} y={250} width={110} height={12} fill="#c9b8de" {...LINE} />
          <rect x={14} y={330} width={110} height={12} fill="#c9b8de" {...LINE} />
          <path d="M18 230 L18 470 M120 230 L120 470" stroke={INK} strokeOpacity={0.25} strokeWidth={4} />
          <rect x={250} y={110} width={46} height={60} rx={3} fill={accent} opacity={0.35} />
          <rect x={302} y={124} width={36} height={46} rx={3} fill="#9ed2c6" opacity={0.6} />
          <Floor color="#ddd2ea" />
        </g>
      );
    case "parking":
      return (
        <g>
          <rect width={360} height={540} fill="#e3eef0" />
          <rect x={0} y={250} width={360} height={60} fill="#d4dfe1" />
          {[30, 90, 150, 210, 270, 330].map((x) => (
            <path key={x} d={`M${x - 14} 300 Q${x} 270 ${x + 14} 300`} fill="none" stroke={INK} strokeOpacity={0.3} strokeWidth={4} />
          ))}
          <Sign x={180} y={30} text="CYCLE STAND" color="#3f8a7a" />
          <Floor color="#c9d6d8" />
        </g>
      );
    case "metro":
      return (
        <g>
          <rect width={360} height={540} fill="#e7eef7" />
          {[24, 140, 256].map((x) => (
            <rect key={x} x={x} y={70} width={84} height={70} rx={12} fill="#b9d3ec" {...LINE} />
          ))}
          <path d="M0 52 L360 52" stroke="#5b8bc9" strokeWidth={8} opacity={0.6} />
          {[96, 264].map((x) => (
            <path key={x} d={`M${x} 52 L${x} 470`} stroke="#9aa9b8" strokeWidth={5} />
          ))}
          <rect x={0} y={400} width={360} height={30} fill="#9ec5e8" opacity={0.6} />
          <Floor color="#cfd8e2" />
        </g>
      );
    case "orientation":
      return (
        <g>
          <rect width={360} height={540} fill="#f3ecdf" />
          <rect x={40} y={12} width={280} height={36} rx={6} fill={accent} opacity={0.85} />
          <text x={180} y={36} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK} fontFamily="var(--font-display), sans-serif">
            FRESHERS&apos; BANK DESK
          </text>
          <rect x={150} y={360} width={210} height={70} rx={6} fill="#d9c8a6" {...LINE} />
          <Floor color="#e6dac2" />
        </g>
      );
    case "travel":
      return (
        <g>
          <rect width={360} height={540} fill="#e9f4f1" />
          <rect x={22} y={70} width={90} height={70} rx={4} fill="#9fd3e6" {...LINE} />
          <path d="M22 140 L60 100 L82 122 L96 110 L112 140 Z" fill="#7fb069" />
          <rect x={248} y={70} width={90} height={70} rx={4} fill="#ffe1a0" {...LINE} />
          <path d="M248 128 Q293 110 338 128 L338 140 L248 140 Z" fill="#7cc3e8" />
          <Sign x={180} y={40} text="TRIPS & TOURS" color="#2f8a7d" />
          <Floor color="#d4e8e2" />
        </g>
      );
    case "showroom":
      return (
        <g>
          <rect width={360} height={540} fill="#eef0f3" />
          <rect x={0} y={60} width={360} height={10} fill={accent} opacity={0.7} />
          {[70, 290].map((x) => (
            <g key={x} opacity={0.35}>
              <circle cx={x - 26} cy={330} r={22} fill="none" stroke={INK} strokeWidth={5} />
              <circle cx={x + 26} cy={330} r={22} fill="none" stroke={INK} strokeWidth={5} />
              <path d={`M${x - 26} 330 L${x} 300 L${x + 26} 330 M${x} 300 L${x + 10} 290`} fill="none" stroke={INK} strokeWidth={5} />
            </g>
          ))}
          <Sign x={180} y={30} text="BIKE SHOWROOM" color="#C2410C" />
          <Floor color="#dfe3e8" />
        </g>
      );
    case "bankdesk":
      return (
        <g>
          <rect width={360} height={540} fill="#eef3ee" />
          {[40, 110, 250, 320].map((x) => (
            <rect key={x} x={x - 10} y={60} width={20} height={300} fill="#dbe6db" {...LINE} />
          ))}
          <Sign x={180} y={30} text="RELATIONSHIP MANAGER" color="#2f5d46" />
          <rect x={120} y={380} width={240} height={60} rx={6} fill="#c6d6c4" {...LINE} />
          <Floor color="#d9e4d7" />
        </g>
      );
    case "canteen":
      return (
        <g>
          <rect width={360} height={540} fill="#fbeedd" />
          <rect x={250} y={12} width={100} height={80} rx={8} fill="#2f5d46" opacity={0.85} />
          {["SAMOSA 15", "CHAI 10", "MAGGI 40"].map((t, i) => (
            <text
              key={t}
              x={300}
              y={34 + i * 22}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="#F5EFE3"
              fontFamily="var(--font-display), sans-serif"
            >
              {t}
            </text>
          ))}
          <rect x={20} y={400} width={320} height={14} rx={4} fill="#d9b48a" {...LINE} />
          <Floor color="#efdcc2" />
        </g>
      );
    case "office":
      return (
        <g>
          <rect width={360} height={540} fill="#eef0f5" />
          <Window x={20} y={60} w={100} h={80} />
          <rect x={220} y={330} width={120} height={10} fill="#c7cbd6" {...LINE} />
          <rect x={250} y={286} width={56} height={40} rx={4} fill="#1d3a2c" opacity={0.7} />
          <rect x={272} y={326} width={12} height={6} fill="#1d3a2c" opacity={0.7} />
          <circle cx={318} cy={100} r={22} fill="#fff" {...LINE} />
          <path d="M318 100 L318 86 M318 100 L328 104" stroke={INK} strokeWidth={2} opacity={0.4} />
          <Floor color="#dcdfe8" />
        </g>
      );
    case "terrace":
      return (
        <g>
          <rect width={360} height={540} fill="#fde7d2" />
          <circle cx={70} cy={90} r={30} fill="#FFC56B" />
          <rect x={250} y={150} width={80} height={90} rx={8} fill="#c9cfd6" {...LINE} />
          <path d="M0 360 L360 360" stroke={INK} strokeOpacity={0.3} strokeWidth={4} />
          {Array.from({ length: 13 }, (_, i) => i * 30).map((x) => (
            <path key={x} d={`M${x} 360 L${x} 410`} stroke={INK} strokeOpacity={0.25} strokeWidth={3} />
          ))}
          <path d="M0 410 L360 410" stroke={INK} strokeOpacity={0.3} strokeWidth={4} />
          <Floor color="#eccfb3" />
        </g>
      );
    case "gym":
      return (
        <g>
          <rect width={360} height={540} fill="#ebeef2" />
          <rect x={20} y={70} width={150} height={150} rx={6} fill="#dfe8f0" {...LINE} />
          {[250, 290, 330].map((x) => (
            <g key={x}>
              <rect x={x - 16} y={140} width={32} height={8} rx={3} fill="#5f6b78" opacity={0.6} />
              <rect x={x - 20} y={134} width={8} height={20} rx={2} fill={INK} opacity={0.5} />
              <rect x={x + 12} y={134} width={8} height={20} rx={2} fill={INK} opacity={0.5} />
            </g>
          ))}
          <Sign x={300} y={30} text="GYM" color="#C2410C" />
          <Floor color="#d4dae1" />
        </g>
      );
    case "chaistall":
      return (
        <g>
          <rect width={360} height={540} fill="#fdf1dc" />
          <path d="M20 0 L340 0 L320 44 L40 44 Z" fill="#E9785B" />
          {[60, 120, 180, 240, 300].map((x) => (
            <path key={x} d={`M${x} 0 L${x - 4} 44`} stroke="#fff" strokeWidth={12} opacity={0.7} />
          ))}
          <rect x={40} y={330} width={280} height={80} rx={6} fill="#c98b5e" {...LINE} />
          <Sign x={180} y={62} text="BALAN TEA STALL" color="#8a4b2a" />
          <Floor color="#ead6b5" />
        </g>
      );
    case "living":
      return (
        <g>
          <rect width={360} height={540} fill="#f2ece4" />
          <rect x={110} y={60} width={140} height={90} rx={6} fill="#1d3a2c" opacity={0.85} />
          <rect x={120} y={70} width={120} height={70} rx={3} fill="#3b6b5a" />
          <path d="M120 120 L150 100 L170 112 L200 84 L240 96" fill="none" stroke="#E9785B" strokeWidth={3} />
          <rect x={10} y={380} width={120} height={50} rx={14} fill="#c9a7d6" opacity={0.7} {...LINE} />
          <Floor color="#e2d8cb" />
        </g>
      );
    case "cricket":
      return (
        <g>
          <rect width={360} height={540} fill="#dcefe0" />
          <path d="M0 330 Q180 280 360 330 L360 540 L0 540 Z" fill="#a8d5a2" />
          <rect x={160} y={340} width={40} height={120} fill="#e8d9a8" opacity={0.8} />
          {[170, 180, 190].map((x) => (
            <rect key={x} x={x - 1.5} y={318} width={3} height={26} fill="#f7f2e8" stroke={INK} strokeWidth={1} />
          ))}
          <rect x={20} y={80} width={110} height={60} rx={6} fill="#fff" opacity={0.7} {...LINE} />
          <text x={75} y={116} textAnchor="middle" fontSize={14} fontWeight={800} fill="#2f5d46" fontFamily="var(--font-display), sans-serif">
            PAVILION
          </text>
          <Floor color="#93c98c" y={480} />
        </g>
      );
    case "bedroom":
      return (
        <g>
          <rect width={360} height={540} fill="#26364a" />
          <Window x={230} y={60} w={90} h={80} sky="#3d5578" />
          <circle cx={290} cy={88} r={12} fill="#FFE08A" />
          {[
            [40, 60],
            [90, 110],
            [150, 50],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={2} fill="#fff" opacity={0.7} />
          ))}
          <rect x={10} y={380} width={150} height={50} rx={8} fill="#4a6487" />
          <Floor color="#34465d" />
        </g>
      );
    default:
      return <rect width={360} height={540} fill="#F5EFE3" />;
  }
}
