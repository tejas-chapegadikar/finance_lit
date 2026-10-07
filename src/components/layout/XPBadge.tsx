export function XPBadge({ xpTotal }: { xpTotal: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 ring-1 ring-orange-200">
      <span aria-hidden>⭐</span>
      {xpTotal.toLocaleString("en-IN")} XP
    </span>
  );
}
