"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { MIN_PASSWORD, USERNAME_RE, normaliseUsername, usernameToEmail } from "@/lib/username";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { Burst } from "@/components/ui/Burst";
import { card, primaryButton } from "@/components/ui/button-styles";
import { CheckIcon, LockIcon, UserIcon } from "@/components/ui/icons";

// Sign in or sign up with a username and password, through Supabase Auth.
// Passwords are checked and stored (hashed) by Supabase, never by us.

/** Turns Supabase's messages into plain, friendly ones. */
function friendly(message: string, signUp: boolean): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong username or password. Check both and try again.";
  if (m.includes("already registered") || m.includes("already been registered")) return "That username is taken. Try another one.";
  if (m.includes("email not confirmed")) return "Sign-in isn't fully set up yet (Supabase still asks for email confirmation).";
  if (m.includes("password") && (m.includes("at least") || m.includes("short"))) return `Use at least ${MIN_PASSWORD} characters for your password.`;
  if (m.includes("password") && (m.includes("weak") || m.includes("pwned") || m.includes("leaked")))
    return "That password is too easy to guess. Try a longer one.";
  if (
    m.includes("signups not allowed") ||
    m.includes("signup is disabled") ||
    m.includes("signups are disabled") ||
    m.includes("logins are disabled") ||
    m.includes("provider is not enabled")
  )
    return signUp ? "New sign-ups are switched off right now." : "Sign-in is switched off right now.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts — please wait a minute and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

const safeNext = (next: string | undefined) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

const input =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pr-3.5 pl-10 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const fieldIcon = "pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-500";

// "Remember me" keeps the username filled in on this device (never the password).
const REMEMBERED = "stockstreak-username";
function rememberUsername(name: string | null) {
  try {
    if (name) window.localStorage.setItem(REMEMBERED, name);
    else window.localStorage.removeItem(REMEMBERED);
  } catch {
    /* private mode — fine */
  }
}
function rememberedUsername() {
  try {
    return window.localStorage.getItem(REMEMBERED);
  } catch {
    return null;
  }
}

export function AuthCard({ mode, next, initialError }: { mode: "sign-in" | "sign-up"; next?: string; initialError?: string }) {
  const router = useRouter();
  const signUp = mode === "sign-up";
  const usernameRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [shown, setShown] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = signUp ? null : rememberedUsername();
    if (saved && usernameRef.current && rememberRef.current) {
      usernameRef.current.value = saved;
      rememberRef.current.checked = true;
    }
  }, [signUp]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = normaliseUsername(usernameRef.current?.value ?? "");
    if (!USERNAME_RE.test(name)) {
      setError("Usernames are 3–20 characters: letters, numbers, dots or underscores.");
      return;
    }
    if (signUp && password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError(null);
    setBusy(true);
    const auth = supabaseBrowser().auth;
    const email = usernameToEmail(name);
    const { data, error: err } = signUp
      ? await auth.signUp({ email, password, options: { data: { username: name } } })
      : await auth.signInWithPassword({ email, password });
    if (err || !data.session) {
      setBusy(false);
      setError(err ? friendly(err.message, signUp) : friendly("email not confirmed", signUp));
      return;
    }
    if (!signUp) rememberUsername(rememberRef.current?.checked ? name : null);
    setDone(true);
    router.replace(safeNext(next));
    router.refresh();
  }

  const mood: { expression: Expression; text: string } = error
    ? { expression: "shocked", text: "Uh-oh. Small hiccup — we'll fix it." }
    : done
      ? { expression: "celebrating", text: "You're in! Let's go." }
      : signUp
        ? { expression: "welcoming", text: "Hi! I'm your new money buddy." }
        : { expression: "welcoming", text: "You're back! I missed roasting you." };

  return (
    <div className="flex flex-col items-center">
      <div className="relative -mb-3 flex items-end gap-2" aria-live="polite">
        {done && <Burst />}
        <Avatar
          key={mood.expression}
          config={DEFAULT_AVATAR}
          expression={mood.expression}
          crop="head"
          alive
          className={`relative z-10 h-24 w-auto ${done ? "animate-hop" : "animate-bob"}`}
          label="The StockStreak avatar"
        />
        <p
          key={mood.text}
          className="mb-8 max-w-[12rem] animate-avatar-in rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs leading-snug font-medium text-slate-800 shadow-[0_10px_24px_-12px_rgb(28_26_38/0.35)] ring-1 ring-slate-200"
        >
          {mood.text}
        </p>
      </div>
      <section className={`${card} w-[min(26rem,calc(100vw-2rem))] p-6 sm:p-8`} aria-labelledby="auth-heading">
        {done ? (
          <div role="status" className="flex flex-col items-center py-4 text-center">
            <span className="flex h-12 w-12 animate-check items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon className="h-6 w-6" />
            </span>
            <h1 id="auth-heading" className="mt-4 text-2xl text-slate-900">
              You&apos;re signed in
            </h1>
            <p className="mt-1 text-sm text-slate-600">Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 id="auth-heading" className="text-2xl text-slate-900 sm:text-[1.75rem]">
              {signUp ? "Sign up" : "Sign in"}
            </h1>
            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="auth-username" className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="relative mt-1.5">
                  <UserIcon aria-hidden className={fieldIcon} />
                  <input
                    id="auth-username"
                    ref={usernameRef}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    onChange={() => setError(null)}
                    aria-invalid={!!error}
                    aria-describedby={signUp ? "auth-username-hint" : undefined}
                    className={input}
                  />
                </div>
                {signUp && (
                  <p id="auth-username-hint" className="mt-1 text-xs text-slate-500">
                    3–20 characters: letters, numbers, dots or underscores.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <LockIcon aria-hidden className={fieldIcon} />
                  <input
                    id="auth-password"
                    type={shown ? "text" : "password"}
                    autoComplete={signUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    aria-invalid={!!error}
                    aria-describedby={signUp ? "auth-password-hint" : undefined}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-16 pl-10 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShown((s) => !s)}
                    aria-pressed={shown}
                    aria-label={shown ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {shown ? "Hide" : "Show"}
                  </button>
                </div>
                {signUp && (
                  <p id="auth-password-hint" className="mt-1 text-xs text-slate-500">
                    At least {MIN_PASSWORD} characters. Remember it — there&apos;s no email reset.
                  </p>
                )}
              </div>
              {!signUp && (
                <label className="flex w-fit items-center gap-2.5 text-sm font-medium text-slate-700">
                  <input ref={rememberRef} type="checkbox" className="h-4 w-4 accent-brand-600" />
                  Remember me
                </label>
              )}
              <button type="submit" disabled={busy} className={`${primaryButton} w-full py-3 text-[15px]`}>
                {busy ? (signUp ? "Creating your account…" : "Signing in…") : signUp ? "Sign up" : "Sign in"}
              </button>
            </form>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-800 ring-1 ring-rose-100">
                {error}
              </p>
            )}

            <p className="mt-4 text-sm text-slate-600">
              {signUp ? "Already have an account? " : "Don't have an account? "}
              <Link href={signUp ? "/sign-in" : "/sign-up"} className="font-semibold text-brand-700 hover:underline">
                {signUp ? "Sign in" : "Sign up"}
              </Link>
            </p>
            {!signUp && (
              <Link href="/contact" className="mt-1.5 inline-block text-sm font-semibold text-brand-700 hover:underline">
                Forgot Password
              </Link>
            )}
            <p className="mt-5 text-xs leading-relaxed text-slate-500">
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
          </>
        )}
      </section>
    </div>
  );
}
