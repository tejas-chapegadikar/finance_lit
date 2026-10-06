import { CheckIcon, XIcon } from "@/components/ui/icons";

type Option = { id: string; text: string };

export type OptionState = "idle" | "pending" | "wrong" | "correct" | "dimmed";

const LETTERS = ["A", "B", "C", "D"];

const TILE: Record<OptionState, string> = {
  idle: "border-neutral-200 text-neutral-800 enabled:hover:border-violet-300 enabled:hover:bg-violet-50/60",
  pending: "border-violet-500 bg-violet-50 text-neutral-900",
  wrong: "border-rose-300 bg-rose-50 text-rose-700",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-800",
  dimmed: "border-neutral-200 text-neutral-500 opacity-60",
};

const BADGE: Record<OptionState, string> = {
  idle: "bg-violet-100 text-violet-700",
  pending: "bg-violet-600 text-white",
  wrong: "bg-rose-500 text-white",
  correct: "bg-emerald-600 text-white",
  dimmed: "bg-neutral-100 text-neutral-500",
};

export function QuestionCard({
  number,
  total,
  prompt,
  options,
  stateOf,
  onSelect,
  disabled,
}: {
  number: number;
  total: number;
  prompt: string;
  options: Option[];
  stateOf: (optionId: string) => OptionState;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-lg shadow-violet-900/20 sm:p-8">
        <p className="text-xs font-bold tracking-wider text-violet-100 uppercase">
          Question {number} of {total}
        </p>
        <h2 className="mt-2 text-xl leading-snug font-bold sm:text-2xl">{prompt}</h2>
      </div>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Answer options">
        {options.map((option, i) => {
          const state = stateOf(option.id);
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled || state !== "idle"}
              onClick={() => onSelect(option.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left text-sm font-semibold transition ${TILE[state]}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${BADGE[state]}`}
              >
                {LETTERS[i] ?? i + 1}
              </span>
              <span className="flex-1">{option.text}</span>
              {state === "correct" && <CheckIcon className="h-5 w-5 shrink-0 text-emerald-600" />}
              {state === "wrong" && <XIcon className="h-5 w-5 shrink-0 text-rose-500" />}
              {state === "correct" && <span className="sr-only">(correct answer)</span>}
              {state === "wrong" && <span className="sr-only">(not correct)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
