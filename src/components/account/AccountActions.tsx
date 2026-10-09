"use client";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { LogOutIcon, ShieldIcon } from "@/components/ui/icons";

/** Account preferences (Clerk's sign-in, password and security settings) and signing out. */
export function AccountActions() {
  const { openUserProfile } = useClerk();

  return (
    <ul className={menuListClass}>
      <li>
        <button type="button" onClick={() => openUserProfile()} className={menuRowClass}>
          <MenuRowContent icon={<ShieldIcon />} label="Account preferences & security" />
        </button>
      </li>
      <li>
        <SignOutButton redirectUrl="/">
          <button type="button" className={`${menuRowClass} hover:bg-rose-50`}>
            <MenuRowContent icon={<LogOutIcon />} label="Sign out" tone="danger" />
          </button>
        </SignOutButton>
      </li>
    </ul>
  );
}
