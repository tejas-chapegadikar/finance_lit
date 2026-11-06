import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy — StockStreak" };

const CONTENT = `
This policy explains what personal data StockStreak ("we", "us") collects when you use stockstreak.in, why we collect it, and the choices you have. We process personal data in line with India's Digital Personal Data Protection Act, 2023.

## What we collect

- **Account details** — your username and the name you give us. Sign-in is handled by our authentication provider, Supabase: your password is stored only by Supabase, in scrambled (hashed) form — StockStreak never sees or stores it.
- **Profile details you give us** — your display name, your stage (year of study or graduate/working), your college (optional) and your learning goal (optional).
- **Learning activity** — the lessons you open, your answers to scenarios, quizzes, revision questions, the Daily Money Reality Check and the Daily Challenge, your scores, topic mastery, the days you learned (your streak), daily missions, XP, badges, Rewards Store unlocks, and any lesson feedback you send.
- **Your avatar** — the look you pick in the avatar studio.
- **Money Manager entries you choose to log** — amounts, categories, optional notes and dates for money you spent or received, your monthly budgets, savings goals and the money you record putting into them, and your daily money check-ins. You type these in yourself: StockStreak never connects to your bank, UPI or cards. Only you can see them.
- **Practice and personality** — your progress in practice challenges and your Money Personality Quiz result (you can retake it anytime).
- **The weekly league, if you join it** — when you switch it on, other students in the league can see your display name, avatar and that week's XP. It's off unless you turn it on, and you can leave anytime.
- **Questions you ask the AI Coach** — the follow-up questions you type during a quiz, and the Coach's replies.
- **Technical data** — your IP address and basic device and browser information, processed by our hosting and security providers to run and protect the service.

We **don't** collect bank account numbers, card details, UPI IDs or PINs, Aadhaar or PAN numbers, or any payment information. Never share these with us — not even in a Money Manager note.

## How we use it

- To run StockStreak: save your progress, award XP and badges, calculate your Financial Readiness Score and recommend what to learn next
- To show you your own money reports and insights in Money Manager — these are calculated for you alone and never shared
- To give AI Coach hints when you get a quiz question wrong, and to schedule revision of what you missed
- To improve our lessons, using overall statistics and the feedback you send
- To keep the service secure — for example, limiting how fast requests can be made
- To contact you about your account, if we ever need to

## The AI Coach

When you ask for a hint, we send the quiz question, its answer options, the lesson's explanation and the lesson text to our AI provider, Anthropic, to write the hint. We **don't** send your name, email or other personal details. Hints may be saved and shown to other students who make the same mistake.

When you ask the Coach a follow-up question, we also send the words you type (and your earlier follow-ups on that question) to Anthropic to write the reply, and we save the question and reply with your account. Please don't type personal or financial details into it.

## Who we share data with

We use trusted service providers to run StockStreak: **Supabase** (sign-in), **Neon** (database), **Vercel** (hosting), **Upstash** (rate limiting), **Anthropic** (AI hints). If you choose Google sign-in, Google shares your basic profile with us. These providers only process data to provide their service to us.

We **don't sell** your personal data or use it for advertising. We may disclose data if the law requires it.

## Where your data is stored

Our providers may store and process data outside India, including in the United States.

## How long we keep it

We keep your data while your account is active. If you delete your account, we delete your profile and learning data from our database; copies in backups may remain for a limited time. We may keep anonymous, overall statistics (for example, how many students completed a lesson).

## Your rights

You can:

- **See and correct** your profile at any time on your Profile page
- **Delete your account** from Profile → Account preferences & security, or by emailing us
- **Withdraw consent** by deleting your account
- **Ask questions or raise a grievance** by emailing [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})

## Cookies

We only use the cookies needed to keep you signed in, set by Supabase on our own domain. We don't use advertising cookies or third-party trackers.

## Age

StockStreak is meant for people aged 18 and above.

## Security

Data is encrypted in transit (HTTPS) and access to it is restricted. No system is perfectly secure, so please use a strong password and keep your sign-in details private.

## Changes to this policy

If we change this policy, we'll update this page and the date at the top.

## Contact

Questions about your privacy? Email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).
`;

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
