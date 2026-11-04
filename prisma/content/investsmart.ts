import { choices, type SeedLesson, type SeedPractice } from "./types";

// InvestSmart: the investing track. It builds on the three investing lessons
// in the Money IQ path (compound interest, stocks vs funds vs FDs, SIPs) and
// covers only what those don't: inflation and real returns, how the market
// itself works, what index investing costs over time, and how a beginner
// actually starts. Orders start at 101 so they never shift the core path.
//
// No lesson here recommends a product or promises a return. Every growth
// figure is an illustration at an assumed rate.

const inflation: SeedLesson = {
  slug: "inflation-purchasing-power",
  title: "Inflation: Why Saving Alone Isn't Enough",
  icon: "🎈",
  area: "INVESTING",
  description: "What investing actually means, why prices quietly shrink your money, and how to tell a real return from a fake one.",
  estimatedMinutes: 5,
  xpReward: 75,
  order: 101,
  hook: `A plate of momos cost ₹60 when you were in school. Now it's ₹120.

The momos didn't get bigger. So what changed — the momos, or your money?`,
  learn: `## Purchasing power

**Inflation** is prices rising over time. When prices rise, the same ₹100 buys less — its **purchasing power** falls. Money that just sits still slowly shrinks, even though the number doesn't change.

## How India measures it

India tracks inflation with the **Consumer Price Index (CPI)**, a basket of everyday things like food, rent, fuel and clothes. The RBI aims to keep CPI inflation around **4%**, within a band of **2–6%**. Some years run hotter, and your own inflation (rent, tuition, data plans) can be higher than the average.

## Saving vs investing

**Saving** keeps money safe and ready — for next month's rent or an emergency. **Investing** puts money into things that can grow faster than prices, like shares or mutual funds, in exchange for ups and downs along the way. You need both: savings for the near future, investing for goals that are years away.

## The real return

What you earn after inflation is your **real return** — roughly the return minus inflation. A 7% FD with 5% inflation grows your buying power by only about 2% a year (before tax). A 3% savings account with 5% inflation is a slow leak.

## Your inflation isn't the average

CPI is an average across the country. If most of your money goes on rent, tuition or travel — and those rise faster — your personal inflation can be well above the headline number. That's why the goal is to grow money faster than the prices *you* pay.`,
  keyTerms: [
    { term: "Inflation", definition: "The general rise in prices over time." },
    { term: "Purchasing power", definition: "How much your money can actually buy." },
    { term: "CPI", definition: "Consumer Price Index — India's main measure of retail inflation." },
    { term: "Real return", definition: "Your return after inflation — roughly the return minus the inflation rate." },
  ],
  example: `**Megha keeps ₹50,000 in a savings account at 3%** for 5 years while prices rise about 6% a year.

- Her balance grows to about **₹58,000**.
- But things that cost ₹50,000 today would cost about **₹67,000** by then.

Her number went up. **What happened to what her money can buy?**`,
  scenario: {
    prompt:
      "Your grandmother gives you ₹20,000 and says, “Keep it safe in cash at home — banks and markets are risky.” You won't need it for at least 10 years. What would you do?",
    options: choices(
      2,
      "Keep the cash at home — the amount will always stay ₹20,000",
      "Spend it now, since it'll be worth less later anyway",
      "Thank her, keep some aside for emergencies, and learn how to grow the rest faster than prices rise",
      "Put it all into whatever a friend says is going up this week",
    ),
    explanation:
      "Cash at home never loses rupees, but it loses buying power every year — at 6% inflation, it buys about half as much in 12 years. Money you won't need for a decade has time to be invested sensibly, after an emergency buffer is in place.",
  },
  questions: [
    {
      prompt: "A ₹100 note buys less today than it did five years ago. What has fallen?",
      explanation: "The note's face value is the same — its purchasing power, what it can buy, has fallen because prices rose.",
      hint: "The number printed on the note didn't change. What did?",
      difficulty: "EASY",
      options: choices(
        1,
        "The number printed on the note",
        "Its purchasing power",
        "The interest rate on your account",
        "The value of gold",
      ),
    },
    {
      prompt: "What's the key difference between saving and investing?",
      explanation:
        "Saving keeps money safe and available for near-term needs. Investing puts it into assets that can grow faster than prices — with ups and downs along the way.",
      hint: "One is about safety and access; the other is about growth over time.",
      difficulty: "EASY",
      options: choices(
        0,
        "Saving keeps money safe and ready; investing aims to grow it over years, with ups and downs",
        "They're the same thing with different names",
        "Investing is only for people with lakhs",
        "Saving always grows faster than investing",
      ),
    },
    {
      prompt: "Your FD pays 7% a year and inflation is 5%. Roughly what's your real return, before tax?",
      explanation: "Real return is roughly the return minus inflation: 7% − 5% ≈ 2% more buying power each year.",
      hint: "Take away what rising prices eat from what the FD pays.",
      difficulty: "MEDIUM",
      options: choices(2, "12%", "7%", "About 2%", "Exactly 0%"),
    },
    {
      prompt: "What does India's Consumer Price Index (CPI) track?",
      explanation:
        "CPI tracks the prices of a basket of everyday goods and services — food, rent, fuel, clothes and more. Its change over a year is the headline retail inflation rate.",
      hint: "The name says “consumer” and “price”.",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "The value of the Sensex",
        "Prices of a basket of everyday goods and services",
        "Interest rates on savings accounts",
        "How many people have jobs",
      ),
    },
    {
      prompt: "A thali costs ₹500 today. If prices rise 6% every year, about how much will it cost in 10 years?",
      explanation: "₹500 × 1.06¹⁰ ≈ ₹895. Rising prices compound just like returns do — which is why money needs to grow too.",
      hint: "It isn't 6% × 10 = 60% — each year's rise builds on the last.",
      difficulty: "HARD",
      options: choices(2, "₹530", "₹800", "About ₹895", "₹1,500"),
    },
  ],
};

