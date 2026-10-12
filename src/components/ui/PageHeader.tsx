/**
 * The top of every app page: a small context line, the title, an optional
 * description and an optional row below (meta, progress or actions). Plain
 * text on the page background — no banner box.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** An emoji or element shown in a square beside the title. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {icon && (
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="text-sm font-semibold text-brand-700">{eyebrow}</p>}
          <h1 className="text-3xl leading-tight font-extrabold text-slate-900 sm:text-4xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-slate-600">{description}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}

/** A row of small facts under a page title, e.g. "4 minutes · 3 decisions · +50 XP". */
export function MetaRow({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-1.5">
          {item}
        </li>
      ))}
    </ul>
  );
}
