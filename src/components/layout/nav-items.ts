import { BoltIcon, BookIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/lessons", label: "Lessons", Icon: BookIcon },
  { href: "/challenge", label: "Challenge", Icon: BoltIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
