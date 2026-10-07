export const adminInput =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500";

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="text-rose-700">{error}</span>}
    </label>
  );
}

export function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
