import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { primaryButton } from "@/components/ui/button-styles";

// About, Contact and the legal pages, public, readable whether or not
// you're signed in.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const userId = (await getAuthUser())?.id;

  return (
    <>
      <header className="border-b border-slate-900/5 bg-white">
        <div className="page-wrap flex items-center justify-between gap-4 py-3">
          <Link href="/" aria-label="Rupli home">
            <Logo />
          </Link>
          <Link href={userId ? "/dashboard" : "/sign-up"} className={`${primaryButton} px-5 py-2.5`}>
            {userId ? "Go to dashboard" : "Start Learning"}
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
