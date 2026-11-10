import { CheckIcon, InfoIcon } from "@/components/ui/icons";

/** The explanation after a question is settled: green when right, a calm "let's learn it" when revealed. */
export function AnswerBanner({
  status,
  tryNumber,
  explanation,
}: {
  status: "correct" | "revealed";
  tryNumber: number;
  explanation: string;
}) {
  const correct = status === "correct";
  return (
    <div
      role="status"
      className={`flex animate-fade-up gap-3 rounded-2xl p-4 text-sm ring-1 ${correct ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-200"}`}
    >
      <span
        aria-hidden
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${correct ? "animate-check bg-emerald-700 text-white" : "bg-brand-50 text-brand-700"}`}
      >
        {correct ? <CheckIcon className="h-4 w-4" /> : <InfoIcon className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <p className={`text-base font-semibold ${correct ? "text-emerald-900" : "text-slate-900"}`}>
          {correct ? (tryNumber === 1 ? "Correct! I'm as shocked as you are." : "There it is. Only took a few tries.") : "Okay, let's actually learn this one."}
        </p>
        {!correct && <p className="mt-0.5 text-slate-600">The right answer is highlighted in green.</p>}
        <p className={`mt-1 leading-relaxed ${correct ? "text-emerald-950" : "text-slate-800"}`}>{explanation}</p>
      </div>
    </div>
  );
}
