import { CheckIcon, XIcon } from "@/components/ui/icons";

export type OptionState = "idle" | "pending" | "wrong" | "correct" | "dimmed";

export const OPTION_LETTERS = ["A", "B", "C", "D"];

// Calm at rest, clear on feedback: green with a check that pops in when
// right, rose with a small shake when wrong.
const TILE: Record<OptionState, string> = {
  idle: "border-slate-200 bg-white text-slate-800 enabled:hover:-translate-y-px enabled:hover:border-slate-300 enabled:hover:shadow-[0_8px_20px_-16px_rgb(30_28_26/0.4)]",
  pending: "border-brand-500 bg-brand-50 text-slate-900",
  wrong: "animate-shake border-rose-300 bg-rose-50 text-rose-900",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-950",
  dimmed: "border-slate-200 bg-white text-slate-500 opacity-60",
};

const BADGE: Record<OptionState, string> = {
  idle: "bg-slate-100 text-slate-700",
  pending: "bg-brand-600 text-white",
  wrong: "bg-rose-600 text-white",
  correct: "bg-emerald-600 text-white",
  dimmed: "bg-slate-100 text-slate-400",
};

/** One lettered answer tile, used by quiz questions, lesson scenarios and the daily challenge. */
export function OptionButton({
  index,
  text,
  state,
  disabled,
  onSelect,
}: {
  index: number;
  text: string;
  state: OptionState;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || state !== "idle"}
      onClick={onSelect}
      className={`flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-[15px] leading-snug font-medium transition duration-150 ease-out active:scale-[0.99] sm:text-base ${TILE[state]}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition ${BADGE[state]}`}>
        {OPTION_LETTERS[index] ?? index + 1}
      </span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <CheckIcon className="h-5 w-5 shrink-0 animate-check text-emerald-600" />}
      {state === "wrong" && <XIcon className="h-5 w-5 shrink-0 text-rose-600" />}
      {state === "correct" && <span className="sr-only">(correct answer)</span>}
      {state === "wrong" && <span className="sr-only">(not correct)</span>}
    </button>
  );
}
