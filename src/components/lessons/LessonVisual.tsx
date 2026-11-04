import { card } from "@/components/ui/button-styles";

// One explanatory visual per lesson, drawn with HTML and CSS rather than
// images: crisp at any width, tiny to download, readable by screen readers
// (every number is real text), and they follow the theme. Numbers match the
// lesson text; anything involving returns is labelled as an assumption.

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Figure({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <figure className={`${card} p-5 sm:p-6`}>
      <p className="text-[13px] font-medium text-slate-500">At a glance</p>
      <h3 className="mt-1 text-xl text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
      <figcaption className="mt-4 text-sm text-slate-600">{caption}</figcaption>
    </figure>
  );
}

/** A labelled horizontal bar; `value` out of `max` sets the width. */
function Bar({ label, value, max, display, tone }: { label: string; value: number; max: number; display: string; tone: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="font-semibold text-slate-900 tabular-nums">{display}</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-brand-50">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Budgeting() {
  const parts = [
    { label: "Needs", pct: 50, amount: 4000, tone: "bg-brand-600", text: "Mess, bus pass, phone recharge" },
    { label: "Wants", pct: 30, amount: 2400, tone: "bg-peach-300", text: "Cafés, OTT, shopping" },
    { label: "Savings", pct: 20, amount: 1600, tone: "bg-emerald-500", text: "Moved out on the 1st" },
  ];
  return (
    <Figure title="Priya's ₹8,000 with the 50/30/20 rule" caption="Savings go first — the day the money arrives — then needs and wants share the rest.">
      <div className="flex h-10 overflow-hidden rounded-2xl" role="img" aria-label="50% needs, 30% wants, 20% savings">
        {parts.map((p) => (
          <div key={p.label} className={`${p.tone} flex items-center justify-center text-xs font-semibold ${p.label === "Wants" ? "text-orange-950" : "text-white"}`} style={{ width: `${p.pct}%` }}>
            {p.pct}%
          </div>
        ))}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {parts.map((p) => (
          <li key={p.label} className="flex items-start gap-2">
            <span aria-hidden className={`mt-1 h-3 w-3 shrink-0 rounded-full ${p.tone}`} />
            <span className="text-sm">
              <span className="block font-semibold text-slate-900">
                {p.label} · {rupees(p.amount)}
              </span>
              <span className="text-slate-600">{p.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

function CompoundInterest() {
  // ₹10,000 at 10% a year: simple adds ₹1,000 a year; compound multiplies by 1.1.
  const rows = [0, 10, 20, 30].map((years) => ({
    years,
    simple: 10000 + 1000 * years,
    compound: Math.round(10000 * 1.1 ** years),
  }));
  const max = rows[rows.length - 1].compound;
  return (
    <Figure title="₹10,000 at 10% a year" caption="Simple interest grows in a straight line. Compound interest grows on its own growth — slow at first, then fast.">
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.years}>
            <p className="text-sm font-semibold text-slate-900">{r.years === 0 ? "Start" : `After ${r.years} years`}</p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              <Bar label="Simple" value={r.simple} max={max} display={rupees(r.simple)} tone="bg-slate-400" />
              <Bar label="Compound" value={r.compound} max={max} display={rupees(r.compound)} tone="bg-brand-600" />
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

function SavingVsSpending() {
  const rows = [50, 100, 150].map((perDay) => ({ perDay, perYear: perDay * 30 * 12 }));
  return (
    <Figure title="Small daily spends, one year later" caption="Counted as 30-day months. A ₹150 daily habit costs about ₹54,000 a year — cutting it to ₹50 frees up ₹36,000.">
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <Bar key={r.perDay} label={`${rupees(r.perDay)} a day`} value={r.perYear} max={54000} display={`${rupees(r.perYear)} a year`} tone="bg-peach-300" />
        ))}
      </div>
    </Figure>
  );
}

function Upi() {
  return (
    <Figure title="Does money go out or come in?" caption="If a screen asks for your UPI PIN or says “Pay”, money is leaving your account. Receiving never needs a PIN, a scan or an approval.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="font-semibold text-emerald-900">Receiving money</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-emerald-900">
            <li>✓ The sender pays from their app</li>
            <li>✓ It simply arrives in your account</li>
            <li>✓ No PIN, no QR scan, no request to approve</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <p className="font-semibold text-rose-900">Paying money</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-rose-900">
            <li>→ You scan a QR code or approve a collect request</li>
            <li>→ The screen says “Pay ₹…”</li>
            <li>→ You enter your UPI PIN — money leaves</li>
          </ul>
        </div>
      </div>
    </Figure>
  );
}

function Scams() {
  const tricks = [
    { name: "Urgency", line: "“Your account will be blocked in 2 hours!”" },
    { name: "Fear", line: "“You're under digital arrest — pay to clear your name.”" },
    { name: "Greed", line: "“Earn ₹3,000 a day just by liking videos!”" },
  ];
  return (
    <Figure title="The three tricks behind almost every scam" caption="Spot one of these, slow down. Never share an OTP, UPI PIN or CVV, and report scams on 1930 or cybercrime.gov.in.">
      <ul className="grid gap-3 sm:grid-cols-3">
        {tricks.map((t) => (
          <li key={t.name} className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="font-semibold text-rose-900">{t.name}</p>
            <p className="mt-1 text-sm text-rose-900">{t.line}</p>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

function BankAccounts() {
  const days = Array.from({ length: 30 }, (_, i) => i < 10);
  return (
    <Figure title="How the average monthly balance is worked out" caption="₹6,000 for 10 days and ₹0 for 20 days averages ₹2,000 — below a ₹5,000 minimum, so a charge applies even though the balance once looked fine.">
      <div role="img" aria-label="30 days: 10 days at ₹6,000, 20 days at ₹0" className="grid grid-cols-10 gap-1.5">
        {days.map((full, i) => (
          <span key={i} className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-semibold ${full ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-2xl bg-slate-100 p-3">
          <p className="text-slate-600">10 days</p>
          <p className="font-semibold text-slate-900">₹6,000</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-slate-600">20 days</p>
          <p className="font-semibold text-slate-900">₹0</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
          <p className="text-amber-900">Average</p>
          <p className="font-semibold text-amber-900">₹2,000</p>
        </div>
      </div>
    </Figure>
  );
}

function FdRd() {
  return (
    <Figure title="FD: once. RD: every month." caption="Rohit's RD: ₹1,950 a month for 12 months at about 6.5% — ₹23,400 deposited plus about ₹820 interest. Illustrative; check your bank's rates.">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Fixed Deposit — one lump sum, locked for a fixed time</p>
          <div className="mt-1.5 flex h-8 items-center justify-center rounded-xl bg-brand-600 text-xs font-semibold text-white">One deposit</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Recurring Deposit — the same amount every month</p>
          <div className="mt-1.5 grid grid-cols-12 gap-1" role="img" aria-label="12 monthly deposits of ₹1,950">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="flex h-8 items-center justify-center rounded-lg bg-brand-200 text-[10px] font-semibold text-brand-900">
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-800">₹23,400 deposited</span>
          <span aria-hidden>+</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">≈ ₹820 interest</span>
          <span aria-hidden>=</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-900">≈ ₹24,200 at maturity</span>
        </div>
      </div>
    </Figure>
  );
}

function Cibil() {
  const factors = [
    { name: "Payment history", note: "Paying EMIs and bills on time — the biggest factor" },
    { name: "Credit utilisation", note: "Using under 30% of your limit" },
    { name: "Credit age", note: "Older accounts help" },
    { name: "New applications", note: "Many in a short time can pull it down" },
  ];
  const marker = ((750 - 300) / 600) * 100;
  return (
    <Figure title="The 300–900 credit score scale" caption="750+ usually means easier approvals and better rates. No credit history means no score yet — not a bad score.">
      <div className="relative pt-7">
        <span className="absolute top-0 -translate-x-1/2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-emerald-800" style={{ left: `${marker}%` }}>
          750+
        </span>
        <div className="h-4 rounded-full bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-400" role="img" aria-label="Score scale from 300 to 900, with 750 marked" />
        <span aria-hidden className="absolute top-6 h-6 w-0.5 bg-slate-900" style={{ left: `${marker}%` }} />
        <div className="mt-1 flex justify-between text-xs font-semibold text-slate-600">
          <span>300</span>
          <span>900</span>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {factors.map((f) => (
          <li key={f.name} className="rounded-2xl bg-slate-100 p-3 text-sm">
            <span className="block font-semibold text-slate-900">{f.name}</span>
            <span className="text-slate-600">{f.note}</span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

function CreditCards() {
  return (
    <Figure title="One credit card cycle" caption="Rahul's ₹12,000 bill: paying in full costs nothing extra; paying only the minimum leaves ₹11,400 growing at around 3.5% a month. Illustrative — check your card's terms.">
      <ol className="grid grid-cols-3 gap-2 text-center text-sm">
        {[
          ["Spend", "About 30 days of purchases"],
          ["Statement", "Your total bill arrives"],
          ["Due date", "Usually 15–20 days later"],
        ].map(([step, note], i) => (
          <li key={step} className="rounded-2xl bg-slate-100 p-3">
            <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{i + 1}</span>
            <span className="mt-1.5 block font-semibold text-slate-900">{step}</span>
            <span className="text-xs text-slate-600">{note}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="font-semibold text-emerald-900">Pay the full ₹12,000</p>
          <p className="mt-1 text-sm text-emerald-900">₹0 interest, and your credit score benefits.</p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <p className="font-semibold text-rose-900">Pay only the ₹600 minimum</p>
          <p className="mt-1 text-sm text-rose-900">₹11,400 left over attracts about ₹400 interest by next month — and it keeps growing.</p>
        </div>
      </div>
    </Figure>
  );
}

function FirstSalary() {
  const lines = [
    { label: "Employer's PF share (part of CTC)", amount: 1800 },
    { label: "Her own PF contribution", amount: 1800 },
    { label: "Professional tax", amount: 200 },
    { label: "Income tax (TDS), new regime", amount: 0 },
  ];
  return (
    <Figure title="Kavya's ₹6 LPA, month by month" caption="Tax year 2026-27, new regime, illustrative. Both PF amounts still belong to her — they build up in her own EPF account.">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <span className="font-medium text-slate-800">CTC ÷ 12 (on paper)</span>
          <span className="font-semibold text-slate-900 tabular-nums">₹50,000</span>
        </div>
        {lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between px-3">
            <span className="text-slate-700">{l.label}</span>
            <span className="font-semibold text-rose-700 tabular-nums">−{rupees(l.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-2xl bg-brand-600 p-3 text-white">
          <span className="font-medium">In-hand salary</span>
          <span className="font-semibold tabular-nums">≈ ₹46,200</span>
        </div>
      </div>
    </Figure>
  );
}

function StocksFundsFds() {
  const ladder = [
    { name: "Fixed deposit", risk: "Low risk", note: "Known, fixed interest; insured up to ₹5 lakh per bank", width: "w-1/3", tone: "bg-emerald-500" },
    { name: "Index / mutual fund", risk: "Medium risk", note: "Spread across many companies", width: "w-2/3", tone: "bg-amber-400" },
    { name: "A single stock", risk: "High risk", note: "One company — can rise or fall a lot", width: "w-full", tone: "bg-rose-400" },
  ];
  return (
    <Figure title="Higher possible returns, higher risk" caption="Ishaan's single hyped stock fell 40% (₹10,000 → ₹6,000); Tanya's index fund dipped 5% (→ ₹9,500). Neither result is guaranteed to repeat.">
      <ul className="flex flex-col gap-3">
        {ladder.map((l) => (
          <li key={l.name}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-900">{l.name}</span>
              <span className="text-xs font-semibold text-slate-600">{l.risk}</span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-brand-50">
              <div className={`h-full rounded-full ${l.width} ${l.tone}`} />
            </div>
            <p className="mt-1 text-xs text-slate-600">{l.note}</p>
          </li>
        ))}
      </ul>
    </Figure>
  );
}

function Sip() {
  const people = [
    { name: "Aisha starts at 21", invested: 1404000, total: 17100000, display: "≈ ₹1.7 crore", investedDisplay: "₹14 lakh invested" },
    { name: "Rohan starts at 31", invested: 1044000, total: 6200000, display: "≈ ₹62 lakh", investedDisplay: "₹10.4 lakh invested" },
  ];
  const max = people[0].total;
  return (
    <Figure title="₹3,000 a month until 60" caption="Assumes 10% a year to show the maths — real returns go up and down and are never guaranteed. The darker part of each bar is the money actually put in.">
      <div className="flex flex-col gap-4">
        {people.map((p) => (
          <div key={p.name}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-900">{p.name}</span>
              <span className="font-semibold text-slate-900">{p.display}</span>
            </div>
            <div className="mt-1 h-5 overflow-hidden rounded-full bg-brand-50" role="img" aria-label={`${p.investedDisplay}, could grow to ${p.display}`}>
              <div className="flex h-full rounded-full bg-brand-300" style={{ width: `${(p.total / max) * 100}%` }}>
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${(p.invested / p.total) * 100}%` }} />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-600">{p.investedDisplay}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

function Loans() {
  // ₹1,00,000 at 12% a year for 12 months, reducing balance: EMI ≈ ₹8,885.
  const months = [
    { label: "Month 1", interest: 1000 },
    { label: "Month 6", interest: 598 },
    { label: "Month 12", interest: 88 },
  ];
  const emi = 8885;
  return (
    <Figure title="Where Rohit's ₹8,885 EMI goes" caption="Same EMI every month — but as the balance shrinks, less goes to interest and more pays off the loan.">
      <div className="flex flex-col gap-4">
        {months.map((m) => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-900">{m.label}</span>
              <span className="text-slate-600 tabular-nums">
                {rupees(m.interest)} interest · {rupees(emi - m.interest)} principal
              </span>
            </div>
            <div className="mt-1 flex h-4 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${m.label}: ${rupees(m.interest)} interest, ${rupees(emi - m.interest)} principal`}>
              <div className="h-full rounded-l-full bg-orange-400" style={{ width: `${(m.interest / emi) * 100}%` }} />
              <div className="h-full flex-1 rounded-r-full bg-brand-600" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-orange-400" /> Interest
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Principal
        </span>
      </div>
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        Total interest: about <span className="font-semibold">{rupees(6619)}</span> on a reducing balance — versus{" "}
        <span className="font-semibold">{rupees(12000)}</span> if the same 12% were charged “flat”.
      </p>
    </Figure>
  );
}

function Inflation() {
  // What ₹1,000 buys in today's money at 6% inflation a year.
  const points = [
    { label: "Today", value: 1000 },
    { label: "In 5 years", value: 747 },
    { label: "In 10 years", value: 558 },
    { label: "In 20 years", value: 312 },
  ];
  return (
    <Figure title="What ₹1,000 in cash can buy, at 6% inflation" caption="The note never changes. What it buys does — so money you won't need for years has to grow, too.">
      <div className="flex flex-col gap-3">
        {points.map((p) => (
          <Bar key={p.label} label={p.label} value={p.value} max={1000} display={`${rupees(p.value)} worth`} tone="bg-orange-400" />
        ))}
      </div>
    </Figure>
  );
}

function StockMarket() {
  const steps = [
    { title: "You", text: "Place a buy order in a broker app" },
    { title: "Broker", text: "SEBI-registered; sends the order on" },
    { title: "Exchange", text: "NSE or BSE matches you with a seller" },
    { title: "Demat account", text: "Your shares land here the next working day" },
  ];
  return (
    <Figure title="What happens when you buy a share" caption="SEBI regulates every step. Your money goes to the investor who sold — not to the company.">
      <ol className="grid gap-2 sm:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-xs font-semibold text-brand-700 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="mt-0.5 block font-semibold text-slate-900">{s.title}</span>
            <span className="mt-0.5 block text-sm text-slate-600">{s.text}</span>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

function IndexFunds() {
  const people = [
    { name: "Kunal · fund fee 0.2%", value: 6.49, display: "about ₹6.5 lakh" },
    { name: "Simran · fund fee 1.5%", value: 5.11, display: "about ₹5.1 lakh" },
  ];
  return (
    <Figure
      title="₹1 lakh, the same index, 20 years"
      caption="Assumes the index grows 10% a year — an illustration, not a forecast. The only difference is the fee."
    >
      <div className="flex flex-col gap-4">
        {people.map((p) => (
          <Bar key={p.name} label={p.name} value={p.value} max={6.49} display={p.display} tone="bg-brand-600" />
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">Gap from fees alone: about ₹1.4 lakh</p>
    </Figure>
  );
}

function StartInvesting() {
  const steps = [
    { title: "Emergency buffer and health cover first", text: "So you never have to sell in a hurry." },
    { title: "KYC, once", text: "PAN plus an ID/address proof such as Aadhaar." },
    { title: "Name the goal and the date", text: "Near goals stay steady; far goals can take ups and downs." },
    { title: "Pick a risk you'd still hold in a fall", text: "A mix you stick with beats a “better” one you abandon." },
    { title: "Paid advice? SEBI-registered only", text: "Check any adviser or broker on SEBI's website." },
  ];
  return (
    <Figure title="The beginner's checklist" caption="Start small — many funds accept SIPs from ₹100–₹500 a month.">
      <ol className="flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-3">
            <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 tabular-nums">
              {i + 1}
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-slate-900">{s.title}</span>
              <span className="text-slate-600">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

const VISUALS: Record<string, () => React.ReactNode> = {
  "loans-emis": Loans,
  "inflation-purchasing-power": Inflation,
  "how-stock-market-works": StockMarket,
  "index-funds-long-term": IndexFunds,
  "start-investing-checklist": StartInvesting,
  "budgeting-basics": Budgeting,
  "compound-interest": CompoundInterest,
  "saving-vs-spending": SavingVsSpending,
  "upi-digital-payments": Upi,
  "financial-scams": Scams,
  "bank-accounts": BankAccounts,
  "fd-rd": FdRd,
  "cibil-score": Cibil,
  "credit-cards-101": CreditCards,
  "first-salary-tax": FirstSalary,
  "stocks-mutual-funds-fds": StocksFundsFds,
  "sip-starting-early": Sip,
};

/** The lesson's explanatory visual, or nothing for a lesson without one. */
export function LessonVisual({ slug }: { slug: string }) {
  const Visual = VISUALS[slug];
  return Visual ? <Visual /> : null;
}
