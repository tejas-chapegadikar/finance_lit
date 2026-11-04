import { BookIcon, CalendarCheckIcon, GiftIcon, HomeIcon, TrendingUpIcon, UserIcon, WalletIcon } from "@/components/ui/icons";

// The student's destinations: the three pillars — Money IQ (learn about
// money), Money Manager (manage it) and InvestSmart (understand investing) —
// plus Home, the Daily hub (reality check, challenges, the 30-day habit,
// scenarios and revision), Rewards and Profile.
//
// The phone tab bar holds five: Home, the three pillars and Daily. Profile is
// the avatar in the top bar; Rewards is the XP badge beside it.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", Icon: HomeIcon, also: [] as string[], mobile: true },
  { href: "/lessons", label: "Money IQ", shortLabel: "Money IQ", Icon: BookIcon, also: [] as string[], mobile: true },
  { href: "/money", label: "Money Manager", shortLabel: "Money", Icon: WalletIcon, also: [] as string[], mobile: true },
  { href: "/invest", label: "InvestSmart", shortLabel: "Invest", Icon: TrendingUpIcon, also: [] as string[], mobile: true },
  {
    href: "/practice",
    label: "Daily",
    shortLabel: "Daily",
    Icon: CalendarCheckIcon,
    also: ["/question", "/challenge", "/revision"],
    mobile: true,
  },
  { href: "/rewards", label: "Rewards", shortLabel: "Rewards", Icon: GiftIcon, also: [] as string[], mobile: false },
  { href: "/profile", label: "Profile", shortLabel: "Profile", Icon: UserIcon, also: ["/personality"], mobile: false },
];

export function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
