import { BookIcon, GiftIcon, HomeIcon, TargetIcon, UserIcon } from "@/components/ui/icons";

// The five student destinations. Today's Challenge, revision and the money
// scenarios live under Practice (and on the dashboard).
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", Icon: HomeIcon, also: [] as string[] },
  { href: "/lessons", label: "Learn", shortLabel: "Learn", Icon: BookIcon, also: [] as string[] },
  { href: "/practice", label: "Practice", shortLabel: "Practice", Icon: TargetIcon, also: ["/challenge", "/revision"] },
  { href: "/rewards", label: "Rewards", shortLabel: "Rewards", Icon: GiftIcon, also: [] as string[] },
  { href: "/profile", label: "Profile", shortLabel: "Profile", Icon: UserIcon, also: [] as string[] },
];

export function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
