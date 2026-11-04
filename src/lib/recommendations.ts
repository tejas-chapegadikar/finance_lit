import type { Progress } from "./progress";
import type { BudgetAlert } from "./money/calc";
import type { Personality } from "./personality";

// "What should I do next?" — one primary suggestion and a couple of others,
// drawn from what the student has actually done across the three pillars.
// The rules are kind, not judgemental: they suggest a next step, never a
// verdict. They teach and point to tools; they never recommend a financial
// product. Pure, so it can be tested.

export type Pillar = "money-iq" | "money-manager" | "investsmart" | "daily";

export type Recommendation = {
  id: string;
  pillar: Pillar;
  title: string;
  why: string;
  href: string;
  cta: string;
};

export type RecommendationInput = {
  progress: Pick<Progress, "next" | "invest" | "levels">;
  dueRevision: number;
  /** This month's money, if anything is logged. */
  money: { income: number; spent: number; entries: number };
  alerts: BudgetAlert[];
  goals: { active: number; total: number };
  /** Saving challenges the student is in (or has finished). */
  joinedChallenges: Set<string>;
  personality: Personality | null;
};

/** Which saving challenge helps with an over-budget category. */
const CHALLENGE_FOR: Record<string, { id: string; name: string }> = {
  food: { id: "delivery-detox-7", name: "7-day delivery detox" },
  shopping: { id: "impulse-blocker-5", name: "5-day impulse blocker" },
  entertainment: { id: "impulse-blocker-5", name: "5-day impulse blocker" },
};

export function recommend(input: RecommendationInput): Recommendation[] {
  const out: Recommendation[] = [];
  const { progress } = input;

  // Spending awareness for someone over budget: a matching challenge, or a budget review.
  const over = input.alerts.find((a) => a.level === "over" && a.id !== "total") ?? input.alerts.find((a) => a.level === "over");
  if (over) {
    const challenge = CHALLENGE_FOR[over.id];
    if (challenge && !input.joinedChallenges.has(challenge.id)) {
      out.push({
        id: "over-budget-challenge",
        pillar: "daily",
        title: `Try the ${challenge.name}`,
        why: `${over.label} is over its budget this month. A short challenge is an easy way to rein it in.`,
        href: `/practice/challenges/${challenge.id}`,
        cta: "See the challenge",
      });
    } else {
      out.push({
        id: "over-budget-review",
        pillar: "money-manager",
        title: `Look at your ${over.id === "total" ? "monthly budget" : over.label.toLowerCase() + " budget"}`,
        why: "You've gone over it this month. A quick look now beats a surprise at month-end.",
        href: "/money#budgets",
        cta: "Review budgets",
      });
    }
  }

  if (input.dueRevision >= 3) {
    out.push({
      id: "revision",
      pillar: "money-iq",
      title: `Revise ${input.dueRevision} questions you missed`,
      why: "They're due today — a couple of minutes and they'll stick for good.",
      href: "/revision",
      cta: "Start revision",
    });
  }

  if (progress.next) {
    const lesson = progress.next.lesson;
    out.push({
      id: "next-lesson",
      pillar: "money-iq",
      title: progress.next.isRetake ? `Strengthen “${lesson.title}”` : `${lesson.status === "in-progress" ? "Continue" : "Next"}: ${lesson.title}`,
      why: progress.next.reason,
      href: `/lessons/${lesson.slug}`,
      cta: progress.next.isRetake ? "Review the lesson" : lesson.status === "in-progress" ? "Continue learning" : "Start learning",
    });
  }

  if (input.money.entries === 0) {
    out.push({
      id: "start-tracking",
      pillar: "money-manager",
      title: "Log this month's money",
      why: "Add your pocket money or stipend and today's spends — you'll see where it goes and whether it'll last.",
      href: "/money",
      cta: "Open Money Manager",
    });
  } else if (input.money.income === 0) {
    out.push({
      id: "add-income",
      pillar: "money-manager",
      title: "Add what came in this month",
      why: "With your income logged, Money Manager can tell you what's left and whether it'll last the month.",
      href: "/money",
      cta: "Add income",
    });
  }

  if (input.goals.total === 0) {
    out.push({
      id: "first-goal",
      pillar: "money-manager",
      title: "Create your first savings goal",
      why: "Saving works best with a name on it — a trip, a laptop, a safety buffer. Even ₹500 counts.",
      href: "/money#goals",
      cta: "Create a goal",
    });
  }

  // Basics done → the next step in investing education.
  const levelOneDone = progress.levels[0]?.status === "completed";
  const investNext = progress.invest.find((l) => !l.locked && l.status !== "completed");
  if (investNext && (levelOneDone || investNext.status === "in-progress")) {
    out.push({
      id: "invest-next",
      pillar: "investsmart",
      title: `InvestSmart: ${investNext.title}`,
      why: levelOneDone ? "You've got the basics of budgeting and compounding — ready for how investing really works." : "You've started this one.",
      href: `/lessons/${investNext.slug}`,
      cta: investNext.status === "in-progress" ? "Continue" : "Start",
    });
  }

  if (!input.personality) {
    out.push({
      id: "personality",
      pillar: "daily",
      title: "Take the Money Personality Quiz",
      why: "Six quick questions. Your result tunes the suggestions you see here.",
      href: "/personality",
      cta: "Take the quiz",
    });
  } else if (!input.joinedChallenges.has(input.personality.focus.challengeId) && input.personality.focus.challengeId !== "habit-30") {
    out.push({
      id: "personality-challenge",
      pillar: "daily",
      title: "A challenge picked for your habits",
      why: input.personality.focus.tip,
      href: `/practice/challenges/${input.personality.focus.challengeId}`,
      cta: "See it",
    });
  }

  return out;
}
