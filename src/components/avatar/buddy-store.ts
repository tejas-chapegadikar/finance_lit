"use client";

import type { Expression } from "./Avatar";

// A tiny message channel between pages and the peeking avatar: a page (or a
// click on the dashboard) hands it lines worked out from real data, and the
// avatar says them. No global state library needed.

export type BuddyMessage = { id: string; expression: Expression; text: string; title?: string; priority?: number; celebrate?: boolean };

type Listener = (message: BuddyMessage, mode: "say" | "page") => void;
const listeners = new Set<Listener>();

/** Say something right now (e.g. after a click). */
export function buddySay(message: BuddyMessage) {
  listeners.forEach((l) => l(message, "say"));
}

/** Give the avatar this page's own line(s) — shown instead of the generic page line. */
export function buddyPage(message: BuddyMessage) {
  listeners.forEach((l) => l(message, "page"));
}

export function subscribeBuddy(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// On the dashboard the big centre avatar does the talking: the peeking
// avatar hands its messages (real events, greetings) over instead.
type HubListener = (message: BuddyMessage) => void;
const hubListeners = new Set<HubListener>();

export function hubSay(message: BuddyMessage) {
  hubListeners.forEach((l) => l(message));
  return hubListeners.size > 0;
}

export function subscribeHub(listener: HubListener) {
  hubListeners.add(listener);
  return () => {
    hubListeners.delete(listener);
  };
}
