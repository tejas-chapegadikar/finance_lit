import type { Prisma } from "@prisma/client";
import { REACTIONS, type ReactionData, type ReactionKind } from "./reactions";

// Records real events the student's avatar reacts to. Every event has a key
// that is unique per student (e.g. "lesson:<attemptId>", "budget-over:
// 2026-11:food"), so the same event can never queue a second reaction, even
// if an action runs twice. Only server code records events, for the signed-in
// student's own actions. No database import here: callers pass their own
// client or transaction, which keeps this safe to import from shared modules.

type Client = { avatarEvent: Prisma.TransactionClient["avatarEvent"] };

export type AvatarEventInput = { kind: ReactionKind; key: string; data?: ReactionData };

/** Records events (duplicates by key are ignored). Never throws into the caller's flow. */
export async function queueAvatarEvents(client: Client, userId: string, events: AvatarEventInput[]) {
  if (events.length === 0) return;
  try {
    await client.avatarEvent.createMany({
      data: events.map((e) => ({ userId, key: e.key, kind: e.kind, priority: REACTIONS[e.kind].priority, data: (e.data ?? {}) as Prisma.InputJsonValue })),
      skipDuplicates: true,
    });
  } catch (error) {
    // A reaction is a nice-to-have: it must never break saving money or finishing a quiz.
    console.error("avatar event not recorded", error);
  }
}

export const queueAvatarEvent = (client: Client, userId: string, kind: ReactionKind, key: string, data?: ReactionData) =>
  queueAvatarEvents(client, userId, [{ kind, key, data }]);
