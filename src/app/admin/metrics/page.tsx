import type { Metadata } from "next";
import { getLaunchMetrics, type Rate } from "@/lib/metrics";

export const metadata: Metadata = { title: "Metrics — StockStreak Admin" };

function percent(r: Rate) {
  return r.denominator ? `${Math.round((100 * r.numerator) / r.denominator)}%` : "—";
}

function sample(r: Rate, unit: string, empty: string) {
  return r.denominator ? `${r.numerator} of ${r.denominator} ${unit}` : empty;
}

function Metric({ name, value, detail, question }: { name: string; value: string; detail: string; question: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-sm font-medium text-neutral-600">{name}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
      <p className="mt-3 border-t border-neutral-100 pt-2 text-xs text-neutral-600">{question}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export default async function AdminMetricsPage() {
  const m = await getLaunchMetrics();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Metrics that matter</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Launch metrics from the blueprint, for students only (admin accounts are excluded).
        </p>
      </div>

      <Section title="Activation">
        <Metric
          name="Visitor → Signup"
          value="—"
          detail="Not tracked yet — needs page analytics (e.g. Vercel Web Analytics) once deployed"
          question="Is the value proposition compelling?"
        />
        <Metric
          name="Signups"
          value={String(m.signups)}
          detail="Student accounts created"
          question="How many students have joined?"
        />
        <Metric
          name="Signup → First lesson"
          value={percent(m.funnel.firstLesson)}
          detail={sample(m.funnel.firstLesson, "students opened a lesson", "No students yet")}
          question="Can users get started easily?"
        />
        <Metric
          name="First lesson → Quiz"
          value={percent(m.funnel.quizAfterLesson)}
          detail={sample(
            m.funnel.quizAfterLesson,
            "lesson openers started a quiz",
            "No one has opened a lesson yet",
          )}
          question="Is the learning experience engaging?"
        />
        <Metric
          name="3+ lesson completion"
          value={percent(m.funnel.threePlusLessons)}
          detail={sample(m.funnel.threePlusLessons, "students finished 3+ quizzes", "No students yet")}
          question="Is there meaningful product engagement?"
        />
      </Section>

      <Section title="Learning">
        <Metric
          name="AI Coach retry rate"
          value={percent(m.coach.retry)}
          detail={sample(
            m.coach.retry,
            "wrong first answers were followed by another try",
            "No wrong first answers yet",
          )}
          question="Do students keep going after a hint?"
        />
        <Metric
          name="AI Coach recovery rate"
          value={percent(m.coach.recovery)}
          detail={sample(
            m.coach.recovery,
            "coached questions solved before the answer was shown",
            "No coached questions finished yet",
          )}
          question="Does the coach actually help users recover from mistakes?"
        />
        <Metric
          name="Quiz improvement"
          value={percent(m.improvement.improved)}
          detail={
            m.improvement.averageDelta === null
              ? "No retakes yet"
              : `${sample(m.improvement.improved, "retaken lessons improved", "")} · avg ${m.improvement.averageDelta >= 0 ? "+" : ""}${m.improvement.averageDelta} mastery points`
          }
          question="Are students learning, not just guessing?"
        />
      </Section>

      <Section title="Retention">
        <Metric
          name="Day-7 retention"
          value={percent(m.retention.day7)}
          detail={sample(
            m.retention.day7,
            "students came back 7+ days after signing up",
            "No students signed up 7+ days ago yet",
          )}
          question="Do users have a reason to return?"
        />
        <Metric
          name="Day-30 retention"
          value={percent(m.retention.day30)}
          detail={sample(
            m.retention.day30,
            "students came back 30+ days after signing up",
            "No students signed up 30+ days ago yet",
          )}
          question="Is this becoming a habit?"
        />
      </Section>
    </div>
  );
}
