import { usernameFromEmail } from "./username";
import { db } from "./db";
import { istDay, istHour } from "./ist-date";
import { countDueRevision } from "./revision";

// Optional daily reminders, entirely in the student's control. Emails go out
// only when an email provider is configured (RESEND_API_KEY and
// REMINDER_FROM_EMAIL); without them, nothing is sent. A scheduler calls
// /api/cron/reminders once an hour.
//
// The settings form was removed from the Profile page on 2026-10-12 at the
// founder's request, so no student can switch reminders on right now. The
// data, this sender and the calendar file stay, ready for when a settings
// screen returns, it must come back (with a way to turn them off) before
// emails are switched on.

export const REMINDER_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM – 10 PM

export function formatHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "https://stockstreak.in").replace(/\/$/, "");
}

export function emailRemindersConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL);
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.REMINDER_FROM_EMAIL, to, subject, text }),
  });
  if (!response.ok) console.error(`[reminders] email failed: ${response.status} ${await response.text()}`);
  return response.ok;
}

/**
 * Sends this hour's reminders: students who chose this IST hour, haven't had
 * one today, and haven't already done something today.
 */
export async function sendDueReminders(now = new Date()) {
  if (!emailRemindersConfigured()) return { sent: 0, skipped: "Email provider not configured" };

  const today = istDay(now);
  const students = await db.user.findMany({
    where: {
      reminderEnabled: true,
      reminderHour: istHour(now),
      onboardingCompletedAt: { not: null },
      OR: [{ reminderLastSentDay: null }, { reminderLastSentDay: { not: today } }],
      AND: [{ OR: [{ streakLastDay: null }, { streakLastDay: { not: today } }] }],
    },
    select: { id: true, email: true, displayName: true, name: true },
    take: 500,
  });

  let sent = 0;
  for (const student of students) {
    const due = await countDueRevision(student.id, today);
    const name = student.displayName ?? student.name ?? "there";
    // Friendly and short, never guilt or alarm about streaks.
    const text = [
      `Hi ${name},`,
      "",
      `Today's Reality Check and Daily Challenge are ready. A couple of minutes, whenever suits you.${due ? ` You also have ${due} revision ${due === 1 ? "question" : "questions"} due.` : ""}`,
      "",
      `Open StockStreak: ${siteUrl()}/dashboard`,
      "",
      `You asked for this daily reminder. Turn it off or change the time any time: ${siteUrl()}/profile#reminders`,
    ].join("\n");
    // Marked first so a slow or failed email is never sent twice in a day.
    await db.user.update({ where: { id: student.id }, data: { reminderLastSentDay: today } });
    if (usernameFromEmail(student.email)) continue; // username accounts have no real inbox
    if (await sendEmail(student.email, "Today's money question is ready", text)) sent++;
  }
  return { sent };
}
