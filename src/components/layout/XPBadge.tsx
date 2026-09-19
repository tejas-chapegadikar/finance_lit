export function XPBadge({ xpTotal }: { xpTotal: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 px-3.5 py-1.5 text-sm font-bold text-white shadow-sm shadow-orange-500/30">
      <span aria-hidden>⚡</span>
      {xpTotal.toLocaleString()} XP
    </span>
  );
}
