import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay, shiftDay } from "@/lib/ist-date";
import { budgetAlerts, getMoneyMonth, getMoneyTrends, isMonth, moneyInsights, monthOf, shiftMonth } from "@/lib/money";
import { EXPENSE_CATEGORIES, expenseCategory, incomeCategory, rupees } from "@/lib/money/categories";
import { moneyFactFor } from "@/lib/money-facts";
import { PageHeader, StatStrip } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { QuickAdd } from "@/components/money/QuickAdd";
import { BudgetEditor } from "@/components/money/BudgetEditor";
import { CategoryBars, DailyColumns, SpendSplit, TrendColumns } from "@/components/money/Charts";
import { InsightList, MoneyFactCard } from "@/components/money/Insights";
import { GoalCard, NewGoalForm } from "@/components/money/Goals";
import { EntryRow } from "@/components/money/EntryRow";
import { AvatarSays } from "@/components/avatar/AvatarSays";
import type { Expression } from "@/components/avatar/Avatar";
import { avatarName, readAvatar } from "@/lib/avatar";

export const metadata: Metadata = { title: "Money Manager — StockStreak" };

const dayLabel = (day: string, today: string) =>
  day === today
    ? "Today"
    : day === shiftDay(today, -1)
      ? "Yesterday"
      : new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const TYPES = [
  { id: "all", label: "All" },
  { id: "out", label: "Expenses" },
  { id: "in", label: "Income" },
] as const;

