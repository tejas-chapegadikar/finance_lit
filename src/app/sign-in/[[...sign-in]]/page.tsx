import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";

export const metadata: Metadata = { title: "Log in — StockStreak" };

export default function SignInPage() {
  return (
    <AuthBackdrop>
      {/* After logging in: the dashboard (or the page the student was sent from, when Clerk has one). */}
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </AuthBackdrop>
  );
}
