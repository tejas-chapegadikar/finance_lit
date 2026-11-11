// Home's own loading shape: the same rows and sizes as the hub, so nothing
// below it jumps when the real page arrives.
export default function HomeLoading() {
  const bubble = "skeleton h-full min-h-[6.25rem] rounded-3xl md:h-auto md:min-h-[8rem]";
  return (
    <div role="status" aria-live="polite" className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="flex h-9 items-center justify-between gap-2">
        <div className="skeleton h-6 w-32 rounded-lg" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
      <div
        aria-hidden
        className="mx-auto grid w-full max-w-md grid-cols-2 items-center gap-x-3 gap-y-3 [grid-template-areas:'learn_money'_'hero_hero'_'invest_invest'] md:max-w-4xl md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] md:gap-x-8 md:[grid-template-areas:'learn_hero_money'_'._invest_.']"
      >
        <div className={`${bubble} [grid-area:learn]`} />
        <div className={`${bubble} [grid-area:money]`} />
        <div className="flex items-center gap-2 [grid-area:hero] md:flex-col-reverse md:gap-3">
          <div className="skeleton h-40 w-28 shrink-0 rounded-full md:h-56 md:w-40" />
          <div className="skeleton h-28 min-w-0 flex-1 rounded-3xl md:w-full md:flex-none" />
        </div>
        <div className={`${bubble} w-full max-w-[16rem] justify-self-center [grid-area:invest]`} />
      </div>
      <div aria-hidden className="skeleton mx-auto h-12 w-full max-w-md rounded-2xl" />
    </div>
  );
}
