import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { AuthBackdrop } from "@/components/layout/AuthBackdrop";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Log in — StockStreak" };

const ERRORS: Record<string, string> = {
  google: "Google sign-in didn't finish. Please try again.",
  link: "That sign-in link has expired. Please try again.",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const params = await props.searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  // Already signed in: straight in.
  if (await getAuthUser()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return (
    <AuthBackdrop>
      <AuthCard mode="sign-in" next={next} initialError={error} />
    </AuthBackdrop>
  );
}
