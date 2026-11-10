import { dayNumber } from "./ist-date";
import { rupees } from "./money/categories";
import type { MoneyMonth } from "./money";

// The money fact of the day, shown with the Daily Money Reality Check. It
// rotates by date; on alternate days, if the student has logged spending this
// month, it's about their own numbers instead.
//
// The no-repeats rule: these are facts NO lesson, daily question or challenge
// already teaches, mostly money rights and money trivia, each checkable
// against its source. `npm test` checks them against everything else.

export type MoneyFact = { id: string; text: string; source?: string; href?: string; cta?: string };

export const MONEY_FACTS: MoneyFact[] = [
  {
    id: "failed-upi-compensation",
    text: "If a UPI payment fails but your account is debited, the bank must reverse it by the next working day, or pay you ₹100 for every day it's late.",
    source: "RBI turnaround-time rules for failed transactions",
  },
  {
    id: "rupee-symbol",
    text: "The ₹ symbol is younger than most smartphones: it was adopted in 2010, designed by D. Udaya Kumar, blending the Devanagari “र” and the Roman “R”.",
  },
  {
    id: "card-controls",
    text: "You can switch your debit or credit card's online, international and contactless use on or off, and set your own limits, in your bank's app.",
    source: "RBI card-security rules",
  },
  {
    id: "free-credit-report",
    text: "You're entitled to one free full credit report a year from every credit bureau in India: CIBIL is just one of them.",
    source: "RBI",
  },
  {
    id: "rbi-ombudsman",
    text: "If your bank doesn't sort out a complaint within 30 days, you can take it to the RBI Ombudsman for free at cms.rbi.org.in.",
    source: "RBI Integrated Ombudsman Scheme",
  },
  {
    id: "one-rupee-note",
    text: "The ₹1 note is the odd one out: it's issued by the Government of India and signed by the Finance Secretary, not the RBI Governor.",
  },
  {
    id: "cheque-validity",
    text: "A cheque is valid for three months from the date written on it. After that, the bank won't pay it.",
    source: "RBI",
  },
  {
    id: "udgam",
    text: "Money left untouched in a bank account for 10 years becomes an “unclaimed deposit”, but it's still yours. RBI's UDGAM portal helps families find it.",
    source: "RBI UDGAM",
  },
  {
    id: "failed-atm-compensation",
    text: "ATM didn't give you cash but debited your account? The bank must reverse it within five days. After that, it owes you ₹100 a day.",
    source: "RBI turnaround-time rules for failed transactions",
  },
  {
    id: "torn-notes",
    text: "Torn or soiled notes can be exchanged at bank branches, free of charge. You don't have to tape them up and hope a shopkeeper takes them.",
    source: "RBI note refund rules",
  },
  {
    id: "free-atm-withdrawals",
    text: "Banks must give you a set number of free ATM transactions each month (five at your own bank's ATMs). Beyond that, each one can cost you a fee.",
    source: "RBI",
  },
  {
    id: "fifty-paise",
    text: "50-paise coins are still legal tender in India. Shops may not love them, but they're real money.",
    source: "RBI",
  },
  {
    id: "senior-fd-rates",
    text: "Many banks pay senior citizens 0.25–0.5% extra on fixed deposits, worth knowing when your grandparents ask where to keep their savings.",
  },
  {
    id: "two-thousand-note",
    text: "₹2,000 notes were withdrawn from circulation in 2023 but are still legal tender. Found one in an old wallet? RBI issue offices still accept them.",
    source: "RBI",
  },
];

/** Today's money fact; `month` makes it personal on alternate days. */
export function moneyFactFor(day: string, month?: MoneyMonth): MoneyFact {
  const n = dayNumber(day);
  if (month && month.isCurrent && n % 2 === 0) {
    const topWant = month.byCategory.find((c) => c.kind === "want" && c.amount >= 100);
    if (topWant) {
      return {
        id: "personal-top-want",
        text: `${rupees(topWant.amount)} on ${topWant.label.toLowerCase()} this month. That's about ${Math.floor(topWant.amount / 15).toLocaleString("en-IN")} cutting chais at ₹15 each.`,
        href: "/money",
        cta: "See your spending",
      };
    }
  }
  return MONEY_FACTS[n % MONEY_FACTS.length];
}
