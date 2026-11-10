import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { investToolsUnlocked } from "@/lib/invest/access";
import { LockedTool } from "@/components/lessons/LockedTool";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconTile } from "@/components/ui/topic-icons";
import { ArrowLeftIcon, CalculatorIcon } from "@/components/ui/icons";
import { CompoundSimulator } from "@/components/practice/CompoundSimulator";

export const metadata: Metadata = { title: "Compounding simulator | Rupli" };

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export default async function SimulatorPage(props: PageProps<"/invest/simulator">) {
  const user = await requireOnboardedUser();
  if (!(await investToolsUnlocked(user.id))) {
    const first = (await getProgress(user.id)).invest[0];
    return <LockedTool title="Compounding simulator" lessonTitle={first?.title ?? "the first InvestSmart lesson"} lessonHref={first ? `/lessons/${first.slug}` : "/lessons"} />;
  }
  const params = await props.searchParams;
  const initial = {
    monthly: Math.round(clamp(params.monthly, 100, 25000, 1000) / 100) * 100,
    years: Math.round(clamp(params.years, 1, 40, 10)),
    rate: Math.round(clamp(params.rate, 1, 15, 10) * 2) / 2,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/lessons" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Learn
      </Link>
      <PageHeader
        icon={
          <IconTile area="INVESTING" size="lg">
            <CalculatorIcon />
          </IconTile>
        }
        eyebrow="InvestSmart · Compounding simulator"
        title="See what waiting is costing you"
        description="Move the sliders. Watch “I'll start next year” get very expensive. Numbers are examples, not promises."
      />
      <CompoundSimulator initial={initial} />
    </div>
  );
}
