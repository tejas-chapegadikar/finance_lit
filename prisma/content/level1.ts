import { choices, type SeedLesson } from "./types";

// Level 1 — Financial Foundations. Every lesson follows the same V1 structure:
// Hook → Learn (each "## " section is a card) → Real-life example → Key
// concepts (3–5 terms) → "What would you do?" scenario → 5-question quiz.
//
// Numbers that involve returns are always labelled as assumptions — lessons
// teach how things work, they never promise returns or recommend products.

const budgeting: SeedLesson = {
  slug: "budgeting-basics",
  title: "Budgeting",
  icon: "💰",
  area: "BUDGETING",
  description: "Make your first ₹15,000 stipend last the month — plan it with the 50/30/20 rule.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 1,
  hook: `It's the 1st. ₹8,000 just landed from home. By the 20th, you're checking your balance before buying chai.

Sound familiar? Where did the money actually go?`,
  learn: `## What is a budget?

A budget is a **plan for your money, made before you spend it**. It isn't about saying no to everything — it's about deciding in advance, instead of wondering at month-end where it all went.

## The 50/30/20 rule

A simple way to split any income — allowance, stipend or salary:

- **50% Needs** — rent or hostel, mess, transport, phone recharge
- **30% Wants** — eating out, OTT, shopping, trips
- **20% Savings** — an emergency fund and your goals

It's a starting point, not a strict law — adjust it to your life.

## Pay yourself first

Most people spend first and save whatever is left — which is usually nothing. Flip it: the day money arrives, **move your savings out first**. Then spend what remains.

## Watch the small leaks

A ₹500 purchase makes you stop and think. Five ₹100 UPI payments don't — but they cost exactly the same. **Small, frequent spends** are the #1 reason budgets quietly fail. Check your UPI history once a week.`,
  keyTerms: [
    { term: "Budget", definition: "A plan that decides where your money will go before you spend it." },
    { term: "Needs", definition: "Expenses you can't avoid — rent, food, transport, basic bills." },
    { term: "Wants", definition: "Things that make life nicer but you could skip — eating out, shopping, subscriptions." },
    { term: "50/30/20 rule", definition: "Split income into 50% needs, 30% wants and 20% savings." },
    { term: "Pay yourself first", definition: "Moving your savings out as soon as money arrives, before spending anything." },
  ],
  example: `**Priya, 19, Pune** gets ₹8,000 a month from home. Using 50/30/20, she plans:

- **Needs: ₹4,000** — mess, bus pass, phone recharge
- **Wants: ₹2,400** — cafés, OTT, shopping
- **Savings: ₹1,600** — moved to a separate account on the 1st

After 6 months she has **₹9,600 saved** — without ever feeling broke.

**If her wants budget runs out by the 15th, what should she do for the rest of the month?**`,
  scenario: {
    prompt:
      "Your ₹10,000 stipend arrives on the 1st. On the 5th, a friend invites you on a ₹3,000 weekend trip. You haven't set anything aside yet. What would you do?",
    options: choices(
      1,
      "Go — you'll save whatever is left at the end of the month",
      "First move ₹2,000 to savings, then see if the trip fits your wants budget",
      "Skip budgeting this month and start fresh next month",
      "Borrow from a friend so your stipend stays untouched",
    ),
    explanation:
      "Pay yourself first. Moving ₹2,000 (20%) to savings the day money arrives protects it. Your wants budget is ₹3,000 (30%) — the trip fits, but it uses all of it, so you'd skip other treats this month. That's budgeting: choosing, not just restricting.",
  },
  questions: [
    {
      prompt: 'In the 50/30/20 rule, what share of your income goes to "needs"?',
      explanation:
        "Needs like rent, food and transport take about half your income — leaving 30% for wants and 20% for savings.",
      hint: "The rule's name lists its three buckets in order: needs, wants, savings. Which number comes first?",
      difficulty: "EASY",
      options: choices(0, "50%", "30%", "20%", "70%"),
    },
    {
      prompt: 'Which of these is a "want", not a "need"?',
      explanation:
        "An OTT subscription is nice to have, but you can live without it. Rent, transport and food are needs.",
      hint: "Which one could you stop paying for tomorrow without it affecting your studies or your health?",
      difficulty: "EASY",
      options: choices(2, "Hostel rent", "Monthly bus pass", "A new OTT subscription", "Mess fees"),
    },
    {
      prompt: 'What does "pay yourself first" mean?',
      explanation:
        "Saving first — the day money arrives — means saving actually happens. Waiting for leftover money usually means saving nothing.",
      hint: "Think about the order of things: does saving happen before spending, or after?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Buy something nice for yourself on payday",
        "Move your savings out as soon as money arrives",
        "Pay your friends back before anyone else",
        "Spend first and save whatever is left",
      ),
    },
    {
      prompt: "Riya gets ₹12,000 a month. Following 50/30/20, how much should go to savings?",
      explanation: "20% of ₹12,000 is ₹2,400. Needs would get ₹6,000 and wants ₹3,600.",
      hint: "Savings is 20% — the same as one-fifth. What is one-fifth of ₹12,000?",
      difficulty: "MEDIUM",
      options: choices(1, "₹1,200", "₹2,400", "₹3,600", "₹6,000"),
    },
    {
      prompt:
        "Your UPI history shows 30 payments of about ₹80 each on snacks and chai this month. What's the best takeaway?",
      explanation:
        "30 × ₹80 = ₹2,400 — as much as a whole month's wants budget for many students. Small, frequent spends add up silently, so give them a limit.",
      hint: "Multiply it out: what do 30 payments of ₹80 add up to in a month?",
      difficulty: "HARD",
      options: choices(
        1,
        "It's only ₹80 at a time, so it doesn't matter",
        "That's about ₹2,400 a month — worth setting a limit for",
        "UPI makes you overspend, so stop using it completely",
        "Only big purchases affect a budget",
      ),
    },
  ],
};

