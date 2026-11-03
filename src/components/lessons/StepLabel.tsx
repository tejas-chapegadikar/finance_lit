/** The numbered heading that walks a student through a lesson's parts: "02  Learn". */
export function StepLabel({ id, step, title, tone = "light" }: { id?: string; step: number; title: string; icon?: string; tone?: "light" | "dark" }) {
  return (
    <h2 id={id} className="flex items-baseline gap-3">
      <span className={`font-display text-sm font-semibold tabular-nums ${tone === "dark" ? "text-brand-300" : "text-brand-600"}`}>
        {String(step).padStart(2, "0")}
      </span>
      <span className={`text-2xl leading-tight ${tone === "dark" ? "text-white" : "text-slate-900"}`}>{title}</span>
    </h2>
  );
}
