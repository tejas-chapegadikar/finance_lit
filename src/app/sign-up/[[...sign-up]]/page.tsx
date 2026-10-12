import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";

export const metadata: Metadata = { title: "Sign up — StockStreak" };

export default function SignUpPage() {
  return (
    <AuthBackdrop>
      {/* New accounts go to the dashboard, which sends them through onboarding first. */}
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </AuthBackdrop>
  );
}