const compoundInterest: SeedLesson = {
  slug: "compound-interest",
  title: "Compound Interest",
  icon: "🌱",
  area: "BUDGETING",
  description: "See how money grows on its own growth — and why your college years are the best time to start.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 2,
  hook: `Two friends each put away ₹50,000 once — one at 20, the other at 30. Same amount, same returns.

At 60, one has about ₹22 lakh and the other under ₹9 lakh. What made the difference?`,
  learn: `## Simple vs compound interest

**Simple interest** is paid only on your original amount. **Compound interest** is paid on your original amount *plus* the interest it has already earned — your money earns money on its money.

## See the difference

₹10,000 at 10% a year for 30 years:

- Simple interest → **₹40,000**
- Compound interest → **₹1.74 lakh**

Same money, same rate. Compounding did all the extra work.

## Time is the secret ingredient

Compounding is slow at first and fast later. The longer money stays invested, the bigger each year's growth gets. That's why **starting early often beats starting big**.

## The Rule of 72

A quick trick: **72 ÷ yearly interest rate ≈ years to double**. At 8%, money doubles in about 9 years. At 12%, in about 6.

## It works against you too

Debt compounds as well. Unpaid credit card dues can grow at **36–45% a year** — that's compounding working for the bank, not for you.`,
  keyTerms: [
    { term: "Principal", definition: "The original amount you invest or borrow." },
    { term: "Interest", definition: "Money paid for using money — you earn it on savings and pay it on loans." },
    { term: "Simple interest", definition: "Interest calculated only on the original principal." },
    { term: "Compound interest", definition: "Interest calculated on the principal plus the interest already earned." },
    { term: "Rule of 72", definition: "Divide 72 by the yearly interest rate to estimate how many years money takes to double." },
  ],
  example: `**Ravi and Meena** each invest ₹50,000 once. Assume 10% a year — just to show the maths; real returns go up and down and are never guaranteed.

- **Ravi invests at 20** → by 60 it grows to about **₹22.6 lakh**
- **Meena invests at 30** → by 60 it grows to about **₹8.7 lakh**

Ravi didn't invest more. He just gave compounding 10 extra years.

**If Meena wanted to catch up with Ravi, what would she have to change?**`,
  scenario: {
    prompt:
      "You have ₹5,000 from Diwali gifts. Your cousin says, \"Saving such a small amount is pointless — start when you get a salary.\" What would you do?",
    options: choices(
      1,
      "Agree — small amounts can't grow into anything meaningful",
      "Start saving it now — with compounding, time matters as much as the amount",
      "Wait until you have ₹1 lakh so it's worth the effort",
      "Spend it, since prices will rise anyway",
    ),
    explanation:
      "Small amounts started early can beat bigger amounts started late, because compounding needs time. Building the habit now matters as much as the amount itself.",
  },
  questions: [
    {
      prompt: "What makes compound interest different from simple interest?",
      explanation:
        "With compounding, interest is added to your balance — and next year you earn interest on that bigger balance.",
      hint: "After year one, what happens to the interest you earned? Does it just sit there, or start earning too?",
      difficulty: "EASY",
      options: choices(
        1,
        "It's only offered by government banks",
        "You earn interest on your interest too",
        "It's always paid out in cash",
        "Its rate can never change",
      ),
    },
    {
      prompt: "Using the Rule of 72, roughly how long does money take to double at 8% a year?",
      explanation: "72 ÷ 8 = 9, so money roughly doubles in about 9 years at 8%.",
      hint: "Divide 72 by the yearly interest rate.",
      difficulty: "EASY",
      options: choices(2, "6 years", "8 years", "9 years", "12 years"),
    },
    {
      prompt: "Two people invest the same amount at the same rate. Who usually ends up with more?",
      explanation:
        "With compounding, time is the biggest lever — extra years give growth more time to build on itself.",
      hint: "If the amount and the rate are the same, what's the only thing left that can be different?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "The one who checks their balance more often",
        "The one who started earlier",
        "The one with the higher salary",
        "They always end up with exactly the same",
      ),
    },
    {
      prompt: "₹10,000 earns 10% simple interest a year. How much interest does it earn in 3 years?",
      explanation:
        "Simple interest is ₹1,000 a year (10% of ₹10,000), calculated on the original amount only — ₹3,000 over 3 years. With compounding it would be ₹3,310.",
      hint: "Simple interest is calculated only on the original ₹10,000. What's 10% of that, each year?",
      difficulty: "MEDIUM",
      options: choices(1, "₹1,000", "₹3,000", "₹3,310", "₹13,000"),
    },
    {
      prompt: "Why is unpaid credit card debt so dangerous?",
      explanation:
        "Unpaid card dues attract interest of roughly 36–45% a year, and that interest is added to what you owe — compounding working against you.",
      hint: "Compounding works on anything that charges interest — including money you owe. How high is credit card interest?",
      difficulty: "HARD",
      options: choices(
        1,
        "It lowers the interest on your savings account",
        "Interest compounds on it at a very high rate",
        "Banks can instantly freeze your savings account",
        "It has no effect as long as you pay eventually",
      ),
    },
  ],
};

const savingVsSpending: SeedLesson = {
  slug: "saving-vs-spending",
  title: "Saving vs Spending Psychology",
  icon: "🐷",
  area: "BUDGETING",
  description: "Spot impulse buys, beat lifestyle creep before your first salary, and start an emergency fund.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 3,
  hook: `A ₹150 chai-and-snack break every day doesn't feel like much.

But over a year, it adds up to ₹54,000. What else could that money have done for you?`,
  learn: `## Need it, want it, or want it right now?

Before buying, ask yourself that question. **Impulse buys** — the "right now" ones — are where most money quietly disappears.

## Try the 24-hour rule

For anything non-essential, **wait a day** before buying. If you still want it tomorrow, go ahead. Most of the time, the urge fades.

## Beware of lifestyle creep

When income goes up, spending quietly rises with it — a pricier phone, more deliveries, fancier outings. **Raise your savings every time your income rises**, not just your spending.

## Build an emergency fund

An **emergency fund** is money kept aside only for surprises — a laptop repair, a medical bill, a gap between jobs. Over time, aim for **3–6 months of expenses**. Start with even ₹500 a month.

## "No-cost EMI" isn't always free

Splitting a purchase into EMIs makes it feel cheaper. Check for **processing fees** and lost discounts — and remember that every EMI locks up part of your future income.`,
  keyTerms: [
    { term: "Impulse buying", definition: "Buying on a sudden urge, without having planned for it." },
    { term: "24-hour rule", definition: "Waiting a day before a non-essential purchase to check if you really want it." },
    { term: "Lifestyle creep", definition: "Spending rising as your income rises, so your savings never grow." },
    { term: "Emergency fund", definition: "Money set aside only for unexpected expenses." },
    { term: "EMI", definition: "Equated Monthly Instalment — a fixed monthly payment to repay a purchase or loan." },
  ],
  example: `**Aman, 20, Delhi** spends about ₹150 a day on chai, snacks and quick deliveries.

- Per month: **₹4,500**
- Per year: **₹54,000**

He cuts it to ₹50 a day and moves the ₹100 he saves into an emergency fund — that's about **₹36,000 in a year**.

**Which of your small daily spends would add up the most over a year?**`,
  scenario: {
    prompt:
      "A flash sale shows headphones for ₹4,999 — \"70% off, ends in 10 minutes!\" You weren't planning to buy headphones. What would you do?",
    options: choices(
      2,
      "Buy now — a 70% discount is too good to miss",
      "Buy them on no-cost EMI so it doesn't hurt this month",
      "Close the tab — if you still need them tomorrow, compare prices then",
      "Buy two pairs so one can be a gift later",
    ),
    explanation:
      "Countdown timers are designed to rush you. A discount only saves money if you were going to buy the item anyway. Waiting a day lets the urge fade — and lets you check whether the \"original price\" was ever real.",
  },
  questions: [
    {
      prompt: "What is an emergency fund for?",
      explanation:
        "An emergency fund is kept aside only for surprises, so a sudden expense doesn't push you into debt.",
      hint: "The name is a clue — what kind of situation is it meant for?",
      difficulty: "EASY",
      options: choices(
        1,
        "Shopping during big sales",
        "Unexpected expenses like medical bills or repairs",
        "Buying stocks when prices fall",
        "Paying for a planned holiday",
      ),
    },
    {
      prompt: "Over time, how big should an emergency fund ideally be?",
      explanation:
        "A common guideline is 3–6 months of expenses — enough to handle a job loss or a big surprise. Start small and build up.",
      hint: "It should cover a few months of life if your income suddenly stopped. Which option fits \"a few months\"?",
      difficulty: "EASY",
      options: choices(1, "One week of expenses", "3–6 months of expenses", "5 years of expenses", "Exactly ₹10,000"),
    },
    {
      prompt: "Your salary rises from ₹25,000 to ₹35,000. What's a smart way to avoid lifestyle creep?",
      explanation:
        "Raising your savings when your income rises stops your lifestyle from swallowing every raise — and you can still enjoy part of it.",
      hint: "Lifestyle creep means spending grows with income. What else could grow instead?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Upgrade your phone right away",
        "Increase your savings along with your income",
        "Keep saving exactly the same amount as before",
        "Spend all of the extra — you earned it",
      ),
    },
    {
      prompt: "What does the 24-hour rule help you avoid?",
      explanation:
        "Waiting a day before a non-essential purchase gives the urge time to fade, so you only buy what you really want.",
      hint: "The rule is about waiting before you buy. What kind of buying does waiting stop?",
      difficulty: "MEDIUM",
      options: choices(1, "Late payment fees", "Impulse purchases", "Bank charges", "Income tax"),
    },
    {
      prompt:
        "A ₹30,000 phone is offered on 6-month \"no-cost EMI\" with a ₹199 processing fee. What should you check first?",
      explanation:
        "\"No-cost\" EMIs can still carry fees, and you may lose an upfront discount. ₹5,000 a month is also locked in for 6 months — make sure your budget can carry it.",
      hint: "\"No-cost\" is a marketing term. What extra costs — and what monthly commitment — come with it?",
      difficulty: "HARD",
      options: choices(
        1,
        "Nothing — no-cost means it costs nothing extra",
        "The total cost after fees, and whether ₹5,000 a month fits your budget",
        "Whether the phone comes in more colours",
        "Whether you can stretch it to 24 months instead",
      ),
    },
  ],
};

