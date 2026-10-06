import "dotenv/config";
import { PrismaClient, type ReadinessArea } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Swap this for the real InVideo AI export URL (or a YouTube/Vimeo link)
// once it exists — see LessonVideo.tsx for how both are supported.
const PLACEHOLDER_VIDEO = "https://placeholder.stockstreak.in/videos/replace-me.mp4";

type SeedOption = { text: string; isCorrect: boolean };
type SeedQuestion = { prompt: string; explanation: string; options: SeedOption[] };
type SeedLesson = {
  slug: string;
  title: string;
  topic: string;
  area: ReadinessArea;
  description: string;
  contentMarkdown: string;
  videoUrl: string;
  estimatedMinutes: number;
  xpReward: number;
  isPublished: boolean;
  order: number;
  questions: SeedQuestion[];
};

const budgetingBasics: SeedLesson = {
  slug: "budgeting-basics",
  title: "Budgeting Basics",
  topic: "Budgeting",
  area: "BUDGETING",
  description:
    "Learn the 50/30/20 rule and how to make your monthly allowance actually last the month.",
  contentMarkdown: `## Why budget at all?

A budget isn't about restricting yourself — it's about deciding *in advance* where your money goes, instead of wondering where it went.

## The 50/30/20 rule

A simple way to split any income (allowance, stipend, part-time earnings):

- **50% — Needs**: hostel/mess fees, transport, required textbooks, phone recharge
- **30% — Wants**: eating out, OTT subscriptions, shopping, entertainment
- **20% — Savings/goals**: an emergency fund, a big purchase you're saving for, or just building the habit

## Worked example

Priya gets **₹8,000/month** from home. Using 50/30/20:

- Needs: ₹4,000
- Wants: ₹2,400
- Savings: ₹1,600

## Pay yourself first

Most people spend first and save whatever's left — which is usually nothing. Flip it: the moment money arrives, move your savings share out immediately. What's left is what you have to spend. This one habit is the difference between people who save consistently and people who never quite manage to.

## The real budget killer: small recurring spends

A single ₹500 purchase feels significant enough to think about. Five ₹100 UPI payments for chai, a quick-commerce snack order, or a subscription you forgot about don't — but they add up to the same ₹500, invisibly. Small recurring spends are the #1 reason budgets quietly fail.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 5,
  xpReward: 75,
  isPublished: true,
  order: 0,
  questions: [
    {
      prompt: 'What does the 50/30/20 rule allocate to "needs"?',
      explanation:
        "Needs like mess fees and transport should take up about half your income, leaving room for wants and savings.",
      options: [
        { text: "50%", isCorrect: true },
        { text: "30%", isCorrect: false },
        { text: "20%", isCorrect: false },
        { text: "70%", isCorrect: false },
      ],
    },
    {
      prompt: "Priya gets ₹8,000/month. Following 50/30/20, how much should go to savings/goals?",
      explanation: "20% of ₹8,000 is ₹1,600 — the savings/goals share.",
      options: [
        { text: "₹800", isCorrect: false },
        { text: "₹1,600", isCorrect: true },
        { text: "₹2,400", isCorrect: false },
        { text: "₹4,000", isCorrect: false },
      ],
    },
    {
      prompt: 'What is "pay yourself first"?',
      explanation:
        "It means setting aside savings the moment you receive money, before spending on anything else — it guarantees consistent saving instead of hoping something's left over.",
      options: [
        { text: "Spend on wants first, save what's left", isCorrect: false },
        { text: "Set aside savings the moment you receive money, before spending", isCorrect: true },
        { text: "Only pay bills first", isCorrect: false },
        { text: "Borrow from friends first", isCorrect: false },
      ],
    },
    {
      prompt: 'Which of these is a "want", not a "need", in a student budget?',
      explanation:
        "Mess fees, required textbooks, and a bus pass for class are needs. A monthly OTT subscription is a want — nice to have, not essential.",
      options: [
        { text: "Hostel mess fee", isCorrect: false },
        { text: "Required textbooks", isCorrect: false },
        { text: "Monthly OTT subscription", isCorrect: true },
        { text: "Bus pass for classes", isCorrect: false },
      ],
    },
    {
      prompt: "What's the biggest budget risk of frequent small UPI payments?",
      explanation:
        "They add up quietly and are easy to lose track of — a handful of small payments can silently equal one big expense you'd have thought twice about.",
      options: [
        { text: "They cost more per transaction", isCorrect: false },
        { text: "Banks block them", isCorrect: false },
        { text: "They add up quietly and are easy to lose track of", isCorrect: true },
        { text: "They have no risk", isCorrect: false },
      ],
    },
  ],
};

const compoundInterest: SeedLesson = {
  slug: "compound-interest",
  title: "Compound Interest",
  topic: "Investing",
  area: "BUDGETING",
  description:
    "The math behind why starting to invest early beats almost everything else you can do with money.",
  contentMarkdown: `## Simple vs. compound interest

**Simple interest** is calculated only on your original amount (the principal) every year.

**Compound interest** is calculated on your principal *plus* all the interest you've already earned. Your money starts earning money on its own money.

## The formula

\`A = P(1 + r/n)^(nt)\`

- **P** = principal (what you start with)
- **r** = annual interest rate (as a decimal)
- **n** = how many times per year interest compounds
- **t** = number of years
- **A** = final amount

## The Rule of 72

A quick mental shortcut: divide 72 by your interest rate to estimate how many years it takes your money to double.

At 8% interest: 72 ÷ 8 = **9 years** to double.

## Why starting at 20 beats starting at 30

Ravi invests ₹2,000/month starting at age 20. Meena invests the exact same ₹2,000/month starting at age 30. Both stop at 60.

Ravi's money compounds for **10 extra years** — and because compounding accelerates over time, those early years are worth far more than 10 extra years added at the *end*. Ravi ends up with significantly more, despite contributing the same amount per month.

This is why "time in the market" matters more than trying to time when you start. The best time to start was years ago; the second-best time is now — even with a small amount, even through a student SIP or a PPF account.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 5,
  xpReward: 75,
  isPublished: true,
  order: 1,
  questions: [
    {
      prompt: "What is compound interest?",
      explanation:
        "Compound interest is interest calculated on your principal plus all previously earned interest — your money earns money on its own earnings.",
      options: [
        { text: "Interest only on the original principal each year", isCorrect: false },
        { text: "Interest on principal plus previously earned interest", isCorrect: true },
        { text: "A one-time bank fee", isCorrect: false },
        { text: "Same as simple interest", isCorrect: false },
      ],
    },
    {
      prompt: "Invest ₹10,000 at 8% annual compound interest for 1 year. Approximately how much do you have?",
      explanation: "₹10,000 × 1.08 = ₹10,800 after one year.",
      options: [
        { text: "₹10,080", isCorrect: false },
        { text: "₹10,800", isCorrect: true },
        { text: "₹18,000", isCorrect: false },
        { text: "₹8,000", isCorrect: false },
      ],
    },
    {
      prompt: "Using the Rule of 72, roughly how many years to double your money at 8% interest?",
      explanation: "72 ÷ 8 = 9 years.",
      options: [
        { text: "6", isCorrect: false },
        { text: "8", isCorrect: false },
        { text: "9", isCorrect: true },
        { text: "12", isCorrect: false },
      ],
    },
    {
      prompt:
        "Ravi starts investing ₹2,000/month at 20; Meena starts the same amount at 30. Both stop at 60. Who ends up with more, and why?",
      explanation:
        "Ravi, because his money compounds for 10 more years — and those extra early years matter more than extra years added at the end.",
      options: [
        { text: "Meena, because she started when she was more financially mature", isCorrect: false },
        { text: "They end up with equal amounts", isCorrect: false },
        { text: "Ravi, because his money compounds for 10 more years", isCorrect: true },
        { text: "It doesn't matter when you start", isCorrect: false },
      ],
    },
    {
      prompt: "Which of these grows money fastest over a long time horizon, all else equal?",
      explanation:
        "Compound interest, reinvested, grows fastest — cash sitting idle or spent immediately earns nothing, and simple interest grows more slowly since it ignores previously earned interest.",
      options: [
        { text: "Cash kept at home", isCorrect: false },
        { text: "A simple-interest savings account", isCorrect: false },
        { text: "Compound interest, reinvested", isCorrect: true },
        { text: "Spending it immediately", isCorrect: false },
      ],
    },
  ],
};

const savingVsSpending: SeedLesson = {
  slug: "saving-vs-spending-psychology",
  title: "Saving vs. Spending Psychology",
  topic: "Saving",
  area: "BUDGETING",
  description:
    "Why small daily spends do more damage than one big purchase, and how to make saving automatic instead of willpower-dependent.",
  contentMarkdown: `## The ₹40 chai problem

A cup of chai from the campus stall costs about ₹40. That feels like nothing — you don't even think about it. But ₹40 a day, every day, for a year is ₹14,600. That's more than most students' entire laptop-accessory budget, spent one invisible ₹40 at a time.

This is the core problem with student spending: **big purchases get scrutiny, small ones don't.** You'd think twice about a ₹15,000 purchase. You won't think twice about ₹40, five times a day.

## Lifestyle inflation

When your allowance or income goes up, it's tempting to instantly spend the raise — a costlier phone plan, more food delivery, upgraded subscriptions. This is called lifestyle inflation, and it's why people who start earning more often don't end up saving more. The fix: whenever your income rises, increase your savings rate before you increase your spending.

## Mental accounting: not all money feels equal

People treat money differently depending on where it came from — a ₹2,000 birthday gift feels "free" to blow, while ₹2,000 earned from a part-time job feels earned and gets saved. Financially this makes no sense: ₹2,000 is ₹2,000, no matter the source. Treating "bonus" money with the same discipline as earned money is a habit that compounds.

## Automate it — don't rely on willpower

Willpower runs out by the end of a stressful week. Automatic systems don't. Setting up an auto-transfer of a fixed amount to a separate savings account the day your money arrives removes the decision entirely — you're not choosing to save each month, you already did.

## The 24-hour rule

For any non-essential purchase over a set threshold (say ₹1,000), wait 24 hours before buying. Most impulse purchases lose their appeal once the urgency of the moment passes. If you still want it a day later, buy it — you've filtered out impulse spending.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 5,
  xpReward: 75,
  isPublished: true,
  order: 2,
  questions: [
    {
      prompt: "A cup of chai costs ₹40. Spent once a day, every day, for a year, this comes closest to:",
      explanation: "₹40 × 365 ≈ ₹14,600 — small recurring spends add up far more than they feel like they should.",
      options: [
        { text: "₹4,600", isCorrect: false },
        { text: "₹14,600", isCorrect: true },
        { text: "₹40,000", isCorrect: false },
        { text: "₹1,460", isCorrect: false },
      ],
    },
    {
      prompt: "What is lifestyle inflation?",
      explanation:
        "Lifestyle inflation is spending increasing automatically whenever income increases, so savings never grow even as income does.",
      options: [
        { text: "Prices rising due to general inflation", isCorrect: false },
        { text: "Spending rising automatically whenever income rises, leaving savings unchanged", isCorrect: true },
        { text: "Saving more as income rises", isCorrect: false },
        { text: "The cost of living decreasing over time", isCorrect: false },
      ],
    },
    {
      prompt: "What is 'mental accounting'?",
      explanation:
        "Mental accounting is treating money differently based on its source (gift vs. earned), even though money is fungible and should be treated the same regardless of origin.",
      options: [
        { text: "A type of bank statement", isCorrect: false },
        { text: "Treating money differently depending on where it came from", isCorrect: true },
        { text: "Calculating mental math for taxes", isCorrect: false },
        { text: "A feature in budgeting apps", isCorrect: false },
      ],
    },
    {
      prompt: "Why is automating savings more reliable than just 'trying to save more'?",
      explanation:
        "Automation removes the need for willpower or a decision each time money arrives — the saving already happened before you can talk yourself out of it.",
      options: [
        { text: "It earns a higher interest rate", isCorrect: false },
        { text: "It removes the need for willpower or a decision each time money arrives", isCorrect: true },
        { text: "It is required by all banks", isCorrect: false },
        { text: "It avoids taxes on savings", isCorrect: false },
      ],
    },
    {
      prompt: "What is the '24-hour rule' for spending?",
      explanation:
        "Waiting 24 hours before a non-essential purchase filters out impulse buys — most lose their appeal once the moment's urgency passes.",
      options: [
        { text: "Pay off your credit card within 24 hours of any purchase", isCorrect: false },
        { text: "Wait 24 hours before making a non-essential purchase", isCorrect: true },
        { text: "Banks process all refunds within 24 hours", isCorrect: false },
        { text: "Save exactly 24% of your income", isCorrect: false },
      ],
    },
  ],
};

