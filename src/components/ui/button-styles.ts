// Shared styles. Soft and rounded: violet panels, white cards that float on
// the lavender page with a faint shadow, pill-shaped labels. Colour meanings,
// used the same way everywhere: brand violet for actions and navigation,
// orange/peach only for streaks, gold (amber) for XP and achievements.

const control =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50";

export const primaryButton = `${control} rounded-2xl bg-brand-600 px-5 py-2.5 text-sm text-white shadow-sm shadow-brand-700/25 hover:bg-brand-700`;

// The same violet action — kept as its own name for quiz and scenario steps.
export const skyButton = primaryButton;

// A white button for use on violet panels.
export const lightButton = `${control} rounded-2xl bg-white px-5 py-2.5 text-sm text-brand-700 hover:bg-brand-50`;

export const secondaryButton = `${control} rounded-2xl bg-white px-5 py-2.5 text-sm text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50`;

// A quieter action inside a card — the lavender pill from the tab switcher.
export const softButton = `${control} rounded-2xl bg-brand-100 px-4 py-2 text-sm text-brand-800 hover:bg-brand-200`;

// The standard white card on the lavender page background.
export const card = "rounded-3xl bg-white shadow-[0_6px_24px_-14px_rgb(60_40_180/0.28)] ring-1 ring-brand-100/70";

// A card that is itself a link or button.
export const tile = `${card} transition hover:ring-brand-300 hover:shadow-[0_10px_28px_-14px_rgb(60_40_180/0.38)]`;

// Small neutral label, e.g. "5 min" or "Level 2".
export const badge = "inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800";