const upiPayments: SeedLesson = {
  slug: "upi-digital-payments",
  title: "UPI and Digital Payments",
  icon: "📱",
  area: "DIGITAL_SAFETY",
  description: "Pay and get paid on UPI with confidence — and the one rule that stops most UPI frauds.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 4,
  hook: `You're selling your old cycle online. The buyer says: "I've sent you a request — just enter your PIN to receive ₹5,000."

Do you need your PIN to receive money?`,
  learn: `## How UPI works

**UPI (Unified Payments Interface)** moves money instantly between bank accounts using a UPI ID or a QR code. Every payment is approved with your **UPI PIN** — think of it as your signature.

## The golden rule

**You never need your UPI PIN to receive money.** Entering your PIN always means money is leaving your account. Anyone who says otherwise is trying to scam you.

## Collect requests

A **collect request** asks you to *pay*. Scammers send them disguised as refunds, prizes or payments for something you're selling. Read every screen: if it says **"Pay"** or asks for your PIN, money will go out.

## QR codes

Scanning a QR code is for **paying**, not receiving. If someone sends you a QR code to "receive" money, it's a trap.

## If something goes wrong

Call the **cybercrime helpline 1930** or report at **cybercrime.gov.in** right away, and inform your bank. The faster you report, the better the chance of stopping the money.`,
  keyTerms: [
    { term: "UPI", definition: "Unified Payments Interface — instant bank-to-bank payments using a UPI ID or QR code." },
    { term: "UPI ID", definition: "Your payment address (like name@bank), used instead of an account number." },
    { term: "UPI PIN", definition: "The secret number that approves payments. It's only ever needed to send money." },
    { term: "Collect request", definition: "A request asking you to pay — approving it sends money out of your account." },
    { term: "1930", definition: "India's national cybercrime helpline for reporting online fraud." },
  ],
  example: `**Sneha, 21, Bengaluru** lists her old textbooks online. A "buyer" sends her a ₹2,000 request and says, "Approve it to receive your money."

She looks closely: the screen says **"Pay ₹2,000"** and asks for her UPI PIN. She declines it and blocks the number.

**What detail on that screen gave the scam away?**`,
  scenario: {
    prompt:
      "You receive a WhatsApp message: \"Congratulations! You won ₹5,000. Enter your UPI PIN to receive your prize.\" What should you do?",
    options: choices(2, "Enter your UPI PIN", "Click the link", "Ignore it and report it", "Send ₹1 first"),
    explanation:
      "You never need a UPI PIN to receive money — entering it only ever sends money out. Prize messages like this are scams. Don't click the link, block the sender, and report it at cybercrime.gov.in or by calling 1930.",
  },
  questions: [
    {
      prompt: "When do you need to enter your UPI PIN?",
      explanation: "Your UPI PIN approves money going out. Receiving money never needs your PIN.",
      hint: "Think of the PIN as your signature approving a payment. Which direction is that payment going?",
      difficulty: "EASY",
      options: choices(
        0,
        "Only when sending money",
        "When receiving money",
        "When checking whether a refund has arrived",
        "When someone sends you a QR code to get paid",
      ),
    },
    {
      prompt:
        "A stranger sends you a QR code and says scanning it will credit ₹1,000 to your account. What's really going on?",
      explanation:
        "Scanning a QR code starts a payment from your account. Nobody needs you to scan anything to send you money.",
      hint: "When you scan a QR code at a shop, which way does the money go?",
      difficulty: "EASY",
      options: choices(
        1,
        "It's a quick way to receive money",
        "It's a trick — scanning a QR code is for paying, not receiving",
        "It's how banks verify your account",
        "It's safe as long as the amount is small",
      ),
    },
    {
      prompt: 'What is a UPI "collect request"?',
      explanation:
        "A collect request asks you to approve a payment. Scammers disguise them as refunds or prizes — approving one sends your money out.",
      hint: "In a collect request, who is collecting the money — you, or the person who sent it?",
      difficulty: "MEDIUM",
      options: choices(
        0,
        "A request asking you to pay money",
        "A notice that money has been credited",
        "Your bank asking you to update KYC",
        "A refund that's on its way to you",
      ),
    },
    {
      prompt: "You were tricked into a fraudulent UPI payment. What should you do first?",
      explanation:
        "Speed matters. Reporting immediately on 1930 or cybercrime.gov.in and alerting your bank gives the best chance of freezing the money.",
      hint: "In fraud cases, every hour counts. Which option gets you official help fastest?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Wait a week to see if the money comes back",
        "Report it right away on 1930 or cybercrime.gov.in and inform your bank",
        "Post about it on social media",
        "Message the scammer and ask for a refund",
      ),
    },
    {
      prompt:
        "Someone \"from customer care\" asks you to install a screen-sharing app so they can fix a failed UPI refund. What's the risk?",
      explanation:
        "Screen-sharing apps let a scammer watch everything you type — PINs, OTPs, passwords. Real banks and UPI apps never ask you to install them.",
      hint: "If someone can see your screen live, what would they see when you type your PIN?",
      difficulty: "HARD",
      options: choices(
        1,
        "None — support teams do this all the time",
        "They can see your PIN and OTPs and take over your payments",
        "It only slows down your phone",
        "Your refund gets delayed by a day",
      ),
    },
  ],
};

const financialScams: SeedLesson = {
  slug: "financial-scams",
  title: "Common Financial Scams in India",
  icon: "🚨",
  area: "DIGITAL_SAFETY",
  description: "Recognise the scams aimed at students and freshers — fake internships, KYC calls and \"digital arrests\".",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 5,
  hook: `"Earn ₹3,000 a day just by liking YouTube videos!" The first task pays you ₹150. The next one asks you to deposit ₹2,000 to unlock bigger tasks.

Is this a job — or a trap?`,
  learn: `## How scams work

Almost every scam uses the same three tricks: **urgency** (act now!), **fear** (your account will be blocked) or **greed** (easy money). If a message makes you panic or feel lucky, slow down.

## Scams that target students

- **Task and job scams** — paid "likes" or reviews that ask you to deposit money to continue
- **KYC update calls** — "your account will be blocked today", plus a link or an OTP request
- **Fake customer care** — numbers planted in search results and ads
- **Investment groups** — WhatsApp or Telegram groups promising guaranteed high returns

## The "digital arrest" scam

Someone posing as the police, CBI or customs video-calls you, says you're under "digital arrest" and demands money to clear your name. **There is no such thing as a digital arrest.** Real officials never demand money over a call.

## Your safety rules

- Never share your **OTP, UPI PIN, CVV or passwords** — with anyone
- Never install an app because someone on a call asked you to
- Verify by calling the **official number** yourself
- Report scams on **1930** or at **cybercrime.gov.in**`,
  keyTerms: [
    { term: "Phishing", definition: "Fake messages, emails or links designed to steal your details." },
    { term: "OTP", definition: "One-Time Password — a code that approves a login or payment. Never share it." },
    { term: "Task scam", definition: "A fake online \"job\" that pays a little at first, then demands deposits." },
    { term: "Digital arrest", definition: "A scam where fake officials \"arrest\" you on a video call and demand money. It doesn't exist in law." },
    { term: "Red flags", definition: "Warning signs like urgency, threats, secrecy and promises of easy money." },
  ],
  example: `**Karan, 22, Indore** joins a Telegram group offering ₹50 for every YouTube "like". He earns ₹250 on day one.

- Then he's asked to deposit **₹5,000** for "premium tasks"
- His dashboard soon shows **₹8,000** in earnings
- To withdraw, he's told to pay another **₹10,000** as "tax"

The earnings were never real — every deposit went straight to the scammers.

**At which step should Karan have stopped?**`,
  scenario: {
    prompt:
      "You get a call: \"This is your bank. Your KYC has expired and your account will be blocked in 2 hours. Tell me the OTP we just sent to verify you.\" What would you do?",
    options: choices(
      1,
      "Share the OTP quickly so your account isn't blocked",
      "Hang up and call the number on your debit card or the bank's official website",
      "Ask for their employee ID first, then share the OTP",
      "Call back the number that just called you",
    ),
    explanation:
      "Banks never ask for your OTP. The 2-hour deadline exists to make you panic. Hang up and contact your bank through its official number — never the one that called you.",
  },
  questions: [
    {
      prompt: "Who should you share your OTP with?",
      explanation:
        "An OTP approves a login or a payment. Banks, police and companies never need it — sharing it hands over control.",
      hint: "An OTP approves things on your behalf. Is there anyone who should be approving things as you?",
      difficulty: "EASY",
      options: choices(
        2,
        "Your bank's customer care, if they call you",
        "A close friend you trust",
        "No one",
        "Anyone who already knows your account number",
      ),
    },
    {
      prompt: "Which of these is the biggest red flag in a message?",
      explanation:
        "Urgency and threats are classic scam tactics — they stop you from thinking clearly or checking with someone first.",
      hint: "Scammers want you to act before you think. Which option is designed to make that happen?",
      difficulty: "EASY",
      options: choices(
        1,
        "It comes from a saved contact",
        "It pressures you to act immediately or face a penalty",
        "It doesn't use any emojis",
        "It's written in English",
      ),
    },
    {
      prompt:
        "A part-time job pays you ₹200 for liking videos, then asks you to deposit ₹3,000 to unlock higher-paying tasks. This is most likely:",
      explanation:
        "Real jobs pay you — they never ask you to deposit money to keep working. The small first payment is bait to win your trust.",
      hint: "In a real job, which way does money flow — from the employer to you, or from you to the employer?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "A normal onboarding fee",
        "A task scam",
        "A government scheme",
        "A bank verification step",
      ),
    },
    {
      prompt: 'Someone on a video call says they\'re a CBI officer and you\'re under "digital arrest". What\'s true?',
      explanation:
        "Indian law has no \"digital arrest\". Real officials don't arrest people or demand payments over video calls. Hang up and report it on 1930.",
      hint: "Would a real investigation be handled entirely over a video call that ends with a payment request?",
      difficulty: "MEDIUM",
      options: choices(
        2,
        "You must stay on the call until you're cleared",
        "Paying a security deposit will close the case",
        "\"Digital arrest\" doesn't exist — it's a scam",
        "Sharing your Aadhaar details will prove you're innocent",
      ),
    },
    {
      prompt:
        "You need help with a failed payment, so you search online and call the first \"customer care\" number you see. What's the risk?",
      explanation:
        "Scammers plant fake helpline numbers in search ads and listings. Always get support numbers from the official app or website.",
      hint: "Can anyone put a phone number on the internet? Where would a number you can trust come from?",
      difficulty: "HARD",
      options: choices(
        1,
        "No risk — search results are always verified",
        "It could be a fake number planted by scammers",
        "The call will be charged at a higher rate",
        "Your payment will be refunded twice",
      ),
    },
  ],
};

