import { db } from "../db";
import { REACTIONS, type ReactionData, type ReactionKind } from "./reactions";

// Reading the avatar's pending reactions (recording lives in ./queue).
export { queueAvatarEvent, queueAvatarEvents, type AvatarEventInput } from "./queue";

export type PendingAvatarEvent = { id: string; kind: ReactionKind; priority: number; data: ReactionData; createdAt: string };

// Reactions are about the moment. Anything older than this is quietly marked
// as seen instead of popping up days later.
const STALE_MS = 3 * 864e5;

/** The student's unseen reactions, most important first. */
export async function getPendingAvatarEvents(userId: string): Promise<PendingAvatarEvent[]> {
  const stale = new Date(Date.now() - STALE_MS);
  await db.avatarEvent.updateMany({ where: { userId, shownAt: null, createdAt: { lt: stale } }, data: { shownAt: new Date() } });
  const rows = await db.avatarEvent.findMany({
    where: { userId, shownAt: null },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 12,
    select: { id: true, kind: true, priority: true, data: true, createdAt: true },
  });
  return rows
    .filter((r) => r.kind in REACTIONS)
    .map((r) => ({ id: r.id, kind: r.kind as ReactionKind, priority: r.priority, data: (r.data ?? {}) as ReactionData, createdAt: r.createdAt.toISOString() }));
}
