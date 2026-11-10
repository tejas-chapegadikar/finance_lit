/** The Rupli mark and wordmark. */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <span className="group/logo inline-flex items-center gap-2.5">
      <svg viewBox="0 0 1024 1024" aria-hidden className="h-9 w-9 transition-transform duration-300 ease-out group-hover/logo:scale-110 group-hover/logo:-rotate-6">
        <path fill="#12201A" d="M512 0C880 0 1024 144 1024 512s-144 512-512 512S0 880 0 512 144 0 512 0Z" />
        <path fill="#F5F0E6" d="M309 235h122v553H309zM458 605h150l120 183H579z" />
        <path fill="#FFB81F" d="M458 235h106a171.5 171.5 0 0 1 0 343H458z" />
      </svg>
      <span className={`font-display text-[1.4rem] leading-none font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>Rupli</span>
    </span>
  );
}
