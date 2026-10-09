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
      <div
        role="status"
        className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-sm shadow-[0_4px_0_0_var(--color-brand-200)]"
      >
        <p className="text-base font-extrabold text-brand-800">📘 Let&apos;s learn this one</p>
        <p className="mt-1 font-semibold text-slate-700">The right answer is highlighted in green.</p>
        <p className="mt-1 leading-relaxed text-slate-800">{explanation}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm shadow-[0_4px_0_0_var(--color-emerald-200)]"
    >
      <p className="text-base font-extrabold text-emerald-800">{tryNumber === 1 ? "✅ Correct!" : "🎉 Exactly!"}</p>
      <p className="mt-1 leading-relaxed text-emerald-900">{explanation}</p>
    </div>
  );
}
