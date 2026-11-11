import Link from "next/link";
import { ViewTransition } from "react";
import { card, primaryButton } from "@/components/ui/button-styles";
import { LockIcon } from "@/components/ui/icons";

/** Shown instead of a simulator until the first InvestSmart lesson is done. */
export function LockedTool({ title, lessonTitle, lessonHref }: { title: string; lessonTitle: string; lessonHref: string }) {
  return (
    <div data-guide="invest-locked" className={`${card} mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center`}>
      <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <LockIcon className="h-6 w-6" />
      </span>
      <ViewTransition name="hub-invest" share="morph" default="none">
        <h1 className="text-2xl text-slate-900">{title} is locked</h1>
      </ViewTransition>
      <p className="text-sm text-slate-600">
        Finish the lesson &quot;{lessonTitle}&quot; to unlock it. Nobody gets pretend money before knowing what inflation is.
      </p>
      <Link href={lessonHref} className={`${primaryButton} w-full py-3`}>
        Start the lesson
      </Link>
      <Link href="/lessons" className="text-sm font-semibold text-brand-700 underline underline-offset-2">
        Back to Learn
      </Link>
    </div>
  );
}