const bankAccounts: SeedLesson = {
  slug: "bank-accounts",
  title: "Savings and Current Accounts",
  icon: "🏦",
  area: "BANKING",
  description: "Pick the right account for your stipend or salary, dodge minimum-balance charges, and know your money is protected.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 6,
  hook: `Your bank cut ₹350 plus GST from your account this quarter. You didn't buy anything.

What did you just pay for?`,
  learn: `## Savings vs current accounts

- **Savings account** — for individuals keeping their own money. It earns a little interest.
- **Current account** — for businesses, shops and freelancers who make many payments every day. It earns **no interest** and usually needs a much higher minimum balance.

As a student or young employee, a **savings account** is almost always the right choice.

## Kinds of savings accounts

- **Regular savings account** — often needs a minimum balance
- **Salary account** — opened through your employer; usually zero-balance while your salary comes in
- **Zero-balance (BSBDA) account** — a basic account with no minimum balance

## Minimum balance (AMB)

Many savings accounts need an **Average Monthly Balance** — the average of your balance across *every day* of the month. Fall below it and the bank charges a **non-maintenance fee**.

## Savings interest vs rising prices

Savings accounts at large banks usually pay a low rate — often around **2.5–3% a year**. Prices often rise faster than that, so money left idle slowly loses value. Keep everyday and emergency money here — not every long-term goal.

## Your money is protected

Deposits in a bank are insured by **DICGC up to ₹5 lakh per person, per bank** — savings, FDs and RDs combined.

## Safety basics

Add a **nominee**, turn on SMS alerts, and never share your debit card PIN, CVV or net-banking password.`,
  keyTerms: [
    { term: "Savings account", definition: "An account for individuals to keep money safely while earning a little interest." },
    { term: "Current account", definition: "An account for businesses that make many transactions — it earns no interest." },
    { term: "Average Monthly Balance (AMB)", definition: "The average of your end-of-day balances across the month." },
    { term: "Non-maintenance charge", definition: "A fee banks charge when your balance falls below the required minimum." },
    { term: "DICGC", definition: "The RBI-backed body that insures bank deposits up to ₹5 lakh per person, per bank." },
  ],
  example: `**Divya, 20, Chennai** opened an account that needs a **₹5,000 Average Monthly Balance**. Most months she withdraws everything by the 10th, so her average falls short.

- Charge every quarter: **₹350 + GST**
- Cost over a year: **about ₹1,650** — for nothing

She switches to a zero-balance account and keeps that money instead.

**Is your account's minimum balance costing you?**`,
  scenario: {
    prompt:
      "You're opening your first bank account. Account A needs a ₹10,000 average monthly balance and offers a premium debit card. Account B is zero-balance, with UPI and a basic card. You usually keep ₹3,000–4,000 in the bank. What would you do?",
    options: choices(
      1,
      "Pick Account A — the premium card is worth it",
      "Pick Account B — it fits how much money you actually keep",
      "Open both and use whichever is convenient",
      "Pick Account A and plan to top it up to ₹10,000 someday",
    ),
    explanation:
      "With ₹3,000–4,000 balances, Account A would charge you non-maintenance fees almost every month. A zero-balance account gives you UPI and a card without the penalty.",
  },
  questions: [
    {
      prompt: "What is a nominee on your bank account?",
      explanation:
        "A nominee is the person you choose to receive your deposits if you pass away. Adding one makes things much easier for your family.",
      hint: "Think about what should happen to the money in an account if its owner were no longer around.",
      difficulty: "EASY",
      options: choices(
        1,
        "The bank manager who handles your account",
        "The person who receives your money if something happens to you",
        "A friend who can withdraw money anytime",
        "Your employer",
      ),
    },
    {
      prompt: "Who is a current account mainly designed for?",
      explanation:
        "Current accounts are built for businesses and freelancers who make many transactions every day. They earn no interest, so students and employees are usually better off with a savings account.",
      hint: "Think about who makes dozens of payments a day — and who would care more about that than about earning interest.",
      difficulty: "EASY",
      options: choices(
        2,
        "A student keeping their monthly allowance",
        "Anyone who wants to earn more interest",
        "A business or freelancer making many transactions",
        "Someone saving for an emergency fund",
      ),
    },
    {
      prompt: "How much of your deposits in one bank are insured by DICGC?",
      explanation: "DICGC insures deposits up to ₹5 lakh per person, per bank — savings, FDs and RDs combined.",
      hint: "The cover is per person, per bank, it's measured in lakhs — and it isn't unlimited.",
      difficulty: "MEDIUM",
      options: choices(2, "Up to ₹50,000", "Up to ₹1 lakh", "Up to ₹5 lakh", "Unlimited"),
    },
    {
      prompt: "Why can keeping all your money in a savings account for many years be a problem?",
      explanation:
        "If savings earn around 3% but prices rise faster, your money buys less over time. Savings accounts are great for everyday money and emergencies, not for every long-term goal.",
      hint: "Compare the interest a savings account pays with how fast prices usually rise.",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Banks take the money after one year",
        "Savings interest is often lower than price rises, so its value shrinks",
        "Savings accounts aren't safe",
        "You can't withdraw money once it's been there a year",
      ),
    },
    {
      prompt:
        "Your account needs a ₹5,000 average monthly balance. In a 30-day month, you keep ₹6,000 for 10 days and ₹0 for the other 20. What's your average monthly balance?",
      explanation:
        "(₹6,000 × 10 days + ₹0 × 20 days) ÷ 30 days = ₹2,000 — well below ₹5,000, so a charge would apply.",
      hint: "Add up the balance for each day of the month, then divide by the number of days.",
      difficulty: "HARD",
      options: choices(3, "₹6,000", "₹5,000", "₹3,000", "₹2,000"),
    },
  ],
};

