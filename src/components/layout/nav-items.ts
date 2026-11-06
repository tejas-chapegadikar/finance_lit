import { BookIcon, HomeIcon, TrendingUpIcon, UserIcon, WalletIcon } from "@/components/ui/icons";

// The student's destinations: Home (your avatar, with the three pillars
// around it), the three pillars — Money Management, Money IQ (learn about
// money, with revision and money scenarios) and InvestSmart (investing
// lessons, the simulator and a virtual portfolio) — and your Profile.
// Settings sits at the bottom of the sidebar.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", Icon: HomeIcon, also: [] as string[], mobile: true },
  { href: "/money", label: "Money Management", shortLabel: "Money", Icon: WalletIcon, also: [] as string[], mobile: true },
  { href: "/lessons", label: "Money IQ", shortLabel: "Money IQ", Icon: BookIcon, also: ["/revision", "/practice"], mobile: true },
  { href: "/invest", label: "InvestSmart", shortLabel: "Invest", Icon: TrendingUpIcon, also: [] as string[], mobile: true },
  { href: "/profile", label: "Profile", shortLabel: "Profile", Icon: UserIcon, also: ["/personality", "/settings"], mobile: true },
];

export function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
