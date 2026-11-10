// A small, one-off celebration: a dozen dots and stars flying out from the
// centre of whatever relative box holds it. CSS only, plays once, and
// disappears for reduced motion. Decorative.

const PIECES = [
  { x: -46, y: -30, c: "bg-orange-400", s: "h-2 w-2 rounded-full" },
  { x: 42, y: -36, c: "bg-amber-400", s: "h-2 w-2 rounded-sm rotate-45" },
  { x: -30, y: 34, c: "bg-emerald-400", s: "h-1.5 w-1.5 rounded-full" },
  { x: 50, y: 22, c: "bg-orange-300", s: "h-2.5 w-1 rounded-full" },
  { x: 6, y: -50, c: "bg-emerald-500", s: "h-1.5 w-1.5 rounded-full" },
  { x: -56, y: 4, c: "bg-brand-400", s: "h-1.5 w-1.5 rounded-full" },
  { x: 24, y: 46, c: "bg-orange-500", s: "h-2 w-2 rounded-sm rotate-12" },
  { x: -14, y: -44, c: "bg-brand-300", s: "h-1 w-2.5 rounded-full" },
  { x: 58, y: -6, c: "bg-emerald-300", s: "h-2 w-2 rounded-full" },
  { x: -40, y: -50, c: "bg-orange-200", s: "h-1.5 w-1.5 rounded-full" },
];

export function Burst({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute top-1/2 left-1/2 ${className}`}>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`absolute animate-burst ${p.c} ${p.s}`}
          style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, animationDelay: `${(i % 4) * 40}ms` } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
