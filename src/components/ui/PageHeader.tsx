import Link from "next/link";

/**
 * The top of every app page, set like an editorial header: a quiet context
 * line, a large Fraunces title, a short description and an optional row
 * below (facts, metrics, progress or actions). No banner box, the page's
 * main focus gets the colour, not its title.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  aside,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** An icon tile shown beside the title. */
  icon?: React.ReactNode;
  /** Shown to the right of the title on wide screens (e.g. a balance), below it on phones. */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex animate-fade-up flex-col gap-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {icon}
          <div className="min-w-0">
            {eyebrow && <p className="text-[13px] font-medium text-slate-500">{eyebrow}</p>}
            <h1 className="mt-1 text-[2.1rem] leading-[1.05] text-slate-900 sm:text-[2.75rem]">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">{description}</p>}
          </div>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children}
    </header>
  );
}

/** A row of small facts under a page title, e.g. "4 minutes · 3 decisions · +50 XP". */
export function MetaRow({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-1.5">
          {item}
        </li>
      ))}
    </ul>
  );
}

export type Stat = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** Colour for the value, e.g. orange for XP. */
  tone?: string;
};

/**
 * Numbers set like a statement: small label, big Fraunces figure, thin rules
 * between columns. `onPanel` is for dark surfaces.
 */
export function StatStrip({ stats, label, onPanel = false }: { stats: Stat[]; label?: string; onPanel?: boolean }) {
  return (
    <dl
      aria-label={label}
      className={`grid border-y ${onPanel ? "divide-x divide-white/10 border-white/10" : "divide-x divide-slate-200 border-slate-200"}`}
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex min-w-0 flex-col-reverse justify-end gap-1 px-3 py-3.5 first:pl-0 sm:px-5">
          <dd
            className={`font-display text-xl leading-none font-semibold whitespace-nowrap tabular-nums sm:text-[1.75rem] ${
              stat.tone ?? (onPanel ? "text-white" : "text-slate-900")
            }`}
          >
            {stat.value}
          </dd>
          <dt className={`flex items-center gap-1.5 text-xs font-medium sm:text-[13px] ${onPanel ? "text-white/60" : "text-slate-500"}`}>
            {stat.icon && <span aria-hidden className="[&>svg]:h-3.5 [&>svg]:w-3.5">{stat.icon}</span>}
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/** A warm one-line notice with a small badge, e.g. the streak. */
export function Callout({ badge, children, href }: { badge: React.ReactNode; children: React.ReactNode; href?: string }) {
  const body = (
    <>
      <span className="flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-xl bg-orange-500 px-2 font-display text-base font-semibold text-white">
        {badge}
      </span>
      <span className="min-w-0 text-sm leading-snug text-orange-950">{children}</span>
    </>
  );
  const className = "flex items-center gap-3 rounded-2xl bg-orange-50 p-2 pr-4 ring-1 ring-orange-100";
  return href ? (
    <Link href={href} className={`${className} transition hover:bg-orange-100/70`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
