export function AnswerBanner({
  status,
  tryNumber,
  explanation,
}: {
  status: "correct" | "revealed";
  tryNumber: number;
  explanation: string;
}) {
  if (status === "revealed") {
    return (
      <div role="status" className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-sm">
        <p className="font-bold text-violet-700">Let&apos;s learn this one 📘</p>
        <p className="mt-1 leading-relaxed text-neutral-700">{explanation}</p>
      </div>
    );
  }

  return (
    <div role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm">
      <p className="font-bold text-emerald-800">
        {tryNumber === 1 ? "Woohoo! You got it right 🎉" : "You got it — nice recovery! 💪"}
      </p>
      <p className="mt-1 leading-relaxed text-emerald-800">{explanation}</p>
    </div>
  );
}
