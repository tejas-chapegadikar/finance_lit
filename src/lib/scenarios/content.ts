import type { ScenarioDef } from "./types";

// Numbers are illustrative, real stipends, card terms and payslips vary.

const STIPEND_ESSENTIALS = 10_000;

const stipend: ScenarioDef = {
  slug: "stipend-15000",
  title: "Manage your internship stipend",
  icon: "🎒",
  area: "BUDGETING",
  minutes: 4,
  lessonSlug: "budgeting-basics",
  summary: "Split an illustrative ₹15,000 stipend between essentials, savings and wants, then see how the month plays out.",
  intro:
    "You've landed a 3-month internship in Bengaluru with a **₹15,000 monthly stipend**. It's your money now: rent, food and everything else.",
  exhibit: {
    kind: "stipend",
    amount: 15_000,
    essentials: [
      { label: "PG rent", amount: 6_000 },
      { label: "Food", amount: 2_500 },
      { label: "Travel", amount: 1_000 },
      { label: "Phone & data", amount: 500 },
    ],
  },
  steps: [
    {
      kind: "allocate",
      prompt: "Plan the month: how much goes to each part of your stipend?",
      total: 15_000,
      increment: 500,
      buckets: [
        { id: "essentials", label: "Essentials", hint: "Rent, food, travel, phone, about ₹10,000", initial: 10_000 },
        { id: "savings", label: "Savings", hint: "Emergency fund and goals", initial: 0 },
        { id: "wants", label: "Wants", hint: "Eating out, shopping, trips", initial: 5_000 },
      ],
      evaluate: ({ essentials = 0, savings = 0, wants = 0 }) => {
        const feedback: string[] = [];
        let points = 0;
        if (essentials >= STIPEND_ESSENTIALS) {
          points += 1;
          feedback.push(`✅ Essentials covered. ₹${essentials.toLocaleString("en-IN")} pays rent, food, travel and your phone.`);
        } else {
          feedback.push(
            `⚠️ Your essentials add up to ₹10,000 but you planned ₹${essentials.toLocaleString("en-IN")}. You'd run short on rent or food mid-month.`,
          );
        }
        if (savings >= 1_500) {
          points += 1;
          feedback.push(
            `✅ ₹${savings.toLocaleString("en-IN")} saved. That's ${Math.round((savings / 15_000) * 100)}% of your stipend set aside for surprises and goals.`,
          );
        } else if (savings > 0) {
          feedback.push(`🟡 You saved ₹${savings.toLocaleString("en-IN")}. Aim for at least 10% (₹1,500) so one surprise doesn't wipe you out.`);
        } else {
          feedback.push("⚠️ Nothing saved. The first unexpected expense would mean borrowing.");
        }
        if (wants > 4_500) {
          feedback.push(`🟡 Wants are ₹${wants.toLocaleString("en-IN")}, more than 30% of your stipend, which squeezes savings.`);
        }
        return { points, feedback };
      },
    },
    {
      kind: "choice",
      prompt: "Day 18: your laptop charger stops working. A new one costs ₹1,500 and you need it for work tomorrow. What do you do?",
      options: [
        {
          text: "Pay from my savings, then top them back up next month",
          points: 2,
          feedback: "That's exactly what savings are for. A planned buffer turns a crisis into a small inconvenience.",
        },
        {
          text: "Borrow from an instant-loan app. It's approved in 5 minutes",
          points: 0,
          feedback:
            "Instant-loan apps can charge very high interest and fees, and some aren't regulated. A ₹1,500 problem can grow quickly.",
        },
        {
          text: "Skip meals for a week to free up the money",
          points: 0,
          feedback: "Cutting essentials hurts your health and your work. This is the situation an emergency fund prevents.",
        },
        {
          text: "Put it on a friend's credit card and pay them back \"sometime\"",
          points: 1,
          feedback: "It solves today's problem, but an open-ended loan from a friend can strain the friendship. Agree on a date at least.",
        },
      ],
    },
    {
      kind: "choice",
      prompt: "Next month you get a ₹2,000 performance bonus. What's the smartest plan?",
      options: [
        {
          text: "Save at least half, and enjoy the rest guilt-free",
          points: 2,
          feedback: "Balanced: your savings grow, and you still enjoy some of what you earned.",
        },
        {
          text: "Spend it all on a weekend trip",
          points: 0,
          feedback: "Fun, but your savings stay where they are, and the charger money still needs replacing.",
        },
        {
          text: "Lend it to a friend who hasn't repaid the last loan",
          points: 0,
          feedback: "Lending money you may not get back is a risk your stipend can't afford.",
        },
        {
          text: "Keep it in your wallet as cash for later",
          points: 1,
          feedback: "Not wasted, but cash in a wallet tends to get spent. Moving it to savings makes it stick.",
        },
      ],
    },
  ],
  takeaway: "Cover essentials first, save something every month, even 10%, and keep wants within what's left.",
};

