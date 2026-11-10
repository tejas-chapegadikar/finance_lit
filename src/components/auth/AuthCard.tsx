"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { MIN_PASSWORD, USERNAME_RE, normaliseUsername, usernameToEmail } from "@/lib/username";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { usePointerGaze } from "@/components/avatar/use-gaze";
import { Burst } from "@/components/ui/Burst";
import { card, primaryButton } from "@/components/ui/button-styles";
import { CheckIcon, LockIcon, UserIcon } from "@/components/ui/icons";
import { CONSENT_VERSION } from "@/lib/site";
import { ConsentCheck } from "./ConsentCheck";

// Sign in or sign up with Google, or with a username and password. Google
// hands us the name and email, so nobody types them. Passwords are checked
// and stored (hashed) by Supabase, never by us.

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

/** Turns Supabase's messages into plain, friendly ones. */
function friendly(message: string, signUp: boolean): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That username and password don't match. Have another go.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Someone already grabbed that username. Try another one.";
  if (m.includes("email not confirmed")) return "Sign-in isn't fully set up on our side yet. Give it a few minutes.";
  if (m.includes("password") && (m.includes("at least") || m.includes("short"))) return `Your password needs at least ${MIN_PASSWORD} characters.`;
  if (m.includes("password") && (m.includes("weak") || m.includes("pwned") || m.includes("leaked")))
    return "That password is way too easy to guess. Try a longer one.";
  if (
    m.includes("signups not allowed") ||
    m.includes("signup is disabled") ||
    m.includes("signups are disabled") ||
    m.includes("logins are disabled") ||
    m.includes("provider is not enabled")
  )
    return signUp ? "New sign-ups are switched off for now." : "Sign-in is switched off for now.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Take a minute, then go again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your internet and try again.";
  return "That didn't work. Mind trying again?";
}

const safeNext = (next: string | undefined) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

const input =
  "w-full rounded-xl border border-slate-200 bg-white py-3 pr-3.5 pl-10 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const fieldIcon = "pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-brand-600";

// "Remember me" keeps the username filled in on this device (never the password).
const REMEMBERED = "stockstreak-username";
function rememberUsername(name: string | null) {
  try {
    if (name) window.localStorage.setItem(REMEMBERED, name);
    else window.localStorage.removeItem(REMEMBERED);
  } catch {
    /* private mode, fine */
  }
}
function rememberedUsername() {
  try {
    return window.localStorage.getItem(REMEMBERED);
  } catch {
    return null;
  }
}

const POKES: { expression: Expression; text: string }[] = [
  { expression: "happy", text: "Hey! Fingers off the merchandise." },
  { expression: "shocked", text: "You poke me before you've even logged in?" },
  { expression: "thinking", text: "Still here? The button's right there." },
  { expression: "excited", text: "Fine. One more poke, then we talk about your spending." },
];

type Mood = { expression: Expression; text: string };

