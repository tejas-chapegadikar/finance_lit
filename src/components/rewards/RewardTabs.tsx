"use client";

import { useState } from "react";

export type RewardTab = { id: string; label: string; count: number; content: React.ReactNode };

/**
 * The store's categories as tabs, so the page shows one shelf at a time
 * instead of one long scroll. Panels are rendered on the server and only
 * shown or hidden here; arrow keys move between tabs.
 */
export function RewardTabs({ tabs }: { tabs: RewardTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Reward categories" onKeyDown={onKeyDown} className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const on = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`panel-${tab.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                on ? "bg-slate-900 font-semibold text-white" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="mt-6 animate-fade-up"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
