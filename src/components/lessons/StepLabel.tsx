/** The numbered heading that walks a student through a lesson's parts. */
export function StepLabel({ id, step, title, icon }: { id?: string; step: number; title: string; icon: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white shadow-[0_3px_0_0_var(--color-brand-800)]">
        {step}
      </span>
      <span className="text-lg font-extrabold text-slate-900">
        <span aria-hidden>{icon}</span> {title}
      </span>
    </h2>
  );
}
