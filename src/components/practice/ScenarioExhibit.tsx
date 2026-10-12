import type { PublicScenario } from "@/lib/scenarios";

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** The "document" a scenario is about: a stipend, a card statement, a phone screen or a payslip. */
export function ScenarioExhibit({ exhibit }: { exhibit: PublicScenario["exhibit"] }) {
  if (exhibit.kind === "stipend") {
    const total = exhibit.essentials.reduce((sum, e) => sum + e.amount, 0);
    return (
      <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <p className="text-sm font-semibold text-emerald-800">Monthly stipend</p>
        <p className="font-display text-3xl font-extrabold text-slate-900">{rupees(exhibit.amount)}</p>
        <p className="mt-3 text-sm font-bold text-slate-800">Your essentials this month</p>
        <ul className="mt-1 divide-y divide-emerald-100 text-sm">
          {exhibit.essentials.map((e) => (
            <li key={e.label} className="flex justify-between py-1.5">
              <span className="text-slate-700">{e.label}</span>
              <span className="font-bold text-slate-900 tabular-nums">{rupees(e.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between py-1.5 font-extrabold text-slate-900">
            <span>Total essentials</span>
            <span className="tabular-nums">{rupees(total)}</span>
          </li>
        </ul>
      </div>
    );
  }

  if (exhibit.kind === "statement") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
        <p className="text-xs font-bold text-slate-200">{exhibit.bank}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {exhibit.rows.map((row) => (
            <div key={row.label} className={`rounded-xl p-2.5 ${row.strong ? "bg-white/15" : "bg-white/5"}`}>
              <dt className="text-xs text-slate-200">{row.label}</dt>
              <dd className={`tabular-nums ${row.strong ? "text-lg font-extrabold" : "font-bold"}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (exhibit.kind === "phone") {
    return (
      <div className="mx-auto w-full max-w-xs rounded-[2rem] bg-slate-900 p-3">
        <div className="flex flex-col gap-2.5 rounded-[1.5rem] bg-slate-100 p-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-slate-600">UPI app · {exhibit.request.action}</p>
            <p className="mt-1 font-extrabold text-slate-900">{exhibit.request.from}</p>
            <p className="text-xs text-slate-600">{exhibit.request.handle}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{exhibit.request.amount}</p>
            <p className="mt-1 text-sm text-slate-700">{exhibit.request.note}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm font-bold">
              <span className="rounded-xl bg-slate-100 py-2 text-slate-700">Decline</span>
              <span className="rounded-xl bg-emerald-700 py-2 text-white">Approve</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-slate-600">Messages · {exhibit.sms.from}</p>
            <p className="mt-1 text-sm text-slate-800">{exhibit.sms.body}</p>
          </div>
        </div>
      </div>
    );
  }

  if (exhibit.kind === "payslip") {
    return (
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-600">Payslip · illustrative</p>
        <p className="text-sm font-bold text-slate-900">{exhibit.employee}</p>
        <p className="text-sm text-slate-700">
          CTC: <span className="font-bold">{exhibit.ctc}</span>
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <PayslipList title="Earnings (monthly)" rows={exhibit.earnings} />
          <PayslipList title="Deductions (monthly)" rows={exhibit.deductions} />
        </div>
        <p className="mt-3 flex justify-between rounded-xl bg-emerald-50 px-3 py-2 font-extrabold text-emerald-900">
          <span>Net pay (take-home)</span>
          <span className="tabular-nums">{exhibit.net}</span>
        </p>
        <PayslipList title="Also in her CTC" rows={exhibit.outsideMonthly} className="mt-3" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-600">{exhibit.title}</p>
      <dl className="mt-2 divide-y divide-slate-100 text-sm">
        {exhibit.lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-3 py-2">
            <dt className="text-slate-700">{line.label}</dt>
            <dd className="text-right font-bold text-slate-900">{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PayslipList({
  title,
  rows,
  className = "",
}: {
  title: string;
  rows: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-bold text-slate-600">{title}</p>
      <dl className="mt-1 divide-y divide-slate-100 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 py-1.5">
            <dt className="text-slate-700">{row.label}</dt>
            <dd className="font-bold text-slate-900 tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
