import type { ChoiceStep } from "../scenarios/types";

// Hand-written material for the Daily Challenge. Quick-fire days draw on the
// lesson quiz questions instead (see index.ts). Amounts are illustrative.

export type ScamMessage = { text: string; scam: boolean; why: string };

// "Spot the scams": each day shows three scams and three genuine messages.
export const SCAM_MESSAGES: ScamMessage[] = [
  {
    text: "SMS: \"Your KYC expires today! Update now at bit.ly/kyc-upd8 or your account will be blocked.\"",
    scam: true,
    why: "Urgent KYC threats with a short link are a classic scam. Banks don't block accounts over an SMS link.",
  },
  {
    text: "UPI request: \"₹4,999 cashback waiting for you. Enter your UPI PIN to receive it.\"",
    scam: true,
    why: "Your UPI PIN only ever sends money. No one needs it for you to receive money.",
  },
  {
    text: "Call: \"I'm from your bank's fraud team. Read me the OTP we just sent so we can stop a payment.\"",
    scam: true,
    why: "No bank ever asks for your OTP, not even its own fraud team.",
  },
  {
    text: "WhatsApp: \"Work from home! Earn ₹3,000 a day liking videos. Pay ₹500 registration to start.\"",
    scam: true,
    why: "A job that asks you to pay first is a task scam. Real employers pay you.",
  },
  {
    text: "SMS: \"Your electricity will be cut at 9:30 PM tonight. Call officer 98XXXXXX21 immediately.\"",
    scam: true,
    why: "Disconnection threats pointing to a personal mobile number are a well-known scam.",
  },
  {
    text: "Instagram DM: \"Congratulations, you won an iPhone! Pay ₹999 delivery charges to claim it.\"",
    scam: true,
    why: "A prize you never entered for, with a fee to claim it, is a scam.",
  },
  {
    text: "Email: \"Your income tax refund of ₹15,490 is approved. Click here and enter your card details.\"",
    scam: true,
    why: "Tax refunds go straight to your bank account. The department never asks for card details by email.",
  },
  {
    text: "SMS from your bank's usual sender ID: \"₹250 debited from A/c XX1234 at Swiggy. Not you? Call the number on the back of your card.\"",
    scam: false,
    why: "A normal debit alert that sends you to the official number on your own card.",
  },
  {
    text: "Your UPI app: \"You received ₹500 from Rahul Sharma.\" and your balance went up by ₹500.",
    scam: false,
    why: "A real credit that shows up in your own app and balance.",
  },
  {
    text: "Your college portal email: \"The fee receipt for semester 5 is available on the student portal.\"",
    scam: false,
    why: "An expected notice that asks for nothing and points to a portal you already use.",
  },
  {
    text: "SMS just after you tried to log in: \"482913 is your OTP for bank login. Do not share it with anyone.\"",
    scam: false,
    why: "An OTP you asked for, with the right warning. Just don't share it.",
  },
  {
    text: "A friend you know: \"Sent you ₹200 for the pizza 🍕\" and your UPI app shows ₹200 received.",
    scam: false,
    why: "A payment you expected, confirmed in your own app.",
  },
];

export const SCAM_FOLLOW_UPS: ChoiceStep[] = [
  {
    kind: "choice",
    prompt: "You paid a scammer ₹2,000 by UPI an hour ago. What's the best first step?",
    options: [
      {
        text: "Report it right away on 1930 or cybercrime.gov.in, and tell your bank",
        points: 2,
        feedback: "Yes, speed matters. Reporting quickly gives the best chance of freezing the money.",
      },
      {
        text: "Wait a few days to see if they send it back",
        points: 0,
        feedback: "Waiting gives the scammer time to move the money. Report on 1930 or cybercrime.gov.in straight away.",
      },
      {
        text: "Send them ₹1 with a message asking for a refund",
        points: 0,
        feedback: "Contacting the scammer again only exposes you more. Report it on 1930 and tell your bank.",
      },
      {
        text: "Only tell your bank, next time you visit the branch",
        points: 1,
        feedback: "Telling your bank helps, but call now, and report on 1930 or cybercrime.gov.in too.",
      },
    ],
  },
  {
    kind: "choice",
    prompt: "A caller knows your name and the last 4 digits of your card, and says they'll block a fraud payment if you share the OTP. What do you do?",
    options: [
      {
        text: "Share it. They clearly have your details already",
        points: 0,
        feedback: "Knowing a few details is how scammers build trust. An OTP approves a payment. Never share it.",
      },
      {
        text: "Hang up and call the number on the back of your card",
        points: 2,
        feedback: "Exactly. End the call and contact your bank yourself on its official number.",
      },
      {
        text: "Share only the first three digits",
        points: 0,
        feedback: "Any part of an OTP helps them. Hang up and call your bank's official number.",
      },
      {
        text: "Ask them to email you first",
        points: 1,
        feedback: "Better than sharing, but an email can be faked too. Hang up and call the official number yourself.",
      },
    ],
  },
];

// "Build a budget": a stipend and essentials that change week to week.
export const BUDGET_VARIANTS = [
  { income: 12000, essentials: 8000, city: "Pune" },
  { income: 15000, essentials: 10000, city: "Bengaluru" },
  { income: 18000, essentials: 11500, city: "Hyderabad" },
  { income: 20000, essentials: 13000, city: "Gurugram" },
];

export const BUDGET_FOLLOW_UPS: ChoiceStep[] = [
  {
    kind: "choice",
    prompt: "Your friends plan a ₹3,000 weekend trip, but only ₹1,500 is left in your wants budget this month. What's the smartest move?",
    options: [
      {
        text: "Go, and take the extra ₹1,500 from your savings",
        points: 0,
        feedback: "Dipping into savings for wants is how emergency funds disappear. Look for a cheaper plan first.",
      },
      {
        text: "Suggest a cheaper day trip, or join next month after saving up",
        points: 2,
        feedback: "Nice. You keep the fun and your plan. Saving up for it next month makes it guilt-free.",
      },
      {
        text: "Put the trip on a credit card and pay it later",
        points: 0,
        feedback: "Borrowing for wants you can't afford now often ends in interest. Find a cheaper plan instead.",
      },
      {
        text: "Skip it, and stop going out for the rest of the year",
        points: 1,
        feedback: "It protects your money, but a budget should still leave room for fun. A cheaper plan works better.",
      },
    ],
  },
  {
    kind: "choice",
    prompt: "Halfway through the month, your food budget is already used up. What now?",
    options: [
      {
        text: "Move money over from your wants budget, and cook or eat at the mess more",
        points: 2,
        feedback: "Right. Move money from wants (not savings) and adjust. Next month, plan food a little higher.",
      },
      {
        text: "Keep ordering in and fix it next month",
        points: 0,
        feedback: "Ignoring it usually means borrowing or raiding savings. Adjust now by moving money from wants.",
      },
      {
        text: "Take it from your emergency savings",
        points: 0,
        feedback: "Emergency savings are for real emergencies. Move money from wants instead.",
      },
      {
        text: "Borrow from a friend until payday",
        points: 1,
        feedback: "It works short-term, but you start next month in debt. Moving money from wants is better.",
      },
    ],
  },
];
