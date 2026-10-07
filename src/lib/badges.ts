import type { ReadinessArea } from "@prisma/client";
import type { LessonProgress } from "./progress";

export type Badge = {
  id: string;
  icon: string;
  name: string;
  description: string;
  /** Earned by finishing every lesson in this area — or all of Level 1 when null. */
  area: ReadinessArea | null;
};

export const BADGES: Badge[] = [
  { id: "budget-beginner", icon: "💰", name: "Budget Beginner", description: "Complete the budgeting lessons", area: "BUDGETING" },
  { id: "scam-spotter", icon: "🛡️", name: "Scam Spotter", description: "Complete the digital safety lessons", area: "DIGITAL_SAFETY" },
  { id: "banking-beginner", icon: "🏦", name: "Banking Beginner", description: "Complete the banking lessons", area: "BANKING" },
  { id: "credit-ready", icon: "💳", name: "Credit Ready", description: "Complete the credit lessons", area: "CREDIT" },
  { id: "tax-smart", icon: "🧾", name: "Tax Smart", description: "Complete the tax lesson", area: "TAX" },
  { id: "financial-foundations", icon: "🎓", name: "Financial Foundations", description: "Complete Level 1", area: null },
];

export type BadgeProgress = Badge & { earnedAt: Date | null };

/**
 * Badges are derived, not stored: one is earned at the moment the last of
 * its lessons was first completed. That also tells the completion screen
 * which badges a given quiz attempt unlocked.
 */
export function getBadges(lessons: LessonProgress[]): BadgeProgress[] {
  return BADGES.map((badge) => {
    const required = badge.area ? lessons.filter((lesson) => lesson.area === badge.area) : lessons;
    const times = required.map((lesson) => lesson.firstCompletedAt?.getTime());
    const earned = required.length > 0 && times.every((time) => time !== undefined);
    return { ...badge, earnedAt: earned ? new Date(Math.max(...(times as number[]))) : null };
  });
}
