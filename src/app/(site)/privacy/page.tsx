import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, OPERATOR_LOCATION, OPERATOR, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
Rupli is run by ${OPERATOR}, ${OPERATOR_LOCATION} ("we", "us"). This page explains what we collect, why, who helps us, and what you can do about it. We have tried to follow India's Digital Personal Data Protection Act, 2023 and its Rules.

## The short version

- We only ask for what the app needs to work.
- We never ask for your bank details, card, UPI PIN, Aadhaar or PAN. Please don't type them anywhere on Rupli.
- We don't sell your data, show ads, or use tracking tools.
- You can delete your account and your data whenever you want.

## What we collect and why

- **Sign-in details.** With a username: your username and password. The password is stored only by our login provider, Supabase, in scrambled (hashed) form, and we can't read it. With Google: the name and email address Google shares. We use these to let you sign in.
- **Your name.** Whatever you tell us to call you. We use it to greet you.
- **Your year of study and college (optional).** Used only to suggest where to start. Skip them if you like.
- **What you want to learn (optional).** Used to suggest lessons.
- **Your progress.** Lessons, quiz and scenario answers, scores, revision, streak days, XP, badges and any lesson feedback you send. We use these to save your place and show your progress.
- **Your avatar.** The look you choose.
- **Your money entries (only if you add them).** Amounts, categories, notes, dates, budgets and savings goals. You type these in yourself. Rupli never connects to your bank, UPI or cards. We use them to show your own charts and comments, and no other user can see them.
- **Your virtual portfolio.** Pretend money only. Used to run the simulator.
- **Money Personality result (optional).** Used to show you your result.
- **Weekly league (only if you turn it on).** Other players in the league see your display name, avatar and that week's XP. It is off unless you switch it on.
- **What you ask the AI Coach.** Your follow-up questions and the replies.
- **Your agreement.** The date you agreed to these terms, and which version.
- **Technical data.** Your IP address and basic browser details, handled by our hosting and login providers to run and protect the service.

## The AI Coach

To write a hint, we send the quiz question, its options and the lesson text to our AI provider, Anthropic. If you ask a follow-up, we also send the words you type. We don't send your name or account details. Hints with no personal content may be saved and shown to other learners who make the same mistake. Please don't type personal or financial details into the Coach.

## The legal basis

We use your data because you agreed to it when you signed up. You can withdraw that agreement at any time by deleting your account. Withdrawing doesn't affect what we already did before you withdrew. We may also process or disclose data where the law requires it.

## Who helps us run Rupli

- **Supabase**: sign-in
- **Neon**: database
- **Vercel**: hosting
- **Anthropic**: AI Coach
- **Upstash**: limiting abuse, when it is switched on
- **Google**: only if you choose Google sign-in

They handle data only to provide their service to us. We don't sell your data or share it for advertising.

## Where your data goes

Some of these providers store or process data outside India, including in the United States.

## How long we keep it

We keep your data while your account exists. When you delete your account, we delete your profile, progress and money entries from our database. Copies in provider backups and logs can remain for a limited time before they expire. We may keep overall statistics that can't identify you.

## Your rights

You can:

- **See and correct** your details in Settings, or ask us for a summary of the data we hold about you
- **Delete your account and data** in Settings, or by emailing us
- **Withdraw consent** by deleting your account
- **Nominate someone** to exercise these rights for you if you die or become unable to
- **Raise a grievance** with us, using the contact below

We will answer as soon as we can, and within 90 days at the latest. If you are not happy with our answer, you can complain to the Data Protection Board of India.

## Grievance contact

${OPERATOR}, ${OPERATOR_LOCATION}. Email: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})

## If something goes wrong

If a data breach affects you, we will tell you and the authorities as the law requires. Username accounts have no email address on file, so for those we will post the notice inside the app.

## Age

Rupli is only for people aged 18 or older. If you are under 18, please don't sign up. If we learn that an account belongs to someone under 18, we will delete it.

## Cookies

We only use what the site needs to work. See the [Cookie Policy](/cookies).

## Security

Data is encrypted in transit and access to it is restricted. No system is perfectly safe, so use a strong password and don't reuse it.

## Changes

If we change this policy, we will update this page and the date at the top. If the change matters, we will ask you to agree again.
`;

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