const fdRd: SeedLesson = {
  slug: "fd-rd",
  title: "Fixed Deposits and Recurring Deposits",
  icon: "🪙",
  area: "BANKING",
  description: "Park your first savings in FDs and RDs — a simple, low-risk way to grow them.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 7,
  hook: `You want a ₹24,000 phone a year from now, and you can spare about ₹2,000 a month.

Should that money just sit in your savings account?`,
  learn: `## Fixed Deposit (FD)

You deposit a **lump sum** for a fixed period — anywhere from 7 days to 10 years — at a **fixed interest rate**. The rate is locked when you open it, so you know exactly what you'll get.

## Recurring Deposit (RD)

You deposit a **fixed amount every month** for a set period. It's perfect for building towards a goal from your monthly allowance or salary.

## FD vs savings account

FDs usually pay **more interest** than savings accounts, but the money is locked in. You can break an FD early, but banks usually cut the rate — a **premature withdrawal penalty**.

## Good to know

- FD and RD interest is **taxable** as part of your income
- Bank FDs and RDs are covered by **DICGC insurance up to ₹5 lakh** per person, per bank
- Keep emergency money accessible — don't lock all of it in an FD`,
  keyTerms: [
    { term: "Fixed Deposit (FD)", definition: "A one-time deposit locked for a fixed period at a fixed interest rate." },
    { term: "Recurring Deposit (RD)", definition: "Fixed monthly deposits for a set period that earn interest." },
    { term: "Tenure", definition: "How long the deposit stays locked." },
    { term: "Maturity amount", definition: "What you receive when the deposit ends — your deposits plus interest." },
    { term: "Premature withdrawal", definition: "Breaking a deposit before it matures, usually at a lower interest rate." },
  ],
  example: `**Rohit, 19, Jaipur** wants ₹24,000 for a phone in a year. He starts an **RD of ₹1,950 a month** at about 6.5% interest.

- Deposited over 12 months: **₹23,400**
- Interest earned: **about ₹820**
- Maturity amount: **about ₹24,200**

The interest covers part of the cost, and the fixed monthly deposit keeps him on track.

**Why might an RD suit Rohit better than an FD?**`,
  scenario: {
    prompt:
      "You've saved ₹20,000. You might need ₹5,000 of it anytime for emergencies, but you won't touch the rest for a year. What would you do?",
    options: choices(
      1,
      "Put all ₹20,000 in a 1-year FD for maximum interest",
      "Keep ₹5,000 in savings and put ₹15,000 in a 1-year FD",
      "Keep all of it as cash at home",
      "Put it all in a 5-year FD for a higher rate",
    ),
    explanation:
      "Splitting works best: emergency money stays accessible in savings, while money you won't need earns more in an FD. Locking up everything means paying a penalty if an emergency hits.",
  },
  questions: [
    {
      prompt: "What is a Fixed Deposit?",
      explanation:
        "An FD is a one-time deposit locked for a set tenure at an interest rate that's fixed when you open it.",
      hint: "Focus on the word \"fixed\" — what stays fixed in this kind of deposit?",
      difficulty: "EASY",
      options: choices(
        0,
        "A lump sum locked for a fixed period at a fixed rate",
        "Money you deposit every month",
        "A loan from the bank",
        "A type of credit card",
      ),
    },
    {
      prompt: "Which one lets you deposit a fixed amount every month?",
      explanation: "A Recurring Deposit takes a fixed amount every month — great for building towards a goal bit by bit.",
      hint: "Which name suggests something that happens again and again?",
      difficulty: "EASY",
      options: choices(1, "Fixed Deposit", "Recurring Deposit", "Current account", "Credit card"),
    },
    {
      prompt: "What usually happens if you break an FD before it matures?",
      explanation:
        "Banks allow premature withdrawal but usually pay a slightly lower interest rate as a penalty. Your principal is safe.",
      hint: "Banks allow it, but they'd prefer you didn't. Would they reward you — or charge you a little?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "You lose all the money",
        "The bank pays a slightly lower interest rate",
        "The bank doubles your interest",
        "Nothing at all changes",
      ),
    },
    {
      prompt: "Is the interest you earn on an FD taxable?",
      explanation:
        "FD interest counts as income and is taxed as per your income tax slab. If your total income is low, you may pay little or no tax on it.",
      hint: "Interest is money you earn. How does the tax system usually treat money you earn?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "No, FD interest is always tax-free",
        "Yes, it's added to your income and taxed as per your slab",
        "Only for people above 60",
        "Only if the FD is above ₹10 lakh",
      ),
    },
    {
      prompt:
        "Neel puts ₹1,000 a month into a 12-month RD at about 6.5% interest. Which is closest to his maturity amount?",
      explanation:
        "He deposits ₹12,000 in total. Earlier deposits earn interest for longer and later ones for less, adding up to roughly ₹420 — so about ₹12,420.",
      hint: "Start with what he deposits in total. Each deposit only earns interest for the months it has been in.",
      difficulty: "HARD",
      options: choices(1, "₹12,000", "₹12,420", "₹13,500", "₹18,000"),
    },
  ],
};

const cibilScore: SeedLesson = {
  slug: "cibil-score",
  title: "CIBIL Score",
  icon: "📊",
  area: "CREDIT",
  description: "Build a credit score from zero before you need your first loan or card.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 8,
  hook: `Two friends apply for the same bike loan. One gets it at a good rate. The other gets rejected.

They earn the same. What does the bank know that they don't?`,
  learn: `## What is a credit score?

A **credit score** is a 3-digit number from **300 to 900** that shows how reliably you've repaid borrowed money. **CIBIL** is India's best-known credit bureau; Experian, Equifax and CRIF High Mark are the others.

## Why it matters

Banks check it before giving you a loan or a credit card. A score of **750+** usually means easier approvals and better interest rates.

## What moves your score

- **Payment history** — paying EMIs and card bills on time (the biggest factor)
- **Credit utilisation** — how much of your limit you use; **under 30%** is healthy
- **Credit age** — older accounts help
- **Too many applications** — lots of loan or card applications in a short time can pull it down

## Starting from zero

Never borrowed? You may simply have **no score** yet — that's not the same as a bad score. Your first card or loan, repaid on time, starts building it. And checking your own score does **not** lower it.`,
  keyTerms: [
    { term: "Credit score", definition: "A 300–900 number that shows how reliably you repay borrowed money." },
    { term: "Credit bureau", definition: "A company, like CIBIL, that tracks your borrowing and repayment history." },
    { term: "Credit utilisation", definition: "The share of your credit limit you're using. Under 30% is healthy." },
    { term: "Payment history", definition: "Your record of paying EMIs and bills on time — the biggest factor in your score." },
    { term: "Hard enquiry", definition: "A lender checking your report when you apply for credit. Too many can lower your score." },
  ],
  example: `**Anjali, 23, Hyderabad** has a credit card with a **₹50,000 limit**. She pays her bill in full every month — but she spends about ₹40,000 on it, so her **utilisation is 80%**.

Her score stays stuck around 690. She starts paying part of her bill mid-month so her balance stays under ₹15,000 (30%), and her score begins to climb.

**Why would using less of her limit help, even though she always paid on time?**`,
  scenario: {
    prompt:
      "You just got your first credit card with a ₹40,000 limit, and you want to build a strong credit score. What would you do?",
    options: choices(
      0,
      "Use it for small regular spends and pay the full bill on time every month",
      "Max out the limit to show banks you can handle big amounts",
      "Never use it at all, so there's no risk",
      "Apply for four more cards this month to raise your total limit",
    ),
    explanation:
      "Paying the full bill on time builds your payment history — the biggest factor in your score — and small spends keep utilisation low. Maxing out raises utilisation, and many applications at once look risky to lenders.",
  },
  questions: [
    {
      prompt: "What is the range of a CIBIL score?",
      explanation: "CIBIL scores range from 300 to 900. Higher is better — 750+ is generally considered good.",
      hint: "It's a three-digit number, and the top of the range is below 1,000.",
      difficulty: "EASY",
      options: choices(1, "0 to 100", "300 to 900", "1 to 10", "100 to 1,000"),
    },
    {
      prompt: "Which of these matters most for your credit score?",
      explanation: "Payment history is the biggest factor. Even one missed payment can pull your score down.",
      hint: "A credit score shows how reliable you are as a borrower. What's the most reliable thing a borrower can do?",
      difficulty: "EASY",
      options: choices(
        1,
        "Your salary",
        "Paying EMIs and bills on time",
        "How many bank accounts you have",
        "Your college marks",
      ),
    },
    {
      prompt: "Your card limit is ₹1,00,000. To keep utilisation healthy, your balance should usually stay under:",
      explanation:
        "Keeping utilisation below 30% of your limit — ₹30,000 here — shows lenders you aren't dependent on credit.",
      hint: "The healthy utilisation guideline is a percentage of your limit. What's that percentage of ₹1,00,000?",
      difficulty: "MEDIUM",
      options: choices(0, "₹30,000", "₹60,000", "₹90,000", "₹1,00,000"),
    },
    {
      prompt: "Does checking your own credit score lower it?",
      explanation:
        "Checking your own score is a soft enquiry and doesn't affect it. Only lenders' checks when you apply for credit (hard enquiries) can.",
      hint: "Think about who's checking and why. Is it a lender deciding whether to lend you money?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Yes, every check lowers it",
        "No — checking your own score is a soft enquiry",
        "Only if you check it more than once a day",
        "Yes, by about 100 points each time",
      ),
    },
    {
      prompt: "You've never had a loan or a credit card. What does your credit report most likely show?",
      explanation:
        "Without any credit history, bureaus can't calculate a score, so you'll usually see \"no history\" instead of a number. It isn't a bad score — just a blank one.",
      hint: "A score is calculated from your repayment record. What if there's no record to calculate it from?",
      difficulty: "HARD",
      options: choices(
        1,
        "A score of 300 — the lowest possible",
        "No score yet, because there's no credit history",
        "A perfect 900, because you have no debt",
        "A negative score",
      ),
    },
  ],
};

