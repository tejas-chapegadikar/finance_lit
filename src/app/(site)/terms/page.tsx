import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Use | StockStreak" };

const CONTENT = `
These terms apply when you use StockStreak at stockstreak.in. By creating an account or using the site, you agree to them.

## 1. What StockStreak is

StockStreak is a financial-education platform. It teaches general money concepts through lessons, scenarios, quizzes and an AI Coach. It is **not** financial, investment, tax or legal advice. Please read our [Disclaimer](/disclaimer).

## 2. Your account

- You must be 18 or older to create an account.
- Give accurate details, keep your sign-in secure, and don't share your account. One account per person.
- You're responsible for what happens on your account.

## 3. Fair use

Please don't:

- Use scripts, bots or other tricks to earn XP, badges or scores
- Try to break, overload or get around the security of the site
- Copy or scrape our lessons and quizzes at scale
- Misuse the AI Coach, for example by trying to make it produce content unrelated to the lesson
- Pretend to be someone else

## 4. XP, badges, streaks and scores

XP, badges, ranks, streaks and the Financial Readiness Score track your learning. You can spend XP in the Rewards Store on digital unlocks such as avatar items, profile titles, themes and bonus scenarios; some avatar items unlock only through badges or streaks. XP, unlocks and streak freezes have **no monetary value**, can't be bought or exchanged for cash, and spent XP can't be refunded. Unlocks are cosmetic or extra practice. They give no advantage. Spending XP never lowers your lifetime XP, badges or readiness score. We may correct XP, streaks or unlocks given by mistake, and we may change the store and how XP works.

## 5. Our content

Lessons, quizzes, challenges and the design of StockStreak belong to us. You may use them for your own personal learning. If you send us feedback, we may use it to improve StockStreak.

## 6. The AI Coach

The AI Coach generates hints automatically. They can be incomplete or wrong, and they are not advice. If a hint doesn't match the lesson, trust the lesson and [tell us](/contact).

## 7. Availability

We're improving StockStreak all the time. We provide it "as is", may change or remove features, and can't promise it will always be available or error-free.

## 8. Liability

You're responsible for your own financial decisions. To the extent the law allows, StockStreak isn't liable for any loss arising from decisions you make based on what you learned here, or from the site being unavailable.

## 9. Ending your account

You can delete your account at any time from your Profile page. We may suspend or close accounts that break these terms.

## 10. Governing law

These terms are governed by the laws of India.

## 11. Changes

If we change these terms, we'll update this page and the date at the top. Continuing to use StockStreak means you accept the updated terms.

## Contact

Questions? Email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).
`;

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Use" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
