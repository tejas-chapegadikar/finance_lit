"use client";

import { useEffect } from "react";
import type { Expression } from "./Avatar";
import { buddyPage } from "./buddy-store";

/**
 * Put this on a page to give the peeking avatar the page's own line(s), 
 * for example a roast worked out from the student's real spending. One line
 * is picked per visit (rotating), so it doesn't repeat itself.
 */
export function BuddyLine({ id, expression, lines }: { id: string; expression: Expression; lines: string[] }) {
  useEffect(() => {
    if (lines.length === 0) return;
    const key = `buddy-rot:${id}`;
    let index = 0;
    try {
      index = (Number(window.sessionStorage.getItem(key) ?? -1) + 1) % lines.length;
      window.sessionStorage.setItem(key, String(index));
    } catch {
      /* private mode, fine */
    }
    // Give the avatar a moment to mount after navigation.
    const t = window.setTimeout(() => buddyPage({ id: `${id}:${index}`, expression, text: lines[index] }), 50);
    return () => window.clearTimeout(t);
  }, [id, expression, lines]);
  return null;
}
