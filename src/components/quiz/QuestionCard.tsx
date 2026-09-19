type Option = { id: string; text: string; order: number };
type Question = { id: string; prompt: string; options: Option[] };
type Feedback = { isCorrect: boolean; explanation: string; correctOptionId?: string };

const LETTERS = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  selectedOptionId,
  feedback,
  onSelect,
  disabled,
}: {
  question: Question;
  selectedOptionId: string | null;
  feedback: Feedback | null;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
      <h2 className="text-lg font-bold text-neutral-900">{question.prompt}</h2>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = option.id === selectedOptionId;
          const isCorrectOption = !!feedback && option.id === feedback.correctOptionId;
          const isWrongSelection = !!feedback && isSelected && !feedback.isCorrect;

          let stateClasses = "border-neutral-200 hover:border-violet-300 hover:bg-violet-50/50";
          let letterClasses = "bg-neutral-100 text-neutral-500";
          if (feedback) {
            if (isCorrectOption) {
              stateClasses = "border-green-400 bg-green-50";
              letterClasses = "bg-green-500 text-white";
            } else if (isWrongSelection) {
              stateClasses = "border-red-400 bg-red-50";
              letterClasses = "bg-red-500 text-white";
            } else {
              stateClasses = "border-neutral-200 opacity-50";
            }
          } else if (isSelected) {
            stateClasses = "border-violet-500 bg-violet-50";
            letterClasses = "bg-violet-600 text-white";
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled || !!feedback}
              onClick={() => onSelect(option.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-neutral-800 transition ${stateClasses}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${letterClasses}`}
              >
                {LETTERS[i] ?? i + 1}
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
