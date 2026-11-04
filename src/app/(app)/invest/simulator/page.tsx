import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { IconTile } from "@/components/ui/topic-icons";
import { ArrowLeftIcon, CalculatorIcon } from "@/components/ui/icons";
import { CompoundSimulator } from "@/components/practice/CompoundSimulator";

export const metadata: Metadata = { title: "Compounding simulator — StockStreak" };

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export default async function SimulatorPage(props: PageProps<"/invest/simulator">) {
  await requireOnboardedUser();
  const params = await props.searchParams;
  const initial = {
    monthly: Math.round(clamp(params.monthly, 100, 25000, 1000) / 100) * 100,
    years: Math.round(clamp(params.years, 1, 40, 10)),
    rate: Math.round(clamp(params.rate, 1, 15, 10) * 2) / 2,
  };

  return (
    <div className="flex flex-col gap-10">
      <Link href="/invest" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        InvestSmart
      </Link>
      <PageHeader
        icon={
          <IconTile area="INVESTING" size="lg">
            <CalculatorIcon />
          </IconTile>
        }
        eyebrow="InvestSmart · Compounding simulator"
        title="Watch time do the heavy lifting"
        description="Move the sliders and see how a monthly amount could grow when returns earn returns — and what “I'll start next year” really costs."
      />
      <CompoundSimulator initial={initial} />
    </div>
  );
}
