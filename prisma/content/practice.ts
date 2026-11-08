import { choices, type SeedPractice } from "./types";

// One practice question per quiz question, in the same order: the same idea
// with a different example. The AI Coach asks it right after a student
// misses the original, and revision brings it back 1, 3 and 7 days later.
// Correct answers are checked on the server like every other question.

export const PRACTICE: Record<string, SeedPractice[]> = {
  "budgeting-basics": [
    {
      prompt: "Aman gets ₹20,000 a month. Under the 50/30/20 rule, how much is meant for needs like rent and food?",
      options: choices(2, "₹4,000", "₹6,000", "₹10,000", "₹14,000"),
      explanation: "Needs get 50%: half of ₹20,000 is ₹10,000. Wants get 30% (₹6,000) and savings 20% (₹4,000).",
    },
    {
      prompt: "For a hostel student, which of these is a need rather than a want?",
      options: choices(0, "Monthly mess fees", "A concert ticket", "A second pair of sneakers", "A premium music app"),
      explanation: "Mess fees pay for food, which you can't skip. The others make life nicer but are optional. They're wants.",
    },
    {
      prompt: "Your ₹8,000 stipend arrives on the 1st. What does \"pay yourself first\" look like?",
      options: choices(
        3,
        "Spend freely and save whatever is left on the 30th",
        "Save only when a friend reminds you",
        "Wait for a bonus month to start saving",
        "Move ₹1,600 to savings on the 1st, then spend the rest",
      ),
      explanation: "Saving first, the day money arrives, means savings actually happen, instead of depending on what's left at month-end.",
    },
    {
      prompt: "Kabir earns ₹30,000 a month. Following 50/30/20, how much is his wants budget?",
      options: choices(1, "₹6,000", "₹9,000", "₹15,000", "₹3,000"),
      explanation: "Wants get 30%: 30% of ₹30,000 is ₹9,000. Needs get ₹15,000 and savings ₹6,000.",
    },
    {
      prompt: "You spend about ₹150 a day on food delivery. Roughly how much is that in a 30-day month?",
      options: choices(2, "₹1,500", "₹3,000", "₹4,500", "₹15,000"),
      explanation: "₹150 × 30 days = ₹4,500. Small daily spends add up fast. That's why a weekly limit helps.",
    },
  ],
  "compound-interest": [
    {
      prompt: "₹1,000 earns 10% a year, compounded yearly. How much do you have after 2 years?",
      options: choices(1, "₹1,200", "₹1,210", "₹1,100", "₹1,020"),
      explanation: "Year 1: ₹1,000 + ₹100 = ₹1,100. Year 2: 10% of ₹1,100 is ₹110, so ₹1,210. The extra ₹10 is interest on interest.",
    },
    {
      prompt: "Using the Rule of 72, roughly how long does money take to double at 6% a year?",
      options: choices(3, "6 years", "8 years", "10 years", "12 years"),
      explanation: "Divide 72 by the yearly rate: 72 ÷ 6 = about 12 years.",
    },
    {
      prompt:
        "Meera invests ₹2,000 a month from age 22. Dev invests the same amount from age 32, at the same return. At 60, who is likely to have more?",
      options: choices(
        0,
        "Meera. Her money compounds for 10 more years",
        "Dev. He invests when he earns more",
        "Both end up with the same amount",
        "There's no way to tell",
      ),
      explanation: "With the same amount and return, the earlier starter wins: those extra years let returns earn their own returns.",
    },
    {
      prompt: "₹20,000 earns 5% simple interest a year. How much interest does it earn in 4 years?",
      options: choices(2, "₹1,000", "₹2,000", "₹4,000", "₹4,310"),
      explanation: "Simple interest is the same every year: 5% of ₹20,000 = ₹1,000 a year, so ₹4,000 over 4 years. (₹4,310 would be compound interest.)",
    },
    {
      prompt: "A friend owes ₹20,000 on a credit card and pays only the minimum each month. What usually happens to the debt?",
      options: choices(
        1,
        "It disappears in a few months",
        "It shrinks very slowly, because high interest keeps compounding on it",
        "The bank cancels the interest",
        "It stays exactly the same",
      ),
      explanation: "Card interest is very high and compounds, so most of a minimum payment goes on interest. The debt barely falls.",
    },
  ],
  "saving-vs-spending": [
    {
      prompt: "Which of these should you pay for from your emergency fund?",
      options: choices(
        2,
        "A weekend trip with friends",
        "A new phone because the old one feels slow",
        "An unexpected hospital bill",
        "A sale on sneakers",
      ),
      explanation: "An emergency fund is only for genuine surprises like medical bills or urgent repairs, not for wants.",
    },
    {
      prompt: "Your monthly expenses are ₹15,000. What's a sensible long-term emergency fund target?",
      options: choices(1, "₹5,000", "₹45,000–₹90,000", "₹15 lakh", "Nothing, a credit card is enough"),
      explanation: "Aim for 3–6 months of expenses: 3 × ₹15,000 = ₹45,000 up to 6 × ₹15,000 = ₹90,000. Build it gradually.",
    },
    {
      prompt: "You get a ₹5,000 raise. Which choice best avoids lifestyle creep?",
      options: choices(
        3,
        "Move to a costlier flat straight away",
        "Add a new subscription with every raise",
        "Spend all of it. You earned it",
        "Put a big part of the raise into savings first",
      ),
      explanation: "Lifestyle creep is spending rising with every raise. Saving part of each raise lets you enjoy some of it and still get ahead.",
    },
    {
      prompt: "A ₹2,500 jacket is on sale and you feel you must buy it now. What does the 24-hour rule suggest?",
      options: choices(
        0,
        "Wait a day, and buy it only if you still want it",
        "Buy it before the sale ends",
        "Buy two to save more",
        "Ask for a bigger discount first",
      ),
      explanation: "Waiting a day takes the urgency away. If you still want it tomorrow, it's a choice, not an impulse.",
    },
    {
      prompt: "A ₹12,000 course is offered on \"no-cost EMI\" of ₹2,000 for 6 months, plus a ₹299 processing fee. What's the real total cost?",
      options: choices(2, "₹12,000", "₹11,701", "₹12,299", "₹14,000"),
      explanation: "6 × ₹2,000 = ₹12,000, plus the ₹299 fee = ₹12,299. \"No-cost\" EMIs often still carry fees, so check the total.",
    },
  ],
  "upi-digital-payments": [
    {
      prompt: "A buyer on a resale app says: \"I've sent a request, enter your UPI PIN to receive ₹2,000.\" What's true?",
      options: choices(
        1,
        "Entering your PIN will receive the money",
        "Entering your PIN would send money, not receive it",
        "UPI needs your PIN to send and to receive",
        "The PIN only confirms who you are",
      ),
      explanation: "You only ever enter your UPI PIN to pay. Anyone asking for it so you can \"receive\" money is trying to take money from you.",
    },
    {
      prompt: "A friend wants to pay you back on UPI. What do you need to do?",
      options: choices(
        2,
        "Scan their QR code",
        "Enter your UPI PIN",
        "Nothing more than share your UPI ID or number and let them pay",
        "Share an OTP",
      ),
      explanation: "Receiving needs no PIN, no OTP and no scanning. The payer does the paying; you just share where to send it.",
    },
    {
      prompt: "You get a UPI collect request for ₹1,500 from someone you don't know. What should you do?",
      options: choices(
        0,
        "Decline it. Approving would send them money",
        "Approve it to see what happens",
        "Approve it and ask for a refund later",
        "Share your PIN to check the details",
      ),
      explanation: "A collect request asks you to pay. Approving it with your PIN sends the money. Decline anything you don't recognise.",
    },
    {
      prompt: "You notice a ₹4,000 UPI debit you didn't make. What's the right first step?",
      options: choices(
        3,
        "Wait a week to see if it reverses",
        "Post about it on social media",
        "Search online for a refund helpline",
        "Report it quickly to your bank and on 1930 or cybercrime.gov.in",
      ),
      explanation: "Speed matters. Reporting quickly to your bank and the national cyber-crime helpline (1930) gives the best chance of stopping the money.",
    },
    {
      prompt: "A caller says your refund is stuck and asks you to install a remote-access app. What should you do?",
      options: choices(
        1,
        "Install it. They're helping you",
        "Refuse and hang up; genuine support never needs control of your phone",
        "Install it but cover your screen",
        "Share only your OTP, not your PIN",
      ),
      explanation: "Remote-access apps let a stranger see and control your phone, including PINs and OTPs. Real support never asks for that.",
    },
  ],
  "financial-scams": [
    {
      prompt: "A caller says they're from your bank and need the OTP you just received to \"stop a fraud\". What do you do?",
      options: choices(
        2,
        "Share it. They're from the bank",
        "Share half of it",
        "Don't share it. Banks never ask for your OTP",
        "Share it if they know your name",
      ),
      explanation: "An OTP is like a key to your account. Banks never ask for it. Anyone who does is trying to use it.",
    },
    {
      prompt: "Which message is most likely a scam?",
      options: choices(
        0,
        "\"Your account will be blocked in 2 hours, update your KYC at this link\"",
        "\"Your monthly statement is ready in the app\"",
        "\"Your FD has matured\"",
        "\"Thank you for your payment\"",
      ),
      explanation: "Threats plus a deadline plus a link is the classic scam pattern. Check KYC only in your bank's official app or branch.",
    },
    {
      prompt: "An \"internship\" offer asks you to pay a ₹2,000 registration fee before you start. What's the safest view?",
      options: choices(
        3,
        "Normal, all internships charge fees",
        "Fine if the company has a website",
        "Pay now and ask for a refund later",
        "A big red flag. Genuine employers don't charge you to join",
      ),
      explanation: "Real employers pay you, not the other way round. Fee-to-join offers are a common scam aimed at students.",
    },
    {
      prompt: "A video caller in a police uniform says you must stay on camera and transfer money to \"clear your name\". What should you do?",
      options: choices(
        1,
        "Transfer the money quickly",
        "Hang up. There's no such thing as a \"digital arrest\", and police don't collect money on calls",
        "Keep the call going and negotiate",
        "Share your bank details to prove you're innocent",
      ),
      explanation: "\"Digital arrest\" is a scam. Hang up and report it on 1930 or cybercrime.gov.in.",
    },
    {
      prompt: "Where is the safest place to find your bank's customer care number?",
      options: choices(
        2,
        "The first result in a web search",
        "A number someone texts you",
        "Your bank's official app or website, or the back of your card",
        "A comment on social media",
      ),
      explanation: "Scammers plant fake helpline numbers online. Use only the number in your bank's official app, website or card.",
    },
  ],
  "bank-accounts": [
    {
      prompt: "Why should you add a nominee to your savings account?",
      options: choices(
        0,
        "So your money reaches the right person easily if something happens to you",
        "So a friend can withdraw money any time",
        "To get a higher interest rate",
        "Because UPI won't work without one",
      ),
      explanation: "A nominee is the person your deposits go to if something happens to you. It saves your family a lot of paperwork.",
    },
    {
      prompt: "Riya is a college student who keeps her allowance in the bank. Which account suits her best?",
      options: choices(1, "A current account", "A savings account", "A business overdraft account", "No account at all"),
      explanation: "Savings accounts are for individuals and pay some interest. Current accounts are for businesses with many transactions.",
    },
    {
      prompt: "You have ₹3 lakh in a savings account and ₹3 lakh in an FD at the same bank. How much is covered by DICGC insurance?",
      options: choices(2, "₹6 lakh", "₹3 lakh", "₹5 lakh", "Nothing"),
      explanation: "DICGC covers up to ₹5 lakh per person, per bank: savings, FDs and RDs at that bank added together.",
    },
    {
      prompt: "Prices rise about 5% a year and your savings account pays 3%. What happens to your money's buying power over time?",
      options: choices(3, "It grows faster than prices", "It stays the same", "It doubles every year", "It slowly shrinks"),
      explanation: "If prices rise faster than your interest, the same money buys a little less each year.",
    },
    {
      prompt:
        "Your account needs a ₹3,000 average monthly balance. In a 30-day month you keep ₹9,000 for 10 days and ₹0 for 20 days. What's your average monthly balance?",
      options: choices(0, "₹3,000", "₹9,000", "₹4,500", "₹1,000"),
      explanation: "(₹9,000 × 10 days + ₹0 × 20 days) ÷ 30 days = ₹3,000, just enough to meet the requirement.",
    },
  ],
  "fd-rd": [
    {
      prompt: "You have ₹20,000 you won't need for a year and want a fixed, known return. Which fits best?",
      options: choices(1, "A Recurring Deposit", "A Fixed Deposit", "A current account", "Cash at home"),
      explanation: "An FD locks a lump sum for a fixed period at a fixed rate, a good fit for money you won't need soon.",
    },
    {
      prompt: "You want to save ₹2,000 every month for a year. Which product is built for this?",
      options: choices(2, "A Fixed Deposit", "A credit card", "A Recurring Deposit", "A personal loan"),
      explanation: "A Recurring Deposit takes a fixed amount every month and pays interest, like an FD in instalments.",
    },
    {
      prompt: "You need your FD money 3 months early for an emergency. What usually happens?",
      options: choices(
        0,
        "You can withdraw it, but the bank pays a slightly lower interest rate",
        "The money is lost",
        "You must wait until maturity no matter what",
        "The bank pays a higher rate",
      ),
      explanation: "Banks usually allow early withdrawal with a small penalty on the interest. Your money isn't lost.",
    },
    {
      prompt: "Your FD earns ₹4,000 in interest this year. How is that interest treated?",
      options: choices(
        3,
        "It's tax-free",
        "Only the bank pays tax on it",
        "It's taxed only when you close the FD",
        "It's added to your income and taxed as per your slab",
      ),
      explanation: "FD interest counts as your income and is taxed at your slab rate, whether or not you withdraw it.",
    },
    {
      prompt: "Asha puts ₹500 a month into a 12-month RD at about 6.5% interest. Which is closest to her maturity amount?",
      options: choices(1, "₹6,000", "₹6,210", "₹6,500", "₹7,200"),
      explanation: "She deposits ₹6,000 in total. Earlier instalments earn interest for longer, adding about ₹210, roughly ₹6,210.",
    },
  ],
  "cibil-score": [
    {
      prompt: "Which of these CIBIL scores would lenders usually see as the strongest?",
      options: choices(2, "350", "600", "780", "Scores don't matter"),
      explanation: "CIBIL scores run from 300 to 900. Scores of 750 and above are generally seen as strong.",
    },
    {
      prompt: "Which habit hurts your credit score the most?",
      options: choices(
        0,
        "Missing EMI and credit card payments",
        "Checking your own score",
        "Paying your card bill in full",
        "Keeping an old card open",
      ),
      explanation: "Payment history matters most. Late or missed payments stay on your report and drag your score down.",
    },
    {
      prompt: "Your card limit is ₹50,000. Roughly what balance keeps your utilisation under 30%?",
      options: choices(1, "₹40,000", "Below ₹15,000", "Exactly ₹50,000", "₹30,000"),
      explanation: "30% of ₹50,000 is ₹15,000. Using less of your limit looks better to lenders.",
    },
    {
      prompt: "A bank checks your credit report because you applied for a loan. What kind of enquiry is that?",
      options: choices(
        3,
        "A soft enquiry with no effect",
        "A refund request",
        "A KYC check",
        "A hard enquiry, which can lower your score slightly",
      ),
      explanation: "Lender checks for a new loan or card are hard enquiries. Many in a short time can lower your score; checking your own is soft.",
    },
    {
      prompt: "You're 21 with no loans or cards. What's a common way to start building a credit history?",
      options: choices(
        2,
        "Take several loans at once",
        "Avoid all credit forever",
        "Use a first card lightly and pay it in full and on time every month",
        "Apply for many cards in one week",
      ),
      explanation: "Your first card or loan, repaid on time, starts your credit history. Paying in full also means no interest.",
    },
  ],
  "credit-cards-101": [
    {
      prompt: "Your card has a ₹40,000 credit limit. What does that mean?",
      options: choices(
        0,
        "You can borrow up to ₹40,000 on it",
        "You must spend ₹40,000 a month",
        "You'll get ₹40,000 in cashback",
        "It's ₹40,000 of free money",
      ),
      explanation: "The limit is the most you can borrow. Everything you spend is a loan you have to repay.",
    },
    {
      prompt: "Your bill is ₹8,000 and you pay all ₹8,000 by the due date. How much interest do you pay on those purchases?",
      options: choices(2, "36% a year", "₹800", "None", "Interest on the minimum due"),
      explanation: "Paying the full bill by the due date means you pay no interest on those purchases.",
    },
    {
      prompt: "Your bill is ₹15,000 and the minimum due is ₹750. If you pay only ₹750, what happens?",
      options: choices(
        1,
        "The bill is cleared",
        "You avoid a late fee, but the unpaid ₹14,250 attracts high interest",
        "You get a discount",
        "Your limit doubles",
      ),
      explanation: "The minimum only avoids a late fee. The rest carries interest that is often 36–45% a year.",
    },
    {
      prompt: "Your billing cycle ends on the 10th and your due date is the 30th. When do you pay for something bought on the 5th?",
      options: choices(3, "Immediately", "Never", "After a year", "By the 30th, as part of that month's bill"),
      explanation: "Spends inside a billing cycle go on that cycle's bill, which you pay by the due date.",
    },
    {
      prompt: "Which use of a credit card is usually the most expensive?",
      options: choices(
        0,
        "Withdrawing cash at an ATM",
        "Paying the full bill on time",
        "Buying groceries and paying in full",
        "Setting up autopay for the full amount",
      ),
      explanation: "Cash withdrawals usually carry a fee and interest from day one, with no interest-free period.",
    },
  ],
  "first-salary-tax": [
    {
      prompt: "Sana's offer letter says ₹5 LPA CTC. What will reach her bank each month?",
      options: choices(
        2,
        "Exactly ₹5 lakh ÷ 12",
        "More than ₹5 lakh ÷ 12",
        "Less than ₹5 lakh ÷ 12, after deductions like PF",
        "Nothing until the year ends",
      ),
      explanation: "CTC includes parts she never gets monthly (like her employer's PF share), and deductions come out, so in-hand is lower.",
    },
    {
      prompt: "Your payslip shows \"TDS: ₹2,000\". What is it?",
      options: choices(
        0,
        "Income tax your employer deducted and paid for you",
        "A fine for coming in late",
        "A savings scheme",
        "A bank charge",
      ),
      explanation: "TDS is income tax deducted at source. Your employer takes it from your salary and deposits it with the government.",
    },
    {
      prompt: "You never told HR which tax regime you want. Which one will they usually apply?",
      options: choices(
        1,
        "The old regime",
        "The new regime, because it's the default",
        "Both at once",
        "Neither, no tax is deducted",
      ),
      explanation: "The new regime is the default. You have to opt for the old one if its deductions would save you more.",
    },
    {
      prompt: "Your payslip shows EPF of ₹1,800 from you and ₹1,800 from your employer. What happens to this money?",
      options: choices(
        3,
        "It's paid as income tax",
        "It becomes your employer's profit",
        "It's lost if you change jobs",
        "It builds up in your own PF account with interest",
      ),
      explanation: "Both shares go into your own Provident Fund account and earn interest. You can transfer it when you change jobs.",
    },
    {
      prompt: "Karan's CTC is ₹6 lakh, which includes a ₹36,000 bonus paid once a year. What's his monthly salary before deductions?",
      options: choices(2, "₹50,000", "₹53,000", "₹47,000", "₹44,000"),
      explanation: "Take out the yearly bonus: ₹6,00,000 − ₹36,000 = ₹5,64,000. Over 12 months that's ₹47,000 before deductions.",
    },
  ],
  "stocks-mutual-funds-fds": [
    {
      prompt: "If you buy shares of a company, what do you own?",
      options: choices(1, "A loan to the company", "A small part of the company", "A fixed deposit with the company", "The company's products"),
      explanation: "A share is a small piece of ownership. Its value rises and falls with the company and the market.",
    },
    {
      prompt: "Which of these is the most diversified?",
      options: choices(
        3,
        "All your money in one company's shares",
        "All your money in a friend's startup",
        "All your money in one sector",
        "Money spread across many companies through a mutual fund",
      ),
      explanation: "Spreading money across many companies means one bad pick can't sink everything.",
    },
    {
      prompt: "An app promises \"30% guaranteed returns every month\". What should you think?",
      options: choices(
        0,
        "Very high \"guaranteed\" returns are a warning sign. Real investments carry risk",
        "It's safe because it says guaranteed",
        "Invest more to earn faster",
        "All returns are guaranteed in India",
      ),
      explanation: "Higher returns come with higher risk. Promises of big, guaranteed returns are a classic sign of fraud.",
    },
    {
      prompt: "Why do many beginners choose index funds?",
      options: choices(
        2,
        "They guarantee returns",
        "They invest in just one stock",
        "They spread money across a whole index of companies in one go",
        "They're the same as FDs",
      ),
      explanation: "An index fund copies an index like the Nifty 50, so one investment spreads your money across many companies, but returns aren't guaranteed.",
    },
    {
      prompt: "You're saving for a laptop you'll buy in 4 months. Where should that money sit?",
      options: choices(
        1,
        "In a single volatile stock",
        "Somewhere safe, like a savings account or a short FD",
        "In crypto",
        "In an equity fund for growth",
      ),
      explanation: "Money you need soon shouldn't face market falls. Keep short-term money somewhere safe.",
    },
  ],
  "sip-starting-early": [
    {
      prompt: "Which of these is a SIP?",
      options: choices(
        0,
        "₹1,000 going into a mutual fund automatically every month",
        "A one-time ₹50,000 investment",
        "A bank loan you repay monthly",
        "A credit card EMI",
      ),
      explanation: "A SIP invests a fixed amount in a mutual fund at regular intervals, usually monthly.",
    },
    {
      prompt: "Your SIP is ₹1,000 a month. One month the fund's price per unit halves. What happens?",
      options: choices(3, "Your SIP pauses", "You get fewer units", "You lose your ₹1,000", "Your ₹1,000 buys twice as many units"),
      explanation: "Rupee cost averaging: when prices fall, the same amount buys more units.",
    },
    {
      prompt: "What gives a small SIP the most time to grow?",
      options: choices(
        1,
        "Starting later with a bigger amount",
        "Starting early and staying invested",
        "Stopping whenever markets fall",
        "Switching funds every month",
      ),
      explanation: "Time in the market lets compounding work. Starting early usually matters more than starting big.",
    },
    {
      prompt: "Priya has no savings and no health cover. Before starting a SIP, what's the sensible first step?",
      options: choices(
        2,
        "Put everything into a SIP now",
        "Take a loan to invest",
        "Build an emergency fund and get health cover",
        "Buy the most expensive insurance policy",
      ),
      explanation: "Protection first: an emergency fund and health cover mean a surprise bill won't force you to sell investments.",
    },
    {
      prompt: "Markets fall and your SIP shows a loss after a year. Your goal is 8 years away. What's the sensible move?",
      options: choices(
        0,
        "Keep investing. The dip lets your fixed amount buy more units",
        "Stop the SIP and sell everything",
        "Move all your money to cash for good",
        "Use your emergency fund to invest more",
      ),
      explanation: "For long goals, short-term falls are normal. Staying invested buys more units while prices are low.",
    },
  ],
};
