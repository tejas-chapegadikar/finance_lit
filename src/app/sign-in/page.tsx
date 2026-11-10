import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Log in | Rupli" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in didn't finish. Please try again.",
  claim: "This email is already linked to another Rupli sign-in. If it's yours, contact us and we'll sort it out.",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  // Already signed in: straight in (unless we were sent here with a problem
  // to show, e.g. "claim", where the student is signed in but must use Google).
  if (!error && (await getAuthUser())) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
  return (
    <AuthBackdrop>
      <AuthCard mode="sign-in" next={next} initialError={error} />
    </AuthBackdrop>
  );
}
