import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const user = await requireAppUser();
  if (user.onboardingCompletedAt) {
    redirect("/lessons");
  }

  const colleges = await db.college.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">One last step</h1>
        <p className="text-neutral-600">
          Tell us your college and phone number to get started.
        </p>
      </div>
      <OnboardingForm colleges={colleges} />
    </main>
  );
}
