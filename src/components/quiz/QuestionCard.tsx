import { OptionButton, type OptionState } from "@/components/ui/OptionButton";

type Option = { id: string; text: string };

const DIFFICULTY: Record<string, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "bg-emerald-50 text-emerald-800" },
  MEDIUM: { label: "Medium", className: "bg-amber-50 text-amber-800" },
  HARD: { label: "Hard", className: "bg-rose-50 text-rose-800" },
};

export function QuestionCard({
  prompt,
  difficulty,
  options,
  stateOf,
  onSelect,
  disabled,
}: {
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
      <div className="animate-fade-up py-2">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-slate-500">Pick one answer</p>
          {level && <span className={`rounded-full px-2 py-px text-[11px] font-semibold ${level.className}`}>{level.label}</span>}
        </div>
        <h2 className="mt-2 text-2xl leading-snug text-slate-900 sm:text-[1.75rem]">{prompt}</h2>
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="Answer options">
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
