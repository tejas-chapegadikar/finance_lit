import { choices, type SeedDailyQuestion } from "./types";

// The Daily Money Reality Check pool (stored as DailyQuestion rows). Each
// student gets one a day, a fresh one they haven't answered, preferring their
// latest lesson's topic, then this order. Areas are interleaved so back-to-back
// days feel different.
//
// The no-repeats rule: every question here teaches something NO lesson quiz or
// practice question already asks, a new concept, or a genuinely new decision.
// `npm test` (src/lib/content/catalog.test.ts) fails if one starts to overlap.
// Retired keys are hidden by the seed, not deleted, so past answers survive.
export const DAILY_QUESTIONS: SeedDailyQuestion[] = [
  {
    key: "windfall-2000",
    area: "BUDGETING",
    prompt: "You unexpectedly receive ₹2,000, a cashback, a gift, a refund. What happens next?",
    options: choices(
      0,
      "Give it a job before it disappears: a small treat, the rest straight into savings",
      "Spend it tonight. It was never “really” yours",
      "Lend it to the friend who still owes you from last semester",
      "Nothing. Somehow, it's already gone.",
    ),
    explanation:
      "Unplanned money vanishes fastest because it has no plan. A simple windfall rule, say, 20% to enjoy, 80% to savings or a goal, lets you celebrate and still keep most of it.",
  },
  {
    key: "fake-delivery-sms",
    area: "DIGITAL_SAFETY",
    prompt:
      "You get an SMS: \"Your parcel is on hold. Pay ₹25 to reschedule delivery: bit.ly/xyz\". You are expecting a parcel. What do you do?",
    options: choices(
      1,
      "Pay the ₹25. It's a tiny amount",
      "Ignore the link and check the order in the official app or website",
      "Reply with your address to confirm",
      "Call the number mentioned in the SMS",
    ),
    explanation:
      "Fake delivery messages use small amounts to get you to enter card or UPI details on a fake page. Always check deliveries in the official app. Never through SMS links.",
  },
  {
    key: "add-on-card",
    area: "CREDIT",
    prompt: "Your parent offers you an add-on card on their credit card. Freedom! Does it build your own credit history?",
    options: choices(
      2,
      "Yes. It's exactly like having your own card",
      "Yes, and it doubles their limit",
      "Not really. It shares their limit, and the bill and credit history are theirs",
      "No, and add-on cards are illegal for students",
    ),
    explanation:
      "An add-on card spends from the main cardholder's limit, and the bill is theirs. It's handy, but it usually doesn't build a credit history in your name, and every swipe lands on their statement.",
  },
  {
    key: "unit-price",
    area: "BUDGETING",
    prompt: "Coffee powder: 100 g for ₹180, or 200 g for ₹380 on “mega saver” offer. Which is cheaper per gram?",
    options: choices(
      0,
      "The 100 g pack, ₹1.80 a gram vs ₹1.90",
      "The 200 g pack. It says mega saver",
      "They're exactly the same",
      "Whichever has the shinier packaging",
    ),
    explanation:
      "Bigger isn't always cheaper. Divide price by quantity: ₹180 ÷ 100 = ₹1.80 a gram; ₹380 ÷ 200 = ₹1.90 a gram. Many shelf labels show this “unit price”. It's worth a glance.",
  },
  {
    key: "pan-aadhaar-link",
    area: "TAX",
    prompt: "You've had a PAN card for years but never linked it to your Aadhaar. Does it matter?",
    options: choices(
      1,
      "No, linking is optional and changes nothing",
      "Yes, an unlinked PAN can become inoperative, blocking things like refunds and investing",
      "Only if you earn over ₹1 crore",
      "Only for people living abroad",
    ),
    explanation:
      "The Income Tax Department requires most PAN holders to link their PAN with Aadhaar. An unlinked PAN can become inoperative, which can block refunds and many financial transactions. You can check and link it on incometax.gov.in (a fee applies now).",
  },
  {
    key: "split-bill",
    area: "BUDGETING",
    prompt: "Every group dinner, one friend says “I'll send my share later.” Later never comes. The least awkward fix?",
    options: choices(
      3,
      "Pay for everyone forever and quietly resent it",
      "Stop going out with friends",
      "Post about it in the group chat",
      "Split the bill on the spot, on UPI or a bill-splitting app, before anyone leaves",
    ),
    explanation:
      "Small unsettled shares add up into real money and real awkwardness. Settling before you leave the table, or tracking it in a split app, keeps both your wallet and your friendships intact.",
  },
  {
    key: "dividend",
    area: "INVESTING",
    prompt: "A company you own shares in announces a ₹5-per-share dividend. What is that?",
    options: choices(
      2,
      "A guaranteed yearly payment, forever",
      "A fee you pay the company",
      "A share of profits the company chose to pay out, not guaranteed, and taxable",
      "A sign the share price can never fall",
    ),
    explanation:
      "A dividend is part of a company's profit paid to shareholders. Companies can raise, cut or skip dividends, and dividend income is taxable in your hands.",
  },
  {
    key: "buy-now-pay-later",
    area: "CREDIT",
    prompt: "A shopping app offers \"Buy Now, Pay Later\" on ₹3,000 shoes. What should you know before using it?",
    options: choices(
      1,
      "It's free money that never needs repaying",
      "It's a loan, missing a payment can mean fees and a lower credit score",
      "It always improves your credit score",
      "It only works if you have a credit card",
    ),
    explanation:
      "Buy Now, Pay Later is credit. Pay on time and it's like a short loan; miss a payment and you could face late fees and damage to your credit score.",
  },
  {
    key: "wrong-upi-transfer",
    area: "DIGITAL_SAFETY",
    prompt: "Oops. You sent ₹1,200 to the wrong UPI ID, one typo. What's the best first move?",
    options: choices(
      0,
      "Raise a complaint in your UPI app or with your bank right away, with the transaction ID",
      "Send another ₹1,200 to the right person and forget it",
      "Message random people with similar names",
      "Wait a month to see if it comes back by itself",
    ),
    explanation:
      "Report it quickly through your UPI app's help section or your bank, quoting the transaction ID. Recovery isn't guaranteed, it often needs the receiver's cooperation, but acting fast gives you the best chance. Double-check the name shown before you hit Pay.",
  },
  {
    key: "sinking-fund",
    area: "BUDGETING",
    prompt: "Every year, Diwali gifts and three birthdays wreck your November budget. What's the fix?",
    options: choices(
      2,
      "Skip all festivals",
      "Borrow from friends every November",
      "Save a small amount each month in advance, so the money's there when November arrives",
      "Buy gifts on EMI",
    ),
    explanation:
      "Expenses you know are coming aren't emergencies. A “sinking fund”, say ₹500 a month set aside from January, turns a November shock into a planned spend.",
  },
  {
    key: "gift-tax",
    area: "TAX",
    prompt: "Your grandparents gift you ₹60,000 for your birthday. Do you pay income tax on it?",
    options: choices(
      1,
      "Yes, every gift over ₹10,000 is taxed",
      "No, gifts from close relatives like grandparents are tax-free",
      "Only if you spend it",
      "Yes, at 50%",
    ),
    explanation:
      "Gifts from specified relatives, parents, grandparents, siblings and others, aren't taxed. Gifts from non-relatives become taxable if they total more than ₹50,000 in a year.",
  },
  {
    key: "nav-myth",
    area: "INVESTING",
    prompt: "Fund A's NAV is ₹15. Fund B's NAV is ₹350. Your friend says Fund A is “cheaper, so it'll grow more.” True?",
    options: choices(
      3,
      "Yes, low-NAV funds always grow faster",
      "Yes. You get more units, so more profit",
      "No, high-NAV funds are always better",
      "No, a lower NAV isn't cheaper; growth depends on how the fund's investments perform, in percentages",
    ),
    explanation:
      "NAV is just the price of one unit. ₹1,000 buys more units of a ₹15 fund, but if both funds rise 10%, both investments rise 10%. What matters is what the fund holds and costs, not the NAV.",
  },
  {
    key: "pg-deposit",
    area: "BANKING",
    prompt: "You're moving into a PG and paying a ₹20,000 security deposit. What protects you most when you move out?",
    options: choices(
      0,
      "A written agreement, a payment receipt, and photos of the room on day one",
      "A verbal promise from the owner",
      "Paying in cash so it's simpler",
      "Trusting that deposits always come back",
    ),
    explanation:
      "Deposit disputes are usually about proof. A written agreement with the deposit terms, a receipt (or a bank/UPI record) and move-in photos make it much harder for anyone to deduct unfairly.",
  },
  {
    key: "fake-friend-upi",
    area: "DIGITAL_SAFETY",
    prompt: "A message from a new number: “Bro it's me, lost my phone, send ₹2,000 on UPI urgently, will return tomorrow.” What do you do?",
    options: choices(
      1,
      "Send it, friends help friends",
      "Call your friend on their usual number to check first",
      "Send half, just in case",
      "Ask them for their UPI PIN to prove it's them",
    ),
    explanation:
      "Impersonation scams lean on urgency and a “new number”. Verify through a channel you already trust, your friend's usual number, before sending anything.",
  },
  {
    key: "opportunity-cost",
    area: "BUDGETING",
    prompt: "Concert tickets cost ₹3,000, exactly what you'd saved for a new phone case, earphones and a month of chai. What's the real price of the tickets?",
    options: choices(
      2,
      "₹3,000, nothing else",
      "Zero, if you pay by UPI",
      "₹3,000 plus everything else that money can no longer buy",
      "It depends on the seat colour",
    ),
    explanation:
      "Every rupee spent is a rupee that can't do something else. That's opportunity cost. The concert might still be worth it! Just compare it with what you're giving up, not with zero.",
  },
  {
    key: "extended-warranty",
    area: "BUDGETING",
    prompt: "At checkout, a ₹15,000 phone comes with a pop-up: “Add 2-year extended warranty for ₹1,999?” What should you check first?",
    options: choices(
      1,
      "Nothing. Always add it, just in case",
      "What it covers that the free manufacturer warranty doesn't, and what it excludes",
      "Whether the pop-up has a timer",
      "How many stars the pop-up has",
    ),
    explanation:
      "Add-ons at checkout are designed for quick yeses. Often the first year is already covered, and accidental damage may be excluded. ₹1,999 is 13% of the phone, worth it only if it covers what you're actually worried about.",
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
      "You can't, extra tax is gone for good",
    ),
    explanation:
      "Filing your ITR on incometax.gov.in is how you claim a refund of extra tax deducted. It also builds your official income record.",
  },
  {
    key: "crypto-risk",
    area: "INVESTING",
    prompt: "A friend says crypto is “just like shares, but faster.” What's the big difference in India?",
    options: choices(
      0,
      "Crypto isn't regulated by SEBI like shares, so there's far less investor protection",
      "Crypto is guaranteed by the RBI",
      "Crypto can only go up",
      "There's no difference at all",
    ),
    explanation:
      "Shares and mutual funds are regulated by SEBI, with rules on disclosure and investor protection. Crypto assets aren't regulated that way, swing far more, and have their own strict tax rules. If you explore it, use only money you could lose entirely.",
  },
  {
    key: "eight-day-month",
    area: "BUDGETING",
    prompt: "It's the 8th. Your ₹8,000 pocket money is down to ₹900, and the month has 22 days left. What's the most useful next step?",
    options: choices(
      1,
      "Ask home for an “advance” and repeat the same thing next month",
      "Divide what's left by the days remaining, about ₹40 a day, and plan around it",
      "Live on air and optimism",
      "Use a credit card until the 1st",
    ),
    explanation:
      "₹900 ÷ 22 days is about ₹41 a day, tight, but plannable. Next month, flip it: move savings out first and give wants a fixed budget before the spending starts.",
  },
  {
    key: "pyramid-scheme",
    area: "DIGITAL_SAFETY",
    prompt: "A senior invites you to a “business opportunity”: pay ₹5,000 to join, then earn by getting your friends to join too. What is it?",
    options: choices(
      2,
      "A startup. Get in early",
      "A normal part-time job",
      "Most likely a pyramid scheme, illegal in India, and it collapses when recruiting stops",
      "A government scheme for students",
    ),
    explanation:
      "If the money mostly comes from recruiting people rather than selling real products to real customers, it's a pyramid scheme. They're banned in India, and nearly everyone except those at the top loses money.",
  },
  {
    key: "parents-health-cover",
    area: "BANKING",
    prompt: "You assume you're covered by your parents' family health insurance. When should you double-check?",
    options: choices(
      3,
      "Never, family policies cover everyone forever",
      "Only after you get hospitalised",
      "Only if you move abroad",
      "Now, many policies cover children only up to a certain age, often around 25",
    ),
    explanation:
      "Family floater policies often cover dependent children only up to an age limit, commonly around 25, though it varies. Check the policy before you assume, and plan your own cover when you start working.",
  },
  {
    key: "delivery-fees",
    area: "BUDGETING",
    prompt: "A ₹220 biryani on a delivery app ends up costing ₹300 at checkout. Where did the ₹80 go?",
    options: choices(
      1,
      "The biryani got bigger",
      "Delivery fees, platform fees, packaging and taxes, and app menu prices are often higher too",
      "A mistake that the app will refund",
      "It's a tip you're required to pay",
    ),
    explanation:
      "Delivery has layers: delivery fee, platform fee, packaging, GST, and menu prices on apps are often higher than at the restaurant. Ordering in four times a week, those layers alone can cost over ₹1,000 a month.",
  },
  {
    key: "first-salary-party",
    area: "BUDGETING",
    prompt: "Your first salary of ₹42,000 just landed and your friends are demanding a party. The sensible plan?",
    options: choices(
      1,
      "Spend all of it, first salary only comes once",
      "Move your savings out first, then budget a fun amount for the treat",
      "Never celebrate anything ever again",
      "Put the whole party on a credit card",
    ),
    explanation: "Celebrate, with a budget. Pay yourself first, then decide what the party can cost, so month one doesn't start a debt habit.",
  },
  {
    key: "pf-job-change",
    area: "TAX",
    prompt: "You're switching jobs after two years. Your PF balance is ₹70,000. Withdraw it for a trip, or transfer it?",
    options: choices(
      0,
      "Transfer it to the new employer's account (your UAN stays the same) so it keeps growing",
      "Withdraw it: PF is free money",
      "Leave it and forget your UAN",
      "Withdraw it, since withdrawals are always tax-free",
    ),
    explanation:
      "Your UAN stays with you across jobs, so transferring PF keeps it compounding for retirement. Withdrawing before five years of continuous service can also be taxable. A trip lasts a week; your PF can compound for decades.",
  },
  {
    key: "trial-auto-renew",
    area: "BUDGETING",
    prompt: "You signed up for a “₹1 trial” that auto-renews at ₹299 a month. Best move?",
    options: choices(
      0,
      "Set a reminder to cancel before it renews, or cancel now if you won't use it",
      "Ignore it, it's only ₹1",
      "Sign up for more trials with the same card",
      "Wait and see what the bill says",
    ),
    explanation: "Trials are designed to be forgotten. ₹299 a month is ₹3,588 a year for something you meant to try once.",
  },
  {
    key: "net-worth",
    area: "BANKING",
    prompt: "You have ₹18,000 in the bank, a ₹6,000 phone EMI still to pay, and your friend owes you ₹1,000. What's your net worth?",
    options: choices(
      2,
      "₹18,000",
      "₹25,000",
      "₹13,000, what you own (₹19,000) minus what you owe (₹6,000)",
      "₹6,000",
    ),
    explanation:
      "Net worth is everything you own minus everything you owe: ₹18,000 + ₹1,000 − ₹6,000 = ₹13,000. Watching it grow is a better scoreboard than your bank balance alone.",
  },
  {
    key: "sunk-cost",
    area: "BUDGETING",
    prompt: "You paid ₹4,000 for a 6-month gym plan. Two months in, you hate it and haven't gone in weeks. The renewal offer is “only ₹3,000 for 6 more months!”",
    options: choices(
      1,
      "Renew, otherwise the first ₹4,000 was wasted",
      "Skip the renewal: the ₹4,000 is gone either way, so decide only on whether you'll use the next ₹3,000",
      "Renew and buy new gym clothes for motivation",
      "Ask for a 12-month plan instead",
    ),
    explanation:
      "Money already spent can't be recovered by spending more. That's the sunk-cost trap. Judge each new payment on its own: will the next ₹3,000 actually get used?",
  },
  {
    key: "weekend-vs-weekday",
    area: "BUDGETING",
    prompt: "You spend about ₹400 on each weekday and ₹1,800 on each weekend day. Which change saves the most in a week?",
    options: choices(
      1,
      "Skip one ₹40 chai every weekday",
      "Cut each weekend day to ₹1,000",
      "Stop buying water",
      "Delete your UPI app forever",
    ),
    explanation:
      "Skipping a ₹40 chai on 5 weekdays saves ₹200. Cutting two weekend days from ₹1,800 to ₹1,000 saves ₹1,600. Find your biggest leak before the smallest.",
  },
  {
    key: "reward-points",
    area: "CREDIT",
    prompt: "Your card gives 2% reward points. A friend says, “Spend more to earn more points!” Is that smart?",
    options: choices(
      3,
      "Yes, points are basically free money",
      "Yes, spend ₹50,000 to earn ₹1,000",
      "Only on weekends",
      "No, spending ₹100 to earn ₹2 back still leaves you ₹98 poorer",
    ),
    explanation:
      "Rewards are a small discount on spending you'd do anyway. Never a reason to spend more. If points tempt you to swipe extra, they're costing you, not paying you.",
  },
  {
    key: "cost-per-use",
    area: "BUDGETING",
    prompt: "A ₹3,000 jacket you'll wear 100 times, or a ₹900 one you'll wear 3 times before it falls apart. Which is cheaper?",
    options: choices(
      0,
      "The ₹3,000 jacket, about ₹30 a wear, vs ₹300 a wear",
      "The ₹900 jacket, the price tag is lower",
      "They cost the same",
      "Neither, jackets are a scam",
    ),
    explanation:
      "Cost per use is price ÷ times you'll use it: ₹3,000 ÷ 100 = ₹30; ₹900 ÷ 3 = ₹300. The cheaper price tag isn't always the cheaper buy.",
  },
  {
    key: "lend-to-friend",
    area: "BANKING",
    prompt: "A close friend asks to borrow ₹5,000 till “next month, pakka.” What's a healthy rule for lending to friends?",
    options: choices(
      2,
      "Always lend whatever is asked. That's what friends are for",
      "Never lend to anyone, ever",
      "Lend only what you could afford not to get back, and agree on a date",
      "Lend it from your emergency fund",
    ),
    explanation:
      "Lending to friends can be kind, but only lend an amount you could live without if “next month” slips, and agree on a clear date. That protects both your money and the friendship.",
  },
];
