import type { Story } from "./types";

// Every lesson's scroll story. Each one loads only when that lesson is opened,
// so the Learn page stays light. A lesson not listed here falls back to the old
// text page (still in lessons/[slug]/page.tsx).

const STORIES: Record<string, () => Promise<{ default: Story }>> = {
  "budgeting-basics": () => import("../../content/stories/budgeting-basics"),
  "compound-interest": () => import("../../content/stories/compound-interest"),
  "saving-vs-spending": () => import("../../content/stories/saving-vs-spending"),
  "upi-digital-payments": () => import("../../content/stories/upi-digital-payments"),
  "financial-scams": () => import("../../content/stories/financial-scams"),
  "bank-accounts": () => import("../../content/stories/bank-accounts"),
  "fd-rd": () => import("../../content/stories/fd-rd"),
  "cibil-score": () => import("../../content/stories/cibil-score"),
  "credit-cards-101": () => import("../../content/stories/credit-cards-101"),
  "loans-emis": () => import("../../content/stories/loans-emis"),
  "first-salary-tax": () => import("../../content/stories/first-salary-tax"),
  "stocks-mutual-funds-fds": () => import("../../content/stories/stocks-mutual-funds-fds"),
  "sip-starting-early": () => import("../../content/stories/sip-starting-early"),
  "inflation-purchasing-power": () => import("../../content/stories/inflation-purchasing-power"),
  "how-stock-market-works": () => import("../../content/stories/how-stock-market-works"),
  "index-funds-long-term": () => import("../../content/stories/index-funds-long-term"),
  "start-investing-checklist": () => import("../../content/stories/start-investing-checklist"),
};

export const STORY_SLUGS = Object.keys(STORIES);
export const hasStory = (slug: string) => slug in STORIES;

export async function loadStory(slug: string): Promise<Story | null> {
  const load = STORIES[slug];
  return load ? (await load()).default : null;
}