const upiSafety: SeedLesson = {
  slug: "upi-payment-safety",
  title: "UPI & Digital Payments Safety",
  topic: "Digital Payments",
  area: "DIGITAL_SAFETY",
  description: "How UPI actually moves money, and the exact scam patterns targeting students right now.",
  contentMarkdown: `## How UPI actually works

UPI (Unified Payments Interface) links your bank account to a simple ID (like name@bank) or QR code, letting money move instantly between banks, 24/7, without needing card numbers or IFSC codes for every transaction. It's free, fast, and hugely convenient — which is exactly why scammers built entire playbooks around it.

## The one rule that stops almost every UPI scam

**Scanning a QR code or entering your UPI PIN only ever sends money out — never receives it.** You never need to enter a PIN, scan a QR, or accept a "collect request" to *receive* money. If anyone asks you to do any of these to "receive" a refund, cashback, or payment, it is a scam, every single time.

## Common scam patterns

- **Fake collect requests**: A scammer sends a "collect request" disguised as a refund, hoping you tap "Pay" without reading. Reading the request always shows it's asking to send money, not receive it.
- **QR code swaps**: A QR code is presented as "scan to receive ₹500 cashback." Scanning it and entering your PIN sends money, it doesn't receive any.
- **Fake customer care numbers**: Scammers pose as bank/UPI app support (often via fake numbers found on search engines or social media) and talk victims into installing screen-sharing apps or sharing OTPs.
- **"Wrong transfer, please refund" scam**: A scammer sends a small real amount, then claims it was a mistake and pressures you to "refund" a larger amount via a collect request or QR — the original transfer is often later reversed or was from a stolen account.

## The two things you must never share

Your **UPI PIN** and any **OTP** are the only two things that can authorize a transaction. No bank, no UPI app, and no "customer care" agent will ever ask for either over a call, message, or screen-share. If someone asks, it's not your bank.

## What to do if you're scammed

Report immediately: call the national cyber helpline **1930**, file a complaint at cybercrime.gov.in, and report the transaction inside your UPI app to freeze it fast — banks can sometimes reverse a fraudulent transfer if it's caught within minutes to hours.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 3,
  questions: [
    {
      prompt: "Which action can actually send money OUT of your account via UPI?",
      explanation: "Entering your UPI PIN to accept a collect request authorizes an outgoing payment — it never brings money in.",
      options: [
        { text: "Entering your UPI PIN to accept a 'collect request'", isCorrect: true },
        { text: "Receiving a payment notification", isCorrect: false },
        { text: "Someone sending you money", isCorrect: false },
        { text: "Checking your account balance", isCorrect: false },
      ],
    },
    {
      prompt: "Someone messages you a QR code saying 'scan to receive ₹1,000 cashback.' What should you do?",
      explanation: "Scanning a QR and entering your PIN only ever sends money out, so this is a scam — ignore and report it.",
      options: [
        { text: "Scan it immediately to get the cashback", isCorrect: false },
        { text: "Scan it, then enter your PIN to confirm", isCorrect: false },
        { text: "Ignore or report it — scanning a QR and entering a PIN only ever sends money", isCorrect: true },
        { text: "Forward the code to friends so they can also get cashback", isCorrect: false },
      ],
    },
    {
      prompt: "What two things should you never share with anyone, even someone claiming to be bank support?",
      explanation: "Your UPI PIN and any OTP are the only things that can authorize a transaction — legitimate support never needs them.",
      options: [
        { text: "Your UPI PIN and OTP", isCorrect: true },
        { text: "Your UPI ID and phone number", isCorrect: false },
        { text: "Your bank name and city", isCorrect: false },
        { text: "Your registered email address", isCorrect: false },
      ],
    },
    {
      prompt: "In the 'wrong transfer, please refund' scam, what actually happens?",
      explanation: "The scammer sends a small real amount then pressures the victim into sending back a larger amount, often from a stolen account or via reversal.",
      options: [
        { text: "A bank mistakenly transfers extra salary", isCorrect: false },
        { text: "A scammer sends a small real amount, then pressures you to send back more", isCorrect: true },
        { text: "You get double the amount for free, no catch", isCorrect: false },
        { text: "It isn't a real scam pattern", isCorrect: false },
      ],
    },
    {
      prompt: "If you've been scammed via UPI, what should you do first?",
      explanation: "Fast reporting via the 1930 cyber helpline, cybercrime.gov.in, and your UPI app gives the best chance of the transfer being reversed.",
      options: [
        { text: "Wait a week to see if it resolves itself", isCorrect: false },
        { text: "Delete the UPI app", isCorrect: false },
        { text: "Report immediately via the 1930 cyber helpline / cybercrime.gov.in and your UPI app", isCorrect: true },
        { text: "Post the scammer's number on social media only", isCorrect: false },
      ],
    },
  ],
};

const bankAccountsSavingsInstruments: SeedLesson = {
  slug: "bank-accounts-savings-instruments",
  title: "Bank Accounts & Savings Instruments",
  topic: "Banking",
  area: "BANKING",
  description: "Savings vs. current accounts, FDs vs. RDs, and the minimum-balance traps that quietly cost students money.",
  contentMarkdown: `## Savings account vs. current account

A **savings account** is for individuals — it pays a small interest rate (typically 2.5-4% annually) and is meant for keeping money, not high transaction volume. A **current account** is for businesses — no interest, but unlimited transactions. As a student, you almost always want a savings account, ideally a **zero-balance / student account**, which many banks offer with no minimum balance requirement.

## The minimum balance trap

Many regular savings accounts require you to maintain a minimum balance (often ₹2,000-10,000 depending on the bank and branch type) or get charged a penalty — sometimes ₹200-600 per quarter just for falling short. Students often don't realize their account isn't a "zero balance" student account until they're hit with these fees. Always confirm your account type when opening one.

## Fixed Deposit (FD)

You lock a lump sum for a fixed term (say, 1 year) at a fixed interest rate, usually higher than a savings account (roughly 6-7.5% depending on tenure and bank). You get it all back with interest at maturity. Breaking it early usually means a penalty (a slightly reduced interest rate), but your principal is safe — FDs are for money you won't need for the term.

## Recurring Deposit (RD)

Instead of one lump sum, you deposit a fixed amount every month for a fixed term, earning FD-like interest on the whole thing at maturity. RDs are built for people without a lump sum but with a steady, small income — a natural fit for pocket money or a part-time stipend.

## Where these fit for a student

- Emergency fund / everyday spending money → zero-balance savings account
- Saving up monthly for a specific goal (a laptop, a trip) → RD
- A lump sum you already have and won't touch for a year or more (a scholarship payout, gift money) → FD

## The one thing FDs/RDs are not good for

Long-term wealth building. Their returns (roughly 6-7.5%) barely beat inflation (roughly 5-6% in India). They're for safety and short-term goals, not growth — that's what investing, covered in a later lesson, is for.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 5,
  xpReward: 75,
  isPublished: true,
  order: 4,
  questions: [
    {
      prompt: "What's the main difference between a savings account and a current account?",
      explanation: "Savings accounts are for individuals and pay interest; current accounts are for businesses, allow unlimited transactions, and pay no interest.",
      options: [
        { text: "Savings accounts are for individuals and pay interest; current accounts are for businesses with no interest", isCorrect: true },
        { text: "Savings accounts are for businesses only", isCorrect: false },
        { text: "Current accounts pay higher interest than savings accounts", isCorrect: false },
        { text: "There is no real difference between them", isCorrect: false },
      ],
    },
    {
      prompt: "What is a 'minimum balance penalty'?",
      explanation: "It's a fee banks charge when your account balance falls below the required minimum for that account type.",
      options: [
        { text: "A fee for opening an account", isCorrect: false },
        { text: "A fee charged when your balance falls below the bank's required minimum", isCorrect: true },
        { text: "Interest earned for maintaining a high balance", isCorrect: false },
        { text: "A tax the government charges on savings accounts", isCorrect: false },
      ],
    },
    {
      prompt: "In a Fixed Deposit, what happens if you withdraw before the term ends?",
      explanation: "Early withdrawal usually returns your principal but at a reduced, penalized interest rate rather than the full rate promised.",
      options: [
        { text: "You usually get your principal back but at a reduced interest rate", isCorrect: true },
        { text: "You lose your principal entirely", isCorrect: false },
        { text: "Nothing changes, there is no penalty at all", isCorrect: false },
        { text: "The bank keeps the money permanently", isCorrect: false },
      ],
    },
    {
      prompt: "A Recurring Deposit (RD) is best suited for someone who:",
      explanation: "RDs are built for a steady small income saved monthly toward a goal, rather than one lump sum invested at once.",
      options: [
        { text: "Has a steady small income and wants to save a fixed amount every month toward a goal", isCorrect: true },
        { text: "Has one large lump sum to invest for decades", isCorrect: false },
        { text: "Wants instant daily access to cash", isCorrect: false },
        { text: "Wants the highest possible long-term returns", isCorrect: false },
      ],
    },
    {
      prompt: "Why are FDs/RDs not ideal for long-term wealth building?",
      explanation: "Their returns barely outpace inflation, so the real purchasing power of the money grows very little over long periods.",
      options: [
        { text: "Their returns barely beat inflation, so real purchasing power grows very little", isCorrect: true },
        { text: "They are illegal for long-term use", isCorrect: false },
        { text: "Banks cap FD duration at 3 months", isCorrect: false },
        { text: "They pay no interest at all", isCorrect: false },
      ],
    },
  ],
};

