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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="flex justify-center">
        <Logo />
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8">
        <OnboardingFlow defaultName={user.displayName ?? user.name ?? ""} />
      </div>
    </main>
  );
}
