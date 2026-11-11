import Link from "next/link";
import { ViewTransition } from "react";
import { EMPTY } from "@/content/avatar-lines";
import { readAvatar } from "@/lib/avatar";
import { AvatarEmpty } from "@/components/guide/AvatarEmpty";
import { primaryButton } from "@/components/ui/button-styles";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay, shiftDay } from "@/lib/ist-date";
import { budgetAlerts, getMoneyMonth, getMoneyTrends, isMonth, moneyInsights, monthOf, shiftMonth } from "@/lib/money";
import { EXPENSE_CATEGORIES, expenseCategory, incomeCategory, rupees } from "@/lib/money/categories";
import { moneyFactFor } from "@/lib/money-facts";
import { getDoneQuests } from "@/lib/quests";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { card } from "@/components/ui/button-styles";
import { QuickAddButton, QuickAddSheet } from "@/components/money/QuickAddSheet";
import { CheckQuest } from "@/components/money/CheckQuest";
import { BudgetEditor } from "@/components/money/BudgetEditor";
import { CategoryBars, CategoryDonut, DailyColumns, SpendSplit, TrendColumns } from "@/components/money/Charts";
import { InsightList, MoneyFactCard } from "@/components/money/Insights";
import { GoalCard, NewGoalForm } from "@/components/money/Goals";
import { EntryRow } from "@/components/money/EntryRow";

export const metadata: Metadata = { title: "Money | Rupli" };