const creditScoreCibil: SeedLesson = {
  slug: "credit-score-cibil",
  title: "Understanding Credit Score (CIBIL)",
  topic: "Credit",
  area: "CREDIT",
  description: "What a CIBIL score actually measures, why it matters before you even have a credit card, and how one mistake follows you for years.",
  contentMarkdown: `## What is a CIBIL score?

A number from 300-900 that summarizes how reliably you repay borrowed money, maintained by credit bureaus like CIBIL (TransUnion CIBIL is the most common in India). Banks and lenders check it before approving loans, credit cards, and sometimes even rental agreements or job offers. Above 750 is generally considered good.

## You can have a score before you ever own a credit card

Student loans, an education loan co-signed by a parent, or being an add-on/co-applicant on a family credit card can start building your credit history early — for better or worse. If a parent's loan you're linked to has a missed payment, it can affect you too.

## What actually moves your score

- **Payment history (roughly 35% weight)**: Have you paid EMIs/credit card bills on time? This matters most.
- **Credit utilization (roughly 30%)**: How much of your available credit you're using. Regularly using 90% of your limit looks riskier than using 20%, even if you pay it off every month.
- **Length of credit history**: Older, well-managed accounts help — don't close your oldest credit card just because you got a new one.
- **Credit mix and new inquiries**: Applying for many loans/cards in a short time (each triggers a "hard inquiry") can temporarily lower your score.

## Why it matters even if you don't need a loan right now

A poor score doesn't just block loans — it can mean higher interest rates when you eventually do need one (a home loan, a car loan, a business loan), or even rejection during rental/job background checks in some cases. Building a clean history in college means better terms later, for free.

## One missed payment's real cost

A single missed credit card or loan payment can stay on your credit report for years and drop your score significantly. Unlike a late fee (a one-time cost), a lowered credit score is a cost that follows you into every future loan application until your history recovers.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 5,
  questions: [
    {
      prompt: "What range does a CIBIL score typically fall in?",
      explanation: "CIBIL scores range from 300 to 900, with 750+ generally considered good.",
      options: [
        { text: "300-900", isCorrect: true },
        { text: "0-100", isCorrect: false },
        { text: "1-10", isCorrect: false },
        { text: "1-1000", isCorrect: false },
      ],
    },
    {
      prompt: "What single factor carries the biggest weight in your credit score?",
      explanation: "Payment history — whether you pay EMIs and bills on time — is roughly 35% of the score, the largest single factor.",
      options: [
        { text: "Your age", isCorrect: false },
        { text: "Payment history — paying EMIs/bills on time", isCorrect: true },
        { text: "Which college you attend", isCorrect: false },
        { text: "Your monthly income directly", isCorrect: false },
      ],
    },
    {
      prompt: "What is 'credit utilization'?",
      explanation: "Credit utilization is how much of your available credit limit you're actually using at a given time.",
      options: [
        { text: "How many bank accounts you have", isCorrect: false },
        { text: "How much of your available credit limit you're using", isCorrect: true },
        { text: "Your total annual salary", isCorrect: false },
        { text: "How often you check your own score", isCorrect: false },
      ],
    },
    {
      prompt: "Can you have a credit history before ever owning your own credit card?",
      explanation: "Yes — being linked to a parent's loan or an add-on card can build, or damage, your credit history before you have your own card.",
      options: [
        { text: "No, credit history only starts once you personally own a card", isCorrect: false },
        { text: "Yes — being linked to a parent's loan or an add-on card can build or hurt your history", isCorrect: true },
        { text: "Only after age 25", isCorrect: false },
        { text: "Only after your first full-time job", isCorrect: false },
      ],
    },
    {
      prompt: "What's the real long-term cost of a single missed payment?",
      explanation: "A missed payment can lower your score for years, affecting the terms of every future loan application, not just a one-time fee.",
      options: [
        { text: "Just a one-time late fee, with no other effect", isCorrect: false },
        { text: "It can lower your score for years, leading to worse terms on future loans", isCorrect: true },
        { text: "Your bank account is frozen permanently", isCorrect: false },
        { text: "Nothing, as long as you pay eventually", isCorrect: false },
      ],
    },
  ],
};

const creditCards101: SeedLesson = {
  slug: "credit-cards-101",
  title: "Credit Cards 101",
  topic: "Credit",
  area: "CREDIT",
  description: "Grace periods, the minimum-due trap, and how credit card interest compounds against you if you're not careful.",
  contentMarkdown: `## How a credit card actually works

A credit card lets you borrow money from the bank up to a limit, to be repaid later. Every purchase adds to your "statement balance," which you must pay by the due date each billing cycle.

## The interest-free grace period

If you pay your **full statement balance** by the due date, you pay zero interest — this is the grace period, usually 20-50 days depending on when in the cycle you purchased. This is the entire point of using a credit card well: free short-term credit, if used correctly.

## The minimum-due trap

Card statements always show a tempting "Minimum Amount Due" — often just 5% of your balance. Paying only this amount means the rest starts accruing interest immediately, at rates that are brutal: typically 3-4% per month, or 36-48% annualized. Worse, once you carry any balance, the grace period disappears entirely — even new purchases start accruing interest immediately, from day one.

## Worked example

Ankit has a ₹20,000 statement balance and pays only the ₹1,000 minimum due. The remaining ₹19,000 starts accruing interest at roughly 42% annually. If he keeps this pattern, that ₹19,000 grows faster than almost any investment could offset — this is compound interest working against him instead of for him.

## Using a credit card well as a student

- Never spend more than you could pay off in cash if needed
- Always pay the **full** statement balance every cycle, not the minimum
- Set up auto-pay for the full amount to remove the risk of forgetting
- A card used this way, and paid off in full, actually helps your credit score through payment history and available credit

## The one exception: cash withdrawals

Withdrawing cash on a credit card has no grace period at all — interest starts from the moment of withdrawal, plus a separate cash advance fee. Avoid it entirely; it's one of the most expensive ways to get cash in the country.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 6,
  questions: [
    {
      prompt: "What happens if you pay your full statement balance by the due date?",
      explanation: "Paying the full balance by the due date means zero interest is charged — that's the grace period.",
      options: [
        { text: "You pay zero interest — that's the grace period", isCorrect: true },
        { text: "You still pay a small interest fee", isCorrect: false },
        { text: "Your credit limit is automatically reduced", isCorrect: false },
        { text: "The bank charges a bonus fee", isCorrect: false },
      ],
    },
    {
      prompt: "Why is paying only the 'Minimum Amount Due' risky?",
      explanation: "The unpaid remainder accrues high interest (roughly 36-48% annualized) and even new purchases lose their grace period once a balance is carried.",
      options: [
        { text: "The remaining balance accrues high interest and the grace period disappears for new purchases too", isCorrect: true },
        { text: "It's not risky, it's the recommended way to pay", isCorrect: false },
        { text: "It improves your credit score the fastest", isCorrect: false },
        { text: "It lowers your card's interest rate", isCorrect: false },
      ],
    },
    {
      prompt: "Roughly what annualized interest rate applies to unpaid credit card balances in India?",
      explanation: "Unpaid credit card balances typically accrue interest around 36-48% annualized — among the highest borrowing costs available.",
      options: [
        { text: "36-48%", isCorrect: true },
        { text: "3-4%", isCorrect: false },
        { text: "8-10%", isCorrect: false },
        { text: "0%, cards never charge interest", isCorrect: false },
      ],
    },
    {
      prompt: "What's the safest way to use a credit card as a student?",
      explanation: "Spending only what you can pay off, and paying the full statement balance every cycle, avoids interest entirely and builds credit history.",
      options: [
        { text: "Only pay the minimum due to preserve cash", isCorrect: false },
        { text: "Never spend more than you can pay off, and pay the full statement balance every cycle", isCorrect: true },
        { text: "Max out the limit to earn more reward points", isCorrect: false },
        { text: "Withdraw cash on it whenever needed", isCorrect: false },
      ],
    },
    {
      prompt: "Why should you avoid cash withdrawals on a credit card?",
      explanation: "Cash withdrawals have no grace period and start accruing interest immediately, plus an additional cash advance fee.",
      options: [
        { text: "Cash withdrawals are free and interest-free like purchases", isCorrect: false },
        { text: "Interest starts immediately with no grace period, plus a cash advance fee", isCorrect: true },
        { text: "ATMs don't accept credit cards at all", isCorrect: false },
        { text: "It damages your PAN card", isCorrect: false },
      ],
    },
  ],
};

