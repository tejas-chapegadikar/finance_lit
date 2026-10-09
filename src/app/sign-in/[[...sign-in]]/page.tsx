import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";

export const metadata: Metadata = { title: "Log in — StockStreak" };

export default function SignInPage() {
  return (
    <AuthBackdrop>
      <SignIn />
    </AuthBackdrop>
  );
}