const stockMarket: SeedLesson = {
  slug: "how-stock-market-works",
  title: "How the Stock Market Actually Works",
  icon: "🏛️",
  area: "INVESTING",
  description: "Exchanges, SEBI, demat accounts, IPOs and the Sensex — what's really happening when people say “the market fell today”.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 102,
  hook: `The news says: “Sensex crashes 800 points!” Your uncle panics. Your roommate shrugs.

What is the Sensex, and should you care?`,
  learn: `## Where shares are bought and sold

A **stock exchange** is a marketplace where shares change hands. India's two main ones are the **NSE** (National Stock Exchange) and the **BSE** (Bombay Stock Exchange). You don't trade there directly — you go through a **broker**, usually an app.

## Who keeps it fair

**SEBI** (Securities and Exchange Board of India) regulates the market: exchanges, brokers, mutual funds and advisers. A broker or adviser should be **SEBI-registered** — you can check on SEBI's website.

## Where your shares live

Shares are held electronically in a **demat account**, linked to your trading account and bank account. When you buy, the shares land in your demat account; India settles most trades the next working day (**T+1**).

## IPOs vs the regular market

When a company first sells shares to the public, that's an **IPO** — the primary market. After listing, investors buy and sell those shares among themselves on the exchange — the secondary market. Most trading happens there; the company doesn't get your money when you buy from another investor.

## Why prices move

Prices move with **demand and supply**: when more people want to buy than sell, the price rises. What people expect about a company's future profits drives that demand — which is why prices can jump or drop on news.

## The indices

The **Sensex** tracks 30 large companies on the BSE; the **Nifty 50** tracks 50 on the NSE. They're averages that show the general mood — not what any one share did.`,
  keyTerms: [
    { term: "Stock exchange", definition: "The regulated marketplace where shares are bought and sold, like the NSE and BSE." },
    { term: "SEBI", definition: "India's market regulator for exchanges, brokers, mutual funds and advisers." },
    { term: "Demat account", definition: "The electronic account that holds your shares." },
    { term: "IPO", definition: "A company's first sale of shares to the public." },
    { term: "Sensex / Nifty 50", definition: "Indices tracking 30 large BSE companies and 50 large NSE companies." },
  ],
  example: `**Aditya buys 10 shares of a company at ₹200** through his broker app on Monday.

- His ₹2,000 goes to **another investor** who was selling — not to the company.
- The shares show up in his **demat account** on Tuesday (T+1).
- On Wednesday, the company reports weak profits. More people want to sell than buy, and the price drops to **₹185**.

**If Aditya doesn't sell, has he actually lost ₹150 yet?**`,
  scenario: {
    prompt:
      "A new trading app with flashy ads offers ₹500 free if you sign up today. You can't find any SEBI registration number on its website. What would you do?",
    options: choices(
      1,
      "Sign up quickly before the offer ends",
      "Skip it until you can verify it's a SEBI-registered broker",
      "Sign up but only deposit ₹5,000 to test it",
      "Share the link with friends to earn referral money",
    ),
    explanation:
      "Every genuine broker is registered with SEBI and shows its registration number. If you can't verify it, your money and shares may not be protected. A sign-up bonus is never a reason to skip that check.",
  },
  questions: [
    {
      prompt: "Who regulates India's stock market, brokers and mutual funds?",
      explanation: "SEBI, the Securities and Exchange Board of India, regulates the securities market — exchanges, brokers, mutual funds and investment advisers.",
      hint: "It's the market regulator, not the bank regulator.",
      difficulty: "EASY",
      options: choices(2, "The RBI", "The stock exchanges themselves", "SEBI", "Your broker app"),
    },
    {
      prompt: "What's a demat account for?",
      explanation: "A demat account holds your shares electronically — like a bank account, but for securities instead of cash.",
      hint: "“Demat” comes from dematerialised — shares that used to be paper certificates.",
      difficulty: "EASY",
      options: choices(
        0,
        "Holding your shares electronically",
        "Getting a loan from the exchange",
        "Paying your credit card bill",
        "Storing cash with interest",
      ),
    },
    {
      prompt: "You buy shares of a company that listed five years ago, through your broker app. Who gets your money?",
      explanation:
        "After an IPO, shares trade between investors on the exchange. Your money goes to whoever sold the shares — not to the company.",
      hint: "The company sold its shares to the public once, at its IPO. Who's selling now?",
      difficulty: "MEDIUM",
      options: choices(
        3,
        "The company, to fund its growth",
        "SEBI, as a fee",
        "The stock exchange keeps it",
        "Another investor who sold the shares",
      ),
    },
    {
      prompt: "A company's share price jumps 8% in a day. What usually explains it?",
      explanation:
        "Prices move with demand and supply. When more people want to buy than sell — often after news that changes expectations — the price rises.",
      hint: "Think of an auction: what happens when more people want the same thing?",
      difficulty: "MEDIUM",
      options: choices(
        1,
        "SEBI raised the price",
        "More people wanted to buy than sell, often after news",
        "The company printed more shares",
        "Prices rise by a fixed amount each day",
      ),
    },
    {
      prompt: "The Sensex falls 2% today. What does that tell you about the one company's shares you own?",
      explanation:
        "The Sensex is an average of 30 large companies. On a day it falls 2%, some shares fall more, some less, and some even rise. It shows the general mood, not your share.",
      hint: "The Sensex is made of 30 companies. Do all 30 have to move the same way?",
      difficulty: "HARD",
      options: choices(
        2,
        "Your share also fell exactly 2%",
        "Your share must have fallen more than 2%",
        "Not much — it's an average of 30 large companies, and your share could have moved differently",
        "Your share is now worth nothing",
      ),
    },
  ],
};

