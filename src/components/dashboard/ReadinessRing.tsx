const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReadinessRing({
  score,
  label = "Overall Financial Readiness",
}: {
  score: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="relative h-40 w-40 shrink-0"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" className="stroke-violet-100" />
        {/* A round cap on a zero-length arc still paints a dot, so skip the arc at 0. */}
        {clamped > 0 && (
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
            className="stroke-violet-600 transition-[stroke-dashoffset] duration-700"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl leading-none font-extrabold text-neutral-900">{clamped}</span>
        <span className="mt-1 text-xs font-semibold text-neutral-500">out of 100</span>
      </div>
    </div>
  );
}
