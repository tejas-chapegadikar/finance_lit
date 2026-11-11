import type { Expression } from "@/components/avatar/Avatar";

// How any part of the app asks the avatar guide to say something. Plain
// browser events, so client components can call these without wiring.

export type GuideAction = {
  label: string;
  /** Go to a page. */
  href?: string;
  /** A [data-guide] name to scroll to and spotlight (and open, if it's a <details>). */
  target?: string;
  /** Open the Quick add sheet (or go to Money and open it there). */
  quickAdd?: boolean;
};

export type GuideKind = "tour" | "idle" | "after" | "locked" | "error" | "help";

export type GuideTip = {
  kind: GuideKind;
  text: string;
  expression?: Expression;
  /** A [data-guide] name to spotlight while the tip shows. */
  target?: string;
  action?: GuideAction;
};

export const GUIDE_EVENT = "rupli:guide";
export const PAGE_GUIDE_EVENT = "rupli:guide-page";

export function guideSay(tip: GuideTip) {
  window.dispatchEvent(new CustomEvent<GuideTip>(GUIDE_EVENT, { detail: tip }));
}

/** The "?" button: replay this page's guide. */
export function openPageGuide() {
  window.dispatchEvent(new Event(PAGE_GUIDE_EVENT));
}