const indexFunds: SeedLesson = {
  slug: "index-funds-long-term",
  title: "Index Funds and the Long Game",
  icon: "🐢",
  area: "INVESTING",
  description: "Why costs matter more than they look, what direct plans are, and why staying invested beats guessing the market.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 103,
  hook: `Two friends invest in funds that hold exactly the same 50 companies. Twenty years later, one has about ₹1.4 lakh more.

Same companies, same market. Where did the gap come from?`,
  learn: `## The fee you never see

Every mutual fund charges a yearly fee called the **expense ratio**, taken quietly from the fund's value. A 1% expense ratio on ₹50,000 is about ₹500 a year. It sounds small — but it's charged every year, on a growing amount, so it compounds against you.

## Direct vs regular plans

The same fund comes in two versions. A **regular plan** pays a commission to the distributor who sold it; a **direct plan** doesn't, so its expense ratio is lower. Same portfolio, same manager — less cost.

## Why index funds are cheap

An **index fund** copies an index instead of paying a team to pick stocks, so its costs are usually low. Many actively managed funds fail to beat their index over long periods once fees are counted — which is a big reason index funds are popular with beginners.

## Time in the market beats timing the market

Nobody reliably predicts the next fall or rise. Some of the market's best days have come soon after its worst ones — so people who sell in a panic and wait for “the right time” often miss the recovery. Staying invested through ups and downs, for goals many years away, has historically mattered more than clever timing. That's history, not a guarantee.`,
  keyTerms: [
    { term: "Expense ratio", definition: "A fund's yearly fee, as a percentage of what you've invested." },
    { term: "Direct plan", definition: "A version of a fund bought without a distributor, with a lower expense ratio." },
    { term: "Active fund", definition: "A fund whose managers pick investments, trying to beat the market." },
    { term: "Market timing", definition: "Trying to buy before rises and sell before falls — very hard to do reliably." },
  ],
  example: `**Kunal and Simran each invest ₹1,00,000 once** in Nifty 50 index funds and leave it for 20 years. Assume the index returns 10% a year.

- **Kunal's fund** charges 0.2% → he earns about 9.8% a year → about **₹6.5 lakh**.
- **Simran's fund** charges 1.5% → she earns about 8.5% a year → about **₹5.1 lakh**.

Illustration only — real returns vary. **Is a 1.3% difference in fees really “small”?**`,
  scenario: {
    prompt:
      "Markets have fallen for three months straight. A friend says, “Stop your SIP, keep the cash, and restart when markets look safe again.” Your goal is 15 years away. What would you do?",
    options: choices(
      0,
      "Keep investing as planned — nobody can reliably tell when “safe” is",
      "Stop now and restart once prices have recovered",
      "Sell everything to avoid further falls",
      "Double down by borrowing money to invest",
    ),
    explanation:
      "Waiting for markets to “look safe” usually means buying back after prices have already recovered. For a goal 15 years away, steady investing through falls has historically worked better than trying to time them — though nothing is guaranteed.",
  },
  questions: [
    {
      prompt: "What is a mutual fund's expense ratio?",
      explanation: "The expense ratio is the fund's yearly fee, shown as a percentage of your investment and deducted from the fund's value.",
      hint: "It's a cost, charged every year.",
      difficulty: "EASY",
      options: choices(
        1,
        "The return the fund promises",
        "The yearly fee, as a percentage of what you've invested",
        "The number of companies the fund holds",
        "A one-time fee to open your account",
      ),
    },
    {
      prompt: "A fund has a direct plan and a regular plan. What's the difference?",
      explanation: "Both hold the same investments. The regular plan pays a distributor commission, so its expense ratio is higher; the direct plan doesn't.",
      hint: "One of them pays someone for selling it to you.",
      difficulty: "EASY",
      options: choices(
        2,
        "They invest in completely different companies",
        "The direct plan guarantees higher returns",
        "Same investments, but the direct plan has a lower expense ratio because no distributor commission is paid",
        "The regular plan is safer",
      ),
    },
    {
      prompt: "You have ₹50,000 in a fund with a 1% expense ratio. Roughly what does that cost you this year?",
      explanation: "1% of ₹50,000 is ₹500 — and it's charged every year on a growing amount.",
      hint: "Find 1% of your investment.",
      difficulty: "MEDIUM",
      options: choices(0, "About ₹500", "About ₹50", "About ₹5,000", "Nothing unless you sell"),
    },
    {
      prompt: "Why does trying to time the market often backfire?",
      explanation:
        "Some of the best days come soon after the worst ones. People who sell to wait for a “safe” moment often miss the recovery and buy back higher.",
      hint: "Think about what happens on the days right after a big fall.",
      difficulty: "MEDIUM",
      options: choices(
        3,
        "It's illegal to sell during a fall",
        "Markets only ever go up",
        "Brokers don't allow it",
        "Big rebound days often come right after big falls, so people who step out miss them",
      ),
    },
    {
      prompt:
        "Two index funds track the same index. One charges 0.2% a year, the other 1.5%. You invest ₹1 lakh in one for 20 years. Assuming the index grows 10% a year, about how much more does the cheaper one leave you?",
      explanation:
        "At about 9.8% a year you'd have roughly ₹6.5 lakh; at about 8.5%, roughly ₹5.1 lakh — a gap of about ₹1.4 lakh from fees alone (illustration only).",
      hint: "The fee gap is 1.3% a year — but it compounds over 20 years.",
      difficulty: "HARD",
      options: choices(1, "About ₹1,300", "About ₹1.4 lakh", "About ₹13,000", "Nothing — the same index gives the same result"),
    },
  ],
};

