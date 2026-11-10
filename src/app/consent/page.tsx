import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { CONSENT_VERSION } from "@/lib/site";
import { ConsentForm } from "@/components/auth/ConsentForm";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";

export const metadata: Metadata = { title: "Before you continue | Rupli" };

// Shown once to anyone who hasn't agreed to the current Terms and Privacy
// Policy: Google sign-ups and accounts made before these terms existed.
export default async function ConsentPage() {
  const user = await requireAppUser();
  if (user.consentVersion === CONSENT_VERSION) redirect("/dashboard");
  return (
    <AuthBackdrop>
      <ConsentForm />
    </AuthBackdrop>
  );
}
