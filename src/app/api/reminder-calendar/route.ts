import { NextResponse, type NextRequest } from "next/server";
import { REMINDER_HOURS, siteUrl } from "@/lib/reminders";

// A calendar file with a daily StockStreak reminder at the chosen IST hour, 
// reminders that work without any email setup. It holds no personal data.
export function GET(request: NextRequest) {
  const hour = Number(request.nextUrl.searchParams.get("hour") ?? 20);
  if (!REMINDER_HOURS.includes(hour)) return new NextResponse("Pick an hour between 6 and 22", { status: 400 });

  // India has no daylight saving, so a fixed UTC time repeats correctly every day.
  const start = new Date(Date.UTC(2026, 0, 1, hour, 0) - (5 * 60 + 30) * 60 * 1000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StockStreak//Daily reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:stockstreak-daily-${hour}@stockstreak.in`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(new Date(start.getTime() + 10 * 60 * 1000))}`,
    "RRULE:FREQ=DAILY",
    "SUMMARY:StockStreak: today's money challenge",
    `DESCRIPTION:Your 2-minute money challenge and any revision due: ${siteUrl()}/dashboard`,
    `URL:${siteUrl()}/dashboard`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:StockStreak: today's money challenge",
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="stockstreak-reminder.ics"',
    },
  });
}