const startInvesting: SeedLesson = {
  slug: "start-investing-checklist",
  title: "Starting to Invest: A Beginner's Checklist",
  icon: "🧭",
  area: "INVESTING",
  description: "KYC, demat or not, who you can trust for advice, and how to pick a mix of risk you'll actually stick with.",
  estimatedMinutes: 6,
  xpReward: 75,
  order: 104,
  hook: `You've decided: this is the month you start investing. You open an app and see 1,500 funds, a KYC form and a “Talk to an expert” button.

Where do you even begin?`,
  learn: `## First, the paperwork

To invest in mutual funds or shares in India you complete **KYC** (Know Your Customer) once, with your **PAN** and an ID and address proof such as Aadhaar. You'll also need a bank account in your name.

## Demat — only if you need it

You need a **demat account** to buy shares or exchange-traded funds. You **don't** need one for regular mutual funds — you can invest directly with the fund house or through a mutual fund platform.

## Start with the why

Before choosing anything, answer: **what is this money for, and when will I need it?** Money for a goal 1–2 years away belongs somewhere steady. Money for goals many years away can take more ups and downs. Your emergency fund and health cover come first.

## Pick a risk you can live with

Your **asset allocation** is how you split money between riskier things like equity and steadier ones like debt or deposits. The “best” mix on paper is useless if you'd panic-sell in a fall. Choose a mix you'd still hold if it dropped 30%.

## Check who's advising you

Only **SEBI-registered investment advisers** may charge you for personal investment advice. Influencers selling tips, courses or referral links may earn from what you buy. You can check any adviser or broker on SEBI's website.

## Start small

Many funds let you start a SIP from ₹100–₹500 a month. Starting small lets you learn how it feels before the amounts get bigger.`,
  keyTerms: [
    { term: "KYC", definition: "A one-time identity check with your PAN and ID proof, needed before you invest." },
    { term: "Asset allocation", definition: "How you split money between riskier and steadier investments." },
    { term: "Time horizon", definition: "How long until you'll need the money." },
    { term: "SEBI-registered adviser", definition: "A professional allowed to charge for personal investment advice in India." },
  ],
  example: `**Nisha, 22, has her first salary.** Before picking a fund, she writes down:

1. **Emergency fund** — 3 months of expenses, in a savings account and FD. Done.
2. **Goal** — a bike in 18 months (steady option) and “future me” in 20+ years (can take ups and downs).
3. **KYC** — done once, with PAN and Aadhaar.
4. **Start** — a ₹1,000 SIP for the long-term goal, and an RD for the bike.

**Why do you think she split the money by goal instead of picking one “best” fund?**`,
  scenario: {
    prompt:
      "An influencer with 2 million followers says, “This small-cap fund will give 40% this year — use my link to invest.” You're just starting. What would you do?",
    options: choices(
      3,
      "Invest your whole savings through the link before it's too late",
      "Invest, since so many followers can't be wrong",
      "Ask in the comments whether it's guaranteed",
      "Skip it — no one can promise a return, and a referral link means they may earn from your choice",
    ),
    explanation:
      "Nobody can promise what a fund will return this year. Influencers can earn from links and courses, and only SEBI-registered advisers may charge for personal advice. Start from your own goal and time horizon, not someone else's tip.",
  },
  questions: [
    {
      prompt: "Which document is essential for completing your investment KYC in India?",
      explanation: "Your PAN is required for investment KYC, along with an ID and address proof such as Aadhaar.",
      hint: "It's the same card you'll use for income tax.",
      difficulty: "EASY",
      options: choices(0, "Your PAN card", "Your college ID", "Your gym membership", "A credit card statement"),
    },
    {
      prompt: "Do you need a demat account to invest in a regular mutual fund?",
      explanation: "No. Demat accounts are needed for shares and exchange-traded funds; regular mutual funds can be bought directly from fund houses or MF platforms.",
      hint: "Demat accounts hold shares. Are mutual fund units the same as shares?",
      difficulty: "EASY",
      options: choices(
        1,
        "Yes, always",
        "No — demat is for shares and ETFs; mutual funds can be bought without one",
        "Only for SIPs above ₹10,000",
        "Only if you're under 25",
      ),
    },
    {
      prompt: "Before choosing any investment, what's the most useful first question?",
      explanation: "What the money is for and when you'll need it decides how much risk makes sense. A goal 1 year away needs something steady; 20 years away can take more ups and downs.",
      hint: "The right choice depends on the goal, not on what's trending.",
      difficulty: "MEDIUM",
      options: choices(
        2,
        "Which fund went up the most last year?",
        "What are my friends buying?",
        "What is this money for, and when will I need it?",
        "Which app has the best design?",
      ),
    },
    {
      prompt: "Someone offers to build you a personal investment plan for a fee. What should you check first?",
      explanation: "In India, only SEBI-registered investment advisers can charge for personal investment advice. You can verify registration on SEBI's website.",
      hint: "Which regulator registers people allowed to give paid advice?",
      difficulty: "MEDIUM",
      options: choices(
        3,
        "How many followers they have",
        "Whether they promise high returns",
        "Whether they drive a nice car",
        "That they're a SEBI-registered investment adviser",
      ),
    },
    {
      prompt: "You realise you'd probably sell in a panic if your investments fell 30%. What does that suggest?",
      explanation:
        "Pick an asset allocation you can stick with — perhaps a smaller share in equity for now. A mix you abandon in a fall does more damage than a steadier one you hold.",
      hint: "The best plan is the one you'll actually follow when things get rough.",
      difficulty: "HARD",
      options: choices(
        0,
        "Choose a mix with less risk that you'd actually hold through a fall",
        "Never invest at all",
        "Put everything in the riskiest fund to recover faster",
        "Check your portfolio every hour",
      ),
    },
  ],
};

