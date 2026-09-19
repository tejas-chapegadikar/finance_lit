import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Swap this for the real InVideo AI export URL (or a YouTube/Vimeo link)
// once it exists — see LessonVideo.tsx for how both are supported.
const PLACEHOLDER_VIDEO = "https://placeholder.stockstreak.in/videos/replace-me.mp4";

const colleges = [
  { name: "IIT Bombay", city: "Mumbai", state: "Maharashtra" },
  { name: "IIT Delhi", city: "New Delhi", state: "Delhi" },
  { name: "Shri Ram College of Commerce", city: "Delhi", state: "Delhi" },
  { name: "BITS Pilani", city: "Pilani", state: "Rajasthan" },
  { name: "Christ University", city: "Bengaluru", state: "Karnataka" },
  { name: "NMIMS Mumbai", city: "Mumbai", state: "Maharashtra" },
];

type SeedOption = { text: string; isCorrect: boolean };
type SeedQuestion = { prompt: string; explanation: string; options: SeedOption[] };
type SeedLesson = {
  slug: string;
  title: string;
  topic: string;
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

async function seedLesson(data: SeedLesson) {
  const lesson = await db.lesson.upsert({
    where: { slug: data.slug },
    create: {
      slug: data.slug,
      title: data.title,
      topic: data.topic,
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
  console.log("Seeding colleges...");
  for (const college of colleges) {
    await db.college.upsert({
      where: { name_city: { name: college.name, city: college.city } },
      create: college,
      update: college,
    });
  }

  console.log("Seeding lessons...");
  await seedLesson(budgetingBasics);
  await seedLesson(compoundInterest);

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
