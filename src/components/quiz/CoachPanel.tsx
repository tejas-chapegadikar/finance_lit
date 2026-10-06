import { SparklesIcon } from "@/components/ui/icons";

export function CoachPanel({
  hint,
  loading,
  triesLeft,
}: {
  hint: { level: number; text: string } | null;
  loading: boolean;
  triesLeft: number;
}) {
  return (
    <section
      aria-live="polite"
      aria-label="AI Coach"
      className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-violet-900/5 ring-1 ring-violet-200"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
        <SparklesIcon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-neutral-900">AI Coach</p>
          {hint && !loading && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
              Hint {hint.level} of 2
            </span>
          )}
        </div>

        {loading ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
            <span className="sr-only">The coach is thinking</span>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                aria-hidden
                className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </p>
        ) : (
          hint && (
            <>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{hint.text}</p>
              <p className="mt-2 text-xs font-semibold text-violet-700">
                Pick another answer — {triesLeft} {triesLeft === 1 ? "try" : "tries"} left.
              </p>
            </>
          )
        )}

        <p className="mt-2 text-xs text-neutral-500">
          The Coach explains concepts. It isn&apos;t personal financial advice.
        </p>
      </div>
    </section>
  );
}