const creditCardBill: ScenarioDef = {
  slug: "credit-card-bill",
  title: "Handle a credit-card bill",
  icon: "💳",
  area: "CREDIT",
  minutes: 4,
  lessonSlug: "credit-cards-101",
  summary: "Read a real-looking statement, decide what to pay, and see what each choice costs you.",
  intro: "Your first credit-card statement has arrived. You spent on a new laptop bag, groceries and a few online orders.",
  exhibit: {
    kind: "statement",
    bank: "Card ending 4821 · Statement for 21 Sep – 20 Oct",
    rows: [
      { label: "Total amount due", value: "₹12,400", strong: true },
      { label: "Minimum amount due", value: "₹620", strong: true },
      { label: "Payment due date", value: "9 November", strong: true },
      { label: "Credit limit", value: "₹50,000" },
      { label: "Available limit", value: "₹37,600" },
    ],
  },
  steps: [
    {
      kind: "choice",
      prompt: "How much must you pay by 9 November to pay no interest on these purchases?",
      options: [
        {
          text: "₹620, the minimum amount due",
          points: 0,
          feedback: "The minimum only avoids a late fee. Anything unpaid starts getting charged interest.",
        },
        {
          text: "₹12,400, the total amount due",
          points: 2,
          feedback: "Right. Paying the total amount due by the due date means no interest on these purchases.",
        },
        { text: "₹37,600, the available limit", points: 0, feedback: "That's how much more you could borrow, not what you owe." },
        { text: "₹50,000, the credit limit", points: 0, feedback: "The limit is the most you can borrow, not your bill." },
      ],
    },
    {
      kind: "choice",
      prompt: "You have ₹15,000 in your bank account. What will you pay?",
      options: [
        {
          text: "The full ₹12,400 before the due date",
          points: 2,
          feedback:
            "No interest, no late fee, and an on-time payment on your credit report. Setting up autopay for the full amount makes this automatic.",
        },
        {
          text: "Only the ₹620 minimum, I'll keep the cash",
          points: 0,
          feedback:
            "No late fee, but about ₹11,780 is left unpaid. Card interest is often around 3–3.75% a month (roughly 36–45% a year), usually counted from each purchase date, and new purchases can lose their interest-free period. Just an example; check your card's terms.",
        },
        {
          text: "₹5,000 now, the rest next month",
          points: 1,
          feedback: "Better than the minimum, but the unpaid ₹7,400 still attracts high interest until it's cleared.",
        },
        {
          text: "Nothing this month, I'll pay it all next time",
          points: 0,
          feedback: "You'd pay a late fee and interest, and a missed payment goes on your credit report, which can hurt your score.",
        },
      ],
    },
    {
      kind: "multi",
      prompt: "Which habits protect you from costly credit-card bills? Select all that apply.",
      options: [
        { text: "Set up autopay for the full amount due", correct: true },
        { text: "Keep your spending well under your limit, ideally under 30%", correct: true },
        { text: "Pay only the minimum to keep more cash", correct: false },
        { text: "Withdraw cash from the card when you're short", correct: false },
        { text: "Check every statement for charges you don't recognise", correct: true },
      ],
      explanation:
        "Paying in full, keeping utilisation low and checking statements keep cards cheap and your score healthy. Minimum-only payments and cash withdrawals are where interest piles up.",
    },
  ],
  takeaway: "Pay the total amount due by the due date. The minimum due only avoids a late fee. It doesn't avoid interest.",
};

