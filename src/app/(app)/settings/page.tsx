import { usernameFromEmail } from "@/lib/username";
import type { Metadata } from "next";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { getDisplayName } from "@/lib/user";
import { LEGAL_LINKS } from "@/lib/site";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ReactionsToggle } from "@/components/avatar/ReactionsToggle";
import { AccountActions } from "@/components/account/AccountActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { MenuRowContent, menuListClass, menuRowClass } from "@/components/ui/MenuRow";
import { card, secondaryButton } from "@/components/ui/button-styles";
import { AlertIcon, DocumentIcon, InfoIcon, LockIcon, MailIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Settings | StockStreak" };

const LEGAL_ICONS: Record<string, React.ReactNode> = {
  "/about": <InfoIcon />,
  "/contact": <MailIcon />,
  "/privacy": <LockIcon />,
  "/terms": <DocumentIcon />,
  "/disclaimer": <AlertIcon />,
};

// Settings: your details (your avatar always carries your name), avatar
// pop-ups, your account, and help and legal pages.
export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const displayName = getDisplayName(user);
  const memberSince = user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <PageHeader eyebrow="Settings" title="Your settings" description="Your details, your avatar's pop-ups and your account." />

      <section aria-labelledby="settings-heading" className={`${card} p-5 sm:p-6`}>
        <h2 id="settings-heading" className="text-xl text-slate-900">
          Edit profile
        </h2>
        <p className="mt-1 text-sm text-slate-600">Your name, college, stage and learning goal. Your avatar uses your name, so it updates everywhere.</p>
        <div className="mt-4">
          <ProfileForm displayName={displayName} collegeName={user.collegeName ?? ""} stage={user.stage ?? ""} goals={user.goals} />
        </div>
      </section>

      <section aria-labelledby="avatar-settings-heading" className={`${card} flex flex-col gap-4 p-5 sm:p-6`}>
        <h2 id="avatar-settings-heading" className="text-xl text-slate-900">
          Your avatar
        </h2>
        <ReactionsToggle initial={user.avatarReactions} />
        <Link href="/profile/avatar" className={`${secondaryButton} self-start`}>
          Open Avatar Studio
        </Link>
      </section>

      <section className={`${card} flex flex-col gap-4 p-5 sm:p-6`} aria-labelledby="account-heading">
        <div>
          <h2 id="account-heading" className="text-xl text-slate-900">
            Account
          </h2>
          <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">{usernameFromEmail(user.email) ? "Username" : "Email"}</dt>
              <dd className="truncate font-medium text-slate-900">{usernameFromEmail(user.email) ?? user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-medium text-slate-900">{memberSince}</dd>
            </div>
          </dl>
        </div>
        <AccountActions />
      </section>

      <section aria-labelledby="legal-heading">
        <h2 id="legal-heading" className="text-xl text-slate-900">
          Help, privacy &amp; legal
        </h2>
        <ul className={`mt-3 ${menuListClass}`}>
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={menuRowClass}>
                <MenuRowContent icon={LEGAL_ICONS[link.href]} label={link.label} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
