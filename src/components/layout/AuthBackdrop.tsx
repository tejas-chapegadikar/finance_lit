import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** The quiet page behind Clerk's sign-in and sign-up cards. */
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-50/60 p-4">
      <Link href="/" aria-label="StockStreak home" className="relative">
        <Logo />
      </Link>
      <div className="relative">{children}</div>
    </div>
  );
}
