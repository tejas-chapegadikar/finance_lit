import type { CoachHint } from "@/lib/coach";
import { COACH_UNAVAILABLE_MESSAGE } from "@/lib/constants";
import { SparklesIcon } from "@/components/ui/icons";

/** Shown after a wrong pick: "Not quite", then the AI Coach's hint and a nudge to try again. */
export function CoachPanel({
  hint,
  loading,
  triesLeft,
}: {
  hint: CoachHint | null;
  loading: boolean;
  triesLeft: number;
}) {
  const intro =
    hint?.source === "fallback"
      ? `${COACH_UNAVAILABLE_MESSAGE} Here's the lesson hint:`
      : hint?.level === 1
        ? "Think about this:"
        : "Here's another hint:";

  return (
    <section aria-live="polite" aria-label="AI Coach" className="flex flex-col gap-3">
      <p className="text-base font-extrabold text-rose-700">Not quite.</p>

      <div className="flex gap-3 rounded-2xl border-2 border-brand-200 bg-white p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <SparklesIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-slate-900">AI Coach</p>
            {hint && !loading && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
                Hint {hint.level} of 2
              </span>
            )}
          </div>

          {loading ? (
            <p className="mt-2 flex items-center gap-1.5">
              <span className="sr-only">The coach is thinking</span>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  aria-hidden
                  className="h-2 w-2 animate-bounce rounded-full bg-brand-500"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </p>
          ) : (
            hint && (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-700">{intro}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-800">{hint.text}</p>
              </>
            )
          )}
        </div>
      </div>

      {!loading && (
        <p className="text-sm font-bold text-brand-700">
          Try again — pick another answer ({triesLeft} {triesLeft === 1 ? "try" : "tries"} left)
        </p>
      )}
      <p className="text-xs text-slate-600">The Coach explains ideas from this lesson. It isn&apos;t financial advice.</p>
    </section>
  );
}