const incomeTaxBasics: SeedLesson = {
  slug: "income-tax-basics",
  title: "Income Tax Basics for First Salary",
  topic: "Taxes",
  area: "TAX",
  description: "Why your CTC isn't your take-home pay, and the old vs. new tax regime choice you'll face on your first payslip.",
  contentMarkdown: `## CTC is not what lands in your bank account

**CTC (Cost to Company)** is the total cost of employing you — it includes your base salary, but also employer PF contributions, insurance premiums, and other benefits the company pays on your behalf. Your actual **take-home pay** is CTC minus these components, minus tax, minus your own PF contribution. A ₹10 LPA CTC offer might land as ₹65,000-70,000/month take-home, not ₹83,000 (10,00,000 divided by 12).

## Old regime vs. new regime

India currently lets salaried taxpayers choose between two tax regimes each year:

- **Old regime**: higher tax slabs, but you can claim deductions (HRA, 80C investments like PPF/ELSS, health insurance premiums under 80D, home loan interest, and more)
- **New regime**: lower tax slabs, but almost no deductions allowed — simpler, but only better if you don't have many deductions to claim

For a first job with few investments/deductions yet, the new regime is often simpler and can result in lower tax. Once you start investing seriously (80C, health insurance, and so on), the old regime may become better. It's worth recalculating each year, not picking once and forgetting.

## Form 16 and TDS

Your employer deducts tax at source (**TDS**) from your salary every month and deposits it with the government on your behalf. At the end of the financial year, they issue **Form 16** — a certificate summarizing your salary and the tax already deducted. You use this to file your **Income Tax Return (ITR)**, which reconciles what was deducted against what you actually owed — you may get a refund, or owe a bit more.

## Filing your first ITR

Even if your employer deducted the correct tax, filing an ITR is legally required above a certain income threshold — and it's useful even below it, as proof of income for loans, visas, or rental agreements. Filing is done online via the Income Tax Department's e-filing portal, using details largely pre-filled from your Form 16 and Form 26AS, a tax credit statement.

## Why understanding this matters immediately

Negotiating a job offer purely on CTC, without checking the take-home breakdown, is a common first-job mistake — two offers with identical CTC can have very different actual monthly income depending on how much is structured as base salary vs. other components.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 7,
  questions: [
    {
      prompt: "What does CTC (Cost to Company) actually represent?",
      explanation: "CTC is the total cost of employing you, including salary plus employer contributions and benefits — not the amount you actually receive.",
      options: [
        { text: "Exactly what you receive in your bank account monthly", isCorrect: false },
        { text: "The total cost of employing you, including salary plus employer contributions/benefits", isCorrect: true },
        { text: "Your monthly tax bill only", isCorrect: false },
        { text: "Your annual bonus only", isCorrect: false },
      ],
    },
    {
      prompt: "What's the key tradeoff between the old and new tax regimes?",
      explanation: "The old regime has higher slabs but allows deductions; the new regime has lower slabs but strips away most deductions.",
      options: [
        { text: "Old regime is only for government employees", isCorrect: false },
        { text: "Old regime has higher slabs but allows deductions; new regime has lower slabs but almost no deductions", isCorrect: true },
        { text: "New regime is mandatory for everyone with no choice", isCorrect: false },
        { text: "There is no real difference between them", isCorrect: false },
      ],
    },
    {
      prompt: "What is TDS?",
      explanation: "TDS (Tax Deducted at Source) is tax your employer deducts from your salary each month and deposits with the government on your behalf.",
      options: [
        { text: "Tax Deducted at Source — deducted from salary monthly and deposited with the government", isCorrect: true },
        { text: "A type of savings account", isCorrect: false },
        { text: "A one-time joining bonus tax", isCorrect: false },
        { text: "A penalty for filing late", isCorrect: false },
      ],
    },
    {
      prompt: "What is Form 16 used for?",
      explanation: "Form 16 summarizes your salary and tax already deducted, and is used to file your income tax return.",
      options: [
        { text: "It's your offer letter", isCorrect: false },
        { text: "It summarizes your salary and tax already deducted, used to file your ITR", isCorrect: true },
        { text: "It's a loan application form", isCorrect: false },
        { text: "It's a resignation document", isCorrect: false },
      ],
    },
    {
      prompt: "Why should you compare take-home pay, not just CTC, between job offers?",
      explanation: "Identical CTC figures can produce very different actual monthly take-home pay depending on how the salary structure is split.",
      options: [
        { text: "CTC and take-home pay are always exactly equal", isCorrect: false },
        { text: "Identical CTC offers can result in very different actual take-home pay", isCorrect: true },
        { text: "Take-home pay doesn't matter for budgeting", isCorrect: false },
        { text: "CTC already excludes all deductions", isCorrect: false },
      ],
    },
  ],
};

const investingBasics: SeedLesson = {
  slug: "investing-basics-stocks-mutual-funds-fds",
  title: "Investing Basics: Stocks vs. Mutual Funds vs. FDs",
  topic: "Investing",
  area: "INVESTING",
  description: "A simple risk/return map of the three most common ways Indians invest, and which fits which goal.",
  contentMarkdown: `## The risk-return spectrum

Every investment sits somewhere on a spectrum: lower risk usually means lower but more certain returns, and higher potential returns come with higher risk of loss. There's no single "best" investment — only what's right for a given goal and time horizon.

## Fixed Deposits: low risk, low-moderate return

Covered in an earlier lesson — a fixed, guaranteed return (roughly 6-7.5%) with your principal protected, and further insured up to ₹5 lakh per bank by DICGC. Good for money you can't afford to lose, needed soon.

## Stocks: you own a piece of a company

Buying a stock means owning a small slice of a real company. If the company grows and becomes more valuable, your shares typically go up. If it performs badly, they go down — sometimes to zero. Individual stocks can swing 20-50%+ in a year in either direction. High potential return, high risk, and requires research (or luck) to pick well.

## Mutual funds: professionally managed, diversified

A mutual fund pools money from thousands of investors, and a professional fund manager invests it across many stocks (or bonds, or a mix) according to a stated strategy. Buying one fund unit effectively buys you tiny slices of dozens or hundreds of companies at once — this diversification means one company doing badly doesn't sink your whole investment.

- **Equity mutual funds**: invest mostly in stocks — higher risk/return, for long-term goals of 5+ years
- **Debt mutual funds**: invest in bonds and fixed-income instruments — lower risk/return, for shorter goals
- **Index funds**: a type of equity fund that just tracks a market index like the Nifty 50 instead of a manager picking stocks — very low fees, and historically hard for most active managers to consistently beat over the long run

## Why most beginners should start with mutual funds, not individual stocks

Picking individual stocks well requires research most students don't have time for, and carries emotional risk — panic-selling during a dip is how people lock in losses. A diversified equity mutual fund gives market-level exposure to growth without needing to correctly predict which single company wins.

## Matching investment to goal

- Money needed in under 1 year → savings account or FD, safety first
- Money needed in 1-3 years → debt mutual fund, some growth with lower volatility
- Money needed in 5+ years (retirement, long-term wealth) → equity mutual funds or index funds, riding out short-term swings for long-term growth`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 8,
  questions: [
    {
      prompt: "What does owning a stock actually mean?",
      explanation: "A stock represents ownership of a small slice of a real company, not a loan or a guaranteed-return product.",
      options: [
        { text: "You own a small slice of a real company", isCorrect: true },
        { text: "You've lent money to the government", isCorrect: false },
        { text: "You own a fixed deposit certificate", isCorrect: false },
        { text: "You've bought an insurance policy", isCorrect: false },
      ],
    },
    {
      prompt: "What is the main benefit of a mutual fund over picking individual stocks?",
      explanation: "Diversification spreads your money across many companies, so one company performing badly doesn't sink the whole investment.",
      options: [
        { text: "Diversification — your money is spread across many companies", isCorrect: true },
        { text: "Mutual funds guarantee profits", isCorrect: false },
        { text: "Mutual funds carry zero risk", isCorrect: false },
        { text: "Mutual funds are only for people with over ₹1 crore", isCorrect: false },
      ],
    },
    {
      prompt: "What does an index fund do differently from an actively managed equity fund?",
      explanation: "An index fund simply tracks a market index like the Nifty 50, rather than relying on a manager to pick individual stocks, usually at lower fees.",
      options: [
        { text: "It tracks a market index instead of a manager picking individual stocks", isCorrect: true },
        { text: "It only invests in fixed deposits", isCorrect: false },
        { text: "It guarantees a fixed return like an FD", isCorrect: false },
        { text: "It's only available to institutional investors", isCorrect: false },
      ],
    },
    {
      prompt: "For a goal 1-3 years away, which investment type is generally more appropriate?",
      explanation: "Debt mutual funds offer some growth with lower volatility, better suited to a medium-term horizon than equities or cash alone.",
      options: [
        { text: "An individual high-growth stock", isCorrect: false },
        { text: "A debt mutual fund", isCorrect: true },
        { text: "A 20-year equity index fund", isCorrect: false },
        { text: "Cash kept at home", isCorrect: false },
      ],
    },
    {
      prompt: "Why do most financial educators suggest beginners start with mutual funds rather than individual stocks?",
      explanation: "Picking individual stocks well takes significant research and time, and beginners are prone to panic-selling during dips, which locks in losses.",
      options: [
        { text: "Individual stocks are illegal for people under 25", isCorrect: false },
        { text: "Picking stocks well requires significant research, and panic-selling during dips is a common costly mistake", isCorrect: true },
        { text: "Mutual funds always outperform stocks in the short term", isCorrect: false },
        { text: "Stocks require a separate bank account", isCorrect: false },
      ],
    },
  ],
};

const sipStartingEarly: SeedLesson = {
  slug: "sip-starting-early",
  title: "SIP & the Power of Starting Early",
  topic: "Investing",
  area: "INVESTING",
  description: "How a Systematic Investment Plan turns compound interest into an actual habit, and why starting at 21 beats starting at 31.",
  contentMarkdown: `## What is a SIP?

A **Systematic Investment Plan (SIP)** is simply investing a fixed amount into a mutual fund on a fixed schedule, usually monthly, automatically — instead of trying to invest a lump sum or time the market. You're not predicting anything; you're just showing up consistently.

## Why SIPs work even for beginners with small amounts

You can start a SIP with as little as ₹500/month in many funds. This makes investing accessible without needing a large lump sum saved up first — the habit matters more than the amount, especially early on.

## Rupee cost averaging

Markets go up and down. With a fixed SIP amount, when prices are low your fixed ₹2,000 buys more units; when prices are high, it buys fewer. Over time, this averages out your purchase price and removes the stress, and near-impossibility, of trying to buy at the exact bottom.

## Connecting back to compound interest

Recall from an earlier lesson: money compounds faster the longer it's invested, and early years matter more than later ones. A SIP is simply the practical, automated way to actually apply that lesson every single month, instead of it staying a one-time calculation.

## Worked example: 21 vs. 31

Aisha starts a SIP of ₹3,000/month at age 21, assuming a long-term equity fund average return of roughly 12% annually, and continues until 60 — 39 years. Rohan starts the exact same ₹3,000/month SIP at 31 and also continues until 60 — 29 years, 10 fewer years.

Despite contributing the same monthly amount, Aisha's corpus at 60 ends up dramatically larger than Rohan's — not just proportionally more for 10 extra years of contributions, but multiples more, because those first 10 years of growth then kept compounding on top of themselves for the following decades. This is the single most important reason to start a SIP now, even with a small amount, rather than waiting until you "have more money later."

## Getting started

SIPs are set up through mutual fund platforms or apps, linked to your bank account via auto-debit, similar to a UPI autopay mandate — once set up, it runs without you needing to remember each month.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 9,
  questions: [
    {
      prompt: "What is a SIP?",
      explanation: "A SIP is investing a fixed amount into a mutual fund on a fixed schedule automatically, typically monthly.",
      options: [
        { text: "Investing a fixed amount into a mutual fund on a fixed schedule automatically", isCorrect: true },
        { text: "A one-time lump sum stock purchase", isCorrect: false },
        { text: "A type of savings account", isCorrect: false },
        { text: "A government tax scheme", isCorrect: false },
      ],
    },
    {
      prompt: "What is 'rupee cost averaging'?",
      explanation: "A fixed SIP amount buys more units when prices are low and fewer when prices are high, which averages the purchase cost over time.",
      options: [
        { text: "A fixed SIP amount buys more units when prices are low and fewer when high, averaging purchase cost", isCorrect: true },
        { text: "Getting a fixed guaranteed return regardless of the market", isCorrect: false },
        { text: "Averaging your salary across the year", isCorrect: false },
        { text: "A fee charged by mutual funds", isCorrect: false },
      ],
    },
    {
      prompt: "Why does starting a SIP 10 years earlier matter so much more than just '10 extra years of contributions'?",
      explanation: "Those early years of returns keep compounding on top of themselves for every following decade, not just adding a fixed extra amount.",
      options: [
        { text: "It doesn't matter, total contributions are what count", isCorrect: false },
        { text: "Those early years of returns then keep compounding on top of themselves for all following decades", isCorrect: true },
        { text: "Banks pay a bonus for early starters", isCorrect: false },
        { text: "Fund fees are lower for older accounts", isCorrect: false },
      ],
    },
    {
      prompt: "What is the typical minimum amount to start a SIP in many mutual funds?",
      explanation: "Many mutual funds allow SIPs starting from as little as ₹500 per month, making it accessible for students.",
      options: [
        { text: "As low as ₹500/month", isCorrect: true },
        { text: "₹50,000 minimum", isCorrect: false },
        { text: "₹1,00,000 minimum", isCorrect: false },
        { text: "There is no minimum but a 10-year lock-in", isCorrect: false },
      ],
    },
    {
      prompt: "How is a SIP typically set up to run automatically each month?",
      explanation: "SIPs use auto-debit from your linked bank account, similar to a UPI autopay mandate, so no manual action is needed each month.",
      options: [
        { text: "You must manually transfer money every month with no automation possible", isCorrect: false },
        { text: "Via auto-debit from your bank account, similar to a UPI autopay mandate", isCorrect: true },
        { text: "Only via physical bank branch visits", isCorrect: false },
        { text: "SIPs cannot be automated, only lump sums can", isCorrect: false },
      ],
    },
  ],
};

