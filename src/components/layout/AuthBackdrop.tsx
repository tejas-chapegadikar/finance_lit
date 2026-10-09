import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** The bright, light-rays page behind Clerk's sign-in and sign-up cards. */
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-brand-50 to-white p-4">
      <div
        aria-hidden
        className="sunburst pointer-events-none absolute top-1/2 left-1/2 h-[110rem] w-[110rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
      />
      <Link href="/" aria-label="StockStreak home" className="relative">
        <Logo />
      </Link>
      <div className="relative">{children}</div>
    </div>
  );
}
