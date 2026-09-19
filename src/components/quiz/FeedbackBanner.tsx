type Feedback = { isCorrect: boolean; explanation: string };

export function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border-2 p-4 text-sm ${
        feedback.isCorrect
          ? "border-green-400 bg-green-50 text-green-900"
          : "border-red-400 bg-red-50 text-red-900"
      }`}
    >
      <span className="text-lg" aria-hidden>
        {feedback.isCorrect ? "🎉" : "💡"}
      </span>
      <div>
        <p className="font-bold">{feedback.isCorrect ? "Correct!" : "Not quite."}</p>
        <p className="mt-0.5">{feedback.explanation}</p>
      </div>
    </div>
  );
}
