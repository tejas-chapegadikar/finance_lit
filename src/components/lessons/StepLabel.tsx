/** The numbered heading that walks a student through a lesson's parts. */
export function StepLabel({ id, step, title }: { id?: string; step: number; title: string; icon?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        {step}
      </span>
      <span className="text-lg font-extrabold text-slate-900">
        {title}
      </span>
    </h2>
  );
}
