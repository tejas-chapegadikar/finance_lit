const SIZES = {
  md: { box: "h-20 w-16", disc: "h-14 w-14", face: "h-10 w-10 text-2xl", tail: "h-7 w-4" },
  lg: { box: "h-36 w-28", disc: "h-28 w-28", face: "h-20 w-20 text-5xl", tail: "h-12 w-7" },
};

// The ribbon tail's notched end.
const TAIL_SHAPE = "[clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]";

/**
 * A medal on a ribbon, for badges and celebrations: gold when earned, grey
 * when still locked. Purely decorative — pair it with a text label.
 */
export function Medal({ icon, earned = true, size = "md" }: { icon: string; earned?: boolean; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span aria-hidden className={`relative inline-flex shrink-0 justify-center ${s.box}`}>
      <span className="absolute bottom-0 flex gap-0.5">
        <span className={`${s.tail} ${TAIL_SHAPE} origin-top rotate-12 ${earned ? "bg-rose-500" : "bg-slate-300"}`} />
        <span className={`${s.tail} ${TAIL_SHAPE} origin-top -rotate-12 ${earned ? "bg-rose-600" : "bg-slate-400"}`} />
      </span>
      <span
        className={`relative flex items-center justify-center rounded-full ${s.disc} ${
          earned
            ? "bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500 shadow-[0_4px_0_0_var(--color-orange-700)]"
            : "bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_4px_0_0_var(--color-slate-400)]"
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-full ${s.face} ${
            earned ? "bg-amber-50 ring-2 ring-amber-300" : "bg-slate-50 opacity-70 ring-2 ring-slate-300 grayscale"
          }`}
        >
          {icon}
        </span>
      </span>
    </span>
  );
}
