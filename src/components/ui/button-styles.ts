// Shared styles. Calm and flat on purpose: solid buttons, white cards with a
// thin border, no decorative shadows. Colour meanings, used the same way
// everywhere: brand blue for actions and navigation, orange only for
// streaks, gold (amber) for XP and achievements.

const control =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50";

// brand-600 is the lightest blue where white button text clears WCAG AA (4.7:1).
export const primaryButton = `${control} rounded-xl bg-brand-600 px-5 py-2.5 text-sm text-white hover:bg-brand-700`;

// The same blue action — kept as its own name for quiz and scenario steps.
export const skyButton = primaryButton;

// A white button for use on solid blue sections.
export const lightButton = `${control} rounded-xl bg-white px-5 py-2.5 text-sm text-brand-800 hover:bg-brand-50`;

export const secondaryButton = `${control} rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-800 hover:bg-slate-50`;

// A quieter action inside a card.
export const softButton = `${control} rounded-xl bg-brand-50 px-4 py-2 text-sm text-brand-800 hover:bg-brand-100`;

// The standard white card on the light page background.
export const card = "rounded-2xl border border-slate-200 bg-white";

// A card that is itself a link or button.
export const tile = "rounded-2xl border border-slate-200 bg-white transition-colors hover:border-brand-300";

// Small neutral label, e.g. "5 min" or "Level 2".
export const badge = "inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700";
