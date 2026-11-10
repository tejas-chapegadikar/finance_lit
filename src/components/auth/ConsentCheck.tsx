"use client";

import Link from "next/link";

const link = "font-semibold text-brand-700 underline underline-offset-2";

/** "I'm 18+ and I agree". Never ticked for you, and the words stay plain. */
export function ConsentCheck({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-2.5 text-sm leading-snug text-slate-700">
      <input type="checkbox" required checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
      <span>
        I&apos;m 18 or older, and I agree to the{" "}
        <Link href="/terms" target="_blank" className={link}>
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" target="_blank" className={link}>
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