const upiRequest: ScenarioDef = {
  slug: "upi-request",
  title: "Spot a suspicious UPI request",
  icon: "🚨",
  area: "DIGITAL_SAFETY",
  minutes: 3,
  lessonSlug: "upi-digital-payments",
  summary: "A \"cashback\" request and a KYC text land on your phone. Spot the warning signs and respond safely.",
  intro: "It's a busy evening. Two things pop up on your phone within a minute of each other.",
  exhibit: {
    kind: "phone",
    request: {
      from: "Rewards Dept",
      handle: "rewards.dept77@okxyz",
      amount: "₹4,999",
      note: "Congratulations! Cashback won 🎉 Approve & enter UPI PIN to RECEIVE ₹4,999. Expires in 10 min!",
      action: "Collect request",
    },
    sms: {
      from: "VK-ALERTS",
      body: "Dear customer, your KYC is pending. Your account will be BLOCKED today. Update now: bit.ly/kyc-upd8",
    },
  },
  steps: [
    {
      kind: "multi",
      prompt: "Which warning signs can you spot in the UPI request? Select all that apply.",
      options: [
        { text: "It asks for your UPI PIN to \"receive\" money", correct: true },
        { text: "It's from an unknown ID, not a company you deal with", correct: true },
        { text: "It rushes you with a 10-minute deadline", correct: true },
        { text: "It's a collect request. Approving it pays them", correct: true },
        { text: "It arrived in the evening", correct: false },
      ],
      explanation:
        "A PIN is only ever needed to pay. Unknown senders, urgent deadlines and collect requests dressed up as \"cashback\" are classic scam signs. The time of day tells you nothing.",
    },
    {
      kind: "choice",
      prompt: "What do you do with the collect request?",
      options: [
        {
          text: "Decline it and block the sender",
          points: 2,
          feedback: "Safe. Declining costs you nothing. Approving would have sent ₹4,999 out of your account.",
        },
        {
          text: "Approve it, free cashback!",
          points: 0,
          feedback: "Approving a collect request with your PIN pays the sender. ₹4,999 would leave your account.",
        },
        {
          text: "Approve it but type a wrong PIN, just to see",
          points: 0,
          feedback: "Never play along with a scam request. Just decline. Repeated wrong PINs can also lock your UPI.",
        },
        {
          text: "Message the sender to ask if it's genuine",
          points: 0,
          feedback: "Scammers will happily say yes. Engaging only gives them a chance to pressure you.",
        },
      ],
    },
    {
      kind: "choice",
      prompt: "The SMS says your KYC is pending. What's the safest move?",
      options: [
        {
          text: "Ignore the link, check KYC only in my bank's official app or branch, and report the SMS",
          points: 2,
          feedback:
            "Exactly. Banks don't block accounts through SMS links. You can report suspected fraud messages on Sanchar Saathi, and if you ever lose money, call 1930 or use cybercrime.gov.in right away.",
        },
        {
          text: "Tap the link. It's quicker",
          points: 0,
          feedback: "Shortened links in urgent messages often lead to fake bank pages that steal your details.",
        },
        {
          text: "Call the number that texts me back",
          points: 0,
          feedback: "Numbers from a scam message lead to scammers. Use only the contact details in your bank's official app or website.",
        },
        {
          text: "Forward it to friends to warn them",
          points: 1,
          feedback: "Kind, but forwarding spreads the link. Report it instead, and warn friends without sharing the link.",
        },
      ],
    },
  ],
  takeaway: "You never need your UPI PIN to receive money. Decline unknown collect requests, and never act on urgent links.",
};

