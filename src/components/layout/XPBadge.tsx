export function XPBadge({ xpTotal }: { xpTotal: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-amber-800 ring-2 ring-amber-200 shadow-[0_3px_0_0_var(--color-amber-200)]">
      <span aria-hidden>⭐</span>
      {xpTotal.toLocaleString("en-IN")} XP
    </span>
  );
}
