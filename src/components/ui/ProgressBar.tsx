/**
 * A progress bar that grows in from zero when it first appears (pure CSS, so
 * it works without JavaScript and stays still for reduced motion). Green by
 * default: in Rupli, progress is green.
 */
export function ProgressBar({
  value,
  max,
  label,
  valueText,
  tone = "bg-emerald-500",
  track = "bg-slate-100",
  size = "md",
  className = "",
}: {
  value: number;
  max: number;
  label: string;
  valueText?: string;
  tone?: string;
  track?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const height = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={`${height} overflow-hidden rounded-full ${track} ${className}`}
    >
      <div className={`h-full animate-bar rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * Progress in steps, e.g. three lessons in a level or three missions: one
 * segment per step, done ones green, the current one violet.
 */
export function StepBar({
  done,
  total,
  current = false,
  label,
  onDark = false,
  className = "",
}: {
  done: number;
  total: number;
  /** Mark the first unfinished step as "in progress". */
  current?: boolean;
  label: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className={`flex gap-1 ${className}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 overflow-hidden rounded-full ${onDark ? "bg-white/15" : "bg-slate-200"}`}>
          {(i < done || (current && i === done)) && (
            <span
              className={`block h-full w-full animate-bar rounded-full ${i < done ? (onDark ? "bg-emerald-400" : "bg-emerald-500") : onDark ? "bg-brand-400" : "bg-brand-500"}`}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

/** A ring for "x of y" progress, with the percentage in the middle. */
export function ProgressRing({ value, max, label, size = 76 }: { value: number; max: number; label: string; size?: number }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-slate-200)" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--color-emerald-500)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - pct}
          className={pct > 0 ? "animate-ring" : "opacity-0"}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-lg font-semibold text-slate-900">
        {pct}%
      </span>
    </div>
  );
}