const firstSalary: ScenarioDef = {
  slug: "first-salary-slip",
  title: "Understand your first salary",
  icon: "💼",
  area: "TAX",
  minutes: 4,
  lessonSlug: "first-salary-tax",
  summary: "Read an illustrative first payslip: CTC, gross pay, deductions and what actually reaches your bank.",
  intro:
    "Neha's offer letter says **₹6 LPA CTC**. Her first payslip has just arrived. Numbers are just examples. Real deductions depend on your employer, state and tax choices.",
  exhibit: {
    kind: "payslip",
    employee: "Neha, Junior Analyst · Tax year 2026-27, new regime",
    ctc: "₹6,00,000 a year",
    earnings: [
      { label: "Basic pay", value: "₹20,000" },
      { label: "House rent allowance (HRA)", value: "₹8,000" },
      { label: "Special allowance", value: "₹18,000" },
    ],
    deductions: [
      { label: "Employee PF (12% of basic)", value: "₹2,400" },
      { label: "Professional tax", value: "₹200" },
      { label: "Income tax (TDS)", value: "₹0" },
    ],
    net: "₹43,400",
    outsideMonthly: [
      { label: "Employer's PF contribution", value: "₹28,800 a year" },
      { label: "Gratuity and insurance", value: "₹19,200 a year" },
    ],
  },
  steps: [
    {
      kind: "choice",
      prompt: "What is Neha's gross monthly salary?",
      options: [
        { text: "₹50,000: CTC divided by 12", points: 0, feedback: "CTC ÷ 12 includes parts she never receives monthly, like her employer's PF." },
        { text: "₹46,000", points: 2, feedback: "Right: basic ₹20,000 + HRA ₹8,000 + special allowance ₹18,000 = ₹46,000 before deductions." },
        { text: "₹43,400", points: 0, feedback: "That's her take-home, after deductions. Gross is before deductions." },
        { text: "₹48,400", points: 0, feedback: "Add up the three earnings lines: basic, HRA and special allowance." },
      ],
    },
    {
      kind: "choice",
      prompt: "How much reaches her bank account this month?",
      options: [
        {
          text: "₹43,400",
          points: 2,
          feedback: "Yes, ₹46,000 gross minus ₹2,400 PF and ₹200 professional tax. TDS is ₹0 at her income under the new regime.",
        },
        { text: "₹46,000", points: 0, feedback: "That's gross pay. PF and professional tax come out before it reaches her." },
        { text: "₹50,000", points: 0, feedback: "CTC ÷ 12 is never what lands in your account." },
        { text: "₹40,000", points: 0, feedback: "Too low. Only ₹2,600 is deducted from her ₹46,000 gross." },
      ],
    },
    {
      kind: "multi",
      prompt: "Which parts of her CTC does she NOT receive in her monthly salary? Select all that apply.",
      options: [
        { text: "Employer's PF contribution", correct: true },
        { text: "Gratuity and insurance", correct: true },
        { text: "Basic pay", correct: false },
        { text: "House rent allowance", correct: false },
      ],
      explanation:
        "Her employer's PF share goes into her PF account, and gratuity and insurance are benefits. All part of CTC, none paid out monthly. Basic and HRA are in her monthly pay.",
    },
    {
      kind: "choice",
      prompt: "A friend has the same ₹6 LPA CTC at another company but a lower take-home. Why could that be?",
      options: [
        {
          text: "Their salary is structured differently, e.g. more variable pay or benefits, or different deductions",
          points: 2,
          feedback:
            "Exactly. Two offers with the same CTC can pay very different monthly amounts. Always ask for the salary breakup and compare in-hand pay.",
        },
        { text: "One of them must be calculating wrong", points: 0, feedback: "Both can be right: CTC alone doesn't fix the monthly amount." },
        { text: "CTC means different things in different cities", points: 0, feedback: "CTC means the same thing everywhere; what differs is how it's split." },
        { text: "Take-home is always the same for the same CTC", points: 0, feedback: "Deductions and salary structure vary, so take-home varies too." },
      ],
    },
  ],
  takeaway: "CTC isn't your salary. Compare offers by in-hand pay, and read every line of your payslip.",
};

const noCostEmi: ScenarioDef = {
  slug: "no-cost-emi",
  title: "The \"no-cost\" EMI offer",
  icon: "📱",
  area: "BUDGETING",
  minutes: 3,
  bonus: true,
  lessonSlug: "saving-vs-spending",
  summary: "A ₹24,000 phone on \"no-cost\" EMI. Work out the real cost and whether it fits your stipend.",
  intro: "Your phone is two years old and a shopping app is showing you a tempting offer. Your stipend is ₹15,000 and essentials take ₹10,000.",
  exhibit: {
    kind: "note",
    title: "Phone offer",
    lines: [
      { label: "Price", value: "₹24,000" },
      { label: "No-cost EMI", value: "₹4,000 × 6 months" },
      { label: "Processing fee", value: "₹199 + 18% GST" },
      { label: "Pay in full instead", value: "₹1,000 instant discount" },
    ],
  },
  steps: [
    {
      kind: "choice",
      prompt: "What does the phone really cost on EMI?",
      options: [
        { text: "₹24,000. It's no-cost", points: 0, feedback: "\"No-cost\" EMIs often still carry a processing fee and GST." },
        {
          text: "About ₹24,235",
          points: 2,
          feedback: "Right: ₹24,000 + ₹199 fee + about ₹36 GST. And you'd give up the ₹1,000 discount for paying in full, so it's ₹1,235 more than paying upfront.",
        },
        { text: "₹23,000", points: 0, feedback: "That's the price if you pay in full with the discount, not on EMI." },
        { text: "₹28,000", points: 0, feedback: "Too high. Check the six instalments plus the fee and GST." },
      ],
    },
    {
      kind: "choice",
      prompt: "With ₹15,000 coming in and ₹10,000 of essentials, should you take the 6-month EMI?",
      options: [
        {
          text: "No, ₹4,000 a month would leave just ₹1,000 for savings and everything else",
          points: 2,
          feedback: "Sensible. An EMI that eats almost all your spare money leaves no room for surprises.",
        },
        { text: "Yes. It's no-cost, so why not", points: 0, feedback: "The cost isn't only the fee. It's six months of almost no breathing room." },
        { text: "Yes, and add a laptop EMI too", points: 0, feedback: "Stacking EMIs on a stipend is how small debts become stressful ones." },
        {
          text: "Save for a few months and buy it with the discount instead",
          points: 2,
          feedback: "Great plan. You pay less and owe nothing.",
        },
      ],
    },
    {
      kind: "multi",
      prompt: "Before taking any EMI, what should you check? Select all that apply.",
      options: [
        { text: "The total cost including fees and GST", correct: true },
        { text: "Whether you lose a discount for paying upfront", correct: true },
        { text: "Whether the monthly amount fits your budget", correct: true },
        { text: "The colour options of the product", correct: false },
      ],
      explanation: "Total cost, lost discounts and monthly affordability decide whether an EMI makes sense. The colour doesn't change the maths!",
    },
  ],
  takeaway: "\"No-cost\" EMI can still cost you, in fees, lost discounts and a tighter budget for months.",
};