const creditCards: SeedLesson = {
  slug: "credit-cards-101",
  title: "Credit Cards 101",
  icon: "💳",
  area: "CREDIT",
  description: "Learn how credit cards, billing cycles, due dates, and minimum payments work.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 9,
  hook: `You just got your first job. Your bank gives you a credit card with a ₹1,00,000 limit.

Does that mean you have ₹1,00,000 to spend?`,
  learn: `## What is a credit card?

A credit card lets you **borrow money from the bank up to a specific limit** and repay it later. It isn't your money — it's a short-term loan.

## How the cycle works

- You spend during a **billing cycle** (about 30 days)
- The bank sends a **statement** with your total bill
- You pay by the **due date** — usually 15–20 days later

Pay the **full amount** by the due date and you pay **zero interest**.

## The minimum payment trap

The **minimum amount due** is a small part of your bill, often around 5%. Paying only that avoids a late fee — but the rest attracts interest of about **3–4% a month (36–45% a year)**, and new purchases can lose their interest-free period too.

## Use it well

- Spend only what you could pay in cash today
- Set up auto-pay for the **full** bill
- Avoid withdrawing cash — interest starts from day one, plus a fee
- On-time payments build your **credit score**`,
  keyTerms: [
    { term: "Credit limit", definition: "The maximum amount you can borrow using the card." },
    { term: "Billing cycle", definition: "The roughly 30-day period whose spends are added into one bill." },
    { term: "Payment due date", definition: "The last date to pay your bill without a late fee." },
    { term: "Minimum payment", definition: "The small amount that avoids a late fee — the unpaid rest still attracts interest." },
    {
      term: "Interest and credit history",
      definition: "Unpaid balances cost around 36–45% a year, and every payment — on time or late — shapes your credit score.",
    },
  ],
  example: `**Rahul earns ₹30,000/month.** His credit-card bill is **₹12,000**. He has **₹15,000** available in his bank account.

If he pays only the minimum (about ₹600), the remaining ₹11,400 starts attracting interest at around 3.5% a month — roughly **₹400 extra by next month**, and it keeps growing.

**What should he consider before paying only the minimum amount?**`,
  scenario: {
    prompt:
      "Your ₹8,000 credit card bill is due tomorrow. You have ₹10,000 in your account, but you were hoping to buy concert tickets this weekend. What would you do?",
    options: choices(
      1,
      "Pay just the minimum due and keep the rest for the tickets",
      "Pay the full ₹8,000, and skip the tickets or plan for them later",
      "Skip the payment — one late payment doesn't matter",
      "Withdraw cash from the credit card to pay the bill",
    ),
    explanation:
      "Paying the full bill means zero interest and protects your credit score. Paying only the minimum lets the rest grow at 36–45% a year, a missed payment hurts your score, and card cash withdrawals charge interest from day one.",
  },
  questions: [
    {
      prompt: "What does a credit limit represent?",
      explanation: "Your credit limit is the maximum amount you can borrow using the card.",
      hint: "Think about what the bank is limiting. Is it the amount you're required to spend, or the amount you're allowed to borrow?",
      difficulty: "EASY",
      options: choices(
        1,
        "Minimum amount you must spend",
        "Maximum amount you can borrow using the card",
        "Your monthly salary",
        "Your bank balance",
      ),
    },
    {
      prompt: "If you pay your full credit card bill by the due date, how much interest do you pay?",
      explanation:
        "Paying the full statement amount by the due date means no interest at all — the card works like a free short-term loan.",
      hint: "Interest is charged on money you still owe after the due date. If you owe nothing, what's left to charge interest on?",
      difficulty: "EASY",
      options: choices(0, "Zero", "3% of the bill", "18% of the bill", "It depends on where you shopped"),
    },
    {
      prompt: "What happens if you pay only the minimum amount due?",
      explanation:
        "The minimum payment only avoids a late fee. The unpaid balance attracts interest at roughly 36–45% a year.",
      hint: "\"Minimum\" means the least you can pay without a penalty. What happens to the part you didn't pay?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Your bill is fully cleared",
        "You avoid a late fee, but the rest of the bill attracts high interest",
        "Your credit limit doubles",
        "The bank waives the remaining amount",
      ),
    },
    {
      prompt: "What is a billing cycle?",
      explanation:
        "All the spends in a billing cycle — usually about 30 days — are added into one statement, which you pay by the due date.",
      hint: "A \"bill\" plus a \"cycle\" — think about how often your card sends you a bill.",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "The date your card expires",
        "The roughly 30-day period whose spends are added into one bill",
        "How often you can change your card PIN",
        "The time it takes to receive a new card",
      ),
    },
    {
      prompt: "Why is withdrawing cash from a credit card a bad idea?",
      explanation:
        "Cash withdrawals get no interest-free period — interest starts immediately, and banks charge a fee too. It's one of the most expensive ways to borrow.",
      hint: "Normal card purchases get an interest-free period. Does a cash withdrawal get one too?",
      difficulty: "HARD",
      options: choices(
        1,
        "ATMs don't accept credit cards",
        "Interest starts from day one, plus a cash withdrawal fee",
        "It permanently cuts your limit to zero",
        "It's illegal in India",
      ),
    },
  ],
};

