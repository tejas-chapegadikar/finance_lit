import type { Challenge } from "@/lib/challenges";
import { CalendarCheckIcon, CoffeeIcon, PencilIcon, ShoppingBagIcon, VaultIcon } from "@/components/ui/icons";

const ICONS: Record<Challenge["icon"], { Glyph: (p: { className?: string }) => React.ReactNode; tone: string }> = {
  habit: { Glyph: CalendarCheckIcon, tone: "bg-brand-50 text-brand-700" },
  delivery: { Glyph: CoffeeIcon, tone: "bg-orange-50 text-orange-700" },
  jar: { Glyph: VaultIcon, tone: "bg-emerald-50 text-emerald-700" },
  impulse: { Glyph: ShoppingBagIcon, tone: "bg-rose-50 text-rose-700" },
  tracker: { Glyph: PencilIcon, tone: "bg-sky-50 text-sky-700" },
};

const SIZES = { md: "h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5", lg: "h-14 w-14 rounded-2xl [&>svg]:h-7 [&>svg]:w-7" };

/** A challenge's icon on its tint. */
export function ChallengeIcon({ icon, size = "md" }: { icon: Challenge["icon"]; size?: keyof typeof SIZES }) {
  const { Glyph, tone } = ICONS[icon];
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center ${SIZES[size]} ${tone}`}>
      <Glyph />
    </span>
  );
}
