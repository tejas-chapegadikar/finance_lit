// Fixed positions so the server and browser render the same pieces.
const PIECES = [
  { left: "6%", top: "14%", color: "bg-amber-300", shape: "h-2 w-3 rotate-12" },
  { left: "14%", top: "52%", color: "bg-emerald-400", shape: "h-2.5 w-2.5 rounded-full" },
  { left: "22%", top: "26%", color: "bg-rose-400", shape: "h-3 w-1.5 -rotate-12" },
  { left: "30%", top: "72%", color: "bg-brand-300", shape: "h-2 w-2 rotate-45" },
  { left: "38%", top: "10%", color: "bg-orange-400", shape: "h-1.5 w-3 rotate-[30deg]" },
  { left: "62%", top: "12%", color: "bg-emerald-300", shape: "h-3 w-1.5 rotate-12" },
  { left: "70%", top: "64%", color: "bg-amber-300", shape: "h-2.5 w-2.5 rounded-full" },
  { left: "78%", top: "24%", color: "bg-brand-300", shape: "h-2 w-3 -rotate-[20deg]" },
  { left: "86%", top: "48%", color: "bg-rose-400", shape: "h-2 w-2 rotate-45" },
  { left: "93%", top: "16%", color: "bg-orange-300", shape: "h-3 w-1.5 -rotate-12" },
  { left: "48%", top: "6%", color: "bg-rose-300", shape: "h-1.5 w-1.5 rounded-full" },
  { left: "8%", top: "82%", color: "bg-orange-300", shape: "h-2 w-2 rounded-full" },
  { left: "90%", top: "80%", color: "bg-emerald-400", shape: "h-1.5 w-3 rotate-[35deg]" },
];

/** Scattered confetti for a celebration background. Decoration only. */
export function Confetti() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className={`absolute rounded-[2px] ${piece.color} ${piece.shape}`}
          style={{ left: piece.left, top: piece.top }}
        />
      ))}
    </span>
  );
}
