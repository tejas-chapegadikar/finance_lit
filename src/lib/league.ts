import { db } from "./db";
import { istDay, istDayStart, shiftDay } from "./ist-date";
import { readAvatar, type AvatarConfig } from "./avatar";

// The friendly weekly league: XP earned this week (Monday–Sunday, IST) among
// students who opted in. Off by default — a name only ever appears here when
// its owner switched the league on. Nothing is lost for a bad week; it
// simply resets on Monday.

const weekday = (day: string) => (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0

export function weekBounds(today = istDay()) {
  const start = shiftDay(today, -weekday(today));
  return { start, end: shiftDay(start, 6) };
}

export type LeagueRow = { rank: number; name: string; avatar: AvatarConfig; xp: number; isYou: boolean };

export type WeeklyLeague = {
  optedIn: boolean;
  rows: LeagueRow[];
  you: { rank: number; xp: number } | null;
  participants: number;
  endsOn: string;
};

const TOP = 10;

export async function getWeeklyLeague(userId: string, optedIn: boolean, today = istDay()): Promise<WeeklyLeague> {
  const { start, end } = weekBounds(today);
  if (!optedIn) return { optedIn, rows: [], you: null, participants: 0, endsOn: end };

  const [totals, participants] = await Promise.all([
    db.xPTransaction.groupBy({
      by: ["userId"],
      where: { amount: { gt: 0 }, createdAt: { gte: istDayStart(start) }, user: { leagueOptIn: true } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 200,
    }),
    db.user.count({ where: { leagueOptIn: true } }),
  ]);

  const ranked = totals.map((t, i) => ({ userId: t.userId, xp: t._sum.amount ?? 0, rank: i + 1 }));
  const mine = ranked.find((r) => r.userId === userId);
  const shown = ranked.slice(0, TOP);
  const users = await db.user.findMany({
    where: { id: { in: shown.map((r) => r.userId) } },
    select: { id: true, displayName: true, name: true, avatar: true },
  });

  const rows = shown.map((r) => {
    const u = users.find((x) => x.id === r.userId);
    // Display name only — never the email the account was made with.
    return { rank: r.rank, name: u?.displayName ?? u?.name?.split(" ")[0] ?? "A student", avatar: readAvatar(u?.avatar ?? null), xp: r.xp, isYou: r.userId === userId };
  });
  return { optedIn, rows, you: mine ? { rank: mine.rank, xp: mine.xp } : null, participants, endsOn: end };
}
