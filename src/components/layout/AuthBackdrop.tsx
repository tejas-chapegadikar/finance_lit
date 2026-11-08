import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COINS = [
  { spot: "top-[9%] left-[8%] h-12 w-12 sm:h-16 sm:w-16", delay: "0s", tone: "bg-amber-300 text-amber-900/70", label: "₹" },
  { spot: "top-[20%] right-[7%] h-9 w-9 sm:h-12 sm:w-12", delay: "1.3s", tone: "bg-brand-200 text-brand-700", label: "%" },
  { spot: "bottom-[13%] left-[5%] h-9 w-9 sm:h-14 sm:w-14", delay: "0.7s", tone: "bg-emerald-200 text-emerald-800", label: "+" },
  { spot: "right-[10%] bottom-[8%] h-12 w-12 sm:h-16 sm:w-16", delay: "2s", tone: "bg-amber-300 text-amber-900/70", label: "₹" },
];

/** The fun page behind the sign-in and sign-up cards: drifting colour, floating coins, dotted paper. */
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-slate-50 px-4 py-8">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{ backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)", backgroundSize: "24px 24px" }}
      />
      <span
        aria-hidden
        className="auth-blob pointer-events-none absolute -top-32 -left-24 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgb(150_130_255/0.4),transparent_68%)]"
      />
      <span
        aria-hidden
        className="auth-blob pointer-events-none absolute -right-28 -bottom-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgb(235_104_52/0.2),transparent_68%)] [animation-delay:-6s]"
      />
      {COINS.map((coin) => (
        <span
          key={coin.spot}
          aria-hidden
          style={{ animationDelay: coin.delay }}
          className={`pointer-events-none absolute -z-10 flex animate-float items-center justify-center rounded-full font-display font-bold opacity-70 shadow-sm max-[420px]:opacity-40 ${coin.spot} ${coin.tone}`}
        >
          {coin.label}
        </span>
      ))}
      <Link href="/" aria-label="StockStreak home" className="relative transition hover:scale-105">
        <Logo />
      </Link>
      <div className="relative animate-fade-up">{children}</div>
      <p className="relative max-w-xs text-center text-sm text-slate-500">Learn money before money teaches you the hard way.</p>
    </div>
  );
}
