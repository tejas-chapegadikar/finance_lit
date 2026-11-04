import type { AvatarConfig } from "@/lib/avatar";
import { Avatar, type Expression } from "./Avatar";

/**
 * The student's avatar with a speech bubble, placed in a page (not a pop-up)
 * — the same avatar everywhere, with the expression and line for the place.
 */
export function AvatarSays({
  config,
  name,
  expression,
  children,
  tone = "light",
  size = "md",
  className = "",
}: {
  config: AvatarConfig;
  name: string;
  expression?: Expression;
  children: React.ReactNode;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const h = size === "sm" ? "h-16" : size === "lg" ? "h-32 sm:h-36" : "h-20 sm:h-24";
  const bubble =
    tone === "dark" ? "bg-white/12 text-white ring-1 ring-white/15" : "bg-white text-slate-800 ring-1 ring-slate-200 shadow-[0_8px_20px_-12px_rgb(28_26_38/0.3)]";
  const pointer = tone === "dark" ? "bg-white/12 ring-1 ring-white/15" : "bg-white ring-1 ring-slate-200";
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Avatar config={config} expression={expression} className={`${h} w-auto shrink-0 animate-bob`} label={`${name}'s avatar`} />
      <p className={`relative mb-3 min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-snug font-medium ${bubble}`}>
        <span aria-hidden className={`absolute bottom-3 -left-1.5 h-3 w-3 rotate-45 ${pointer} [clip-path:polygon(0_0,0_100%,100%_100%)]`} />
        {children}
      </p>
    </div>
  );
}
