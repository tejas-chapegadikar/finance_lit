// Money Manager categories. Kept free of server imports so client components
// (the add-entry form, budgets) can use them. Ids are stored on MoneyEntry and
// MoneyBudget rows, so they are permanent — rename labels, never ids.

export type SpendKind = "need" | "want" | "mixed";

export type ExpenseCategory = { id: string; label: string; kind: SpendKind; hint: string };
export type IncomeCategory = { id: string; label: string };

// The seven spending categories. Ids are stored on rows (migration
// 20261105120000 moved the earlier, finer ones into these). "need" and "want"
// drive the 50/30/20 view; Food mixes both (mess vs delivery), so it's "mixed".
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "food", label: "Food", kind: "mixed", hint: "Mess, groceries, canteen, cafés, delivery" },
  { id: "shopping", label: "Shopping", kind: "want", hint: "Clothes, gadgets, sale finds" },
  { id: "travel", label: "Travel", kind: "need", hint: "Bus, metro, auto, cabs, trains, fuel" },
  { id: "entertainment", label: "Entertainment", kind: "want", hint: "Movies, OTT, games, outings, trips" },
  { id: "education", label: "Education", kind: "need", hint: "Fees, books, courses, stationery" },
  { id: "bills", label: "Bills & rent", kind: "need", hint: "Rent, PG, recharge, Wi-Fi, electricity" },
  { id: "other", label: "Others", kind: "mixed", hint: "Health, gifts, anything else" },
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  { id: "pocket-money", label: "Pocket money" },
  { id: "stipend", label: "Stipend" },
  { id: "salary", label: "Salary" },
  { id: "freelance", label: "Freelance & gigs" },
  { id: "gift-money", label: "Gift money" },
  { id: "other-income", label: "Other" },
];

export const SPEND_KIND_LABEL: Record<SpendKind, string> = { need: "Essentials", want: "Wants", mixed: "Food & others" };

export function expenseCategory(id: string): ExpenseCategory {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function incomeCategory(id: string): IncomeCategory {
  return INCOME_CATEGORIES.find((c) => c.id === id) ?? INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
}

export const EXPENSE_IDS = EXPENSE_CATEGORIES.map((c) => c.id) as [string, ...string[]];
export const INCOME_IDS = INCOME_CATEGORIES.map((c) => c.id) as [string, ...string[]];

/** Savings-goal icons (keys stored on SavingsGoal.icon). */
export const GOAL_ICONS = ["phone", "laptop", "travel", "clothes", "study", "emergency", "gift", "home", "target"] as const;
export type GoalIconKey = (typeof GOAL_ICONS)[number];

// Amount limits, in whole rupees — a sanity cap, not a judgement.
export const MAX_ENTRY = 10_00_000;
export const MAX_GOAL = 1_00_00_000;

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
