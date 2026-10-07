/** The numbered heading that walks a student through a lesson's parts. */
export function StepLabel({ id, step, title, icon }: { id?: string; step: number; title: string; icon: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
        {step}
      </span>
      <span className="text-lg font-extrabold text-slate-900">
        <span aria-hidden>{icon}</span> {title}
      </span>
    </h2>
  );
}
