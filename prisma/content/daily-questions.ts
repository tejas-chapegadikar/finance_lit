import { choices, type SeedDailyQuestion } from "./types";

// The Question of the Day pool. Each student gets one a day — a fresh one they
// haven't answered, preferring their latest lesson's topic, then this order. Areas
// are interleaved so back-to-back days feel different.
export const DAILY_QUESTIONS: SeedDailyQuestion[] = [
  {
    key: "upi-pin-to-receive",
    area: "DIGITAL_SAFETY",
    prompt:
      "Someone sends you a UPI payment request asking you to enter your UPI PIN to receive ₹5,000. What do you do?",
    options: choices(
      1,
      "Enter your PIN to get the money",
      "Decline it — a PIN is never needed to receive money",
      "Ask them to send ₹1 first to check",
      "Approve it, and ask for a refund if something goes wrong",
    ),
    explanation:
      "Your UPI PIN only ever sends money out. A request that needs your PIN to \"receive\" money is a scam — decline it and block the sender.",
  },
  {
    key: "pay-yourself-first",
    area: "BUDGETING",
    prompt:
      "You earn ₹25,000/month. Your rent + food + transport costs ₹17,000. How much should you ideally consider setting aside before spending the rest?",
    options: choices(
      1,
      "Nothing yet — save whatever is left at the end of the month",
      "About ₹5,000 (20%), as soon as your salary arrives",
      "₹500 — anything more isn't realistic",
      "Skip saving until you earn more",
    ),
    explanation:
      "Pay yourself first. Moving about 20% (₹5,000) aside on payday makes saving automatic, and you still have ₹3,000 for wants. \"Whatever is left\" usually turns out to be nothing.",
  },
  {
    key: "minimum-due",
    area: "CREDIT",
    prompt:
      "Your credit card bill is ₹10,000 and the minimum due is ₹500. You can afford to pay all of it. What's the smartest move?",
    options: choices(
      1,
      "Pay ₹500 — the bank says that's enough",
      "Pay the full ₹10,000 by the due date",
      "Pay ₹5,000 now and the rest whenever you can",
      "Skip this month and pay double next month",
    ),
    explanation:
      "Paying in full means zero interest. The minimum only avoids a late fee — the remaining ₹9,500 would attract interest of around 3–4% a month.",
  },
  {
    key: "average-monthly-balance",
    area: "BANKING",
    prompt:
      "Your account needs a ₹3,000 average monthly balance. In a 30-day month you keep ₹9,000 for the first 10 days, then ₹0. Will you be charged?",
    options: choices(
      1,
      "Yes — your balance dropped to ₹0",
      "No — your average works out to exactly ₹3,000",
      "Yes — you need ₹3,000 in the account every single day",
      "No — banks never charge for low balances",
    ),
    explanation:
      "Average monthly balance = (₹9,000 × 10 days) ÷ 30 days = ₹3,000. It's the average across the month that counts, not your lowest day.",
  },
  {
    key: "fake-delivery-sms",
    area: "DIGITAL_SAFETY",
    prompt:
      "You get an SMS: \"Your parcel is on hold. Pay ₹25 to reschedule delivery: bit.ly/xyz\". You are expecting a parcel. What do you do?",
    options: choices(
      1,
      "Pay the ₹25 — it's a tiny amount",
      "Ignore the link and check the order in the official app or website",
      "Reply with your address to confirm",
      "Call the number mentioned in the SMS",
    ),
    explanation:
      "Fake delivery messages use small amounts to get you to enter card or UPI details on a fake page. Always check deliveries in the official app — never through SMS links.",
  },
  {
    key: "ctc-vs-in-hand",
    area: "TAX",
    prompt: "Your offer letter says ₹4.8 LPA CTC. What's the best way to know your monthly in-hand salary?",
    options: choices(
      1,
      "Divide ₹4.8 lakh by 12 — it's ₹40,000",
      "Ask HR for the salary breakup and check the deductions",
      "Assume in-hand will be higher than CTC",
      "There's no way to know until your first payslip",
    ),
    explanation:
      "CTC includes employer PF and other parts that never reach your account. The breakup shows deductions like PF, professional tax and TDS, so you know your real in-hand pay.",
  },
  {
    key: "double-in-30-days",
    area: "INVESTING",
    prompt: "An Instagram \"trader\" offers to double your money in 30 days, guaranteed. What's the reality?",
    options: choices(
      1,
      "It's possible if they're an expert",
      "No genuine investment can guarantee that — it's a red flag",
      "It's fine if they have lots of followers",
      "It's safe if they share profit screenshots",
    ),
    explanation:
      "Guaranteed high returns are a classic sign of a scam. Real investments carry risk, and nobody can promise to double your money. Followers and screenshots are easy to fake.",
  },
  {
    key: "subscription-audit",
    area: "BUDGETING",
    prompt:
      "You pay for two OTT apps (₹199 and ₹149), a music app (₹119) and a ₹999 gym membership you've used once in two months. What's the smartest first move?",
    options: choices(
      1,
      "Keep everything — they're all small amounts",
      "Cancel the gym membership you're not using",
      "Cancel the music app because it's the cheapest",
      "Switch all of them to yearly plans",
    ),
    explanation:
      "Start with the biggest leak: ₹999 a month on something you barely use is about ₹12,000 a year. Review your subscriptions every few months.",
  },
  {
    key: "credit-utilisation",
    area: "CREDIT",
    prompt: "Your credit limit is ₹50,000. Which monthly balance is healthiest for your credit score?",
    options: choices(2, "₹48,000", "₹35,000", "₹12,000", "₹50,000"),
    explanation:
      "Keeping usage under 30% of your limit (₹15,000 here) is a healthy habit — ₹12,000 is 24%. High utilisation can pull your score down even when you pay on time.",
  },
  {
    key: "break-fd-early",
    area: "BANKING",
    prompt:
      "You put ₹20,000 in a 1-year FD. After 4 months you need ₹5,000 urgently. What usually happens if you break the FD?",
    options: choices(
      1,
      "You lose all ₹20,000",
      "You get your money back with slightly lower interest",
      "The bank refuses until the year ends",
      "You earn bonus interest for withdrawing early",
    ),
    explanation:
      "Banks allow premature withdrawal but usually pay a slightly lower rate. That's why emergency money belongs in savings, not locked in an FD.",
  },
  {
    key: "qr-to-receive",
    area: "DIGITAL_SAFETY",
    prompt:
      "You're selling a table online. The buyer sends you a QR code and says, \"Scan this to receive ₹3,000.\" What's going on?",
    options: choices(
      1,
      "It's a quick way to get paid",
      "It's a scam — scanning a QR code makes you pay, not receive",
      "You need to scan it twice to confirm the payment",
      "It's safe if the app shows the buyer's name",
    ),
    explanation:
      "Scanning a QR code sends money out of your account. To receive money you only share your UPI ID or your own QR — you never scan theirs or enter a PIN.",
  },
  {
    key: "one-stock-basket",
    area: "INVESTING",
    prompt:
      "Your friend puts all ₹20,000 of their savings into one company's stock after a YouTube tip. What's the biggest risk?",
    options: choices(
      1,
      "None — one good company is enough",
      "If that one company falls, all their savings fall with it",
      "They'll pay too little tax",
      "The stock will be too easy to sell",
    ),
    explanation:
      "With everything in one stock, a single piece of bad news can hit all your savings. Diversification spreads that risk across many investments.",
  },
  {
    key: "laptop-repair",
    area: "BUDGETING",
    prompt: "Your laptop suddenly needs a ₹6,000 repair. Which is the best way to pay for it?",
    options: choices(
      0,
      "Your emergency fund",
      "Your credit card, paying only the minimum for months",
      "An instant loan app",
      "Borrow from a friend without saying when you'll repay",
    ),
    explanation:
      "This is exactly what an emergency fund is for. Card minimums and instant loan apps can charge very high interest, turning a ₹6,000 problem into a bigger one.",
  },
  {
    key: "buy-now-pay-later",
    area: "CREDIT",
    prompt: "A shopping app offers \"Buy Now, Pay Later\" on ₹3,000 shoes. What should you know before using it?",
    options: choices(
      1,
      "It's free money that never needs repaying",
      "It's a loan — missing a payment can mean fees and a lower credit score",
      "It always improves your credit score",
      "It only works if you have a credit card",
    ),
    explanation:
      "Buy Now, Pay Later is credit. Pay on time and it's like a short loan; miss a payment and you could face late fees and damage to your credit score.",
  },
  {
    key: "otp-to-stop-fraud",
    area: "DIGITAL_SAFETY",
    prompt:
      "A caller says they're from your bank and need the OTP you just received to \"stop a suspicious transaction\". What do you do?",
    options: choices(
      1,
      "Share it quickly to stop the fraud",
      "Hang up — banks never ask for OTPs — and call your bank's official number",
      "Share only the first three digits",
      "Ask them to confirm your name first, then share it",
    ),
    explanation:
      "The caller is the fraud — your OTP would approve their transaction. Banks never ask for OTPs. Hang up and contact your bank through official channels.",
  },
  {
    key: "tds-refund",
    area: "TAX",
    prompt: "Your employer deducted more TDS this year than your actual tax. How do you get the extra back?",
    options: choices(
      1,
      "Ask your employer to return it in cash",
      "File your Income Tax Return (ITR) and claim the refund",
      "It comes back automatically without you doing anything",
      "You can't — extra tax is gone for good",
    ),
    explanation:
      "Filing your ITR on incometax.gov.in is how you claim a refund of extra tax deducted. It also builds your official income record.",
  },
  {
    key: "add-a-nominee",
    area: "BANKING",
    prompt: "Why should you add a nominee to your bank account?",
    options: choices(
      1,
      "So they can use your account anytime",
      "So your money reaches the right person easily if something happens to you",
      "It increases your interest rate",
      "Banks charge lower fees on accounts with nominees",
    ),
    explanation:
      "A nominee receives your deposits if you pass away, saving your family a long legal process. It takes a couple of minutes in most banking apps.",
  },
  {
    key: "sip-market-dip",
    area: "INVESTING",
    prompt: "The market falls 10% and your SIP shows a loss. What does the fall mean for your next SIP instalment?",
    options: choices(
      0,
      "The same amount buys more units",
      "The same amount buys fewer units",
      "Your SIP gets cancelled automatically",
      "You must pay extra to cover the loss",
    ),
    explanation:
      "With a fixed SIP amount, lower prices mean more units — that's rupee cost averaging. Short-term ups and downs are a normal part of markets.",
  },
  {
    key: "raise-lifestyle-creep",
    area: "BUDGETING",
    prompt: "You get a ₹5,000 monthly raise. Which plan helps you avoid lifestyle creep?",
    options: choices(
      1,
      "Upgrade your phone plan and order in more often",
      "Add at least part of the raise to your monthly savings",
      "Save the same as before and spend the whole raise",
      "Take an EMI on a new bike straight away",
    ),
    explanation:
      "Lifestyle creep is spending rising with income. Sending part of every raise to savings lets you enjoy some of it while your savings grow too.",
  },
  {
    key: "check-own-score",
    area: "CREDIT",
    prompt: "You check your own CIBIL score three times this month. What happens to your score?",
    options: choices(
      1,
      "It drops a little every time",
      "Nothing — checking your own score doesn't affect it",
      "It rises because you're being responsible",
      "Your credit card gets blocked",
    ),
    explanation:
      "Checking your own score is a soft enquiry and doesn't change it. Only lenders' checks when you apply for a loan or card can.",
  },
  {
    key: "job-registration-fee",
    area: "DIGITAL_SAFETY",
    prompt:
      "You're offered a work-from-home data-entry job paying ₹25,000 a month — but first you must pay a ₹1,999 \"registration fee\". What's the best move?",
    options: choices(
      1,
      "Pay — it's small compared to the salary",
      "Refuse — real employers don't charge you to get hired",
      "Pay half now and half after your first salary",
      "Pay, but ask for a receipt",
    ),
    explanation:
      "Genuine employers pay you — they don't charge registration or \"training\" fees. Upfront fees for jobs are one of the most common scams.",
  },
];
