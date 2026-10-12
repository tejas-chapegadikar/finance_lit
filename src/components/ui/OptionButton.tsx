import { CheckIcon, XIcon } from "@/components/ui/icons";

export type OptionState = "idle" | "pending" | "wrong" | "correct" | "dimmed";

export const OPTION_LETTERS = ["A", "B", "C", "D"];

// Each tile sits on a hard edge (the box-shadow) like a game button.
const TILE: Record<OptionState, string> = {
  idle: "border-slate-200 bg-white text-slate-800 enabled:hover:border-brand-300 enabled:hover:bg-brand-50",
  pending: "border-brand-500 bg-brand-50 text-slate-900",
  wrong: "border-rose-300 bg-rose-50 text-rose-800",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-900",
  dimmed: "border-slate-200 bg-white text-slate-500 opacity-70",
};

const BADGE: Record<OptionState, string> = {
  idle: "bg-brand-100 text-brand-800",
  pending: "bg-brand-600 text-white",
  wrong: "bg-rose-600 text-white",
  correct: "bg-emerald-700 text-white",
  dimmed: "bg-slate-100 text-slate-500",
};

/** One lettered answer tile — used by quiz questions, lesson scenarios and the daily challenge. */
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
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-[transform,box-shadow,background-color,border-color] duration-100 sm:text-base ${TILE[state]}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${BADGE[state]}`}
      >
        {OPTION_LETTERS[index] ?? index + 1}
      </span>
      <span className="flex-1">{text}</span>
      {state === "correct" && <CheckIcon className="h-5 w-5 shrink-0 text-emerald-700" />}
      {state === "wrong" && <XIcon className="h-5 w-5 shrink-0 text-rose-600" />}
      {state === "correct" && <span className="sr-only">(correct answer)</span>}
      {state === "wrong" && <span className="sr-only">(not correct)</span>}
    </button>
  );
}
