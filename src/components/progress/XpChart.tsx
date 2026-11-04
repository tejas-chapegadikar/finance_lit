// XP earned per day, as a smooth line with a soft purple area — one series,
// so no legend; each day has a hover title and there's a table view. Server
// rendered SVG: crisp at any size, nothing to download.

export type XpDay = { day: string; label: string; xp: number };

const W = 640;
const H = 200;
const PAD = { top: 28, right: 12, bottom: 28, left: 12 };

/** A smooth path through points (Catmull-Rom → cubic Bézier). */
function smooth(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function XpChart({ days, caption }: { days: XpDay[]; caption: string }) {
  const max = Math.max(10, ...days.map((d) => d.xp));
  const top = Math.ceil(max / 10) * 10;
  const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, days.length - 1);
  const y = (v: number) => PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom);
  const pts = days.map((d, i) => ({ x: x(i), y: y(d.xp) }));
  const line = smooth(pts);
  const area = `${line} L ${pts.at(-1)!.x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`;
  const best = days.reduce((b, d, i) => (d.xp > days[b].xp ? i : b), 0);
  const showEvery = days.length > 10 ? Math.ceil(days.length / 7) : 1;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="xp-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="var(--color-slate-200)" />
        <path d={area} fill="url(#xp-area)" />
        <path d={line} fill="none" stroke="var(--color-brand-600)" strokeWidth={2.5} strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={days[i].day}>
            <title>{`${days[i].label}: ${days[i].xp} XP`}</title>
            {/* A bigger invisible target than the dot. */}
            <rect x={p.x - 14} y={PAD.top} width={28} height={H - PAD.top - PAD.bottom} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={i === best && days[i].xp > 0 ? 5 : 3.5} fill="white" stroke="var(--color-brand-600)" strokeWidth={2} />
          </g>
        ))}
        {days[best].xp > 0 && (
          <g>
            <rect x={Math.min(W - PAD.right - 64, Math.max(PAD.left, pts[best].x - 32))} y={pts[best].y - 30} width={64} height={22} rx={8} fill="var(--color-brand-600)" />
            <text
              x={Math.min(W - PAD.right - 32, Math.max(PAD.left + 32, pts[best].x))}
              y={pts[best].y - 15}
              textAnchor="middle"
              className="fill-white text-[12px] font-semibold"
            >
              {days[best].xp} XP
            </text>
          </g>
        )}
        {days.map((d, i) =>
          i % showEvery === 0 || i === days.length - 1 ? (
            <text key={d.day} x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[11px]">
              {d.label}
            </text>
          ) : null,
        )}
      </svg>
      <details className="mt-1 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-brand-700">Show as a table</summary>
        <table className="mt-2 w-full max-w-xs text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th scope="col" className="py-1 font-medium">Day</th>
              <th scope="col" className="py-1 text-right font-medium">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {days.map((d) => (
              <tr key={d.day}>
                <td className="py-1 text-slate-700">{d.label}</td>
                <td className="py-1 text-right font-medium text-slate-900 tabular-nums">{d.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
