import { BookIcon, GiftIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

// The four student destinations. Practice lives inside Learn: the Question of
// the Day, the Daily Challenge, revision and the money scenarios are all
// reached from the Learn page (and the dashboard), so they count as Learn.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", Icon: HomeIcon, also: [] as string[] },
  {
    href: "/lessons",
    label: "Learn",
    shortLabel: "Learn",
    Icon: BookIcon,
    also: ["/practice", "/question", "/challenge", "/revision"],
  },
  { href: "/rewards", label: "Rewards", shortLabel: "Rewards", Icon: GiftIcon, also: [] as string[] },
  { href: "/profile", label: "Profile", shortLabel: "Profile", Icon: UserIcon, also: [] as string[] },
];

export function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