const firstSalaryTax: SeedLesson = {
  slug: "first-salary-tax",
  title: "Income Tax for Your First Salary",
  icon: "🧾",
  area: "TAX",
  description: "Read your first payslip — CTC vs in-hand, PF, TDS and the tax regimes for tax year 2026-27.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 10,
  hook: `Your offer letter says ₹6 LPA. That's ₹50,000 a month, right?

Then your first salary arrives: about ₹46,000. Where did the rest go?`,
  learn: `## CTC vs in-hand

**CTC (Cost to Company)** is everything your employer spends on you in a year. Your **in-hand salary** is what actually reaches your bank after deductions. They're never the same.

## What gets deducted

- **EPF (Provident Fund)** — usually 12% of your basic pay goes into your retirement savings, and your employer adds a matching share
- **Professional tax** — a small state tax of up to ₹2,500 a year (about ₹200 a month in states like Maharashtra and Karnataka)
- **TDS (Tax Deducted at Source)** — income tax your employer deducts and pays to the government for you

## Which rules apply?

From **1 April 2026**, the **Income-tax Act, 2025** replaced the 1961 Act. It talks about a **tax year** (April to March) instead of "financial year" and "assessment year", and many section numbers changed. The ideas in this lesson stay the same.

## New vs old tax regime

India has two tax regimes. The **new regime is the default** — lower tax rates, but fewer deductions. The **old regime** has higher rates but lets you claim deductions like rent (HRA) and some investments. Salaried people can choose each year.

## File your ITR

Even when TDS is deducted, file your **Income Tax Return (ITR)** on incometax.gov.in. It's your official income record — useful for loans and visas — and it's how you claim a refund if extra tax was deducted.`,
  keyTerms: [
    { term: "CTC", definition: "Cost to Company — your total yearly package, including parts you never get in hand." },
    { term: "In-hand salary", definition: "What actually reaches your bank account after deductions." },
    { term: "TDS", definition: "Tax Deducted at Source — income tax your employer deducts before paying you." },
    { term: "Tax regime", definition: "The set of tax rules you pick — new (default, lower rates) or old (more deductions)." },
    { term: "ITR", definition: "Income Tax Return — the yearly form where you report your income to the tax department." },
  ],
  example: `**Kavya, 22, Pune** accepts an offer of **₹6 LPA** — ₹50,000 a month on paper. Her first payslip:

- Employer's PF share (part of her CTC): **−₹1,800**
- Her own PF contribution: **−₹1,800**
- Professional tax: **−₹200**
- Income tax (TDS): **₹0** — at her income, the new regime brings it to zero in tax year 2026-27

**In-hand: about ₹46,200.**

**Which of these deductions still belong to Kavya, even though she can't spend them now?**`,
  scenario: {
    prompt:
      "You have two job offers: Company A offers ₹7 LPA CTC and Company B offers ₹6.5 LPA CTC. You want to know which one actually pays more each month. What would you do?",
    options: choices(
      1,
      "Pick Company A — a higher CTC always means a higher in-hand salary",
      "Ask both for a salary breakup and compare the monthly in-hand amounts",
      "Pick whichever offers the bigger joining bonus",
      "Divide each CTC by 12 — that's your monthly salary",
    ),
    explanation:
      "CTC can include bonuses, employer PF, insurance and other parts you never receive monthly. A salary breakup shows what actually reaches your account, so you can compare fairly.",
  },
  questions: [
    {
      prompt: "What's the difference between CTC and in-hand salary?",
      explanation:
        "CTC includes everything your employer spends on you — PF, bonuses, insurance. In-hand is what's left after deductions like PF, professional tax and TDS.",
      hint: "Think about what your employer spends on you versus what actually lands in your account each month.",
      difficulty: "EASY",
      options: choices(
        1,
        "They're always the same",
        "CTC is the total package; in-hand is what reaches your bank after deductions",
        "In-hand is always higher than CTC",
        "CTC only applies to government jobs",
      ),
    },
    {
      prompt: "What does TDS on your salary mean?",
      explanation:
        "TDS (Tax Deducted at Source) is income tax your employer deducts from your salary and deposits with the government on your behalf.",
      hint: "The \"T\" stands for tax. Who deducts it — and is that before or after your salary reaches you?",
      difficulty: "EASY",
      options: choices(
        1,
        "A bonus for good performance",
        "Income tax deducted by your employer before paying you",
        "A fee charged by your bank",
        "A loan from your employer",
      ),
    },
    {
      prompt: "Which tax regime applies by default if you don't choose one?",
      explanation:
        "The new tax regime is the default. You can opt for the old regime if its deductions (like HRA and certain investments) would save you more.",
      hint: "In recent years the government made one regime the default. Is it the older one or the newer one?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "The old regime",
        "The new regime",
        "Neither — you pay no tax until you choose",
        "Whichever your manager prefers",
      ),
    },
    {
      prompt: "Where does the EPF amount deducted from your salary go?",
      explanation:
        "EPF is your money — it builds up in your own Provident Fund account with interest, and your employer adds a matching share.",
      hint: "EPF stands for Employees' Provident Fund. Whose fund is it?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "To the government as tax",
        "Into your own retirement savings account",
        "Into your company's profits",
        "To your bank as a processing fee",
      ),
    },
    {
      prompt:
        "Arjun's CTC is ₹8.4 lakh, which includes a ₹60,000 performance bonus paid once a year. What's his monthly salary before deductions?",
      explanation:
        "Take out the once-a-year bonus first: ₹8.4 lakh − ₹60,000 = ₹7.8 lakh. Split over 12 months, that's ₹65,000 a month before deductions like PF and tax.",
      hint: "The bonus is paid once a year, not every month. What's left of the CTC to split across 12 months?",
      difficulty: "HARD",
      options: choices(1, "₹70,000", "₹65,000", "₹60,000", "₹75,000"),
    },
  ],
};

const stocksFundsFds: SeedLesson = {
  slug: "stocks-mutual-funds-fds",
  title: "Stocks vs Mutual Funds vs FDs",
  icon: "📈",
  area: "INVESTING",
  description: "Before you invest your first salary: how stocks, mutual funds and FDs differ, and the risk behind returns.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 11,
  hook: `Your friend says he doubled his money in a stock in three months. Your parents say only FDs are safe.

Who's right?`,
  learn: `## Stocks

A **stock (share)** is a small piece of ownership in a company. If the company does well, the share's price may rise — if it struggles, the price can fall a lot. Prices move every day.

## Mutual funds

A **mutual fund** pools money from many people and spreads it across many stocks or bonds, managed by professionals. An **index fund** simply copies an index like the **Nifty 50**. Spreading money across many companies is called **diversification**.

## Fixed deposits

An **FD** pays a fixed, known interest rate. Your money is safe (insured up to ₹5 lakh per bank), but returns are modest and may only just beat rising prices.

## Risk and return go together

Higher possible returns always come with higher risk. **No genuine investment can promise high, guaranteed returns** — anyone who does is a red flag. In India, stock markets and mutual funds are regulated by **SEBI**.

## Time matters

Money you'll need within a year or two is usually kept somewhere safe. Stocks and equity funds can swing a lot in the short term, so they're generally suited to goals that are **many years away**.`,
  keyTerms: [
    { term: "Stock (share)", definition: "A small piece of ownership in a company." },
    { term: "Mutual fund", definition: "A pool of money from many investors, spread across many investments by professionals." },
    { term: "Index fund", definition: "A mutual fund that simply copies a market index like the Nifty 50." },
    { term: "Diversification", definition: "Spreading money across many investments so one bad pick doesn't sink everything." },
    { term: "Risk–return trade-off", definition: "Higher possible returns come with a higher chance of losses." },
  ],
  example: `**Ishaan and Tanya, both 22,** each have ₹10,000.

- **Ishaan** buys a single stock a friend hyped on Instagram. It falls **40%** in a month — now **₹6,000**.
- **Tanya** puts hers in an **index fund** that holds 50 large companies. The market dips 5%, so hers is about **₹9,500**.

Neither result is guaranteed to repeat — markets can rise or fall.

**Why did Tanya's money fall so much less than Ishaan's?**`,
  scenario: {
    prompt:
      "A WhatsApp group promises \"guaranteed 5% returns every month\" if you invest through their app, and shares screenshots of members' profits. What would you do?",
    options: choices(
      1,
      "Invest a small amount first to test it",
      "Stay away — no genuine investment guarantees high monthly returns",
      "Invest, since the screenshots prove it works",
      "Invite your friends so you all earn together",
    ),
    explanation:
      "5% a month is over 60% a year — no genuine investment can guarantee that. Screenshots are easy to fake, and \"small test amounts\" often pay out at first to win your trust. Use only SEBI-registered platforms, and report groups like this.",
  },
  questions: [
    {
      prompt: "What does owning a stock mean?",
      explanation:
        "A stock (or share) is a small piece of ownership in a company — its value rises and falls with the company.",
      hint: "The word \"share\" is a clue. A share of what?",
      difficulty: "EASY",
      options: choices(
        1,
        "You've lent money to the government",
        "You own a small part of a company",
        "You've opened a fixed deposit",
        "You work for that company",
      ),
    },
    {
      prompt: "What is diversification?",
      explanation: "Diversification spreads money across many investments, so one bad pick doesn't sink everything.",
      hint: "Think of the saying about not putting all your eggs in one basket.",
      difficulty: "EASY",
      options: choices(
        1,
        "Putting all your money into one great company",
        "Spreading money across many investments",
        "Investing only in FDs",
        "Checking prices every day",
      ),
    },
    {
      prompt: "Which statement about risk and return is true?",
      explanation:
        "Risk and return go together. Investments that can grow more can also fall more — that's the trade-off.",
      hint: "If an investment could go up a lot, what else could it probably do?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "High returns with zero risk are common",
        "Higher possible returns usually come with higher risk",
        "FDs carry the highest risk",
        "Risk has nothing to do with returns",
      ),
    },
    {
      prompt: "What does a Nifty 50 index fund do?",
      explanation: "An index fund mirrors an index — a Nifty 50 index fund holds the 50 companies in the Nifty 50.",
      hint: "The name \"index fund\" suggests it follows something. What would a Nifty 50 index fund follow?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Picks the 5 hottest stocks each month",
        "Copies the 50 companies in the Nifty 50 index",
        "Guarantees a 12% return",
        "Invests only in FDs",
      ),
    },
    {
      prompt:
        "You need ₹50,000 for college fees in 6 months. Which option fits that goal best?",
      explanation:
        "For money needed soon, safety matters more than growth — markets can fall in the short term, and you can't wait for a recovery before the fees are due.",
      hint: "If the investment fell 20% just before the fees were due, what would happen?",
      difficulty: "HARD",
      options: choices(
        2,
        "A single small-company stock, for the biggest gains",
        "An equity fund, because markets always rise within 6 months",
        "A safe option like an FD, because you can't afford a fall before the fees are due",
        "A crypto token a friend recommended",
      ),
    },
  ],
};

