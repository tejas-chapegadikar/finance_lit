import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Welcome — StockStreak" };

export default async function OnboardingPage() {
  const user = await requireAppUser();
  if (user.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-brand-50/60 px-4 py-8">
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <OnboardingFlow defaultName={user.displayName ?? user.name ?? ""} />
        </div>
      </div>
    </main>
  );
}
