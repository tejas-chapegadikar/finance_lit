import type { Story } from "./types";

// Which lessons have a scroll story. Each one loads only when that lesson is
// opened, so the Learn page stays light. Lessons not listed here keep the
// old text page.

const STORIES: Record<string, () => Promise<{ default: Story }>> = {
  "budgeting-basics": () => import("@/content/stories/budgeting-basics"),
};

export const hasStory = (slug: string) => slug in STORIES;

export async function loadStory(slug: string): Promise<Story | null> {
  const load = STORIES[slug];
  return load ? (await load()).default : null;
}
