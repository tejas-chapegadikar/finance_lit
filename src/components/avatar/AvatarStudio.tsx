"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAvatar } from "@/actions/avatar";
import { AVATAR_GROUPS, AVATAR_SLOTS, DEFAULT_AVATAR, HEAD_SLOTS, type AvatarConfig, type AvatarGroup, type AvatarSlot } from "@/lib/avatar";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { CheckIcon, LockIcon, RefreshIcon, SparklesIcon, StarIcon } from "@/components/ui/icons";
import { Avatar, EXPRESSIONS, type Expression } from "./Avatar";

export type StudioItem = {
  id: string;
  slot: AvatarSlot;
  name: string;
  unlocked: boolean;
  /** Set for items bought with XP. */
  cost: number | null;
  /** How to get it, e.g. "Earn the Quiz Champion badge". */
  how: string;
  rare: boolean;
  /** Unlocked in the last two weeks. */
  recent: boolean;
};

const sameConfig = (a: AvatarConfig, b: AvatarConfig) => AVATAR_SLOTS.every(({ slot }) => a[slot] === b[slot]);

/**
 * Avatar Studio: dress up your own avatar. Try anything on (locked items
 * too), try out expressions, unlock store items with XP, and save what's
 * unlocked, the server checks every item again before saving.
 */
