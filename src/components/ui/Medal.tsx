const SIZES = {
  md: { box: "h-20 w-16", disc: "h-14 w-14", face: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5", tail: "h-7 w-4" },
  lg: { box: "h-36 w-28", disc: "h-28 w-28", face: "h-20 w-20 [&>svg]:h-10 [&>svg]:w-10", tail: "h-12 w-7" },
};

// The ribbon tail's notched end.
const TAIL_SHAPE = "[clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]";

/**
 * A medal on a violet ribbon, for badges and celebrations: warm gold with a
 * slow shine when earned, a quiet outline while still locked. Takes an icon
 * from the app's icon family. Purely decorative — pair it with a text label.
 */
export function Medal({ icon, earned = true, size = "md" }: { icon: React.ReactNode; earned?: boolean; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span aria-hidden className={`relative inline-flex shrink-0 justify-center ${s.box}`}>
      <span className="absolute bottom-0 flex gap-0.5">
        <span className={`${s.tail} ${TAIL_SHAPE} origin-top rotate-12 ${earned ? "bg-brand-500" : "bg-slate-200"}`} />
        <span className={`${s.tail} ${TAIL_SHAPE} origin-top -rotate-12 ${earned ? "bg-brand-700" : "bg-slate-300"}`} />
      </span>
      <span
        className={`relative flex items-center justify-center overflow-hidden rounded-full ${s.disc} ${
          earned
            ? "bg-gradient-to-br from-amber-200 via-orange-300 to-orange-500 shadow-[0_10px_20px_-12px_rgb(194_65_12/0.7)]"
            : "bg-slate-100 ring-1 ring-slate-200"
        }`}
      >
        {earned && <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 animate-shine bg-white/45 blur-[2px]" />}
        <span
          className={`relative flex items-center justify-center rounded-full ${s.face} ${
            earned ? "bg-white/90 text-orange-700 ring-1 ring-white" : "bg-white text-slate-400 ring-1 ring-slate-200"
          }`}
        >
          {icon}
        </span>
      </span>
    </span>
  );
}
