import Link from "next/link";
import { primaryButton } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-900/5">
        <span aria-hidden className="text-4xl">
          🧭
        </span>
        <h1 className="text-xl font-extrabold text-slate-900">We couldn&apos;t find that page</h1>
        <p className="text-sm text-slate-600">It may have moved, or the link might be wrong.</p>
        <Link href="/dashboard" className={`${primaryButton} mt-2`}>
          Go to my dashboard
        </Link>
      </div>
    </main>
  );
}
