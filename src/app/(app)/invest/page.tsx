import Link from "next/link";
import { ViewTransition } from "react";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { getPortfolio } from "@/lib/invest/portfolio";
import { investToolsUnlocked } from "@/lib/invest/access";
import { VirtualPortfolio } from "@/components/invest/VirtualPortfolio";
import { LockedTool } from "@/components/lessons/LockedTool";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Virtual investing | Rupli" };

// The virtual investing simulator: pretend money, unlocked by the first
// InvestSmart lesson. Education only: no product recommendations, no promises.
export default async function InvestPage() {
  const user = await requireOnboardedUser();
  if (!(await investToolsUnlocked(user.id))) {
    const first = (await getProgress(user.id)).invest[0];
    return <LockedTool title="Virtual investing" lessonTitle={first?.title ?? "the first InvestSmart lesson"} lessonHref={first ? `/lessons/${first.slug}` : "/lessons"} />;
  }
  const portfolio = await getPortfolio(user.id);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/lessons" className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-semibold text-slate-600">
        <ArrowLeftIcon className="h-4 w-4" /> Learn
      </Link>
      <ViewTransition name="hub-invest" share="morph" default="none">
        <h1 className="text-2xl text-slate-900">Practice investing</h1>
      </ViewTransition>
      <VirtualPortfolio portfolio={portfolio} />
      <Link href="/invest/simulator" className="text-center text-sm font-semibold text-brand-700 underline underline-offset-2">
        Open the compounding simulator
      </Link>
      <p className="text-xs leading-relaxed text-slate-500">
        Rupli teaches how investing works. It never recommends a product, fund or share, and nothing here is a prediction: real returns vary, can be negative, and are never guaranteed. Education only, not investment advice. For personal advice, speak to a SEBI-registered investment adviser.
      </p>
    </div>
  );
}
