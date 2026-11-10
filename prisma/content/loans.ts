import { choices, type SeedLesson, type SeedPractice } from "./types";

// Money IQ, Level 3: loans and EMIs. The credit-card lesson covers cards,
// minimum dues and card interest; the saving lesson covers "no-cost" EMI
// fees; the CIBIL lesson covers scores. This one covers what neither does:
// how an EMI is built, flat vs reducing rates, the Key Fact Statement, loan
// apps and guaranteeing someone else's loan.

export const loansEmis: SeedLesson = {
  slug: "loans-emis",
  title: "Loans and EMIs",
  icon: "🏦",
  area: "CREDIT",
  description: "Why \"just ₹1,500 a month\" is the most expensive sentence in India.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 10,
  hook: `A loan app pings you: "Pre-approved! ₹50,000 instantly, just ₹1,500 a month!"

You feel chosen. You are not chosen. For how many months, and how much do you really pay back?`,
  learn: `## The three numbers in every loan

Every loan has a **principal** (what you borrow), an **interest rate** (the yearly price of borrowing) and a **tenure** (how long you take to repay). Change any one, and the total you pay changes.

## What's inside an EMI

That monthly number has a secret. It's mostly interest.

An **EMI** (equated monthly instalment) is a fixed monthly payment that covers **interest plus part of the principal**. On most loans, interest is charged on what you still owe, the **reducing balance**. So early EMIs are mostly interest, and later ones mostly principal.

## Flat rates look cheaper than they are

If it sounds cheap, someone's doing maths you aren't.

A **flat rate** charges interest on the full amount for the whole tenure, even as you repay it. A “10% flat” loan over two years costs about the same as roughly **18%** on a reducing balance. Always compare loans on the same basis.

## Read the Key Fact Statement

Yes, read it. All of it. I know. Terrible.

Banks and regulated lenders must give you a **Key Fact Statement (KFS)** before you sign: the **annual percentage rate (APR)**, the all-in yearly cost including fees, the EMI, the number of instalments and any charges. Compare APRs, not ads.

## Loan apps: check before you tap

If an app wants your contacts for a loan, it's not a bank. It's a problem.

A genuine digital lender names the **bank or NBFC** behind the loan, which you can check on the RBI's website. Red flags: no named lender, demands for access to your contacts or photos, and threats when you're late. Report harassment at 1930 or cybercrime.gov.in.

## Being a guarantor is borrowing too

"Just sign here, bro" has ruined friendships and credit scores.

If you **guarantee** a friend's loan and they stop paying, the lender can ask **you** to pay, and it can show on your credit report. Only guarantee what you could afford to repay yourself.`,
  keyTerms: [
    { term: "Principal", definition: "The amount you borrow, before interest." },
    { term: "EMI", definition: "A fixed monthly payment covering interest plus part of the principal." },
    { term: "Reducing balance", definition: "Interest charged only on what you still owe, so it shrinks as you repay." },
    { term: "Flat rate", definition: "Interest charged on the full original amount for the whole loan, costlier than it sounds." },
    { term: "Key Fact Statement (KFS)", definition: "A lender's summary of the loan's all-in yearly cost (APR), EMI and charges." },
  ],
  example: `**Rohit borrows ₹1,00,000 at 12% a year for 12 months**, on a reducing balance.

- His EMI is about **₹8,885**.
- In month 1, about **₹1,000** of it is interest. By month 12, interest is under **₹90**.
- Over the year he pays about **₹1,06,600**, roughly **₹6,600** in interest.

If the same loan were “12% flat”, he'd pay ₹12,000 in interest. **Why does the flat version cost almost twice as much?**`,
  scenario: {
    prompt:
      "You need ₹30,000 for a laptop for your course. An app offers it in 2 minutes for “just ₹50 a day”, no documents needed. Your bank offers a personal loan with a Key Fact Statement showing a 14% APR. What would you do?",
    options: choices(
      2,
      "Take the app loan, ₹50 a day sounds small",
      "Withdraw cash from a credit card instead",
      "Compare the real yearly cost first. ₹50 a day on ₹30,000 is about 60% a year, and consider saving up or a refurbished laptop",
      "Ask a friend to take the loan in their name",
    ),
    explanation:
      "₹50 a day is ₹18,250 a year on ₹30,000, about 60% a year, far more than a 14% APR. Comparing the yearly cost exposes it. And the cheapest loan is often the one you don't take: saving for a few months or buying refurbished costs nothing in interest.",
  },
  questions: [
    {
      prompt: "Your monthly EMI on a loan pays for…",
      explanation: "Each EMI covers that month's interest plus a part of the principal, so the amount you owe shrinks every month.",
      hint: "If an EMI paid only interest, would the loan ever end?",
      difficulty: "EASY",
      options: choices(
        2,
        "Only the interest",
        "Only the principal",
        "Interest plus part of the principal",
        "A fee to the bank, with the loan paid at the end",
      ),
    },
    {
      prompt: "Early in a reducing-balance loan, where does most of each EMI go?",
      explanation:
        "Interest is charged on what you still owe. At the start you owe the most, so most of the EMI is interest; later, more goes to principal.",
      hint: "When do you owe the most, at the start or the end?",
      difficulty: "EASY",
      options: choices(0, "Interest", "Principal", "Exactly half to each, every month", "Processing fees"),
    },
    {
      prompt: "Lender A offers “10% flat” for 2 years. Lender B offers 14% on a reducing balance. Which usually costs less?",
      explanation:
        "A 10% flat rate over 2 years works out to roughly 18% on a reducing balance, because interest is charged on the full amount the whole time. Lender B is cheaper.",
      hint: "A flat rate keeps charging interest on money you've already repaid.",
      difficulty: "MEDIUM",
      options: choices(1, "Lender A, 10% is lower than 14%", "Lender B, a 10% flat rate is roughly 18% on a reducing basis", "They cost exactly the same", "Flat rates are always free"),
    },
    {
      prompt: "An instant-loan app wants access to your contacts and photo gallery before approving ₹10,000. What's the safest view?",
      explanation:
        "Regulated lenders don't need your contacts or photos. Illegal loan apps use them to harass borrowers. Check that the app names an RBI-regulated bank or NBFC, and walk away if it doesn't.",
      hint: "Why would a lender need your friends' phone numbers?",
      difficulty: "MEDIUM",
      options: choices(
        3,
        "It's normal, all lenders ask for this",
        "Allow it, but only for a small loan",
        "Allow it if the interest rate is low",
        "A red flag. Genuine lenders don't need it; check the lender is RBI-regulated",
      ),
    },
    {
      prompt: "A friend asks you to be the guarantor on their ₹80,000 bike loan. What are you agreeing to?",
      explanation:
        "As guarantor, you're responsible if the borrower doesn't pay. The lender can ask you to repay, and missed payments can show on your credit report.",
      hint: "What does a lender want from a guarantor, if not a backup payer?",
      difficulty: "HARD",
      options: choices(
        0,
        "To repay the loan if your friend doesn't, and it can affect your credit",
        "Nothing. It's just a character reference",
        "To share the bike",
        "To pay only the first EMI",
      ),
    },
  ],
};

