import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, OPERATOR_LOCATION, OPERATOR, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Terms and Conditions | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
These terms are a contract between you and ${OPERATOR}, ${OPERATOR_LOCATION}, who runs Rupli. By creating an account, you agree to them. If you don't agree, please don't use Rupli.

## 1. What Rupli is

Rupli teaches general money concepts through lessons, quizzes, a money tracker, a simulator with pretend money, and an avatar that makes jokes. It is education and entertainment. It is **not** financial, investment, tax or legal advice. Please read the [Disclaimer](/disclaimer).

## 2. Who can use it

You must be 18 or older and able to enter a contract under Indian law. One account per person.

## 3. Your account

- Give accurate details and keep your password private.
- You are responsible for what happens on your account.
- Username accounts have no email on file, so a lost password may mean a lost account. We may not be able to verify that an account is yours.

## 4. Fair use

Please don't:

- Use bots or scripts, or cheat XP, badges or scores
- Try to break, overload or get around the site's security
- Copy or scrape our lessons at scale
- Misuse the AI Coach, or use it for anything unrelated to the lesson
- Pretend to be someone else
- Pick a username or display name that is abusive, misleading, or belongs to someone else

## 5. Roasts and jokes

The avatar teases you about your money and your knowledge. That is the point of the character. The jokes are automated, based on what you enter, and are not a judgement of you as a person. If they stop being fun, you can turn avatar pop-ups off in Settings.

## 6. XP, badges and streaks

XP, badges, ranks, streaks, unlocks and the Financial Readiness Score only track your learning on Rupli. They have **no money value** and can't be bought, sold, transferred or exchanged for cash. We may correct mistakes and change how they work.

## 7. Pretend money

The portfolio simulator uses virtual money and made-up market moves. You can't withdraw, invest or lose real money in it. Its results don't predict real returns.

## 8. It's free

Rupli is free and takes no payments. See the [Refund Policy](/refunds).

## 9. Our content

Lessons, quizzes, characters, the logo and the design belong to us. You can use them for your own personal learning. If you send feedback, we may use it to improve Rupli without paying you.

## 10. The AI Coach

The Coach generates hints automatically. They can be incomplete or wrong. If a hint doesn't match the lesson, trust the lesson and [tell us](/contact).

## 11. No guarantees

We provide Rupli "as is". We work hard on accuracy, but lessons can contain mistakes or go out of date, and the site may change, break or stop.

## 12. Liability

You are responsible for your own money decisions. To the extent the law allows, we are not liable for losses from decisions you make after using Rupli, or from the site being unavailable. Nothing here takes away rights you have under Indian consumer law that can't legally be waived.

## 13. Ending your account

You can delete your account at any time in Settings. We may suspend or close accounts that break these terms.

## 14. Law and disputes

These terms are governed by the laws of India. Please contact us first so we can try to fix the problem. Any dispute is subject to the courts of India that have jurisdiction.

## 15. Changes

If we change these terms, we will update this page and the date at the top. If the change matters, we will ask you to agree again.

## Contact

${OPERATOR}, ${OPERATOR_LOCATION}. Email: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})
`;

export default function TermsPage() {
  return (
    <InfoPage title="Terms and Conditions" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
