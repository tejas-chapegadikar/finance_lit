// Shared styles. Quiet surfaces, one strong action: a white surface with a
// hairline border is the only "card", and it's used for things you can act
// on — sections are separated by space and dividers instead. Colour meanings,
// used the same way everywhere: violet for actions and navigation, green for
// progress, orange for XP, rewards and streaks.

const control =
  "inline-flex items-center justify-center gap-2 font-semibold transition duration-150 ease-out select-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50";

export const primaryButton = `${control} rounded-xl bg-brand-600 px-5 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(30_28_26/0.18)] hover:bg-brand-700`;

// The same violet action — kept as its own name for quiz and scenario steps.
export const skyButton = primaryButton;

// A white button for dark surfaces.
export const lightButton = `${control} rounded-xl bg-white px-5 py-2.5 text-sm text-slate-900 hover:bg-slate-100`;

export const secondaryButton = `${control} rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-900 hover:border-slate-300 hover:bg-slate-50`;

// A quieter action inside a section.
export const softButton = `${control} rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-900 hover:bg-slate-200`;

// The standard surface: white with a hairline, no shadow.
export const card = "rounded-2xl border border-slate-200 bg-white";

// A surface that is itself a link or button — lifts a little on hover.
export const tile = `${card} transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-18px_rgb(30_28_26/0.35)]`;

// The one dark surface on a page, for its main focus (e.g. the next lesson).
export const spotlight = "relative isolate overflow-hidden rounded-3xl bg-slate-900 text-white";

// Small neutral label, e.g. "5 min" or "Level 2".
export const badge = "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700";

// A section heading's small context line.
export const eyebrow = "text-[13px] font-medium text-slate-500";