export function AvatarStudio({ initial, items, xpTotal, name }: { initial: AvatarConfig; items: StudioItem[]; xpTotal: number; name: string }) {
  const router = useRouter();
  const [config, setConfig] = useState(initial);
  const [group, setGroup] = useState<AvatarGroup>("face");
  const [slot, setSlot] = useState<AvatarSlot>("skin");
  const [expression, setExpression] = useState<Expression | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const byId = new Map(items.map((item) => [item.id, item]));
  const selected = byId.get(config[slot]);
  const locked = AVATAR_SLOTS.map(({ slot: s }) => byId.get(config[s])).filter((item) => item && !item.unlocked);
  const changed = !sameConfig(config, initial);
  const groupSlots = AVATAR_SLOTS.filter((s) => s.group === group);
  const recent = items.filter((item) => item.recent);

  function pickGroup(next: AvatarGroup) {
    setGroup(next);
    setSlot(AVATAR_SLOTS.find((s) => s.group === next)!.slot);
  }

  function choose(item: StudioItem) {
    setConfig({ ...config, [item.slot]: item.id });
    setExpression(undefined);
    setMessage(null);
  }

  function run(action: () => Promise<void>) {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setMessage(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  function save(next = config) {
    run(async () => {
      const result = await saveAvatar(next);
      if (result.status === "locked") setMessage(`Unlock ${result.itemName} before saving.`);
      else if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      else {
        setMessage(sameConfig(next, DEFAULT_AVATAR) ? "Back to the original you. Saved." : "Looking good. Avatar saved.");
        router.refresh();
      }
    });
  }

  function reset() {
    if (!window.confirm("Reset your avatar to the default look? Your unlocked items stay unlocked.")) return;
    setConfig(DEFAULT_AVATAR);
    setExpression(undefined);
    save(DEFAULT_AVATAR);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
      <section className={`${card} flex flex-col items-center overflow-hidden p-0 md:sticky md:top-6`} aria-labelledby="preview-heading">
        {/* The stage: a game-style purple backdrop, like the rest of the avatar experience. */}
        <div className="relative flex w-full flex-col items-center bg-[radial-gradient(120%_90%_at_50%_0%,oklch(66%_0.16_284),oklch(48%_0.19_283))] px-5 pt-5 pb-4">
          <p className="text-[13px] font-medium text-white/70">This is you</p>
          <h2 id="preview-heading" className="text-2xl text-white">
            {name}
          </h2>
          <span aria-hidden className="absolute bottom-8 h-6 w-44 rounded-[100%] bg-black/20 blur-[3px]" />
          {/* Re-mounts on every change so each try-on pops in. */}
          <Avatar
            key={`${Object.values(config).join("|")}-${expression ?? ""}`}
            config={config}
            expression={expression}
            className="relative mt-1 h-60 w-auto animate-pop sm:h-72"
            label={`${name}'s avatar preview`}
          />
        </div>

        <div className="flex w-full flex-col items-center p-5">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-800">
            <StarIcon className="h-4 w-4 text-orange-500" /> {xpTotal.toLocaleString("en-IN")} XP earned · items unlock as you learn
          </p>
          {locked.length > 0 && (
            <p className="mt-2 text-center text-sm font-medium text-orange-900">
              Previewing {locked.map((item) => item!.name).join(", ")}. Unlock {locked.length === 1 ? "it" : "them"} to save.
            </p>
          )}
          <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <button type="button" onClick={() => save()} disabled={isPending || !changed || locked.length > 0} className={`${primaryButton} flex-1`}>
              {isPending ? "Saving…" : "Save my avatar"}
            </button>
            <button type="button" onClick={() => setConfig(initial)} disabled={isPending || !changed} className={`${secondaryButton} flex-1`}>
              Undo changes
            </button>
          </div>
          <button type="button" onClick={reset} disabled={isPending || sameConfig(initial, DEFAULT_AVATAR)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40">
            <RefreshIcon className="h-4 w-4" /> Reset to default
          </button>
          {message && (
            <p role="status" className="mt-3 animate-fade-up text-center text-sm font-semibold text-slate-800">
              {message}
            </p>
          )}

          <div className="mt-5 w-full border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-600">Try an expression</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Try an expression">
              {EXPRESSIONS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={expression === e.id}
                  onClick={() => setExpression(expression === e.id ? undefined : e.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    expression === e.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Your avatar pulls these faces when it reacts to what you do.</p>
          </div>
        </div>
      </section>

      <section className={`${card} p-5`} aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-xl text-slate-900">
          Customise
        </h2>
        {recent.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-950 ring-1 ring-orange-100">
            <SparklesIcon className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">Recently unlocked:</span> {recent.map((item) => item.name).join(", ")}
          </p>
        )}

        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Category">
          {AVATAR_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              onClick={() => pickGroup(g.id)}
              className={`flex-1 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${group === g.id ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {groupSlots.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Part to change">
            {groupSlots.map(({ slot: s, label }) => (
              <button
                key={s}
                type="button"
                aria-pressed={slot === s}
                onClick={() => {
                  setSlot(s);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${slot === s ? "bg-slate-900 font-semibold text-white" : "bg-slate-100 font-medium text-slate-700 hover:bg-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label={AVATAR_SLOTS.find((s) => s.slot === slot)?.label}>
          {items
            .filter((item) => item.slot === slot)
            .map((item) => {
              const isOn = config[slot] === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={isOn}
                    onClick={() => choose(item)}
                    className={`flex w-full flex-col items-center rounded-2xl border p-2 text-center transition duration-150 active:scale-[0.98] ${
                      isOn ? "border-brand-500 bg-white ring-2 ring-brand-100" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300"
                    }`}
                  >
                    <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                      <Avatar config={{ ...config, [item.slot]: item.id }} crop={HEAD_SLOTS.includes(item.slot) ? "head" : "full"} className="h-full w-auto" />
                      {!item.unlocked && (
                        <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                          <LockIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {item.unlocked && isOn && (
                        <span className="absolute top-1 right-1 flex h-6 w-6 animate-check items-center justify-center rounded-full bg-brand-600 text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {item.rare && <span className="absolute bottom-1 left-1 rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">Rare</span>}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-xs font-semibold text-slate-900">{item.name}</span>
                    <span className={`text-[11px] font-semibold ${item.unlocked ? (isOn ? "text-brand-700" : "text-emerald-700") : "text-orange-700"}`}>
                      {item.unlocked ? (isOn ? "Wearing" : "Unlocked") : item.cost ? `${item.cost} XP` : "Locked"}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>

        {selected && !selected.unlocked && (
          <div className="mt-4 flex animate-fade-up flex-col gap-3 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{selected.name}</span>
              {selected.rare && " · Rare"}, {selected.how} to unlock it
              {selected.cost !== null && ` (you have ${xpTotal.toLocaleString("en-IN")} XP)`}.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
