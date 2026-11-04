// Shared styles. Light and calm: white cards with a hairline and a soft
// violet-tinted shadow on a lavender-white page, one purple gradient hero
// card per page, and a dark "game" surface kept for quizzes, results,
// achievements and rewards. Colour meanings, used the same way everywhere:
// purple for actions and navigation, green for progress and success, amber
// for warnings, orange for XP and streaks, red for errors.

const control =
  "inline-flex items-center justify-center gap-2 font-semibold transition duration-150 ease-out select-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50";

export const primaryButton = `${control} rounded-xl bg-brand-600 px-5 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_16px_-6px_rgb(91_69_224/0.55)] hover:bg-brand-700`;

// The same violet action — kept as its own name for quiz and scenario steps.
export const skyButton = primaryButton;

// A white button for dark surfaces.
export const lightButton = `${control} rounded-xl bg-white px-5 py-2.5 text-sm text-brand-700 shadow-[0_6px_16px_-8px_rgb(28_26_38/0.4)] hover:bg-brand-50`;

export const secondaryButton = `${control} rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-900 hover:border-slate-300 hover:bg-slate-50`;

// A quieter action inside a section.
export const softButton = `${control} rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-900 hover:bg-slate-200`;

// The standard surface: white, a hairline and a soft shadow.
export const card = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(28_26_38/0.04),0_8px_24px_-12px_rgb(91_69_224/0.14)]";

// A surface that is itself a link or button — lifts a little on hover.
export const tile = `${card} transition duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_2px_4px_rgb(28_26_38/0.04),0_16px_32px_-14px_rgb(91_69_224/0.28)]`;

// The page's one hero card: a soft purple gradient (e.g. the next lesson).
export const spotlight =
  "relative isolate overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(64%_0.17_284),oklch(52%_0.2_282)_60%,oklch(46%_0.19_284))] text-white shadow-[0_18px_40px_-18px_rgb(91_69_224/0.6)]";

// The game surface, for quizzes, results, achievements and rewards: deep
// violet, with room for glows and medals.
export const gameSurface =
  "relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(120%_90%_at_50%_0%,oklch(36%_0.14_284),oklch(22%_0.08_282)_70%)] text-white";

// Small neutral label, e.g. "5 min" or "Level 2".
export const badge = "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700";

// A section heading's small context line.
export const eyebrow = "text-[13px] font-medium text-slate-500";