const emergency: ScenarioDef = {
  slug: "emergency-8000",
  title: "An ₹8,000 emergency",
  icon: "🚑",
  area: "BUDGETING",
  minutes: 3,
  bonus: true,
  lessonSlug: "saving-vs-spending",
  summary: "A sudden medical bill. Choose how to pay for it without falling into expensive debt.",
  intro: "Your mother needs a medical test tomorrow that costs ₹8,000. Here's what you have to work with.",
  exhibit: {
    kind: "note",
    title: "Your options",
    lines: [
      { label: "Emergency fund", value: "₹5,000" },
      { label: "Credit card (paid in full each month)", value: "₹20,000 limit" },
      { label: "Instant-loan app", value: "\"₹10,000 in 5 minutes\"" },
      { label: "Family", value: "Could lend some, if asked" },
    ],
  },
  steps: [
    {
      kind: "choice",
      prompt: "Where should the first ₹5,000 come from?",
      options: [
        { text: "My emergency fund. This is exactly what it's for", points: 2, feedback: "Yes. Using your emergency fund avoids interest entirely." },
        {
          text: "The instant-loan app",
          points: 0,
          feedback: "Instant-loan apps can charge very high interest and fees, and some misuse your data. Use your own savings first.",
        },
        {
          text: "A cash withdrawal on my credit card",
          points: 0,
          feedback: "Card cash withdrawals carry a fee and interest from day one. It's the costliest way to use a card.",
        },
        { text: "Skip the test", points: 0, feedback: "Health comes first, and you have better options than skipping it." },
      ],
    },
    {
      kind: "choice",
      prompt: "You still need ₹3,000. What's the best way to cover it?",
      options: [
        {
          text: "Pay the hospital by credit card (as a purchase) and repay it in full by the due date",
          points: 2,
          feedback: "Good: a card purchase repaid in full by the due date costs no interest.",
        },
        {
          text: "Borrow from family and agree on when you'll pay it back",
          points: 2,
          feedback: "Also good. A clear repayment date keeps it fair and stress-free.",
        },
        { text: "Withdraw ₹3,000 cash from the credit card", points: 0, feedback: "Cash withdrawals cost a fee plus interest from day one." },
        { text: "Take the instant loan. It's only ₹3,000", points: 0, feedback: "Small instant loans can carry very high effective interest. Avoid them." },
      ],
    },
    {
      kind: "choice",
      prompt: "The emergency is over. What should you do next month?",
      options: [
        { text: "Rebuild my emergency fund before spending on wants", points: 2, feedback: "Exactly. Refill the buffer so you're ready for the next surprise." },
        { text: "Go back to spending as usual", points: 0, feedback: "Without rebuilding it, the next emergency would hit with no buffer." },
        { text: "Celebrate with a shopping trip", points: 0, feedback: "Understandable, but your emergency fund comes first." },
        { text: "Take a loan to refill the fund quickly", points: 0, feedback: "Borrowing to save just moves the problem. Rebuild it from your income." },
      ],
    },
  ],
  takeaway: "Emergency fund first, card purchases repaid in full second, and never instant-loan apps or card cash withdrawals.",
};

export const SCENARIOS: ScenarioDef[] = [stipend, creditCardBill, upiRequest, firstSalary, noCostEmi, emergency];

export const SCENARIO_XP = 50;