export function AuthCard({ mode, next, initialError }: { mode: "sign-in" | "sign-up"; next?: string; initialError?: string }) {
  const router = useRouter();
  const signUp = mode === "sign-up";
  const stage = useRef<HTMLButtonElement>(null);
  const gaze = usePointerGaze(stage);
  const usernameRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [shown, setShown] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
  const [done, setDone] = useState(false);
  const [focus, setFocus] = useState<"username" | "password" | null>(null);
  const [poke, setPoke] = useState<Mood | null>(null);
  const pokes = useRef(0);

  useEffect(() => {
    const saved = signUp ? null : rememberedUsername();
    if (saved && usernameRef.current && rememberRef.current) {
      usernameRef.current.value = saved;
      rememberRef.current.checked = true;
    }
  }, [signUp]);

  async function google() {
    setError(null);
    setBusy("google");
    // If Google isn't switched on yet, say so here rather than sending people
    // to a raw error page from the login provider.
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
      const settings = (await response.json()) as { external?: { google?: boolean } };
      if (settings.external?.google === false) {
        setBusy(null);
        setError("Google sign-in isn't ready just yet. Use a username for now.");
        return;
      }
    } catch {
      /* the check is only a courtesy; carry on */
    }
    const { error: err } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
        // Always show Google's account picker, even with one account signed in.
        queryParams: { prompt: "select_account" },
      },
    });
    // On success the browser is already on its way to Google.
    if (err) {
      setBusy(null);
      setError(friendly(err.message, signUp));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = normaliseUsername(usernameRef.current?.value ?? "");
    if (!USERNAME_RE.test(name)) {
      setError("Usernames need 3 to 20 characters: letters, numbers, dots or underscores.");
      return;
    }
    if (signUp && password.length < MIN_PASSWORD) {
      setError(`Your password needs at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (signUp && !agreed) {
      setError("Please confirm you're 18 or older and agree to the Terms.");
      return;
    }
    if (!password) {
      setError("You forgot the password bit.");
      return;
    }
    setError(null);
    setBusy("form");
    const auth = supabaseBrowser().auth;
    const email = usernameToEmail(name);
    const { data, error: err } = signUp
      ? await auth.signUp({ email, password, options: { data: { username: name, consent_version: CONSENT_VERSION } } })
      : await auth.signInWithPassword({ email, password });
    if (err || !data.session) {
      setBusy(null);
      setError(err ? friendly(err.message, signUp) : friendly("email not confirmed", signUp));
      return;
    }
    if (!signUp) rememberUsername(rememberRef.current?.checked ? name : null);
    setDone(true);
    router.replace(safeNext(next));
    router.refresh();
  }

  function pokeAvatar() {
    setPoke(POKES[pokes.current++ % POKES.length]);
  }

  const mood: Mood = error
    ? { expression: "shocked", text: "Oops. Small hiccup, we'll sort it." }
    : done
      ? { expression: "celebrating", text: "You're in! Let's go." }
      : busy === "google"
        ? { expression: "excited", text: "Off to Google. Back in a sec!" }
        : busy === "form"
          ? { expression: "thinking", text: "Checking. Act natural." }
          : focus === "password"
            ? { expression: "facepalm", text: "Not looking. Promise." }
            : focus === "username"
              ? { expression: "thinking", text: signUp ? "Pick a good one. No pressure." : "I know you. Probably." }
              : (poke ??
                (signUp
                  ? { expression: "welcoming", text: "Hi! I'm your new money buddy." }
                  : { expression: "welcoming", text: "You're back! I missed roasting you." }));

  const editing = (field: "username" | "password") => ({
    onFocus: () => setFocus(field),
    onBlur: () => setFocus(null),
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative -mb-3 flex items-end gap-2" aria-live="polite">
        {done && <Burst />}
        <button
          ref={stage}
          type="button"
          onClick={pokeAvatar}
          aria-label="Poke the avatar"
          className="group relative z-10 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Avatar
            key={mood.expression}
            config={DEFAULT_AVATAR}
            expression={mood.expression}
            crop="head"
            alive
            gaze={gaze}
            className={`h-24 w-auto transition-transform duration-300 group-hover:scale-105 ${done ? "animate-hop" : "animate-bob"}`}
            label="The Rupli avatar"
          />
        </button>
        <p
          key={mood.text}
          className="mb-8 max-w-[12rem] animate-avatar-in rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs leading-snug font-medium text-slate-800 shadow-[0_10px_24px_-12px_rgb(28_26_38/0.35)] ring-1 ring-slate-200"
        >
          {mood.text}
        </p>
      </div>
      <section className={`${card} w-[min(26rem,calc(100vw-2rem))] p-6 sm:p-8`} aria-labelledby="auth-heading">
        {done ? (
          <div role="status" className="flex animate-fade-up flex-col items-center py-4 text-center">
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
                  <input
                    id="auth-username"
                    ref={usernameRef}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    onChange={() => setError(null)}
                    {...editing("username")}
                    aria-invalid={!!error}
                    aria-describedby={signUp ? "auth-username-hint" : undefined}
                    className={`peer ${input}`}
                  />
                  <UserIcon aria-hidden className={fieldIcon} />
                </div>
                {signUp && (
                  <p id="auth-username-hint" className="mt-1 text-xs text-slate-500">
                    3 to 20 characters: letters, numbers, dots or underscores.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative mt-1.5">
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
                    {...editing("password")}
                    aria-invalid={!!error}
                    aria-describedby={signUp ? "auth-password-hint" : undefined}
                    className="peer w-full rounded-xl border border-slate-200 bg-white py-3 pr-16 pl-10 text-[15px] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <LockIcon aria-hidden className={fieldIcon} />
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
                    At least {MIN_PASSWORD} characters. Don&apos;t forget it, there&apos;s no email reset.
                  </p>
                )}
              </div>
              {!signUp && (
                <label className="flex w-fit items-center gap-2.5 text-sm font-medium text-slate-700">
                  <input ref={rememberRef} type="checkbox" className="h-4 w-4 accent-brand-600" />
                  Remember me
                </label>
              )}
              {signUp && (
                <ConsentCheck
                  checked={agreed}
                  onChange={(v) => {
                    setAgreed(v);
                    setError(null);
                  }}
                />
              )}
              <button type="submit" disabled={busy !== null} className={`${primaryButton} w-full py-3 text-[15px]`}>
                {busy === "form" ? (signUp ? "Setting you up…" : "Signing in…") : signUp ? "Sign up" : "Sign in"}
              </button>
            </form>

            {error && (
              <p role="alert" className="mt-4 animate-fade-up rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-800 ring-1 ring-rose-100">
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

            <p className="my-5 flex items-center gap-3 text-xs font-medium text-slate-500">
              <span aria-hidden className="h-px flex-1 bg-slate-200" />
              or skip the typing
              <span aria-hidden className="h-px flex-1 bg-slate-200" />
            </p>
            <button type="button" onClick={google} disabled={busy !== null} className="google-button group w-full">
              <GoogleLogo />
              {busy === "google" ? "Opening Google…" : "Continue with Google"}
            </button>

            {!signUp && (
              <p className="mt-5 text-xs text-slate-500">
                Terms and privacy:{" "}
                <Link href="/terms" className="underline underline-offset-2">
                  Terms
                </Link>{" "}
                ·{" "}
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </Link>
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
