import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
**Rupli is for education and entertainment.** It teaches general money concepts. Nothing on Rupli is financial, investment, tax or legal advice.

## No personal advice

- Rupli is not registered with SEBI as an investment adviser or research analyst.
- We don't recommend specific stocks, mutual funds, insurance, credit cards or any other financial product.
- We don't know your situation, so we can't tell you what *you* should do with your money.

## Examples are examples

Numbers in lessons (returns, interest rates, salaries) only show how the maths works. Any return is an assumption, not a promise. Real investments go up and down, and you can lose money.

## The simulator is pretend

The virtual portfolio uses fake money and made-up market moves based on assumed long-term rates. It uses no real market data, and doing well in it means nothing about real investing.

## The roasts are jokes

The avatar's comments are automated jokes based on what you enter. They are not advice and not a judgement of you. Money stress is real: if you are struggling with debt or feel overwhelmed, please talk to someone you trust or a qualified professional.

## Rules change

Tax rules, interest rates and other regulations change. Before you act, check official sources such as the Income Tax Department, the RBI or SEBI.

## The AI Coach can be wrong

Coach hints are generated automatically and may be incomplete or wrong.

## The Financial Readiness Score

It only reflects your lessons and quiz results on Rupli. It is **not** a credit score and says nothing about your real finances.

## Before a big decision

For investing, insurance, loans or tax decisions, talk to a SEBI-registered investment adviser or a chartered accountant.
`;

export default function DisclaimerPage() {
  return (
    <InfoPage title="Disclaimer" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
