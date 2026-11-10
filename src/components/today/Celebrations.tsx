"use client";

import { useEffect, useRef, useState } from "react";
import { markAvatarEventsShown } from "@/actions/avatar";
import type { PendingAvatarEvent } from "@/lib/avatar/events";
import { REACTIONS, isCelebration, pickLine } from "@/lib/avatar/reactions";
import { Burst } from "@/components/ui/Burst";

const SHOW_MS = 2800;

/** Small celebrations, one at a time: quest done, level up, badge, streak milestone. Never blocks a tap. */
export function Celebrations({ events, name }: { events: PendingAvatarEvent[]; name: string }) {
  const seen = useRef(new Set<string>());
  const queue = useRef<PendingAvatarEvent[]>([]);
  const [current, setCurrent] = useState<PendingAvatarEvent | null>(null);

  useEffect(() => {
    const fresh = events.filter((e) => isCelebration(e.kind) && !seen.current.has(e.id));
    fresh.forEach((e) => seen.current.add(e.id));
    if (fresh.length === 0) return;
    queue.current.push(...fresh);
    const id = window.setTimeout(() => setCurrent((c) => c ?? queue.current.shift() ?? null), 0);
    return () => window.clearTimeout(id);
  }, [events]);

  useEffect(() => {
    if (!current) return;
    void markAvatarEventsShown([current.id]);
    const id = window.setTimeout(() => setCurrent(queue.current.shift() ?? null), SHOW_MS);
    return () => window.clearTimeout(id);
  }, [current]);

  if (!current) return null;
  const def = REACTIONS[current.kind];
  const line = def.lines[pickLine(current.kind, current.id, undefined)](name, current.data);
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4 lg:top-6">
      <div key={current.id} className="relative max-w-sm animate-avatar-in rounded-2xl bg-brand-900 px-4 py-3 text-center text-white shadow-lg">
        <Burst />
        {def.title && <p className="text-sm font-bold text-brand-500">{def.title(current.data)}</p>}
        <p className="text-sm font-medium">{line}</p>
      </div>
    </div>
  );
}
