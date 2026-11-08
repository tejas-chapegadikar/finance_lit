import type { ReadinessArea } from "@prisma/client";

// Interactive money scenarios: a short story ("exhibit") the student reads,
// then a few decisions. Each step is scored 0-2 on the server; feedback
// explains the trade-offs. Definitions with answers stay on the server, 
// the browser only gets the public view.

export type Exhibit =
  | { kind: "stipend"; amount: number; essentials: { label: string; amount: number }[] }
  | { kind: "statement"; bank: string; rows: { label: string; value: string; strong?: boolean }[] }
  | {
      kind: "phone";
      request: { from: string; handle: string; amount: string; note: string; action: string };
      sms: { from: string; body: string };
    }
  | {
      kind: "payslip";
      employee: string;
      ctc: string;
      earnings: { label: string; value: string }[];
      deductions: { label: string; value: string }[];
      net: string;
      outsideMonthly: { label: string; value: string }[];
    }
  | { kind: "note"; title: string; lines: { label: string; value: string }[] };

export type ChoiceStep = {
  kind: "choice";
  prompt: string;
  options: { text: string; points: number; feedback: string }[];
};

export type MultiStep = {
  kind: "multi";
  prompt: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
};

export type AllocateStep = {
  kind: "allocate";
  prompt: string;
  total: number;
  increment: number;
  buckets: { id: string; label: string; hint: string; initial: number }[];
  evaluate: (values: Record<string, number>) => { points: number; feedback: string[] };
};

export type StepDef = ChoiceStep | MultiStep | AllocateStep;

export type ScenarioDef = {
  slug: string;
  title: string;
  icon: string;
  area: ReadinessArea;
  minutes: number;
  summary: string;
  intro: string;
  exhibit: Exhibit;
  steps: StepDef[];
  takeaway: string;
  /** The lesson it puts into practice. */
  lessonSlug?: string;
  /** Bonus scenarios are unlocked in the Rewards Store. */
  bonus?: boolean;
};

export type StepAnswer = number | number[] | Record<string, number>;

export type StepResult = { points: number; maxPoints: number; feedback: string[] };

/** A server check of one step. "new-day": a daily set changed at midnight IST. */
export type StepCheck = ({ status: "checked" } & StepResult) | { status: "slow-down" } | { status: "new-day" };

// What the browser sees: no points, feedback or correct answers.
export type PublicStep =
  | { kind: "choice"; prompt: string; options: string[] }
  | { kind: "multi"; prompt: string; options: string[] }
  | {
      kind: "allocate";
      prompt: string;
      total: number;
      increment: number;
      buckets: { id: string; label: string; hint: string; initial: number }[];
    };

export type PublicScenario = Omit<ScenarioDef, "steps"> & { steps: PublicStep[] };
