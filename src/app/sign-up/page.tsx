import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Sign up | StockStreak" };

// New accounts go to the dashboard, which sends them through onboarding first.
export default async function SignUpPage() {
  if (await getAuthUser()) redirect("/dashboard");
  return (
    <AuthBackdrop>
      <AuthCard mode="sign-up" />
    </AuthBackdrop>
  );
}
