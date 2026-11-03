import Link from "next/link";

/**
 * The top of every app page: a violet panel with a pill-shaped context line,
 * the title, an optional description and an optional row below (meta, stats,
 * progress or actions). Anything placed inside sits on violet, so it should
 * use white text — `MetaRow`, `StatStrip` and `Callout` already do.
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
  /** An emoji or element shown in a rounded square beside the title. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-[2rem] bg-brand-600 px-5 py-6 text-white sm:px-8 sm:py-8">
      {/* Faint rings, like the backdrop of a game screen. */}
      <span aria-hidden className="pointer-events-none absolute -top-28 -right-20 -z-10 h-80 w-80 rounded-full border-[36px] border-white/[0.06]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-72 w-72 rounded-full border-[28px] border-white/[0.05]" />
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          {icon && (
            <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="mb-2 inline-flex max-w-full rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                <span className="truncate">{eyebrow}</span>
              </p>
            )}
            <h1 className="text-3xl leading-tight font-semibold text-white sm:text-4xl">{title}</h1>
            {description && <p className="mt-1.5 max-w-2xl text-white/85">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}

/** A row of small facts in pills under a page title, e.g. "4 minutes", "3 decisions", "+50 XP". */
export function MetaRow({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-brand-800/40 px-3 py-1">
          {item}
        </li>
      ))}
    </ul>
  );
}



export type Stat = { label: string; value: React.ReactNode; icon: React.ReactNode };

/**
 * The game-style stat card: icon, small caps label and a big number per
 * column, split by thin dividers. Violet on the page; translucent inside a
 * `PageHeader`.
 */
export function StatStrip({ stats, label, onPanel = false }: { stats: Stat[]; label?: string; onPanel?: boolean }) {
  return (
    <dl
      aria-label={label}
      className={`grid divide-x divide-white/15 rounded-3xl py-4 text-white ${onPanel ? "bg-brand-800/35" : "bg-brand-600"}`}
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse items-center gap-0.5 px-2 text-center">
          <dd className="font-display text-xl font-semibold whitespace-nowrap tabular-nums sm:text-2xl">{stat.value}</dd>
          <dt className="flex flex-col items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/75 uppercase sm:text-xs">
            <span aria-hidden className="text-white">
              {stat.icon}
            </span>
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/** The warm peach card with a rounded badge on the left, e.g. a streak callout. */
export function Callout({
  badge,
  children,
  href,
}: {
  badge: React.ReactNode;
  children: React.ReactNode;
  /** Wraps the whole callout in a link when set. */
  href?: string;
}) {
  const body = (
    <>
      <span className="flex h-14 min-w-14 shrink-0 items-center justify-center gap-1 rounded-2xl bg-orange-600 px-3 font-display text-xl font-semibold text-white">
        {badge}
      </span>
      <span className="min-w-0 text-[15px] leading-snug font-medium text-orange-950">{children}</span>
    </>
  );
  const className = "flex items-center gap-4 rounded-3xl bg-peach-300 p-3 pr-5";
  return href ? (
    <Link href={href} className={`${className} transition hover:bg-peach-200`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
