import type { CoachHint } from "@/lib/coach";
import { COACH_UNAVAILABLE_MESSAGE } from "@/lib/constants";
import { SparklesIcon } from "@/components/ui/icons";

/** The AI Coach's face: the same small dark avatar wherever the Coach speaks. */
export function CoachAvatar() {
  return (
    <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-brand-300">
      <SparklesIcon className="h-[18px] w-[18px]" />
    </span>
  );
}

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
      <p className="text-base font-semibold text-rose-700">Not quite.</p>

      <div className="flex animate-fade-up gap-3">
        <CoachAvatar />
        <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white p-4 ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">AI Coach</p>
            {hint && !loading && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
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
        <p className="text-sm font-semibold text-brand-700">
          Try again — pick another answer ({triesLeft} {triesLeft === 1 ? "try" : "tries"} left)
        </p>
      )}
      <p className="text-xs text-slate-600">The Coach explains ideas from this lesson. It isn&apos;t financial advice.</p>
    </section>
  );
}
