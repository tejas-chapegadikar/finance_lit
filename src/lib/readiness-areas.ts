// Kept free of Prisma imports so client components (the admin forms) can use
// it. Values mirror the ReadinessArea enum in schema.prisma.
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
  chipBg: string;
  /** -700 text clears WCAG AA on white and on chipBg; -600 doesn't for most hues. */
  labelText: string;
};

export const READINESS_AREA_META: Record<ReadinessAreaValue, AreaMeta> = {
  BUDGETING: { label: "Budgeting", icon: "💰", chipBg: "bg-emerald-100", labelText: "text-emerald-700" },
  DIGITAL_SAFETY: { label: "Digital Safety", icon: "🛡️", chipBg: "bg-rose-100", labelText: "text-rose-700" },
  BANKING: { label: "Banking", icon: "🏦", chipBg: "bg-slate-100", labelText: "text-slate-700" },
  CREDIT: { label: "Credit", icon: "💳", chipBg: "bg-violet-100", labelText: "text-violet-700" },
  TAX: { label: "Taxes", icon: "🧾", chipBg: "bg-amber-100", labelText: "text-amber-700" },
  INVESTING: { label: "Investing", icon: "📈", chipBg: "bg-teal-100", labelText: "text-teal-700" },
};