const insuranceBasics: SeedLesson = {
  slug: "insurance-basics",
  title: "Insurance Basics",
  topic: "Insurance",
  area: "INVESTING",
  description: "Term vs. health insurance, and why 'investment-cum-insurance' combo products are usually a bad deal for both goals.",
  contentMarkdown: `## What insurance actually is

Insurance is protection against a large, unlikely, financially devastating event — not a savings or investment product. You pay a small, predictable amount, called a **premium**, regularly so that if a rare bad event happens, the insurer covers a much larger cost you couldn't easily absorb yourself.

## Term insurance

A **term life insurance** policy pays a large lump sum, the **sum assured**, to your nominees if you die during the policy term, in exchange for a relatively small annual premium. It has **no maturity payout** if you survive the term — it's pure protection, not an investment. This is precisely why it's so cheap: a healthy 22-year-old can often get ₹1 crore of coverage for a few thousand rupees a year.

## Health insurance

Covers hospitalization and medical costs, which can otherwise wipe out years of savings in a single incident. Many students are covered under a parent's family floater policy or a college/employer group policy — but it's worth checking what that policy actually covers, and considering a personal policy once you start earning, since employer coverage typically ends when the job does.

## The trap: "investment-cum-insurance" plans

Products like ULIPs (Unit Linked Insurance Plans) or endowment policies combine insurance and investment into one product, often sold aggressively by agents earning high commissions. The problem: they tend to do both jobs poorly — the insurance coverage is far smaller than a term plan would give for the same premium, and the "investment" portion has high charges that eat into returns compared to a plain mutual fund SIP.

## The better approach: buy them separately

Financial advisors overwhelmingly recommend buying **term insurance** for pure protection (cheap, high coverage), and separately investing via **mutual funds/SIPs** for growth, as covered in the previous lesson. Combining them into one product sounds convenient but usually costs more and delivers less on both fronts.

## When do you actually need life insurance?

Primarily when someone depends on your income — a parent, spouse, or sibling. A financially independent student with no dependents typically doesn't need life insurance yet, though health insurance is relevant at any age.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 10,
  questions: [
    {
      prompt: "What is insurance fundamentally designed to do?",
      explanation: "Insurance protects against large, unlikely, financially devastating events in exchange for a small, predictable regular premium.",
      options: [
        { text: "Protect against a large, unlikely, financially devastating event for a small regular premium", isCorrect: true },
        { text: "Guarantee investment growth", isCorrect: false },
        { text: "Replace the need for savings entirely", isCorrect: false },
        { text: "Provide a fixed monthly income to everyone", isCorrect: false },
      ],
    },
    {
      prompt: "What happens with a term life insurance policy if you outlive the policy term?",
      explanation: "Term insurance has no maturity payout — if you survive the term, you simply received protection during that period, nothing more.",
      options: [
        { text: "There is no maturity payout — it's pure protection with no payout if you survive the term", isCorrect: true },
        { text: "You get your entire premium back with interest", isCorrect: false },
        { text: "You get double the sum assured", isCorrect: false },
        { text: "The policy automatically renews for free forever", isCorrect: false },
      ],
    },
    {
      prompt: "What is the main criticism of 'investment-cum-insurance' products like ULIPs?",
      explanation: "Combined products tend to provide weaker insurance coverage and weaker investment returns than buying term insurance and a mutual fund SIP separately.",
      options: [
        { text: "They tend to provide weaker insurance coverage and weaker investment returns than buying separately", isCorrect: true },
        { text: "They are illegal in India", isCorrect: false },
        { text: "They only cover accidents, not illness", isCorrect: false },
        { text: "They have no fees at all", isCorrect: false },
      ],
    },
    {
      prompt: "What's the generally recommended approach instead of combined insurance-investment products?",
      explanation: "Buying term insurance for protection and investing separately via mutual funds/SIPs for growth outperforms combined products on both fronts.",
      options: [
        { text: "Avoid insurance and investing entirely until age 40", isCorrect: false },
        { text: "Buy term insurance separately for protection, and invest via mutual funds/SIPs separately for growth", isCorrect: true },
        { text: "Only ever buy combined ULIP products", isCorrect: false },
        { text: "Rely solely on employer coverage forever", isCorrect: false },
      ],
    },
    {
      prompt: "When does someone typically need life insurance?",
      explanation: "Life insurance matters most when someone else depends financially on your income — otherwise there's no income loss to protect against.",
      options: [
        { text: "Every person needs life insurance starting at birth", isCorrect: false },
        { text: "When someone else depends on their income, like a parent, spouse, or sibling", isCorrect: true },
        { text: "Only people over 60 need life insurance", isCorrect: false },
        { text: "Only married people can legally buy life insurance", isCorrect: false },
      ],
    },
  ],
};

const commonScamsIndia: SeedLesson = {
  slug: "common-financial-scams-india",
  title: "Common Financial Scams in India",
  topic: "Scam Awareness",
  area: "DIGITAL_SAFETY",
  description: "Spot the patterns behind fake loan apps, Ponzi schemes, and phishing calls before they cost you money.",
  contentMarkdown: `## The common thread in almost every scam

Nearly every financial scam relies on two ingredients: **urgency**, meaning "act now or lose access," and **secrecy**, meaning "don't tell anyone, don't verify with the bank." Legitimate banks, apps, and government agencies never need you to act within minutes, and never discourage you from double-checking independently.

## Fake or predatory loan apps

Apps promising "instant loans, no documents needed" often charge hidden processing fees upfront, then use extremely aggressive, sometimes illegal, recovery tactics — including accessing your phone's contacts, if you granted that permission during install, to harass you or people you know. Only borrow from RBI-registered NBFCs or banks, visible on the RBI's official list, and never grant a loan app access to your contacts or gallery.

## Ponzi and pyramid schemes

These promise unusually high, "guaranteed" returns, often 20-50%+ monthly, and pay early investors using money from new investors, not real profits. They collapse the moment new investor money slows down — by definition, they cannot last, no matter how legitimate they look. If a return sounds too good to be true relative to normal FD or mutual fund returns of roughly 6-14% annually, it is.

## Fake crypto/trading "gurus"

Social media ads or messages promising guaranteed crypto or stock trading profits, often showing fake screenshots of huge gains, pressure victims into depositing money on fake trading platforms that show fabricated "profits" to encourage larger deposits, until withdrawal is blocked or the platform disappears entirely.

## Phishing calls and messages

Scammers impersonate banks, UPI apps, or even the police or income tax department, creating panic ("your account will be blocked," "a case has been filed against you") to pressure victims into sharing OTPs, PINs, or installing remote-access apps. No real bank or government agency conducts business this way over a cold call.

## The single best defense

Whenever something creates urgency and asks for money, an OTP, a PIN, or app access — pause, and independently verify by calling the organization's official number yourself, not a number given by the caller, or checking their official app or website. Scammers are counting on you not taking that one extra step.`,
  videoUrl: PLACEHOLDER_VIDEO,
  estimatedMinutes: 6,
  xpReward: 75,
  isPublished: true,
  order: 11,
  questions: [
    {
      prompt: "What two ingredients are common to nearly every financial scam?",
      explanation: "Scams rely on urgency, pressure to act fast, and secrecy, discouraging victims from verifying independently.",
      options: [
        { text: "Urgency and secrecy", isCorrect: true },
        { text: "High interest rates and paperwork", isCorrect: false },
        { text: "Long processing times and complexity", isCorrect: false },
        { text: "Government backing and low returns", isCorrect: false },
      ],
    },
    {
      prompt: "What's a major red flag with many 'instant loan' apps?",
      explanation: "Predatory loan apps often charge hidden upfront fees and use aggressive recovery tactics, sometimes exploiting contact/gallery permissions granted at install.",
      options: [
        { text: "Hidden upfront fees and aggressive recovery tactics using contact/gallery access", isCorrect: true },
        { text: "They require too much paperwork", isCorrect: false },
        { text: "They only lend to businesses", isCorrect: false },
        { text: "They offer lower interest than banks", isCorrect: false },
      ],
    },
    {
      prompt: "Why do Ponzi schemes always eventually collapse?",
      explanation: "Ponzi schemes pay earlier investors using newer investors' money rather than real profit, which cannot continue once new money slows.",
      options: [
        { text: "Government regulators always shut them down within a week", isCorrect: false },
        { text: "They pay early investors using new investors' money, which cannot continue once new money slows", isCorrect: true },
        { text: "They are technically illegal even when returns are real", isCorrect: false },
        { text: "They run out of paper money to print", isCorrect: false },
      ],
    },
    {
      prompt: "What should you do if a returns opportunity promises 30% monthly, guaranteed?",
      explanation: "Returns at that scale are not realistically sustainable or 'guaranteed' — treat the offer as almost certainly a scam.",
      options: [
        { text: "Invest immediately before the opportunity closes", isCorrect: false },
        { text: "Treat it as almost certainly a scam", isCorrect: true },
        { text: "Ask friends to invest too since it's a good deal", isCorrect: false },
        { text: "Assume it's safe since it's called 'guaranteed'", isCorrect: false },
      ],
    },
    {
      prompt: "What's the single best defense against phishing calls or messages creating urgency?",
      explanation: "Independently verifying via the organization's official number, found yourself rather than given by the caller, defeats almost every phishing attempt.",
      options: [
        { text: "Immediately comply to avoid the described consequence", isCorrect: false },
        { text: "Pause and independently verify by calling the organization's official number yourself", isCorrect: true },
        { text: "Call back the number the caller provided", isCorrect: false },
        { text: "Share only the OTP, not the PIN", isCorrect: false },
      ],
    },
  ],
};

