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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 to-white px-4 py-8">
      <div aria-hidden className="sunburst pointer-events-none absolute -top-1/3 left-1/2 h-[120vh] w-[120vh] -translate-x-1/2 rounded-full opacity-70" />
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-12px_rgb(15_23_42/0.25)] ring-1 ring-slate-900/5 sm:p-8">
          <OnboardingFlow defaultName={user.displayName ?? user.name ?? ""} />
        </div>
      </div>
    </main>
  );
}
