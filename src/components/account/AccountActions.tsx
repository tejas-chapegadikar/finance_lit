"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { deleteAccount, signOut } from "@/actions/account";
import { GENERIC_ERROR_MESSAGE } from "@/lib/constants";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { LogOutIcon, TrashIcon } from "@/components/ui/icons";
import { secondaryButton } from "@/components/ui/button-styles";

/** Signing out, and deleting your account (named confirmation first). */
export function AccountActions() {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteAccount(typed);
        if (result?.status === "wrong-confirmation") setError("Type DELETE in capitals to confirm.");
      } catch (e) {
        unstable_rethrow(e);
        setError(GENERIC_ERROR_MESSAGE);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className={menuListClass}>
        <li>
          <form action={signOut}>
            <button type="submit" className={`${menuRowClass} w-full hover:bg-rose-50`}>
              <MenuRowContent icon={<LogOutIcon />} label="Sign out" tone="danger" />
            </button>
          </form>
        </li>
        <li>
          <button type="button" onClick={() => setConfirming((v) => !v)} aria-expanded={confirming} className={`${menuRowClass} w-full hover:bg-rose-50`}>
            <MenuRowContent icon={<TrashIcon />} label="Delete my account" tone="danger" />
          </button>
        </li>
      </ul>
      {confirming && (
        <div className="animate-fade-up rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
          <p className="text-sm text-rose-950">
            This permanently deletes your Rupli account: your progress, XP, money records and avatar. It can&apos;t be undone.
          </p>
          <label htmlFor="delete-confirm" className="mt-3 block text-sm font-medium text-rose-950">
            Type <span className="font-bold">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={remove} disabled={isPending || typed !== "DELETE"} className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50">
              {isPending ? "Deleting…" : "Delete my account"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={isPending} className={secondaryButton}>
              Cancel
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-rose-800">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
