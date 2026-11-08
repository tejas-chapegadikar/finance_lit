import { SCENARIOS } from "./content";
import type { PublicScenario, PublicStep, ScenarioDef, StepAnswer, StepDef, StepResult } from "./types";

export { SCENARIOS, SCENARIO_XP } from "./content";
export type { PublicScenario, PublicStep, ScenarioDef, StepAnswer, StepCheck, StepResult } from "./types";

const MAX_STEP_POINTS = 2;

export function getScenario(slug: string): ScenarioDef | undefined {
  return SCENARIOS.find((scenario) => scenario.slug === slug);
}

export const CORE_SCENARIOS = SCENARIOS.filter((scenario) => !scenario.bonus);

/** Steps without answers, points or feedback, safe to send to the browser. */
export function publicSteps(steps: StepDef[]): PublicStep[] {
  return steps.map((step) => {
    if (step.kind === "allocate") {
      const { kind, prompt, total, increment, buckets } = step;
      return { kind, prompt, total, increment, buckets };
    }
    return { kind: step.kind, prompt: step.prompt, options: step.options.map((o) => o.text) };
  });
}

/** The scenario without answers, points or feedback, safe to send to the browser. */
export function publicScenario(def: ScenarioDef): PublicScenario {
  return { ...def, steps: publicSteps(def.steps) };
}

export function maxScore(def: { steps: StepDef[] }): number {
  return def.steps.length * MAX_STEP_POINTS;
}

/** Scores one step on the server. Throws on an answer that doesn't fit the step. */
export function evaluateStep(step: StepDef, answer: StepAnswer): StepResult {
  if (step.kind === "choice") {
    const option = typeof answer === "number" ? step.options[answer] : undefined;
    if (!option) throw new Error("Invalid choice");
    return { points: option.points, maxPoints: MAX_STEP_POINTS, feedback: [option.feedback] };
  }

  if (step.kind === "multi") {
    if (!Array.isArray(answer) || answer.some((i) => !Number.isInteger(i) || !step.options[i])) {
      throw new Error("Invalid selection");
    }
    const picked = new Set(answer);
    const right = step.options.filter((o, i) => o.correct && picked.has(i)).length;
    const wrong = step.options.filter((o, i) => !o.correct && picked.has(i)).length;
    const total = step.options.filter((o) => o.correct).length;
    const points = right === total && wrong === 0 ? 2 : right > wrong ? 1 : 0;
    const summary =
      points === 2
        ? "✅ You spotted all of them."
        : `You got ${right} of ${total}${wrong ? `, plus ${wrong} that ${wrong === 1 ? "isn't" : "aren't"} right` : ""}.`;
    return { points, maxPoints: MAX_STEP_POINTS, feedback: [summary, step.explanation] };
  }

  if (typeof answer !== "object" || Array.isArray(answer)) throw new Error("Invalid allocation");
  const values: Record<string, number> = {};
  for (const bucket of step.buckets) {
    const value = answer[bucket.id];
    if (!Number.isInteger(value) || value < 0 || value % step.increment !== 0) throw new Error("Invalid allocation");
    values[bucket.id] = value;
  }
  if (Object.values(values).reduce((sum, v) => sum + v, 0) !== step.total) {
    throw new Error("The amounts must add up to the total");
  }
  return { maxPoints: MAX_STEP_POINTS, ...step.evaluate(values) };
}

/** Scores a whole run, the server's own check before saving a completion. */
export function evaluateRun(def: { steps: StepDef[] }, answers: StepAnswer[]) {
  if (answers.length !== def.steps.length) throw new Error("Answer every step");
  const results = def.steps.map((step, i) => evaluateStep(step, answers[i]));
  return { score: results.reduce((sum, r) => sum + r.points, 0), maxScore: maxScore(def), results };
}

export function scoreLabel(score: number, max: number): string {
  const ratio = max ? score / max : 0;
  if (ratio >= 0.8) return "Smart moves! 🎉";
  if (ratio >= 0.5) return "Good start 👍";
  return "Tricky one. Try it again 💪";
}
