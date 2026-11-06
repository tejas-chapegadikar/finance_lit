"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { card, primaryButton, secondaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon, MailIcon } from "@/components/ui/icons";

// Sign in or sign up with Supabase Auth: Google, or a 6-digit code sent to
// your email. Both end in the same Supabase user for the same email, so it's
// one account on every device. Codes are checked by Supabase, never here.

const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

/** Turns Supabase's messages into plain, friendly ones. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid") || m.includes("token")) return "That code is wrong or has expired. Check the latest email, or send a new code.";
  if (m.includes("rate limit") || m.includes("security purposes") || m.includes("too many")) return "Too many attempts — please wait a minute and try again.";
  if (m.includes("signups not allowed")) return "New sign-ups are switched off right now.";
  if (m.includes("email")) return "That email address doesn't look right.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

const safeNext = (next: string | undefined) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

export function AuthCard({ mode, next, initialError }: { mode: "sign-in" | "sign-up"; next?: string; initialError?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "email" | "code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "send" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const destination = safeNext(next);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function google() {
    setError(null);
    setBusy("google");
    const { error: err } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}` },
    });
    // On success the browser is already on its way to Google.
    if (err) {
      setBusy(null);
      setError(friendly(err.message));
    }
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    const address = email.trim().toLowerCase();
    if (!EMAIL_RE.test(address)) {
      setError("Enter a valid email address, like name@gmail.com.");
      return;
    }
    setError(null);
    setNotice(null);
    setBusy("send");
    const { error: err } = await supabaseBrowser().auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
    setBusy(null);
    if (err) {
      setError(friendly(err.message));
      return;
    }
    setEmail(address);
    setCode("");
    setStep("code");
    setCooldown(RESEND_SECONDS);
    setNotice(`We sent a ${CODE_LENGTH}-digit code to ${address}.`);
  }

  async function verify(e?: React.FormEvent, value = code) {
    e?.preventDefault();
    if (value.length !== CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits.`);
      return;
    }
    setError(null);
    setBusy("verify");
    const { error: err } = await supabaseBrowser().auth.verifyOtp({ email, token: value, type: "email" });
    if (err) {
      setBusy(null);
      setError(friendly(err.message));
      setCode("");
      codeRef.current?.focus();
      return;
    }
    router.replace(destination);
    router.refresh();
  }

  const title = mode === "sign-in" ? "Welcome back" : "Create your account";
  const subtitle = mode === "sign-in" ? "Log in to keep your streak going." : "Free to start. Takes about a minute.";

  return (
    <section className={`${card} w-[min(26rem,calc(100vw-2rem))] p-6 sm:p-8`} aria-labelledby="auth-heading">
      {step === "choose" && (
        <>
          <h1 id="auth-heading" className="text-2xl text-slate-900 sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={google} disabled={busy !== null} className={`${secondaryButton} w-full py-3 text-[15px]`}>
              <GoogleLogo />
              {busy === "google" ? "Opening Google…" : "Continue with Google"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              disabled={busy !== null}
              className={`${secondaryButton} w-full py-3 text-[15px]`}
            >
              <MailIcon className="h-5 w-5 text-brand-600" />
              Continue with email
            </button>
          </div>
        </>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} noValidate>
          <button type="button" onClick={() => setStep("choose")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <h1 id="auth-heading" className="mt-3 text-2xl text-slate-900">
            Continue with email
          </h1>
          <p className="mt-1 text-sm text-slate-600">We&apos;ll email you a {CODE_LENGTH}-digit code. No password needed.</p>
          <label htmlFor="auth-email" className="mt-5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="name@gmail.com"
            aria-invalid={!!error}
            aria-describedby={error ? "auth-error" : undefined}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" disabled={busy !== null || !email} className={`${primaryButton} mt-4 w-full py-3 text-[15px]`}>
            {busy === "send" ? "Sending code…" : "Send code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verify} noValidate>
          <button type="button" onClick={() => setStep("email")} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" /> Change email
          </button>
          <h1 id="auth-heading" className="mt-3 text-2xl text-slate-900">
            Check your email
          </h1>
          {notice && (
            <p role="status" className="mt-1 text-sm text-slate-600">
              {notice} It can take a minute — check Spam too.
            </p>
          )}
          <label htmlFor="auth-code" className="mt-5 block text-sm font-medium text-slate-700">
            {CODE_LENGTH}-digit code
          </label>
          <input
            id="auth-code"
            ref={codeRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
              setCode(digits);
              setError(null);
              if (digits.length === CODE_LENGTH) void verify(undefined, digits);
            }}
            placeholder="••••••"
            aria-invalid={!!error}
            aria-describedby={error ? "auth-error" : undefined}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-center font-display text-2xl tracking-[0.5em] text-slate-900 tabular-nums outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button type="submit" disabled={busy !== null || code.length !== CODE_LENGTH} className={`${primaryButton} mt-4 w-full py-3 text-[15px]`}>
            {busy === "verify" ? "Checking…" : "Verify and continue"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-600">
            Didn&apos;t get it?{" "}
            {cooldown > 0 ? (
              <span className="text-slate-500 tabular-nums">Resend in {cooldown}s</span>
            ) : (
              <button type="button" onClick={() => sendCode()} disabled={busy !== null} className="font-semibold text-brand-700 hover:underline">
                Send a new code
              </button>
            )}
          </p>
        </form>
      )}

      {error && (
        <p id="auth-error" role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-800 ring-1 ring-rose-100">
          {error}
        </p>
      )}

      {step === "choose" && (
        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === "sign-in" ? "New to StockStreak? " : "Already have an account? "}
          <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} className="font-semibold text-brand-700 hover:underline">
            {mode === "sign-in" ? "Create an account" : "Log in"}
          </Link>
        </p>
      )}
      <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
