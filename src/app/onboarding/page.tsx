import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { CONSENT_VERSION } from "@/lib/site";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Welcome | Rupli" };

export default async function OnboardingPage() {
  const user = await requireAppUser();
  if (user.consentVersion !== CONSENT_VERSION) redirect("/consent");
  if (user.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return (
    <main id="main" tabIndex={-1} className="relative isolate flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{ backgroundImage: "radial-gradient(circle, var(--color-slate-300) 1px, transparent 1.3px)", backgroundSize: "24px 24px" }}
      />
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="animate-fade-up rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgb(30_28_26/0.35)] sm:p-8">
          <OnboardingFlow defaultName={(user.displayName ?? user.name ?? "").trim().slice(0, 40)} />
        </div>
      </div>
    </main>
  );
}
