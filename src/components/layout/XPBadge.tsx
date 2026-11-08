import { StarIcon } from "@/components/ui/icons";
import { CountUp } from "@/components/ui/CountUp";

/** The student's XP in the navigation, orange, the colour of XP everywhere. */
export function XPBadge({ xpTotal, id }: { xpTotal: number; id: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-sm font-semibold text-orange-800 ring-1 ring-orange-100">
      <StarIcon className="h-4 w-4 text-orange-500" />
      <CountUp value={xpTotal} id={id} className="tabular-nums" /> XP
    </span>
  );
}
