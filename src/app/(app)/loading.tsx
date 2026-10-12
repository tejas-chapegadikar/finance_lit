// Shown inside the app shell (sidebar / tab bar stay put) while a page's
// lessons, quiz or progress load.
export default function AppLoading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="flex flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div aria-hidden className="grid gap-5 lg:grid-cols-5">
        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-3" />
        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
      </div>
      <div aria-hidden className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        Loading…
      </div>
    </div>
  );
}
