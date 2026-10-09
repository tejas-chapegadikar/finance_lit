import { BoltIcon, BookIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

// The four student destinations: the desktop sidebar shows `label`; the
// tablet top bar and the phone tab bar have less room and show `shortLabel`.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Dashboard", Icon: HomeIcon },
  { href: "/lessons", label: "Lessons", shortLabel: "Lessons", Icon: BookIcon },
  { href: "/challenge", label: "Today's Challenge", shortLabel: "Challenge", Icon: BoltIcon },
  { href: "/profile", label: "Profile", shortLabel: "Profile", Icon: UserIcon },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
