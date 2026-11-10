"use client";

import { useState, useTransition } from "react";
import { setLeagueOptIn } from "@/actions/profile";
import type { LeagueRow } from "@/lib/league";
import { Avatar } from "@/components/avatar/Avatar";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";

/** The weekly league: an on/off switch, then this week's board. */
export function League({
  optedIn,
  rows,
  you,
  participants,
  endsOn,
}: {
  optedIn: boolean;
  rows: LeagueRow[];
  you: { rank: number; xp: number } | null;
  participants: number;
  endsOn: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ends = new Date(`${endsOn}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });

  function toggle(on: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setLeagueOptIn(on);
        if (result.status === "slow-down") setError(SLOW_DOWN_MESSAGE);
      } catch {
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="min-w-0 flex-1 text-sm text-slate-700">
          {optedIn
            ? "You're in. Other league players see your display name, avatar and this week's XP, nothing else."
            : "A friendly weekly XP board with other students who join. Only your display name, avatar and weekly XP are shown. Off unless you switch it on."}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={optedIn}
          aria-label="Join the weekly league"
          disabled={isPending}
          onClick={() => toggle(!optedIn)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${optedIn ? "bg-brand-600" : "bg-slate-300"} disabled:opacity-60`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${optedIn ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
      {optedIn && (
        <div className="mt-4">
          <p className="text-sm text-slate-600">
            This week · resets after {ends} · {participants} {participants === 1 ? "player" : "players"}
            {you ? ` · you're #${you.rank}` : " · earn XP to get on the board"}
          </p>
          {rows.length > 0 ? (
            <ol className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {rows.map((row) => (
                <li key={`${row.rank}-${row.name}`} className={`flex items-center gap-3 py-2.5 text-sm ${row.isYou ? "font-semibold" : ""}`}>
                  <span className={`w-6 text-center font-display tabular-nums ${row.rank <= 3 ? "text-orange-600" : "text-slate-500"}`}>{row.rank}</span>
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-end justify-center overflow-hidden rounded-full bg-peach-100">
                    <Avatar config={row.avatar} crop="head" className="h-8 w-8" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-900">
                    {row.name}
                    {row.isYou && <span className="ml-1.5 rounded-full bg-brand-50 px-1.5 py-px text-[11px] text-brand-700">You</span>}
                  </span>
                  <span className="shrink-0 text-slate-700 tabular-nums">{row.xp.toLocaleString("en-IN")} XP</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No XP earned by anyone in the league yet this week. First lesson wins the top spot.</p>
          )}
          <p className="mt-3 text-xs text-slate-500">It&apos;s just for fun: XP comes only from real learning, so there&apos;s no way to buy your way up.</p>
        </div>
      )}
    </div>
  );
}
