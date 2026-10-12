"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAvatar } from "@/actions/avatar";
import { redeemReward } from "@/actions/rewards";
import { AVATAR_SLOTS, HEAD_SLOTS, type AvatarConfig, type AvatarSlot } from "@/lib/avatar";
import { GENERIC_ERROR_MESSAGE, SLOW_DOWN_MESSAGE } from "@/lib/constants";
import { card, primaryButton, secondaryButton, skyButton } from "@/components/ui/button-styles";
import { CheckIcon, LockIcon, StarIcon } from "@/components/ui/icons";
import { Avatar } from "./Avatar";

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
};

/** Dress up the avatar: preview anything, unlock store items with XP, save what's unlocked. */
export function AvatarStudio({ initial, items, balance }: { initial: AvatarConfig; items: StudioItem[]; balance: number }) {
  const router = useRouter();
  const [config, setConfig] = useState(initial);
  const [slot, setSlot] = useState<AvatarSlot>("hair");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const byId = new Map(items.map((item) => [item.id, item]));
  const selected = byId.get(config[slot]);
  const locked = AVATAR_SLOTS.map(({ slot: s }) => byId.get(config[s])).filter((item) => item && !item.unlocked);
  const changed = AVATAR_SLOTS.some(({ slot: s }) => config[s] !== initial[s]);

  function choose(item: StudioItem) {
    setConfig({ ...config, [item.slot]: item.id });
    setConfirming(false);
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

  function unlock(item: StudioItem) {
    run(async () => {
      const result = await redeemReward(item.id);
      setConfirming(false);
      if (result.status === "not-enough-xp") setMessage("You don't have enough XP for this yet.");
      if (result.status === "slow-down") setMessage(SLOW_DOWN_MESSAGE);
      if (result.status === "unlocked" || result.status === "owned") {
        setMessage(`Unlocked ${item.name}.`);
        router.refresh();
      }
    });
  }

  function save() {
    run(async () => {
      const result = await saveAvatar(config);
      if (result.status === "locked") setMessage(`Unlock ${result.itemName} before saving.`);
      else {
        setMessage("Avatar saved.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
      <section className={`${card} flex flex-col items-center p-5 md:sticky md:top-6`} aria-labelledby="preview-heading">
        <h2 id="preview-heading" className="sr-only">
          Preview
        </h2>
        <div className="flex w-full justify-center rounded-2xl border border-slate-200 bg-slate-50 py-4">
          <Avatar config={config} className="h-56 w-auto sm:h-64" label="Your avatar preview" />
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          <StarIcon className="h-4 w-4 text-amber-600" /> {balance.toLocaleString("en-IN")} XP to spend
        </p>
        {locked.length > 0 && (
          <p className="mt-2 text-center text-sm font-semibold text-amber-900">
            Previewing {locked.map((item) => item!.name).join(", ")} — unlock {locked.length === 1 ? "it" : "them"} to save.
          </p>
        )}
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
          <button type="button" onClick={save} disabled={isPending || !changed || locked.length > 0} className={`${primaryButton} flex-1`}>
            {isPending ? "Saving…" : "Save my avatar"}
          </button>
          <button type="button" onClick={() => setConfig(initial)} disabled={isPending || !changed} className={`${secondaryButton} flex-1`}>
            Undo changes
          </button>
        </div>
        {message && (
          <p role="status" className="mt-3 text-center text-sm font-bold text-slate-800">
            {message}
          </p>
        )}
      </section>

      <section className={`${card} p-5`} aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-lg font-extrabold text-slate-900">
          Customise
        </h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Part to change">
          {AVATAR_SLOTS.map(({ slot: s, label }) => (
            <button
              key={s}
              type="button"
              aria-pressed={slot === s}
              onClick={() => {
                setSlot(s);
                setConfirming(false);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                slot === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-brand-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
                    className={`flex w-full flex-col items-center rounded-2xl border-2 p-2 text-center transition ${
                      isOn ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                      <Avatar
                        config={{ ...config, [item.slot]: item.id }}
                        crop={HEAD_SLOTS.includes(item.slot) ? "head" : "full"}
                        className="h-full w-auto"
                      />
                      {!item.unlocked && (
                        <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
                          <LockIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {item.unlocked && isOn && (
                        <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-xs font-bold text-slate-900">{item.name}</span>
                    <span className={`text-[11px] font-bold ${item.unlocked ? "text-emerald-800" : "text-amber-800"}`}>
                      {item.unlocked ? "Unlocked" : item.cost ? `${item.cost} XP` : "Milestone"}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>

        {selected && !selected.unlocked && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm font-semibold text-slate-800">
              <span className="font-extrabold text-slate-900">{selected.name}</span>
              {selected.rare && " · Rare"} — {selected.cost ? `${selected.cost} XP in the Rewards Store.` : `${selected.how} to unlock it.`}
            </p>
            {selected.cost !== null &&
              (confirming ? (
                <div className="flex gap-2">
                  <button type="button" disabled={isPending} onClick={() => unlock(selected)} className={skyButton}>
                    {isPending ? "Unlocking…" : `Yes, spend ${selected.cost} XP`}
                  </button>
                  <button type="button" disabled={isPending} onClick={() => setConfirming(false)} className={secondaryButton}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending || balance < selected.cost}
                  onClick={() => setConfirming(true)}
                  className={balance >= selected.cost ? skyButton : secondaryButton}
                >
                  {balance >= selected.cost ? `Unlock for ${selected.cost} XP` : `${selected.cost - balance} more XP needed`}
                </button>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
