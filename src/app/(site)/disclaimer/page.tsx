import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer — StockStreak" };

const CONTENT = `
**StockStreak is for education only.** It teaches general financial concepts. It is **not** a personalised investment-advisory service, and nothing on StockStreak is financial, investment, tax or legal advice.

## No personal advice

- StockStreak is not registered with SEBI as an investment adviser or research analyst.
- We don't recommend specific stocks, mutual funds, insurance policies, credit cards or any other financial product.
- We don't know your personal situation, so our lessons can't tell you what *you* should do with your money.

## Examples are illustrations

Numbers in lessons — returns, interest rates, salaries — are examples to show how the maths works. Any return figure is an assumption, not a promise. Real investments can go up or down, and you can lose money.

## Rules change

Tax rules, interest rates, deposit-insurance limits and other regulations change over time. Before you act, check the latest rules with official sources such as the Income Tax Department, the RBI or SEBI.

## The AI Coach can make mistakes

AI Coach hints are generated automatically to help you understand a quiz question. They may sometimes be incomplete or wrong.

## About the Financial Readiness Score

Your Financial Readiness Score reflects the lessons you've completed and your quiz results on StockStreak. It is **not** a credit score, it doesn't assess your actual finances, and it isn't a scientifically validated measure.

## Before a big decision

For decisions about investing, insurance, loans or tax, consider talking to a SEBI-registered investment adviser or a qualified chartered accountant.
`;

export default function DisclaimerPage() {
  return (
    <InfoPage title="Disclaimer" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
