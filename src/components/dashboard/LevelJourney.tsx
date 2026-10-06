import { LEVELS } from "@/lib/levels";

export function LevelJourney({ graduated }: { graduated: boolean }) {
  return (
    <ol aria-label="Your learning journey" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {LEVELS.map((level) => {
        const current = level.number === 1;
        return (
          <li
            key={level.number}
            aria-current={current ? "step" : undefined}
            className={`rounded-2xl p-3 ${current ? "bg-violet-50 ring-1 ring-violet-200" : "bg-neutral-50"}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                  current ? "bg-violet-600 text-white" : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {level.number}
              </span>
              <span
                className={`text-xs font-bold tracking-wide uppercase ${
                  current ? "text-violet-700" : "text-neutral-500"
                }`}
              >
                {level.purpose}
              </span>
            </div>
            <p className={`mt-1.5 text-sm font-bold ${current ? "text-neutral-900" : "text-neutral-600"}`}>
              {level.name}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {current ? (graduated ? "Completed 🎓" : "In progress") : "🔒 Coming soon"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
