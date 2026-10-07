export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-sm shadow-brand-900/20 ring-1 ring-white/20"
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5">
          <path d="M17.5 6 9 18h5.5l-1 8L23 14h-5.5l0-8z" fill="#fdba74" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        Stock<span className={light ? "text-white" : "text-brand-700"}>Streak</span>
      </span>
    </span>
  );
}
