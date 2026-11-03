/** The StockStreak mark (a spark on violet) and a Fraunces wordmark. */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-600">
        <svg viewBox="0 0 32 32" className="h-5 w-5">
          <path d="M17.5 5.5 9 18h5.6l-1.1 8.5L23 14h-5.6z" fill="#ffd3a8" />
        </svg>
      </span>
      <span
        className={`font-display text-[1.35rem] leading-none font-semibold ${light ? "text-white" : "text-slate-900"}`}
        style={{ fontVariationSettings: '"SOFT" 100' }}
      >
        StockStreak
      </span>
    </span>
  );
}
