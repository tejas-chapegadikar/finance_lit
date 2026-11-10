import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { OPERATOR_LOCATION, OPERATOR } from "@/lib/site";

export const metadata: Metadata = { title: "About Rupli | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
You can order biryani in 30 seconds, but you can't explain what a credit score is. Rupli exists because of that.

It's a free money app for Indian college students and people starting their first job. Nobody taught you this stuff, so now a small pink blob will. It will also make fun of you. You'll live.

## What's inside

- **Money Management**: log what you earn and spend, set budgets, see charts, and get roasted based on your real numbers
- **Money IQ**: short lessons in simple words on budgeting, UPI scams, credit scores, payslips and tax, with quizzes and revision
- **InvestSmart**: learn how investing works, then practise with ₹1,00,000 of pretend money, so your mistakes cost nothing
- **Your avatar**: it talks, reacts, and has opinions about your food delivery habit

## What Rupli is not

Not a trading app, a bank, a wallet or an investment adviser. We don't sell financial products, recommend investments or take payments. It's general education, and the jokes are just jokes. See the [Disclaimer](/disclaimer).

## Who's behind it

Rupli is built by ${OPERATOR} in ${OPERATOR_LOCATION}. It's early, so things will break. Tell us when they do: [get in touch](/contact).
`;

export default function AboutPage() {
  return (
    <InfoPage title="About Rupli">
      {CONTENT}
    </InfoPage>
  );
}
