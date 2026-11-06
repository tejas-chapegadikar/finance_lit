import type { Expression } from "@/components/avatar/Avatar";

// What the avatar says on each part of the site, when nothing more specific
// is going on (a real event, or a page's own data-driven roast, comes
// first). Reusable and rotating: lines are picked by visit, never the same
// one twice in a row. `{name}` is the student's own name.

export type ContextLine = { expression: Expression; text: string };

const L = (expression: Expression, ...texts: string[]): ContextLine[] => texts.map((text) => ({ expression, text }));

const CONTEXT: { prefix: string; lines: ContextLine[] }[] = [
  {
    prefix: "/dashboard",
    lines: [
      ...L("welcoming", "Welcome back, {name}! Let's see what financial disasters you've created today.", "Oh, you're here. Your wallet told me you'd come crawling back."),
      ...L("thinking", "Pick a block. Any block. I promise to judge you fairly. Mostly."),
    ],
  },
  {
    prefix: "/money",
    lines: [
      ...L("thinking", "Your spending habits are looking… suspicious. Let's investigate.", "Every rupee you log is a rupee that can't hide from me."),
      ...L("confused", "Where does your money go every month? Let's find out together. Brace yourself."),
    ],
  },
  {
    prefix: "/lessons",
    lines: [
      ...L("proud", "Ready to prove that you know more than just your UPI PIN?", "Let's see if your financial knowledge is better than your attendance."),
      ...L("thinking", "One lesson a day keeps the money panic away. I made that up, but it's true."),
    ],
  },
  {
    prefix: "/revision",
    lines: L("thinking", "Revision time. The questions you got wrong are back, and they remember you.", "Getting it right the second time is how it actually sticks."),
  },
  {
    prefix: "/practice/",
    lines: L("excited", "Real decisions, fake consequences. My favourite kind.", "Let's see what you'd actually do with the money. No pressure. (Some pressure.)"),
  },
  {
    prefix: "/invest/simulator",
    lines: L("shocked", "Move the sliders. Watch time do the heavy lifting. Try not to faint.", "Wait… money can make more money?! Try starting 5 years later and watch me cry."),
  },
  {
    prefix: "/invest",
    lines: [
      ...L("thinking", "Let's make your money work instead of letting it disappear.", "Virtual money first. Real money later. Panic never."),
      ...L("excited", "Investing already? First learn how to stop spending all your pocket money!"),
    ],
  },
  {
    prefix: "/profile/avatar",
    lines: L("excited", "Ooh, a makeover. Make me look rich. Or at least financially literate.", "Dress me up. I've been wearing nothing but confidence."),
  },
  {
    prefix: "/profile",
    lines: L("proud", "This is us. Look how far we've come, {name}.", "Your trophy shelf. Some of these I even helped with."),
  },
  {
    prefix: "/personality",
    lines: L("thinking", "Six questions. I already know the answer, but go on.", "Be honest. I'll know if you're not."),
  },
  {
    prefix: "/settings",
    lines: L("sleepy", "Settings. The most exciting page on the internet.", "If you switch me off, I'll miss you. Just saying."),
  },
];

/** Lines when you click the avatar and it has nothing new to say. */
export const POKE_LINES: ContextLine[] = [
  ...L("shocked", "Hey! Personal space, please. I'm a financial professional."),
  ...L("happy", "Yes? Did you just log an expense? Did you? I'll know.", "Poke me again and I'll check your food delivery history."),
  ...L("excited", "Fun fact: ₹100 a day is ₹36,500 a year. You're welcome."),
  ...L("thinking", "I'm thinking about compound interest. Like always."),
  ...L("facepalm", "You clicked me instead of saving money. Classic."),
  ...L("proud", "Small reminder: you're doing better than you think."),
];

export function contextLinesFor(pathname: string): ContextLine[] {
  // "/practice/" means "anything under /practice"; other prefixes match the page and its sub-pages.
  const matches = (prefix: string) => (prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`));
  const match = CONTEXT.filter((c) => matches(c.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match?.lines ?? [];
}

export const fillName = (text: string, name: string) => text.replaceAll("{name}", name);
