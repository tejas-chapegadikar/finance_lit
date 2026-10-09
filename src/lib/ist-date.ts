// Our students are in India and the server (Vercel) runs on UTC, so "today"
// for streaks and the daily challenge is always the IST calendar day,
// written as YYYY-MM-DD. India has no daylight saving, so a fixed offset is exact.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The IST calendar day (YYYY-MM-DD) that `date` falls on. */
export function istDay(date = new Date()): string {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The day `delta` days after (or before, if negative) `day`. */
export function shiftDay(day: string, delta: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + delta * DAY_MS).toISOString().slice(0, 10);
}

/** Days since 1970-01-01 — used to rotate through the daily challenge pool. */
export function dayNumber(day: string): number {
  return Math.floor(Date.parse(`${day}T00:00:00Z`) / DAY_MS);
}

/** The instant an IST calendar day starts. */
export function istDayStart(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) - IST_OFFSET_MS);
}

/** The hour (0-23) in IST right now. */
export function istHour(date = new Date()): number {
  return new Date(date.getTime() + IST_OFFSET_MS).getUTCHours();
}
