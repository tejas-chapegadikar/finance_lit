// The XP Rewards Store catalogue. Kept free of Prisma imports so client
// components can use it. XP stays a measure of learning: spending it never
// lowers lifetime XP, badges or the readiness score — it only uses up the
// "available to spend" balance (xpTotal - xpSpent).

export type RewardKind = "title" | "theme" | "scenario";

export type Reward = {
  id: string;
  kind: RewardKind;
  name: string;
  description: string;
  icon: string;
  cost: number;
  /** For bonus scenarios: the scenario it unlocks. */
  scenarioSlug?: string;
  /** For themes: the profile header's gradient (white text stays readable on every step). */
  gradient?: string;
};

export const REWARDS: Reward[] = [
  { id: "title-budget-boss", kind: "title", name: "Budget Boss", description: "A title shown on your profile.", icon: "💼", cost: 100 },
  { id: "title-scam-buster", kind: "title", name: "Scam Buster", description: "A title shown on your profile.", icon: "🕵️", cost: 100 },
  { id: "title-credit-champ", kind: "title", name: "Credit Champ", description: "A title shown on your profile.", icon: "🏆", cost: 100 },
  { id: "title-salary-smart", kind: "title", name: "Salary Smart", description: "A title shown on your profile.", icon: "🧾", cost: 100 },
  {
    id: "theme-sunset",
    kind: "theme",
    name: "Sunset",
    description: "An orange-and-rose profile theme.",
    icon: "🌇",
    cost: 300,
    gradient: "bg-gradient-to-br from-orange-700 via-rose-700 to-rose-800",
  },
  {
    id: "theme-forest",
    kind: "theme",
    name: "Forest",
    description: "A green profile theme.",
    icon: "🌿",
    cost: 300,
    gradient: "bg-gradient-to-br from-emerald-700 via-teal-700 to-teal-800",
  },
  {
    id: "theme-midnight",
    kind: "theme",
    name: "Midnight",
    description: "A deep indigo profile theme.",
    icon: "🌌",
    cost: 300,
    gradient: "bg-gradient-to-br from-indigo-700 via-violet-800 to-slate-900",
  },
  {
    id: "scenario-no-cost-emi",
    kind: "scenario",
    name: "Bonus scenario: the \"no-cost\" EMI",
    description: "A phone on EMI — work out what it really costs and whether it fits your stipend.",
    icon: "📱",
    cost: 250,
    scenarioSlug: "no-cost-emi",
  },
  {
    id: "scenario-emergency",
    kind: "scenario",
    name: "Bonus scenario: an ₹8,000 emergency",
    description: "A sudden medical bill — choose how to pay for it without falling into debt.",
    icon: "🚑",
    cost: 250,
    scenarioSlug: "emergency-8000",
  },
];

export const REWARD_KIND_LABEL: Record<RewardKind, string> = {
  title: "Profile titles",
  theme: "Profile themes",
  scenario: "Bonus scenarios",
};

export function findReward(id: string | null | undefined): Reward | undefined {
  return REWARDS.find((reward) => reward.id === id);
}

export function rewardForScenario(slug: string): Reward | undefined {
  return REWARDS.find((reward) => reward.scenarioSlug === slug);
}

export function spendableXp(user: { xpTotal: number; xpSpent: number }): number {
  return Math.max(0, user.xpTotal - user.xpSpent);
}
