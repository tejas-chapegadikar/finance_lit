// Shown inside the app shell (sidebar / tab bar stay put) while a page's
// lessons, quiz or progress load: the shape of a page, header, one dark
// focus card, a row of tiles, in a soft shimmer.
export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-8 w-64 max-w-full rounded-lg" />
          <div className="skeleton h-4 w-48 max-w-full rounded" />
        </div>
      </div>
      <div aria-hidden className="grid grid-cols-4 gap-px overflow-hidden border-y border-slate-200">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 py-4 pr-4">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-7 w-20 rounded-md" />
          </div>
        ))}
      </div>
      <div aria-hidden className="h-64 animate-pulse rounded-3xl bg-brand-200/70" />
      <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton col-span-2 h-40 rounded-2xl lg:col-span-1" />
      </div>
    </div>
  );
}
