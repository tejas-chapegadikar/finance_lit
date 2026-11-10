import { BookIcon, HomeIcon, UserIcon, WalletIcon } from "@/components/ui/icons";

// Four destinations. Investing lives inside Learn; Settings, Avatar Studio and
// Money Personality live inside Me.
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", shortLabel: "Today", Icon: HomeIcon, also: [] as string[], mobile: true },
  { href: "/lessons", label: "Learn", shortLabel: "Learn", Icon: BookIcon, also: ["/revision", "/practice", "/invest"], mobile: true },
  { href: "/money", label: "Money", shortLabel: "Money", Icon: WalletIcon, also: [] as string[], mobile: true },
  { href: "/profile", label: "Me", shortLabel: "Me", Icon: UserIcon, also: ["/personality", "/settings"], mobile: true },
];

export function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