async function seedLesson(data: SeedLesson) {
  const lesson = await db.lesson.upsert({
    where: { slug: data.slug },
    create: {
      slug: data.slug,
      title: data.title,
      topic: data.topic,
      area: data.area,
      description: data.description,
      contentMarkdown: data.contentMarkdown,
      videoUrl: data.videoUrl,
      estimatedMinutes: data.estimatedMinutes,
      xpReward: data.xpReward,
      isPublished: data.isPublished,
      order: data.order,
    },
    update: {
      title: data.title,
      topic: data.topic,
      area: data.area,
      description: data.description,
      contentMarkdown: data.contentMarkdown,
      videoUrl: data.videoUrl,
      estimatedMinutes: data.estimatedMinutes,
      xpReward: data.xpReward,
      isPublished: data.isPublished,
      order: data.order,
    },
  });

  // Replace questions wholesale so the seed script is safe to rerun —
  // QuizAnswer cascades so this never hits a FK violation even after
  // students have taken the quiz.
  await db.question.deleteMany({ where: { lessonId: lesson.id } });
  for (const [qIndex, q] of data.questions.entries()) {
    await db.question.create({
      data: {
        lessonId: lesson.id,
        prompt: q.prompt,
        explanation: q.explanation,
        order: qIndex,
        options: {
          create: q.options.map((o, oIndex) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oIndex,
          })),
        },
      },
    });
  }

  console.log(`Seeded lesson: ${lesson.title}`);
}

async function main() {
  console.log("Seeding lessons...");
  await seedLesson(budgetingBasics);
  await seedLesson(compoundInterest);
  await seedLesson(savingVsSpending);
  await seedLesson(upiSafety);
  await seedLesson(bankAccountsSavingsInstruments);
  await seedLesson(creditScoreCibil);
  await seedLesson(creditCards101);
  await seedLesson(incomeTaxBasics);
  await seedLesson(investingBasics);
  await seedLesson(sipStartingEarly);
  await seedLesson(insuranceBasics);
  await seedLesson(commonScamsIndia);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
