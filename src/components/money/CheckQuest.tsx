"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { completeCheckQuest } from "@/actions/money";

/** Opening the Money overview completes today's "check your budget" quest. */
export function CheckQuest() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void completeCheckQuest()
      .then(({ xp }) => {
        if (xp > 0) toast.success(`+${xp} XP`, { description: "Daily quest: budget checked" });
      })
      .catch(() => {
        /* the quest simply stays open */
      });
  }, []);
  return null;
}