const sipsStartingEarly: SeedLesson = {
  slug: "sip-starting-early",
  title: "SIPs and Starting Early",
  icon: "⏳",
  area: "INVESTING",
  description: "See how small monthly SIPs add up — and why starting early beats starting big.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 12,
  hook: `₹3,000 a month is about one weekend out with friends.

What if putting it away at 21 instead of 31 made a difference of over ₹1 crore by the time you're 60?`,
  learn: `## What is a SIP?

A **SIP (Systematic Investment Plan)** invests a fixed amount in a mutual fund every month, automatically. Many funds let you start with as little as **₹100–₹500 a month**.

## Why SIPs work

- **Habit** — the money is invested before you can spend it
- **Rupee cost averaging** — the same amount buys more units when prices are low, and fewer when they're high
- **No timing needed** — you don't have to guess the "right" day to invest

Returns are **not guaranteed** — markets go up and down.

## Why starting early matters

**Compounding** means your returns start earning returns of their own. The longer your money stays invested, the bigger that snowball gets — so **time matters more than the amount**. A small SIP started at 21 can end up bigger than a larger one started at 31.

## Stay invested through the dips

Markets will fall sometimes. Stopping your SIP when prices drop means you miss buying units cheaply. SIPs in equity funds suit goals that are **5+ years away**, so there's time to ride out the dips.

## Protect before you invest

Before starting a SIP, build an **emergency fund** and get **health insurance** — so a hospital bill or a gap between jobs doesn't force you to sell your investments at a bad time.`,
  keyTerms: [
    { term: "SIP", definition: "Systematic Investment Plan — investing a fixed amount in a mutual fund at regular intervals." },
    { term: "Rupee cost averaging", definition: "A fixed amount buys more units when prices are low and fewer when they're high." },
    { term: "Compounding", definition: "Returns earning returns of their own — the longer you stay invested, the faster it grows." },
    { term: "Emergency fund", definition: "Money set aside only for surprises, so you never have to sell investments in a hurry." },
    { term: "Health insurance", definition: "Cover for hospital and medical bills, in exchange for a yearly premium." },
  ],
  example: `**Aisha** starts a SIP of **₹3,000 a month at 21**. **Rohan** starts the same SIP at **31**. Both continue until 60.

Assume **10% a year** — just to show the maths; real returns go up and down and are never guaranteed.

- **Aisha** invests about ₹14 lakh → it could grow to about **₹1.7 crore**
- **Rohan** invests about ₹10.4 lakh → it could grow to about **₹62 lakh**

Aisha put in only ₹3.6 lakh more, but those 10 extra years did most of the work.

**What's the real cost of waiting 10 years to start?**`,
  scenario: {
    prompt:
      "You've just started your first job at ₹35,000 a month and already have ₹40,000 saved for emergencies. You can spare ₹2,000 a month. A colleague says, \"Investing is for later — start after 30, when you earn more.\" What would you do?",
    options: choices(
      1,
      "Wait until 30 — ₹2,000 a month is too small to matter",
      "Start a ₹2,000 monthly SIP now and increase it as your salary grows",
      "Move your whole emergency fund into a single stock instead",
      "Start a SIP, but stop it whenever the market falls",
    ),
    explanation:
      "Small amounts invested early get more years to compound — time matters more than the amount. With an emergency fund already in place, starting small now and raising it later builds the habit. Stopping during market falls means missing out on buying units cheaply.",
  },
  questions: [
    {
      prompt: "What is a SIP?",
      explanation:
        "A SIP (Systematic Investment Plan) invests a fixed amount at regular intervals — usually monthly — into a mutual fund.",
      hint: "The \"S\" stands for Systematic. What does investing systematically look like, month after month?",
      difficulty: "EASY",
      options: choices(
        1,
        "A one-time lump-sum investment",
        "Investing a fixed amount in a mutual fund regularly",
        "A type of bank loan",
        "A tax you pay every month",
      ),
    },
    {
      prompt: "With a fixed monthly SIP, what happens when market prices fall?",
      explanation:
        "That's rupee cost averaging — the same amount buys more units when prices are low and fewer when they're high.",
      hint: "If the price of something drops and you spend the same amount on it, do you get more or less of it?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Your SIP stops automatically",
        "Your fixed amount buys more units",
        "You lose your whole investment",
        "Your fixed amount buys fewer units",
      ),
    },
    {
      prompt:
        "Aisha starts a ₹3,000 monthly SIP at 21. Rohan starts the same SIP at 31. Assuming the same returns, why does Aisha end up with much more at 60?",
      explanation:
        "Both invested the same ₹3,000 a month. Aisha's money simply had 10 extra years to compound — returns earning returns — and that made most of the difference.",
      hint: "Both put in the same amount every month. What's the one thing Aisha had more of?",
      difficulty: "MEDIUM",
      options: choices(
        2,
        "She picked a riskier fund",
        "She invested a much bigger amount each month",
        "Her money had 10 more years to compound",
        "SIP returns are guaranteed for younger investors",
      ),
    },
    {
      prompt: "What should usually come before starting a SIP?",
      explanation:
        "An emergency fund and health insurance protect you from sudden shocks, so you won't have to sell your investments at a bad time to pay a bill.",
      hint: "Imagine a big, sudden expense right after you start investing. What would you want to have in place first?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "Buying a new phone on EMI",
        "An emergency fund and health insurance",
        "A credit card with a high limit",
        "Nothing — invest every rupee right away",
      ),
    },
    {
      prompt:
        "Your SIP's value drops 15% in its second year because the market fell. Your goal is 10 years away. What does this lesson suggest?",
      explanation:
        "With a long goal, short-term falls are normal. Continuing the SIP means your fixed amount buys more units while prices are low — and your emergency fund stays untouched.",
      hint: "Your goal is 10 years away. What happens to the number of units your fixed SIP amount buys when prices are low?",
      difficulty: "HARD",
      options: choices(
        1,
        "Stop the SIP and withdraw everything before it falls further",
        "Keep the SIP going — your fixed amount now buys more units",
        "Move all your money into a savings account for good",
        "Double the SIP using your emergency fund",
      ),
    },
  ],
};

export const LEVEL_1_LESSONS: SeedLesson[] = [
  budgeting,
  compoundInterest,
  savingVsSpending,
  upiPayments,
  financialScams,
  bankAccounts,
  fdRd,
  cibilScore,
  creditCards,
  firstSalaryTax,
  stocksFundsFds,
  sipsStartingEarly,
];
