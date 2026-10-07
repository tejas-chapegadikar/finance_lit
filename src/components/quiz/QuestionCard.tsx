import { OptionButton, type OptionState } from "@/components/ui/OptionButton";

type Option = { id: string; text: string };

const DIFFICULTY: Record<string, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-emerald-100 text-emerald-800" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-800" },
  HARD: { label: "Hard", className: "bg-rose-100 text-rose-800" },
};

export function QuestionCard({
  number,
  total,
  prompt,
  difficulty,
  options,
  stateOf,
  onSelect,
  disabled,
}: {
  number: number;
  total: number;
  prompt: string;
  difficulty: string;
  options: Option[];
  stateOf: (optionId: string) => OptionState;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}) {
  const level = DIFFICULTY[difficulty];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-wider text-brand-700 uppercase">
            Question {number} of {total}
          </p>
          {level && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${level.className}`}>{level.label}</span>
          )}
        </div>
        <h2 className="mt-2 text-xl leading-snug font-bold text-slate-900 sm:text-2xl">{prompt}</h2>
      </div>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Answer options">
        {options.map((option, i) => (
          <OptionButton
            key={option.id}
            index={i}
            text={option.text}
            state={stateOf(option.id)}
            disabled={disabled}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
