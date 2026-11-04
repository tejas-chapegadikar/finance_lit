import { permanentRedirect } from "next/navigation";

// The simulator moved to InvestSmart. Old links (from facts, insights and
// the 30-day challenge) keep working, amounts included.
export default async function OldSimulatorPage(props: PageProps<"/practice/simulator">) {
  const params = await props.searchParams;
  const query = new URLSearchParams();
  for (const key of ["monthly", "years", "rate"]) {
    const value = params[key];
    if (typeof value === "string") query.set(key, value);
  }
  const qs = query.toString();
  permanentRedirect(`/invest/simulator${qs ? `?${qs}` : ""}`);
}
