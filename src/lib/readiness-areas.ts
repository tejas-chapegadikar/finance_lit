// Kept free of Prisma imports so client components can use it. Values
// mirror the ReadinessArea enum in schema.prisma.
export const READINESS_AREA_VALUES = [
  "BUDGETING",
  "DIGITAL_SAFETY",
  "BANKING",
  "CREDIT",
  "TAX",
  "INVESTING",
] as const;

export type ReadinessAreaValue = (typeof READINESS_AREA_VALUES)[number];

type AreaMeta = {
  /** The category name shown on lessons and in the readiness breakdown. */
  label: string;
  icon: string;
  /** A quiet tint behind the area's icon. */
  chipBg: string;
  /** -700 text clears WCAG AA on white and on chipBg; -600 doesn't for most hues. */
  labelText: string;
  /** A small solid swatch for dots and bars. */
  dot: string;
};

// Each learning area gets a quiet colour of its own — used for icon tiles,
// small labels and dots, never for large surfaces.
export const READINESS_AREA_META: Record<ReadinessAreaValue, AreaMeta> = {
  BUDGETING: { label: "Budgeting", icon: "💰", chipBg: "bg-emerald-50", labelText: "text-emerald-700", dot: "bg-emerald-500" },
  DIGITAL_SAFETY: { label: "Digital Safety", icon: "🛡️", chipBg: "bg-rose-50", labelText: "text-rose-700", dot: "bg-rose-500" },
  BANKING: { label: "Banking", icon: "🏦", chipBg: "bg-sky-50", labelText: "text-sky-700", dot: "bg-sky-500" },
  CREDIT: { label: "Credit", icon: "💳", chipBg: "bg-violet-50", labelText: "text-violet-700", dot: "bg-violet-500" },
  TAX: { label: "Taxes", icon: "🧾", chipBg: "bg-amber-50", labelText: "text-amber-700", dot: "bg-amber-500" },
  INVESTING: { label: "Investing", icon: "📈", chipBg: "bg-teal-50", labelText: "text-teal-700", dot: "bg-teal-500" },
};
