const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TONES = {
  // On a white card.
  light: { track: "stroke-brand-100", arc: "stroke-brand-600", value: "text-slate-900", caption: "text-slate-600" },
  // On the blue hero surface — plain white text keeps AA contrast there.
  dark: { track: "stroke-white/20", arc: "stroke-orange-300", value: "text-white", caption: "text-white" },
};

export function ReadinessRing({
  score,
  label = "Financial Readiness",
  tone = "light",
  size = "md",
}: {
  score: number;
  label?: string;
  tone?: keyof typeof TONES;
  size?: "sm" | "md";
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const colors = TONES[tone];

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`relative shrink-0 ${size === "sm" ? "h-28 w-28" : "h-36 w-36"}`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="11" className={colors.track} />
        {/* A round cap on a zero-length arc still paints a dot, so skip the arc at 0. */}
        {clamped > 0 && (
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
            className={`${colors.arc} transition-[stroke-dashoffset] duration-700`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`leading-none font-extrabold ${colors.value} ${size === "sm" ? "text-3xl" : "text-4xl"}`}>
          {clamped}
        </span>
        <span className={`mt-1 text-xs font-semibold ${colors.caption}`}>/ 100</span>
      </div>
    </div>
  );
}
