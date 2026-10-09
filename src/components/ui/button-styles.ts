// Chunky, game-style "pressable" buttons: a solid face sitting on a darker
// edge (the hard box-shadow underneath) that sinks when pressed.
const pressable =
  "inline-flex items-center justify-center gap-2 font-bold transition-[transform,box-shadow,background-color] duration-100 active:translate-y-[3px] disabled:pointer-events-none disabled:opacity-50";

// Orange is the action colour. orange-700 is the lightest step where white
// button text still clears WCAG AA (5.2:1 — orange-600 is only 3.6:1).
export const primaryButton = `${pressable} rounded-2xl bg-orange-700 px-6 py-3 text-sm text-white shadow-[0_4px_0_0_var(--color-orange-900)] hover:bg-orange-800 active:shadow-[0_1px_0_0_var(--color-orange-900)]`;

// Sky blue, for moving through a quiz (Next question / Finish quiz).
export const skyButton = `${pressable} rounded-2xl bg-brand-600 px-6 py-3 text-sm text-white shadow-[0_4px_0_0_var(--color-brand-800)] hover:bg-brand-700 active:shadow-[0_1px_0_0_var(--color-brand-800)]`;

export const secondaryButton = `${pressable} rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 text-sm text-slate-700 shadow-[0_4px_0_0_var(--color-slate-200)] hover:bg-slate-50 active:shadow-[0_1px_0_0_var(--color-slate-200)]`;

// For secondary actions on a white card, in the brand blue.
export const softButton = `${pressable} rounded-xl bg-brand-50 px-5 py-2.5 text-sm text-brand-700 ring-1 ring-brand-100 shadow-[0_3px_0_0_var(--color-brand-200)] hover:bg-brand-100 active:shadow-[0_0_0_0_var(--color-brand-200)]`;

// The standard white card on the light page background.
export const card = "rounded-3xl bg-white shadow-[0_2px_14px_-6px_rgb(15_23_42/0.12)] ring-1 ring-slate-900/5";

// A white card that sits on a hard edge, like the buttons — for tappable tiles.
export const tile = "rounded-2xl bg-white ring-1 ring-slate-900/5 shadow-[0_4px_0_0_var(--color-slate-200)]";

// The bright sky header surface. Its light top-left corner (brand-500) only
// clears AA for large text, so small text on it goes in a `heroChip`.
export const heroSurface =
  "rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-lg shadow-brand-900/20";

export const heroChip =
  "inline-flex items-center gap-1.5 rounded-full bg-brand-900/40 px-3 py-1 text-xs font-bold text-white";

// A deeper blue for blocks with running text in white.
export const deepSurface =
  "rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg shadow-brand-900/20";
