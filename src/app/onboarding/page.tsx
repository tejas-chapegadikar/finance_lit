import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = { title: "Finish signing up — StockStreak" };

export default async function OnboardingPage() {
  const user = await requireAppUser();
  if (user.onboardingCompletedAt) {
    redirect("/lessons");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm shadow-violet-900/5 ring-1 ring-violet-900/5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold tracking-wide text-violet-700 uppercase">
            <span aria-hidden>⚡</span>
            One last step
          </span>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">
            Tell us about yourself
          </h1>
          <p className="text-neutral-500">
            Pick your display name, then add your college and phone number.
          </p>
        </div>
        <OnboardingForm defaultDisplayName={user.displayName ?? user.name ?? ""} />
      </div>
    </main>
  );
}
