"use client";

import { SignOutButton, useClerk } from "@clerk/nextjs";

export function AccountActions() {
  const { openUserProfile } = useClerk();

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => openUserProfile()}
        className="rounded-full border-2 border-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        Manage sign-in &amp; security
      </button>
      <SignOutButton redirectUrl="/">
        <button
          type="button"
          className="rounded-full border-2 border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50"
        >
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}