export const INVEST_LESSONS: SeedLesson[] = [inflation, stockMarket, indexFunds, startInvesting];

export const INVEST_PRACTICE: Record<string, SeedPractice[]> = {
  "inflation-purchasing-power": [
    {
      prompt: "A ₹500 recharge pack now gives less data than it did three years ago, at the same price. What's that an example of?",
      options: choices(1, "Higher interest rates", "Your money's purchasing power falling", "Better value for money", "A tax refund"),
      explanation: "Paying the same and getting less means your rupees buy less — that's falling purchasing power.",
    },
    {
      prompt: "Which of these is investing rather than saving?",
      options: choices(
        1,
        "Keeping ₹5,000 in a savings account for emergencies",
        "Buying units of an equity fund for a goal 15 years away",
        "Keeping cash in your wallet",
        "Dropping coins in a piggy bank",
      ),
      explanation: "Investing means putting money into assets that can grow over years, accepting ups and downs. The others keep money safe and ready — that's saving.",
    },
    {
      prompt: "An RD pays 6.5% a year and inflation runs at 5%. Roughly what's the real return, before tax?",
      options: choices(3, "11.5%", "6.5%", "0%", "About 1.5%"),
      explanation: "6.5% − 5% ≈ 1.5%. Your money still grows faster than prices — just not by much.",
    },
    {
      prompt: "Headline CPI inflation is 5%, but your PG rent and mess fees rose 10% this year. What does that tell you?",
      options: choices(2, "CPI must be wrong", "Your money is growing 10%", "Your personal inflation can be higher than the average", "Prices are falling"),
      explanation: "CPI is a national average. If your biggest costs rise faster, your own inflation is higher than the headline number.",
    },
    {
      prompt: "A ₹1,000 pair of jeans today. At 6% inflation a year, about what will it cost in 10 years?",
      options: choices(1, "₹1,060", "About ₹1,790", "₹1,600", "₹6,000"),
      explanation: "₹1,000 × 1.06¹⁰ ≈ ₹1,790 — inflation compounds, so it's more than 60% higher.",
    },
  ],
  "how-stock-market-works": [
    {
      prompt: "A broker app says it's regulated. Which body's registration should it show?",
      options: choices(1, "The RBI", "SEBI", "NPCI", "TRAI"),
      explanation: "Stock brokers must be registered with SEBI and show their registration number.",
    },
    {
      prompt: "You bought 5 shares yesterday. Where are they held?",
      options: choices(2, "In your savings account", "With SEBI", "In your demat account", "On a paper certificate at home"),
      explanation: "Shares are held electronically in your demat account.",
    },
    {
      prompt: "A company's IPO opens next week. Who receives the money from shares sold in the IPO?",
      options: choices(0, "The company (and any existing owners selling)", "The stock exchange", "Your broker", "Other retail investors"),
      explanation: "In an IPO, the company sells shares to the public — this is the primary market. After listing, investors trade among themselves.",
    },
    {
      prompt: "After disappointing results, more investors want to sell a share than buy it. What usually happens to its price?",
      options: choices(3, "It stays fixed until next month", "It rises", "SEBI sets a new price", "It falls"),
      explanation: "When sellers outnumber buyers, the price drops until enough buyers step in.",
    },
    {
      prompt: "The Nifty 50 rose 1% today, but your one share fell 3%. Is that possible?",
      options: choices(2, "No — it's an error", "Only on weekends", "Yes — the index is an average of 50 companies, and single shares can move differently", "Only if you own an index fund"),
      explanation: "An index is an average. Individual shares can rise or fall on their own news, whatever the index does.",
    },
  ],
  "index-funds-long-term": [
    {
      prompt: "A fund shows “Expense ratio: 0.5%”. What does that mean?",
      options: choices(0, "It charges 0.5% of your investment as a yearly fee", "It promises a 0.5% return", "It holds 0.5% in cash", "You pay 0.5% only once"),
      explanation: "The expense ratio is a yearly fee as a percentage of your investment.",
    },
    {
      prompt: "You're choosing between the direct and regular plan of the same index fund. Which usually costs less?",
      options: choices(1, "The regular plan", "The direct plan", "They always cost the same", "Whichever has more investors"),
      explanation: "Direct plans don't pay a distributor commission, so their expense ratio is lower.",
    },
    {
      prompt: "₹2,00,000 sits in a fund with a 1.5% expense ratio. Roughly what's this year's fee?",
      options: choices(2, "₹300", "₹1,500", "About ₹3,000", "₹30,000"),
      explanation: "1.5% of ₹2,00,000 is ₹3,000 — every year.",
    },
    {
      prompt: "After a 15% fall, a friend moves everything to cash, planning to buy back “when it's safe”. What's the usual risk?",
      options: choices(3, "There's no risk in cash", "SEBI will block the trade", "They'll pay double tax", "Missing the rebound and buying back at higher prices"),
      explanation: "Rebounds often come quickly and unannounced. Waiting for “safe” usually means buying back after prices have recovered.",
    },
    {
      prompt: "Over 20 years, why can a 1% higher yearly fee make a big difference?",
      options: choices(1, "It's charged only once", "It's charged every year on a growing amount, so the cost compounds", "It doesn't — 1% is tiny", "Fees are refunded after 20 years"),
      explanation: "A fee charged every year on a growing balance compounds against you, just like returns compound for you.",
    },
  ],
  "start-investing-checklist": [
    {
      prompt: "You're 19 and want to start a SIP. Which pair do you typically need for KYC?",
      options: choices(2, "College ID and ration card", "Driving licence only", "PAN plus an ID/address proof such as Aadhaar", "Your parents' bank passbook"),
      explanation: "Investment KYC needs your PAN and an ID/address proof like Aadhaar.",
    },
    {
      prompt: "You only want to invest in mutual funds through SIPs. Do you need a demat account?",
      options: choices(0, "No — mutual funds can be bought without one", "Yes, it's mandatory", "Only for index funds", "Only after age 21"),
      explanation: "A demat account is for shares and ETFs; mutual fund SIPs don't require one.",
    },
    {
      prompt: "You want money for a laptop in 10 months and for retirement in 35 years. What's the sensible approach?",
      options: choices(1, "Put both in the same high-risk fund", "Treat them as separate goals: steady for the laptop, growth-oriented for the long term", "Put both in cash at home", "Skip the laptop goal"),
      explanation: "Different time horizons need different approaches — near-term money stays steady, long-term money can take ups and downs.",
    },
    {
      prompt: "A Telegram channel charges ₹2,999 a month for “sure-shot” fund tips. What's the key check?",
      options: choices(3, "Its number of members", "Whether the tips sound confident", "Whether it accepts UPI", "Whether it's SEBI-registered to give paid advice"),
      explanation: "Paid personal investment advice requires SEBI registration — and no one can guarantee “sure-shot” returns.",
    },
    {
      prompt: "You picked a high-risk mix but lost sleep when it fell 10%. What's a sensible next step?",
      options: choices(0, "Shift to a mix with less risk that you can stick with", "Stop investing forever", "Borrow to invest more", "Check prices more often"),
      explanation: "A mix you can stay with through falls beats a riskier one you'll abandon.",
    },
  ],
};
