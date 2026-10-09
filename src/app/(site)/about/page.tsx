import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "About — StockStreak" };

const CONTENT = `
**Learn money before money teaches you the hard way.**

StockStreak is a gamified financial-literacy and financial-readiness platform for Indian college students and young adults. It teaches you how to manage money *before* you meet your first stipend, salary, credit card, tax form or UPI scam.

## Why we built it

Most of us leave college without learning how budgets, bank accounts, credit scores, income tax or investing actually work — and then learn the hard way. StockStreak teaches these skills early, in a way that's practical and quick.

## How it works

- **Short written lessons** with Indian examples — ₹, UPI, CIBIL, SIPs, salaries and taxes
- **"What would you do?" scenarios** that put you in real-life situations
- **5-question quizzes** with an **AI Coach** that helps you understand *why* an answer is wrong instead of just revealing it
- **XP, badges and a Financial Readiness Score** that show how far you've come
- **Today's Challenge** — one real-life money decision every day

## What we're not

StockStreak is not a trading app, a bank, a wallet or an investment adviser. We don't sell financial products, recommend specific investments or take payments. Everything here is general education — see our [Disclaimer](/disclaimer).

## Where we are

This is our first version. We're starting with **Level 1 — Financial Foundations**: 12 lessons on budgeting, digital payments, scams, banking, credit, tax and investing. What comes next will be shaped by what students tell us — so please [get in touch](/contact).
`;

export default function AboutPage() {
  return <InfoPage title="About StockStreak">{CONTENT}</InfoPage>;
}