const dayLabel = (day: string, today: string) =>
  day === today
    ? "Today"
    : day === shiftDay(today, -1)
      ? "Yesterday"
      : new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "budgets", label: "Budgets" },
  { id: "goals", label: "Goals" },
  { id: "history", label: "History" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TYPES = [
  { id: "all", label: "All" },
  { id: "out", label: "Expenses" },
  { id: "in", label: "Income" },
] as const;

const subheading = "font-sans text-sm font-semibold tracking-normal text-slate-900";

// Money: one tab at a time. Your own numbers, private to you; every query is
// scoped to the signed-in student, and nothing here is sample data.
export default async function MoneyPage(props: PageProps<"/money">) {
  const user = await requireOnboardedUser();
  const today = istDay();
  const thisMonth = monthOf(today);
  const params = await props.searchParams;
  const tab: TabId = TABS.some((t) => t.id === params.tab) ? (params.tab as TabId) : "overview";
  const month = isMonth(params.month) && params.month <= thisMonth ? params.month : thisMonth;
  const type = TYPES.some((t) => t.id === params.type) ? (params.type as (typeof TYPES)[number]["id"]) : "all";
  const cat = typeof params.cat === "string" && EXPENSE_CATEGORIES.some((c) => c.id === params.cat) ? params.cat : null;

  const [m, goals, trends, doneQuests] = await Promise.all([
    getMoneyMonth(user.id, month),
    db.savingsGoal.findMany({ where: { userId: user.id }, orderBy: [{ completedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }] }),
    getMoneyTrends(user.id, today),
    getDoneQuests(user.id, today),
  ]);

  const href = (next: { tab?: TabId; month?: string; type?: string; cat?: string | null }) => {
    const q = new URLSearchParams();
    const t = next.tab ?? tab;
    const mon = next.month ?? month;
    if (t !== "overview") q.set("tab", t);
    if (mon !== thisMonth) q.set("month", mon);
    if (t === "history") {
      const ty = next.type ?? type;
      const c = next.cat === undefined ? cat : next.cat;
      if (ty !== "all") q.set("type", ty);
      if (c) q.set("cat", c);
    }
    const qs = q.toString();
    return `/money${qs ? `?${qs}` : ""}`;
  };

  const insights = moneyInsights(
    m,
    goals.map((g) => ({ name: g.name, saved: g.saved, target: g.target, completed: !!g.completedAt })),
  ).slice(0, 2);
  const alerts = m.isCurrent ? budgetAlerts(m) : [];
  const left = m.income - m.spent;
  const savedTotal = goals.reduce((sum, g) => sum + g.saved, 0);
  const budgetUsed = m.totalBudget ? Math.round((m.spent / m.totalBudget) * 100) : null;
  const spentToday = m.entries.some((e) => e.day === today && e.kind === "EXPENSE");
  const shown = m.entries.filter((e) => (type === "all" || (type === "in" ? e.kind === "INCOME" : e.kind === "EXPENSE")) && (!cat || (e.kind === "EXPENSE" && e.category === cat)));
  const chip = (on: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 text-sm transition ${on ? "border-slate-900 bg-slate-900 font-semibold text-white" : "border-slate-200 bg-white font-medium text-slate-700"}`;
  const tiles = [
    { label: "Income", value: rupees(m.income) },
    { label: "Spent", value: rupees(m.spent) },
    { label: "Left", value: rupees(left), tone: left < 0 ? "text-rose-700" : "text-emerald-800" },
    { label: "Saved", value: rupees(savedTotal) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <ViewTransition name="hub-money" share="morph" default="none">
          <h1 className="text-2xl text-slate-900">Money</h1>
        </ViewTransition>
        <nav aria-label="Month" className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link href={href({ month: shiftMonth(month, -1) })} aria-label="Previous month" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <span className="tabular-nums">{m.label}</span>
          {month !== thisMonth && (
            <Link href={href({ month: shiftMonth(month, 1) })} aria-label="Next month" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </header>

      <nav aria-label="Money sections" data-guide="money-tabs" className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <Link key={t.id} href={href({ tab: t.id, type: "all", cat: null })} aria-current={tab === t.id ? "page" : undefined} className={`flex min-h-10 items-center justify-center rounded-lg text-[13px] transition sm:text-sm ${tab === t.id ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-slate-600"}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          {m.isCurrent && !doneQuests.has("check") && <CheckQuest />}
          {m.isCurrent && m.entries.length === 0 && (
            <AvatarEmpty text={EMPTY.expenses.text} avatar={readAvatar(user.avatar)}>
              <QuickAddButton className={`${primaryButton} py-3`}>{EMPTY.expenses.button}</QuickAddButton>
            </AvatarEmpty>
          )}
          <dl className="grid grid-cols-2 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className={`${card} flex flex-col-reverse p-3`}>
                <dd className={`truncate font-display text-xl font-bold tabular-nums ${t.tone ?? "text-slate-900"}`}>{t.value}</dd>
                <dt className="text-xs font-medium text-slate-600">{t.label}</dt>
              </div>
            ))}
          </dl>
          <section aria-labelledby="insights-heading">
            <h2 id="insights-heading" className="text-lg text-slate-900">
              What your money is saying
            </h2>
            <div className="mt-2">
              <InsightList insights={insights} />
            </div>
          </section>
          <section aria-labelledby="chart-heading" data-guide="money-chart">
            <h2 id="chart-heading" className="text-lg text-slate-900">
              Spending by category
            </h2>
            <div className="mt-3">
              <CategoryDonut categories={m.byCategory} spent={m.spent} />
            </div>
          </section>
          <details className={`${card} p-4`}>
            <summary className="min-h-6 cursor-pointer text-sm font-semibold text-slate-900">See more charts</summary>
            <div className="mt-4 flex flex-col gap-8">
              <div>
                <h3 className={subheading}>Every category</h3>
                <div className="mt-3">
                  <CategoryBars categories={m.byCategory} />
                </div>
              </div>
              <div>
                <h3 className={subheading}>Essentials, wants, food &amp; others</h3>
                <div className="mt-3">
                  <SpendSplit byKind={m.byKind} spent={m.spent} />
                </div>
              </div>
              <div>
                <h3 className={subheading}>Spending per day</h3>
                <div className="mt-3">
                  <DailyColumns month={m} />
                </div>
              </div>
              <div>
                <h3 className={subheading}>Last 8 weeks</h3>
                <div className="mt-3">
                  <TrendColumns points={trends.weekly} unit="week" caption="Spending per week for the last 8 weeks" />
                </div>
              </div>
              <div>
                <h3 className={subheading}>Last 6 months</h3>
                <div className="mt-3">
                  <TrendColumns points={trends.monthly} unit="month" caption="Spending per month for the last 6 months" />
                </div>
              </div>
              {m.isCurrent && <MoneyFactCard fact={moneyFactFor(today, m)} compact />}
            </div>
          </details>
        </>
      )}

      {tab === "budgets" && (
        <section aria-label="Budgets" className="flex flex-col gap-4">
          {!m.isCurrent ? (
            <p className="text-sm text-slate-600">Budgets are set for the current month.</p>
          ) : (
            <>
              {budgetUsed !== null && (
                <div className={`${card} p-4`}>
                  <ProgressBar value={Math.min(m.spent, m.totalBudget!)} max={m.totalBudget!} label="Monthly budget used" tone={budgetUsed > 100 ? "bg-rose-500" : budgetUsed >= 80 ? "bg-orange-400" : "bg-emerald-500"} />
                  <p className="mt-1.5 text-sm text-slate-600">
                    {budgetUsed}% of {rupees(m.totalBudget!)} used · {m.totalBudget! > m.spent ? `${rupees(m.totalBudget! - m.spent)} left` : "nothing left"}
                  </p>
                </div>
              )}
              {alerts.length > 0 && (
                <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
                  <h2 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-orange-950">
                    <AlertIcon className="h-4 w-4" /> Budget check
                  </h2>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-orange-950">
                    {alerts.map((a) => (
                      <li key={a.id}>
                        <span className="font-semibold">{a.label}</span>:{" "}
                        {a.level === "over" ? `${rupees(a.spent - a.budget)} over its ${rupees(a.budget)} budget.` : `${a.pct}% used, ${rupees(a.budget - a.spent)} left of ${rupees(a.budget)}.`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <BudgetEditor budgets={m.budgets} monthLabel={m.label} />
            </>
          )}
        </section>
      )}

      {tab === "goals" && (
        <section aria-label="Savings goals">
          {goals.length === 0 ? (
            <NewGoalForm today={today} empty />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {goals.map((g) => (
                <GoalCard key={g.id} goal={{ id: g.id, name: g.name, icon: g.icon, target: g.target, saved: g.saved, targetDay: g.targetDay, completed: !!g.completedAt, today }} />
              ))}
              <li>
                <NewGoalForm today={today} />
              </li>
            </ul>
          )}
        </section>
      )}

      {tab === "history" && (
        <section aria-label="Transactions">
          <nav aria-label="Filter transactions" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {TYPES.map((t) => (
              <Link key={t.id} href={href({ type: t.id, cat: t.id === "in" ? null : undefined })} aria-current={type === t.id && !cat ? "page" : undefined} className={chip(type === t.id && !cat)}>
                {t.label}
              </Link>
            ))}
            <span aria-hidden className="mx-1 w-px shrink-0 bg-slate-200" />
            {EXPENSE_CATEGORIES.map((c) => (
              <Link key={c.id} href={href({ type: "out", cat: cat === c.id ? null : c.id })} aria-current={cat === c.id ? "page" : undefined} className={chip(cat === c.id)}>
                {c.label}
              </Link>
            ))}
          </nav>
          {m.entries.length === 0 ? (
            <div className="mt-4">
              <AvatarEmpty text={EMPTY.expenses.text} avatar={readAvatar(user.avatar)}>
                {m.isCurrent ? <QuickAddButton className={`${primaryButton} py-3`}>{EMPTY.expenses.button}</QuickAddButton> : <span className="text-sm text-slate-600">Nothing logged for {m.label}.</span>}
              </AvatarEmpty>
            </div>
          ) : shown.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No {cat ? expenseCategory(cat).label.toLowerCase() : type === "in" ? "income" : "expenses"} logged for {m.label}.{" "}
              <Link href={href({ type: "all", cat: null })} className="font-semibold text-brand-700">
                Show everything
              </Link>
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
              {shown.slice(0, 100).map((e) => (
                <EntryRow key={e.id} entry={e} label={e.kind === "EXPENSE" ? expenseCategory(e.category).label : incomeCategory(e.category).label} dayText={dayLabel(e.day, today)} today={today} minDay={shiftDay(today, -60)} />
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-slate-500">Only you can see your money entries. Rupli never connects to your bank.</p>
        </section>
      )}

      <QuickAddSheet today={today} minDay={shiftDay(today, -60)} startOpen={params.add === "1"} canNoSpend={!m.checkedInToday && !spentToday} />
    </div>
  );
}
