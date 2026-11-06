import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** The quiet page behind the sign-in and sign-up cards: soft lavender-white, dotted paper, one line of brand. */
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{ backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)", backgroundSize: "24px 24px" }}
      />
      <Link href="/" aria-label="StockStreak home" className="relative">
        <Logo />
      </Link>
      <div className="relative animate-fade-up">{children}</div>
      <p className="relative max-w-xs text-center text-sm text-slate-500">Learn money before money teaches you the hard way.</p>
    </div>
  );
}
