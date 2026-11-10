"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { Avatar, type Expression } from "@/components/avatar/Avatar";
import { usePointerGaze } from "@/components/avatar/use-gaze";
import { card } from "@/components/ui/button-styles";

// Sign in or sign up, with Google only. Google's own screen lets people pick
// an account; Google then hands us their name and email, so nobody types
// anything here, and there are no passwords to store or forget.
// New accounts agree to the terms on the next screen (/consent).

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

const NOT_READY = "Sign-in isn't available right now. Please try again in a little while.";

/** Turns Supabase's messages into plain, friendly ones. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) return NOT_READY;
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Take a minute, then go again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your internet and try again.";
  return "That didn't work. Mind trying again?";
}

const safeNext = (next: string | undefined) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

const POKES: { expression: Expression; text: string }[] = [
  { expression: "happy", text: "Hey! Fingers off the merchandise." },
  { expression: "shocked", text: "You poke me before you've even logged in?" },
  { expression: "thinking", text: "Still here? The button's right there." },
  { expression: "excited", text: "Fine. One more poke, then we talk about your spending." },
];

type Mood = { expression: Expression; text: string };

const link = "font-semibold text-brand-700 underline underline-offset-2";

export function AuthCard({ mode, next, initialError }: { mode: "sign-in" | "sign-up"; next?: string; initialError?: string }) {
  const signUp = mode === "sign-up";
  const stage = useRef<HTMLButtonElement>(null);
  const gaze = usePointerGaze(stage);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busy, setBusy] = useState(false);
  const [poke, setPoke] = useState<Mood | null>(null);
  const pokes = useRef(0);

  async function google() {
    setError(null);
    setBusy(true);
    // If Google isn't switched on in Supabase, say so here rather than
    // sending people to a raw error page from the login provider.
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
      const settings = (await response.json()) as { external?: { google?: boolean } };
      if (settings.external?.google === false) {
        setBusy(false);
        setError(NOT_READY);
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
      setBusy(false);
      setError(friendly(err.message));
    }
  }

  const mood: Mood = error
    ? { expression: "shocked", text: "Oops. Small hiccup, we'll sort it." }
    : busy
      ? { expression: "excited", text: "Off to Google. Back in a sec!" }
      : (poke ??
        (signUp
          ? { expression: "welcoming", text: "Hi! I'm your new money buddy." }
          : { expression: "welcoming", text: "You're back! I missed roasting you." }));

  return (
    <div className="flex flex-col items-center">
      <div className="relative -mb-3 flex items-end gap-2" aria-live="polite">
        <button
          ref={stage}
          type="button"
          onClick={() => setPoke(POKES[pokes.current++ % POKES.length])}
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
            className="h-24 w-auto animate-bob transition-transform duration-300 group-hover:scale-105"
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
        <h1 id="auth-heading" className="text-2xl text-slate-900 sm:text-[1.75rem]">
          {signUp ? "Sign up" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {signUp ? "One tap with your Google account. No passwords to forget." : "Pick your Google account to carry on where you left off."}
        </p>

        <button type="button" onClick={google} disabled={busy} className="google-button mt-6 w-full py-3.5 text-base">
          <GoogleLogo />
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>

        {error && (
          <p role="alert" className="mt-4 animate-fade-up rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-800 ring-1 ring-rose-100">
            {error}
          </p>
        )}

        <p className="mt-5 text-sm text-slate-600">
          {signUp ? "Already have an account? " : "New to Rupli? "}
          <Link href={signUp ? "/sign-in" : "/sign-up"} className="font-semibold text-brand-700 hover:underline">
            {signUp ? "Sign in" : "Sign up"}
          </Link>
        </p>
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          New here? On the next screen you&apos;ll confirm you&apos;re 18 or older and agree to our{" "}
          <Link href="/terms" className={link}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
