// Kept free of Prisma imports so client components (the admin lesson form)
// can use it. Values mirror the ReadinessArea enum in schema.prisma.
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
  /** Readiness score name on the dashboard. */
  label: string;
  /** Curriculum group name the lessons are organised under (blueprint §6). */
  group: string;
  icon: string;
  chipBg: string;
  /** -700 text clears WCAG AA on white and on chipBg; -600 doesn't for most hues. */
  labelText: string;
};

export const READINESS_AREA_META: Record<ReadinessAreaValue, AreaMeta> = {
  BUDGETING: {
    label: "Budgeting",
    group: "Foundation",
    icon: "💰",
    chipBg: "bg-emerald-100",
    labelText: "text-emerald-700",
  },
  DIGITAL_SAFETY: {
    label: "Digital Safety",
    group: "Money Safety",
    icon: "🔒",
    chipBg: "bg-sky-100",
    labelText: "text-sky-700",
  },
  BANKING: {
    label: "Banking",
    group: "Banking",
    icon: "🏦",
    chipBg: "bg-slate-100",
    labelText: "text-slate-700",
  },
  CREDIT: {
    label: "Credit",
    group: "Credit",
    icon: "💳",
    chipBg: "bg-pink-100",
    labelText: "text-pink-700",
  },
  TAX: {
    label: "Tax",
    group: "First Salary",
    icon: "🧾",
    chipBg: "bg-amber-100",
    labelText: "text-amber-700",
  },
  INVESTING: {
    label: "Investing",
    group: "Growing Money",
    icon: "📈",
    chipBg: "bg-violet-100",
    labelText: "text-violet-700",
  },
};
