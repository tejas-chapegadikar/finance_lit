import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DISCLAIMER_SHORT, LEGAL_LINKS } from "@/lib/site";
import { MotionToggle } from "@/components/ui/Motion";

/** The public footer: landing page and the About / legal pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" aria-label="Rupli home">
              <Logo />
            </Link>
            <p className="text-sm text-slate-600">Learn money before money teaches you the hard way.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-6 items-center font-medium text-slate-600 hover:text-slate-900">
                {link.label}
              </Link>
            ))}
            <MotionToggle />
          </nav>
        </div>
        <p className="border-t border-slate-100 pt-6 text-center text-xs text-slate-600 sm:text-left">
          {DISCLAIMER_SHORT} © {new Date().getFullYear()} Rupli.
        </p>
      </div>
    </footer>
  );
}
