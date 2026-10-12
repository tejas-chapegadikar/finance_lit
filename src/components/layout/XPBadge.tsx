import { StarIcon } from "@/components/ui/icons";

export function XPBadge({ xpTotal }: { xpTotal: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">
      <StarIcon className="h-4 w-4 text-amber-600" />
      {xpTotal.toLocaleString("en-IN")} XP
    </span>
  );
}