export const LOANS_PRACTICE: SeedPractice[] = [
  {
    prompt: "You pay a ₹2,000 EMI on a phone loan. What is that ₹2,000 made of?",
    options: choices(1, "Only interest", "Some interest and some principal", "Only principal", "GST"),
    explanation: "An EMI always mixes that month's interest with a part of the principal.",
  },
  {
    prompt: "Halfway through a 2-year reducing-balance loan, how does the interest part of your EMI compare with month one?",
    options: choices(2, "It's higher", "It's exactly the same", "It's lower, because you owe less now", "It's zero"),
    explanation: "Interest is charged on what's left, so as the balance falls, the interest part of each EMI falls too.",
  },
  {
    prompt: "A loan is quoted at “12% flat” for 3 years. Roughly what is that on a reducing-balance basis?",
    options: choices(3, "6%", "12%", "9%", "About 21%"),
    explanation: "Because a flat rate charges interest on the full amount for all 3 years, 12% flat is roughly 21% on a reducing balance.",
  },
  {
    prompt: "Before signing a personal loan, which document shows its all-in yearly cost (APR) and charges?",
    options: choices(0, "The Key Fact Statement", "Your Aadhaar card", "Your bank passbook", "The app's ads"),
    explanation: "The Key Fact Statement lists the APR, EMI, number of instalments and charges, so loans can be compared fairly.",
  },
  {
    prompt: "You guaranteed your cousin's loan. They've missed three EMIs. What can happen?",
    options: choices(1, "Nothing. You only signed as a reference", "The lender can ask you to pay, and it can affect your credit report", "The loan is cancelled", "The bank pays it off"),
    explanation: "A guarantor is liable if the borrower doesn't pay, and the default can affect the guarantor's credit too.",
  },
];
