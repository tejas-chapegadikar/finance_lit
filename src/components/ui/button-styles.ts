// Orange is the action color. orange-700 is the lightest step where white
// button text still clears WCAG AA (5.2:1 — orange-600 is only 3.6:1).
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-orange-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-900/20 transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

// For secondary actions on a white card, in the brand blue.
export const softButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-50 px-5 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50";

// The standard white card on the blue-grey page background.
export const card = "rounded-3xl bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5";

// The blue hero surface. Text on it must be plain white (no opacity) to
// keep AA contrast against the lighter end of the gradient.
export const heroSurface =
  "rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-lg shadow-brand-900/20";
