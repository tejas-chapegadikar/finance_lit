import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign up — StockStreak" };

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-brand-50 via-white to-orange-50 p-4">
      <Link href="/" aria-label="StockStreak home">
        <Logo />
      </Link>
      <SignUp />
    </div>
  );
}
