import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "About — StockStreak" };

const CONTENT = `
**Learn money before money teaches you the hard way.**

StockStreak is a practical financial-learning platform for Indian college students and first-job professionals. It prepares you for real money decisions — from managing your first stipend to understanding your first salary — *before* you meet them, or a UPI scam, for real.

## Why we built it

Most of us leave college without learning how budgets, bank accounts, credit scores, income tax or investing actually work — and then learn the hard way. StockStreak teaches these skills early, in a way that's practical and quick.

## How it works

- **A college-to-first-salary journey** — 12 short written lessons in four chapters, with Indian examples
- **Interactive money scenarios** — manage a ₹15,000 stipend, handle a credit-card bill, spot a fake UPI request, read your first payslip
- **5-question quizzes** with an **AI Coach** that gives a hint, lets you retry and checks you've got it — instead of just revealing the answer
- **Smart revision** that brings back what you missed after 1, 3 and 7 days, and tracks your topic mastery
- **Today's Challenge** — one fresh money decision every day
- **XP, badges and a Rewards Store** — XP comes only from real learning, and you can spend it on titles, themes and bonus scenarios

Our lessons cite their sources and show when they were last reviewed, and tax lessons say which tax year they apply to.

## What we're not

StockStreak is not a trading app, a bank, a wallet or an investment adviser. We don't sell financial products, recommend specific investments or take payments. Everything here is general education — see our [Disclaimer](/disclaimer).

## Where we are

This is our first version. We're piloting **Level 1 — Financial Foundations** with a small group of students, measuring whether they come back, improve and remember — and improving it before we build more. Tell us what works and what doesn't: [get in touch](/contact).
`;

export default function AboutPage() {
  return <InfoPage title="About StockStreak">{CONTENT}</InfoPage>;
}
