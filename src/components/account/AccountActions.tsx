"use client";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import { secondaryButton } from "@/components/ui/button-styles";

export function AccountActions() {
  const { openUserProfile } = useClerk();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" onClick={() => openUserProfile()} className={secondaryButton}>
        Manage sign-in &amp; security
      </button>
      <SignOutButton redirectUrl="/">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border-2 border-rose-200 bg-white px-6 py-3 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
        >
          Log out
        </button>
      </SignOutButton>
    </div>
  );
}