// Money Manager: what comes in, what goes out, where it goes, and what it
// could become. Your own numbers, private to you — every query is scoped to
// the signed-in student, and nothing here is sample data.
export default async function MoneyPage(props: PageProps<"/money">) {
  const user = await requireOnboardedUser();
  const today = istDay();
  const thisMonth = monthOf(today);
  const params = await props.searchParams;
  const month = isMonth(params.month) && params.month <= thisMonth ? params.month : thisMonth;
  const type = TYPES.some((t) => t.id === params.type) ? (params.type as (typeof TYPES)[number]["id"]) : "all";
  const cat = typeof params.cat === "string" && EXPENSE_CATEGORIES.some((c) => c.id === params.cat) ? params.cat : null;

  const [m, goals, trends] = await Promise.all([
    getMoneyMonth(user.id, month),
    db.savingsGoal.findMany({ where: { userId: user.id }, orderBy: [{ completedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }] }),
    getMoneyTrends(user.id, today),
  ]);
  const insights = moneyInsights(
    m,
    goals.map((g) => ({ name: g.name, saved: g.saved, target: g.target, completed: !!g.completedAt })),
  ).slice(0, 4);
  const alerts = m.isCurrent ? budgetAlerts(m) : [];
  const left = m.income - m.spent;
  const spentToday = m.entries.some((e) => e.day === today && e.kind === "EXPENSE");
  const budgetUsed = m.totalBudget ? Math.round((m.spent / m.totalBudget) * 100) : null;
  const savedTotal = goals.reduce((sum, g) => sum + g.saved, 0);

  // What your avatar makes of this month, from your own numbers.
  const over = alerts.find((a) => a.level === "over");
  const near = alerts.find((a) => a.level === "near");
  const mood: { expression: Expression; text: string } = m.entries.length === 0
    ? { expression: "welcoming", text: "Log your first spend and I'll show you exactly where your money goes." }
    : over
      ? { expression: "shocked", text: `${over.label} is over budget. Deep breath — we adjust, we don't panic.` }
      : near
        ? { expression: "thinking", text: `${near.label} is at ${near.pct}%. Easy does it for the rest of the month.` }
        : m.income > 0 && left < 0
          ? { expression: "confused", text: "We've spent more than came in this month. Let's find the leak." }
          : m.income > 0
            ? { expression: "happy", text: `${rupees(left)} still available this month. We're doing fine.` }
            : { expression: "happy", text: "Every rupee logged is a rupee understood." };

  const shown = m.entries.filter(
    (e) => (type === "all" || (type === "in" ? e.kind === "INCOME" : e.kind === "EXPENSE")) && (!cat || (e.kind === "EXPENSE" && e.category === cat)),
  );
  const filterHref = (next: { type?: string; cat?: string | null }) => {
    const q = new URLSearchParams();
    if (month !== thisMonth) q.set("month", month);
    const t = next.type ?? type;
    const c = next.cat === undefined ? cat : next.cat;
    if (t !== "all") q.set("type", t);
    if (c) q.set("cat", c);
    const qs = q.toString();
    return `/money${qs ? `?${qs}` : ""}#entries`;
  };
  const chip = (on: boolean) =>
    `inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-sm transition ${
      on ? "border-slate-900 bg-slate-900 font-semibold text-white" : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300"
    }`;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow={`Money Manager · ${m.label}`}
        title="Where your money actually goes"
        description="Log what comes in and what goes out. We'll do the maths — and, gently, the roasting."
        aside={
          <nav aria-label="Month" className="flex items-center gap-1 text-sm">
            <Link href={`/money?month=${shiftMonth(month, -1)}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              <ArrowLeftIcon className="h-4 w-4" /> Previous
            </Link>
            {month !== thisMonth && (
              <Link href="/money" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                This month <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </nav>
        }
      >
        <StatStrip
          label={`${m.label} overview`}
          stats={[
            { label: "Income", value: rupees(m.income) },
            { label: "Expenses", value: rupees(m.spent) },
            { label: "Available balance", value: m.income ? rupees(left) : "—", tone: m.income ? (left < 0 ? "text-rose-700" : "text-emerald-700") : undefined },
            { label: "Total savings", value: rupees(savedTotal) },
          ]}
        />
        {budgetUsed !== null && (
          <div className="max-w-md">
            <ProgressBar
              value={Math.min(m.spent, m.totalBudget!)}
              max={m.totalBudget!}
              label="Monthly budget used"
              tone={budgetUsed > 100 ? "bg-rose-500" : budgetUsed >= 80 ? "bg-orange-400" : "bg-emerald-500"}
            />
            <p className="mt-1.5 text-sm text-slate-600">
              {budgetUsed}% of your {rupees(m.totalBudget!)} monthly budget used · {m.totalBudget! > m.spent ? `${rupees(m.totalBudget! - m.spent)} left` : "nothing left"}
            </p>
          </div>
        )}
      </PageHeader>

      {m.isCurrent && (
        <AvatarSays config={readAvatar(user.avatar)} name={avatarName(user)} expression={mood.expression} className="-mt-4">
          {mood.text}
        </AvatarSays>
      )}

      {alerts.length > 0 && (
        <section aria-labelledby="alerts-heading" className="-mt-4 rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100 sm:p-5">
          <h2 id="alerts-heading" className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-orange-950">
            <AlertIcon className="h-4 w-4" /> Budget check
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-orange-950">
            {alerts.map((a) => (
              <li key={a.id}>
                <span className="font-semibold">{a.label}</span>:{" "}
                {a.level === "over" ? `${rupees(a.spent - a.budget)} over its ${rupees(a.budget)} budget.` : `${a.pct}% used — ${rupees(a.budget - a.spent)} left of ${rupees(a.budget)}.`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        {m.isCurrent ? (
          <QuickAdd today={today} minDay={shiftDay(today, -60)} checkedInToday={m.checkedInToday} spentToday={spentToday} />
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
            You&apos;re looking at {m.label}. To log something new,{" "}
            <Link href="/money" className="font-semibold text-brand-700">
              go to this month
            </Link>
            .
          </p>
        )}
        <section id="insights" aria-labelledby="insights-heading" className="flex scroll-mt-20 flex-col gap-5">
          <div>
            <h2 id="insights-heading" className="text-xl text-slate-900">
              What your money is saying
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Based only on what you&apos;ve logged for {m.label}.</p>
          </div>
          <InsightList insights={insights} />
          {m.isCurrent && <MoneyFactCard fact={moneyFactFor(today, m)} compact />}
        </section>
      </div>

      <section id="report" className="scroll-mt-20" aria-labelledby="report-heading">
        <h2 id="report-heading" className="text-2xl text-slate-900">
          {m.label} breakdown
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Spending by category</h3>
            <div className="mt-4">
              <CategoryBars categories={m.byCategory} />
            </div>
          </div>
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Essentials, wants, food &amp; others</h3>
              <div className="mt-4">
                <SpendSplit byKind={m.byKind} spent={m.spent} />
              </div>
            </div>
            <div>
              <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Spending per day</h3>
              <div className="mt-4">
                <DailyColumns month={m} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trends" className="scroll-mt-20" aria-labelledby="trends-heading">
        <h2 id="trends-heading" className="text-2xl text-slate-900">
          Spending trends
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Last 8 weeks</h3>
            <div className="mt-4">
              <TrendColumns points={trends.weekly} unit="week" caption="Spending per week for the last 8 weeks" />
            </div>
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-slate-900">Last 6 months</h3>
            <div className="mt-4">
              <TrendColumns points={trends.monthly} unit="month" caption="Spending per month for the last 6 months" />
            </div>
          </div>
        </div>
      </section>

      <section id="budgets" className="scroll-mt-20" aria-labelledby="budgets-heading">
        <h2 id="budgets-heading" className="text-2xl text-slate-900">
          Budgets
        </h2>
        <p className="mt-0.5 text-sm text-slate-600">
          A budget isn&apos;t a ban — it&apos;s permission with a limit. Set one for the month, or for any category; we&apos;ll flag it at 80% and when it&apos;s over.
        </p>
        <div className="mt-4">
          {m.isCurrent ? (
            <BudgetEditor budgets={m.budgets} monthLabel={m.label} />
          ) : (
            <p className="text-sm text-slate-600">Budgets are set for the current month.</p>
          )}
        </div>
      </section>

      <section id="goals" className="scroll-mt-20" aria-labelledby="goals-heading">
        <h2 id="goals-heading" className="text-2xl text-slate-900">
          Savings goals
        </h2>
        <p className="mt-0.5 text-sm text-slate-600">Pay yourself first: give your savings a name, then feed it. Track money you set aside — it stays in your own account.</p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={{ id: g.id, name: g.name, icon: g.icon, target: g.target, saved: g.saved, targetDay: g.targetDay, completed: !!g.completedAt, today }}
            />
          ))}
          <li>
            <NewGoalForm today={today} />
          </li>
        </ul>
      </section>

      <section id="entries" className="scroll-mt-20" aria-labelledby="entries-heading">
        <h2 id="entries-heading" className="text-2xl text-slate-900">
          {m.label} transactions
        </h2>
        <nav aria-label="Filter transactions" className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {TYPES.map((t) => (
            <Link key={t.id} href={filterHref({ type: t.id, cat: t.id === "in" ? null : undefined })} aria-current={type === t.id && !cat ? "page" : undefined} className={chip(type === t.id && !cat)}>
              {t.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1 w-px shrink-0 bg-slate-200" />
          {EXPENSE_CATEGORIES.map((c) => (
            <Link key={c.id} href={filterHref({ type: "out", cat: cat === c.id ? null : c.id })} aria-current={cat === c.id ? "page" : undefined} className={chip(cat === c.id)}>
              {c.label}
            </Link>
          ))}
        </nav>
        {m.entries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Nothing logged for {m.label} yet.</p>
        ) : shown.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No {cat ? expenseCategory(cat).label.toLowerCase() : type === "in" ? "income" : "expenses"} logged for {m.label}.{" "}
            <Link href={filterHref({ type: "all", cat: null })} className="font-semibold text-brand-700">
              Show everything
            </Link>
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-slate-500 tabular-nums">
              {shown.length} {shown.length === 1 ? "transaction" : "transactions"} · {rupees(shown.filter((e) => e.kind === "EXPENSE").reduce((s, e) => s + e.amount, 0))} out
              {shown.some((e) => e.kind === "INCOME") && ` · ${rupees(shown.filter((e) => e.kind === "INCOME").reduce((s, e) => s + e.amount, 0))} in`}
            </p>
            <ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
              {shown.slice(0, 100).map((e) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  label={e.kind === "EXPENSE" ? expenseCategory(e.category).label : incomeCategory(e.category).label}
                  dayText={dayLabel(e.day, today)}
                  today={today}
                  minDay={shiftDay(today, -60)}
                />
              ))}
            </ul>
          </>
        )}
        <p className="mt-4 text-xs text-slate-500">Only you can see your Money Manager. StockStreak never connects to your bank — you log what you choose.</p>
      </section>
    </div>
  );
}
