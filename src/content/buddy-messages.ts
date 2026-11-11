// EVERYTHING THE MONEY BUDDY SAYS, in one place, so it's easy to edit.
// Grouped by when it's said (the trigger), with at least 3 versions of each
// so it doesn't repeat. Plain data only (no app imports), so the browser can
// load it lazily.
//
// Writing rules (src/content/buddy-messages.test.ts checks them):
// - Simple English only. No Hindi or Hinglish words.
// - Short: about 110 characters, 2 sentences (a few of the founder's own
//   examples use 3 short ones).
// - A funny best friend: sarcastic sometimes, roasting sometimes, helpful always.
// - Roast the HABIT, never the person. Never mention looks, family, caste,
//   religion, gender, or how much money someone or their family has. Never
//   shame a low balance or low income. Never roast essentials (rent, bills,
//   education, health). No swear words. No em dashes.
//
// Placeholders in {curly braces} are filled in with real numbers and names.
// Amounts and numbers are shown in bold automatically.

export type RoastLevel = "mild" | "spicy" | "savage";
export type HubState = "new" | "unfinished" | "spent" | "noExpense" | "investIdle" | "nextLesson" | "done";
export type HubOptionId = "learn" | "money" | "invest";
type Lines = string[];
type ByLevel = Record<RoastLevel, Lines>;

// ------------------------------------------------------------------ Home

/** The avatar's line on Home, by situation and roast level. Placeholders: {lesson}, {minutes}. */
export const HOME: Record<HubState, ByLevel> = {
  new: {
    mild: [
      "Hey, I'm your money buddy. Pick one: learn, track or invest.",
      "Welcome! Learn a little, track a little, and I'll cheer you on.",
      "New here? No stress. Start small, I've got your back.",
    ],
    spicy: [
      "Hey, I'm your money buddy. Pick one: learn, track or invest. I'll judge you either way.",
      "Welcome! Your money has been going places. Let's find out where.",
      "Hi! Your wallet asked me to have a word with you.",
    ],
    savage: [
      "Finally. Let's find out where your money keeps running off to.",
      "Welcome. No excuses here, just lessons and receipts.",
      "Hi. I'll be honest about your spending. Very honest.",
    ],
  },
  unfinished: {
    mild: [
      "You left '{lesson}' halfway. Just {minutes} min to finish it.",
      "'{lesson}' is waiting for you. Only {minutes} min left.",
      "Pick up '{lesson}' where you stopped. {minutes} min.",
    ],
    spicy: [
      "You ghosted '{lesson}' halfway. Come back, it's {minutes} min.",
      "You finish whole series in a night. '{lesson}' takes {minutes} min.",
      "'{lesson}' is still on read. {minutes} min to finish it.",
    ],
    savage: [
      "Half a lesson is half a brain. Finish '{lesson}', {minutes} min.",
      "'{lesson}' left on read. Commitment issues? {minutes} min, go.",
      "You quit '{lesson}' halfway. Bold. {minutes} min to fix that.",
    ],
  },
  // Used only when the roast rules below have nothing specific to say.
  spent: {
    mild: [
      "Spending looks a bit fast this week. Take a quick look?",
      "Your money is moving quickly. Let's check where it went.",
      "A 2-minute look at your spending could save you a lot.",
    ],
    spicy: [
      "Your wallet just sent an SOS. Let's take a look.",
      "Your money is leaving faster than your weekend plans.",
      "Spending check time. Brace yourself.",
    ],
    savage: [
      "Your budget is crying. Honestly, so am I.",
      "Your money has wings and you keep opening the window.",
      "That much spending? Did the sale shop you again?",
    ],
  },
  noExpense: {
    mild: [
      "You haven't logged today's spending yet. Takes 10 seconds.",
      "Spent anything today? Add it and I'll do the maths.",
      "Today's spending is still empty. Quick log?",
    ],
    spicy: [
      "Nothing logged today. Did your money vanish into thin air?",
      "I know you spent something. Log it, don't hide it.",
      "Today's log is empty. Even chai isn't free.",
    ],
    savage: [
      "No log today? Money doesn't disappear by itself, you know.",
      "Don't track it and it won't stay yours. Log today's spending.",
      "Log it, or admit you have no idea where it went.",
    ],
  },
  investIdle: {
    mild: [
      "Your fake ₹1 lakh is waiting. Try investing with zero risk.",
      "Want to learn investing? Practise with fake money first.",
      "Mistakes are free in Practice Investing. Have a look.",
    ],
    spicy: [
      "₹1 lakh of fake money and you won't touch it? Scared?",
      "The money is fake. Is the fear real?",
      "Free ₹1 lakh to practise with, and you're ignoring it. Wow.",
    ],
    savage: [
      "Scared of fake money? How will you handle real money?",
      "₹1 lakh is sitting there while you scroll reels. Priorities.",
      "Too scared to invest even fake money? Let's fix that.",
    ],
  },
  nextLesson: {
    mild: [
      "Next lesson is ready: '{lesson}'. Only {minutes} min.",
      "One lesson today? '{lesson}' takes {minutes} min.",
      "'{lesson}' is up next. An easy {minutes} min.",
    ],
    spicy: [
      "'{lesson}' is ready. {minutes} min, shorter than a reels break.",
      "Give your brain some work. '{lesson}', {minutes} min.",
      "Do '{lesson}' today and show off to your friends tomorrow.",
    ],
    savage: [
      "Learn '{lesson}' now, or money will teach you the hard way.",
      "{minutes} min feels heavy? Do '{lesson}' anyway.",
      "Zero knowledge, full confidence. '{lesson}' fixes that.",
    ],
  },
  done: {
    mild: ["All done for today. Nice work!", "All three quests done. Go relax.", "Streak saved for today. Well done."],
    spicy: [
      "All done. Streak saved. Okay, I'm a little impressed.",
      "All three quests? Who are you and what did you do with my user?",
      "Done for today. I'm impressed. Don't tell anyone.",
    ],
    savage: [
      "All done today? You have to do it again tomorrow, you know.",
      "Done. Don't start thinking you're a stock market expert.",
      "Today's done. Come back tomorrow or the streak dies.",
    ],
  },
};

/** The short last sentence on Home: which bubble to tap. */
export const HOME_CLOSERS: Record<HubOptionId | "none", Lines> = {
  learn: ["Tap Learn.", "Learn is glowing. Tap it.", "Start with Learn."],
  money: ["Tap My Money.", "My Money is glowing. Tap it.", "Start with My Money."],
  invest: ["Tap Practice Investing.", "Practice Investing is glowing.", "Start with Practice Investing."],
  none: ["Or pick anything above.", "Everything else is right above.", "Pick anything above if you're bored."],
};

/** The three bubbles on Home (labels, not lines). */
export const HUB_OPTIONS: Record<HubOptionId, { title: string; subtitle: string }> = {
  learn: { title: "Learn", subtitle: "Money lessons & quizzes" },
  money: { title: "My Money", subtitle: "Track what you spend" },
  invest: { title: "Practice Investing", subtitle: "Invest fake money, real lessons" },
};

// ------------------------------------------------------------------ guide tips

export type GuideStep = { target: string; lines: Lines };

/** One-time tips, the first time someone opens each section. Each step points at a [data-guide] target. */
export const TOURS: Record<string, GuideStep[]> = {
  home: [
    {
      target: "hub",
      lines: [
        "Hey, I'm your money buddy. Pick one: learn, track or invest. I'll judge you either way.",
        "Three ways to start: learn, track or invest. The glowing one is my pick.",
        "Tap a bubble to start. The glowing one is today's best move.",
      ],
    },
  ],
  money: [
    {
      target: "money-add",
      lines: [
        "Add what you spent here. Amount, category, done. I'll do the boring maths.",
        "Tap + to log a spend. It takes 10 seconds, I timed it.",
        "Every rupee goes in here. Amount, category, save.",
      ],
    },
    {
      target: "money-tabs",
      lines: [
        "Budgets, goals and your full history live in these tabs.",
        "Up here: budgets, goals and history. All the receipts.",
        "Switch tabs for budgets, goals and every past spend.",
      ],
    },
    {
      target: "money-chart",
      lines: [
        "This chart shows where your money goes. The truth may sting.",
        "Your spending, as a chart. No hiding from this one.",
        "This chart never lies. Unlike 'just one more order'.",
      ],
    },
  ],
  learn: [
    {
      target: "learn-current",
      lines: [
        "This is your level map. Finish one, unlock the next. No shortcuts, sorry.",
        "You're standing here. Finish this stop and walk to the next.",
        "One stop at a time. Each lesson unlocks the next one.",
      ],
    },
    {
      target: "learn-continue",
      lines: ["This button takes you straight to your next lesson.", "Tap here to jump into the next lesson.", "Shortcut to your next lesson. Just tap it."],
    },
  ],
  invest: [
    {
      target: "invest-locked",
      lines: [
        "This is fake money, so mistakes are free. Read a lesson first, then go wild.",
        "Practice Investing opens after one lesson. Fake money, real skills.",
        "Finish the first investing lesson and this unlocks. Worth it.",
      ],
    },
    {
      target: "invest-portfolio",
      lines: [
        "This is fake money, so mistakes are free. Read a lesson first, then go wild.",
        "Your pretend portfolio. Lose it all, nobody gets hurt.",
        "Fake money lives here. Make your mistakes now, for free.",
      ],
    },
    {
      target: "invest-assets",
      lines: [
        "Pick where to put your money here. Check the risk first.",
        "Choose an option, type an amount, invest.",
        "Each option has its own risk. Read the label first.",
      ],
    },
    {
      target: "invest-ff",
      lines: ["Then fast-forward time and see what happens.", "Skip ahead a few months and watch your money move.", "Fast-forward here. Try not to panic."],
    },
  ],
  profile: [
    {
      target: "profile-header",
      lines: [
        "This is you. Well, your avatar. Keep the streak alive or it gets sad.",
        "Your avatar, your level, your XP. All in one place.",
        "That's you. Dress me up in Avatar Studio when you earn new stuff.",
      ],
    },
    {
      target: "profile-streak",
      lines: [
        "This is your streak. Do one quest a day. That's it. Even you can manage that.",
        "One quest a day keeps the streak alive. That's the whole deal.",
        "Every flame here is a day you showed up. Don't break the chain.",
      ],
    },
  ],
};

/** "?" on pages with no tour. Matched by the start of the page's address. */
export const PAGE_HELP: { prefix: string; lines: Lines }[] = [
  {
    prefix: "/settings",
    lines: [
      "Change your name, buddy tips and roast level here.",
      "Turn tips off or pick a roast level. Savage is not for the weak.",
      "Your settings. Pick Mild if you want me gentle.",
    ],
  },
  {
    prefix: "/profile/avatar",
    lines: [
      "Dress me up. Some items unlock with XP, so keep learning.",
      "Pick a look. More items unlock as you level up.",
      "Style me. Locked items open as you earn XP.",
    ],
  },
  {
    prefix: "/personality",
    lines: [
      "Six quick questions. Answer honestly, I'll judge kindly.",
      "Six questions about how you handle money. No wrong answers.",
      "Be honest here. Nobody sees your answers but you.",
    ],
  },
  {
    prefix: "/revision",
    lines: [
      "These are questions you got wrong before. Get them right now.",
      "Old mistakes, second chances. Nail them this time.",
      "Get these right and they stop coming back.",
    ],
  },
  {
    prefix: "/lessons/",
    lines: [
      "Read the lesson, then take the quiz. Stuck? The Coach gives hints.",
      "Read first, quiz after. Hints are there if you need them.",
      "Short lesson, quick quiz. You've got this.",
    ],
  },
  {
    prefix: "/practice/",
    lines: [
      "This is a story. Pick the smartest choice at each step.",
      "Real-life money moments. Choose what you'd really do.",
      "Pick wisely at each step. The ending depends on you.",
    ],
  },
  {
    prefix: "/invest/simulator",
    lines: [
      "Move the sliders and see how much waiting costs you.",
      "Drag the sliders. Watch what starting early does.",
      "Try a longer time. Compounding loves patience.",
    ],
  },
];
export const FALLBACK_HELP: Lines = [
  "Lost? The tabs at the bottom take you anywhere. I'm right here.",
  "Home, Learn, Money and Me are at the bottom. Tap any of them.",
  "Not sure where to go? Try Home. I'll point the way.",
];

/** First visit, 15 seconds without a tap or a scroll. */
export const IDLE: Lines = ["Lost? Happens to the best of us. Tap here to start.", "Stuck? No worries. Try this first.", "Not sure where to go? Start here."];
export const IDLE_ACTIONS: Record<string, { label: string; target?: string; href?: string; quickAdd?: boolean }> = {
  home: { label: "Show me", target: "hub-suggested" },
  money: { label: "Log it", quickAdd: true },
  learn: { label: "Start", target: "learn-continue" },
  invest: { label: "Show me", target: "invest-assets" },
  profile: { label: "Dress me up", href: "/profile/avatar" },
};

/** Empty pages: what to do first, with one button. */
export const EMPTY = {
  expenses: {
    lines: [
      "No expenses yet? Either you're a monk or you forgot to log. Add one.",
      "Nothing logged yet. Add one spend and I'll start the maths.",
      "Empty! Log your first spend, even if it's just chai.",
    ],
    button: "Add your first spend",
  },
  budget: {
    lines: [
      "No budget? Then the month is running you. Set one limit.",
      "Set one budget and I'll warn you before it breaks.",
      "No limits set yet. Start with just one category.",
    ],
    button: "Set your first budget",
  },
  goals: {
    lines: [
      "No goal yet? Money without a job wanders off. Give it one.",
      "Saving for something? Make it a goal and watch it grow.",
      "Pick one thing to save for. A trip, a phone, anything.",
    ],
    button: "Create a goal",
  },
  holdings: {
    lines: [
      "Nothing invested yet. It's fake money, so why so scared? Pick one.",
      "Your portfolio is empty. Pick an option and try it.",
      "Zero investments. Fake money, zero risk. Go on.",
    ],
    button: "Show me",
  },
  holdingsHelp: [
    "Pick an option here, type an amount and tap Invest.",
    "Choose one, enter an amount, then Invest.",
    "Start here. One option, one amount, Invest.",
  ],
};

/** Tapping something locked. Placeholders: {level}, {lesson}, {xp}. */
export const LOCKED = {
  level: {
    lines: [
      "Locked. Finish Level {level} first. Patience is also a money skill.",
      "Not yet. Level {level} comes first. No shortcuts, sorry.",
      "Locked until Level {level} is done. You're close.",
    ],
    button: "Show Level {level}",
  },
  lesson: {
    lines: ["Locked. Finish '{lesson}' first.", "Not yet. '{lesson}' comes before this one.", "Do '{lesson}' first, then this one opens."],
    button: "Take me there",
  },
  xp: {
    lines: [
      "Locked. This opens at {xp} XP. Lessons give you XP.",
      "You need {xp} XP for this. A few lessons will do it.",
      "Opens at {xp} XP. Keep learning, it'll come.",
    ],
    button: "Next lesson",
  },
  tool: {
    lines: [
      "Locked. Finish '{lesson}' first, then the fake money is yours.",
      "Read '{lesson}' first. Then you get ₹1 lakh to play with.",
      "One lesson stands between you and fake riches: '{lesson}'.",
    ],
    button: "Start the lesson",
  },
};

/** Right after you do something. */
export const AFTER = {
  expense: {
    lines: [
      "Logged. Now check the chart below. The truth awaits.",
      "Saved! Peek at the chart to see where it all goes.",
      "Done. Want to see how this week looks?",
    ],
    button: "Show me",
  },
  lesson: {
    lines: [
      "Look at you, learning things. Now track what you spent today.",
      "Lesson done. Now log today's spending.",
      "Brain fed. Now let's check your wallet.",
    ],
    button: "Log it",
  },
  invest: {
    lines: [
      "Money invested. Now fast-forward time and see what happens.",
      "Done! Skip ahead a few months and watch.",
      "Invested. Hit fast-forward, then try not to panic.",
    ],
    button: "Show me",
  },
};

/** When something breaks. */
export const ERRORS: Lines = [
  "Oops, that one's on me. Try again?",
  "Something went wrong on my side. Give it another go?",
  "My bad, that didn't work. Try once more?",
];

// ------------------------------------------------------------------ roasts and hype

export type RoastId = "food" | "saleBuys" | "lateNight" | "smallSpends" | "budgetCrossed";

/**
 * Roasts about your real spending (src/lib/buddy/roasts.ts decides which one).
 * Placeholders: food {amount} {place}; saleBuys {count}; lateNight {time};
 * smallSpends {each} {thing} {count} {total}; budgetCrossed {weekday}.
 */
export const ROASTS: Record<RoastId, ByLevel> = {
  food: {
    mild: [
      "{amount} on {place} this week. Your kitchen misses you.",
      "{amount} on {place} in 7 days. Maybe cook once this week?",
      "{amount} went to {place} this week. Your kitchen feels ignored.",
    ],
    spicy: [
      "{amount} on {place} this week. Do you even know where your kitchen is?",
      "{amount} on {place}. The delivery guy knows your address by heart.",
      "{amount} on {place} this week. Your stove thinks you moved out.",
    ],
    savage: [
      "{amount} on {place}. At this point they should send you a birthday card.",
      "{amount} on {place} this week. You're not a customer, you're a sponsor.",
      "{amount} on {place}. Your kitchen is now a very expensive cupboard.",
    ],
  },
  saleBuys: {
    mild: [
      "{count} sale buys in 2 days. Careful, sales are sneaky.",
      "{count} shopping buys in 2 days. Maybe sleep on the next one?",
      "{count} buys in 2 days. Try waiting a day before the next one.",
    ],
    spicy: [
      "{count} sale buys in 2 days. The sale isn't saving you money. It's spending it.",
      "{count} buys in 2 days. Your cart is working overtime.",
      "{count} shopping hits in 2 days. Who's winning, you or the app?",
    ],
    savage: [
      "{count} sale buys in 2 days. You didn't shop the sale. The sale shopped you.",
      "{count} buys in 2 days. The delivery guy is basically your roommate.",
      "{count} orders in 2 days. Your wallet would like to unsubscribe.",
    ],
  },
  lateNight: {
    mild: [
      "Shopping at {time}? Your wallet was asleep. You should be too.",
      "A {time} order? Sleep on it next time. Literally.",
      "Shopping at {time}. Add to cart, decide in the morning?",
    ],
    spicy: [
      "Shopping at {time}? Nothing good gets bought after midnight.",
      "A {time} shopping spree. Your wallet was asleep. You should be too.",
      "Ordering at {time}? Your sleep and your savings both lost.",
    ],
    savage: [
      "{time} shopping? Night owl, morning regret.",
      "Shopping at {time}? Future you is already sighing.",
      "A {time} checkout. The app loves you. Your wallet doesn't.",
    ],
  },
  smallSpends: {
    mild: [
      "{count} small spends this week made {total}. Little leaks add up.",
      "Small spends added up to {total} this week. Worth a look?",
      "{each} here and there, {count} times. That's {total} so far.",
    ],
    spicy: [
      "{each} {thing}, {count} times. That's {total}. Small sips, big leaks.",
      "{total} on small stuff this week. It's never 'just {each}'.",
      "{count} 'it's just {each}' moments. That's {total} now.",
    ],
    savage: [
      "{each} {thing}, {count} times. That's {total}. Small sips, big leaks.",
      "{total} in tiny spends. You didn't leak money, you flooded it.",
      "{each} at a time, {total} gone. Sneaky, sneaky.",
    ],
  },
  budgetCrossed: {
    mild: [
      "You've gone over your budget. Let's slow down for the rest of the month.",
      "Budget crossed. No panic, just slower days ahead.",
      "Over budget now. A few no-spend days will help.",
    ],
    spicy: [
      "Budget? What budget? It left the chat on {weekday}.",
      "Your budget said no. You heard yes.",
      "Over budget already. The month isn't done with you yet.",
    ],
    savage: [
      "Budget? What budget? It left the chat on {weekday}.",
      "Your budget was more of a suggestion, wasn't it?",
      "Over budget. Even your budget needs a budget now.",
    ],
  },
};

/** Praise for good habits. Placeholders: streak {days}; goal {goal} {pct}. */
export const HYPE = {
  underBudget: [
    "Under budget all week. Who are you and what did you do with my user?",
    "A whole week under budget. Okay, legend.",
    "Under budget for 7 days. Your wallet is smiling.",
  ],
  streak: [
    "{days}-day streak. Okay, I'm a little impressed. Don't tell anyone.",
    "{days} days in a row. Look at you, being consistent.",
    "{days}-day streak! Keep it alive, it's growing on me.",
  ],
  goal: ["{goal} at {pct}%. Future you says thanks.", "{goal} is {pct}% done. Keep feeding it.", "{pct}% of {goal} saved. Look at you go."],
  noSpend: ["A no-spend day? Your wallet says thank you.", "Zero spent today. Quietly iconic.", "Nothing spent today. Your wallet is sending flowers."],
};

// ------------------------------------------------------------------ moments (avatar events)

/**
 * What the buddy says when something happens (see src/lib/avatar/reactions.ts
 * for each one's face and importance). {name} is the student's nickname.
 */
export const EVENTS: Record<string, { title?: string; lines: Lines }> = {
  "quest-done": {
    title: "Quest done · +{xp} XP",
    lines: ["One down. Look at you, doing things.", "Done. Don't let it go to your head.", "Quest cleared. Mild applause."],
  },
  "quests-all": {
    title: "All 3 quests done · +{xp} XP",
    lines: ["All three? Who are you and what did you do with my user?", "Full set. I'll be telling everyone.", "All quests done. Okay, show-off."],
  },
  "xp-level": {
    title: "Level {level}!",
    lines: [
      "You levelled up. I'd say I'm proud, but I have a reputation.",
      "New level. Same spending habits, but we're working on it.",
      "Level up! Your brain just got an upgrade.",
    ],
  },
  greeting: {
    lines: [
      "Hey {name}! What are we not overspending on today?",
      "Morning check: wallet still exists. Good start.",
      "New day, new chance to not overspend on chai.",
    ],
  },
  "welcome-back": { lines: ["You're back! Let's get that money sorted.", "{name}! I kept your spot warm.", "Missed you. Let's start fresh today."] },
  expense: { lines: ["Logged. Future you appreciates the paperwork.", "Noted. Your wallet has been informed.", "Tracked. Money can't hide from us now."] },
  "first-expense": {
    lines: [
      "Your first logged spend! Now we know where money goes.",
      "First entry! This is how money stops disappearing.",
      "{name}, first spend logged. The mystery is over.",
    ],
  },
  "no-spend": { lines: HYPE.noSpend },
  "budget-near": {
    lines: [
      "Heads up, {label} is at {pct}%. Slow down a little?",
      "{label} is nearly full. Maybe skip one treat this week?",
      "{label} at {pct}%. We can still land this month.",
    ],
  },
  "budget-over": {
    lines: [
      "{label} just went over. Deep breath. We adjust, we don't panic.",
      "{label} crossed its budget. Slower days ahead?",
      "Over on {label}. The budget has left the chat.",
    ],
  },
  "on-track": {
    lines: [
      "Halfway through the month and still under budget. Look at you.",
      "{name}, you're actually sticking to the plan!",
      "Mid-month and under budget. Quietly impressive.",
    ],
  },
  deposit: {
    lines: ["{goal} at {pct}%. Future you says thanks.", "{amount} into {goal}. Future you just smiled.", "Saved {amount}. Small amounts, big energy."],
  },
  "goal-half": { lines: ["Halfway to {goal}! Don't stop now.", "{goal} is 50% done. We're cooking.", "Half of {goal} saved. Future you says thanks."] },
  "goal-reached": {
    title: "Goal reached: {goal}",
    lines: ["You did it! {goal} is fully saved.", "{goal}: done. Treat yourself. Responsibly.", "Goal complete. I'm doing a tiny dance."],
  },
  "lesson-complete": { lines: ["Brain upgraded. Wallet next?", "'{title}' done. Knowledge acquired.", "Lesson complete. I'd high-five you, but tiny arms."] },
  "lesson-perfect": {
    lines: [
      "Full marks? Who are you and what did you do with my user?",
      "Perfect score. Showing off a little, aren't we?",
      "No mistakes. Not even one. I'm emotional.",
    ],
  },
  "invest-lesson": {
    lines: ["Investing brain: loading... loaded.", "'{title}' done. You know more than most finfluencers now.", "Look at you, understanding the stock market."],
  },
  "invest-complete": {
    title: "InvestSmart complete",
    lines: [
      "Every InvestSmart lesson done. Time is now your best friend.",
      "InvestSmart finished. You get investing better than most adults.",
      "All investing lessons done. Fake money, real skills.",
    ],
  },
  "level-up": {
    title: "Level {level} complete",
    lines: [
      "Level {level} done! The next level is open now.",
      "Level {level} cleared. I'm doing a little dance.",
      "Level {level} done. Your money brain grew a size.",
    ],
  },
  "path-complete": {
    title: "Money IQ path complete",
    lines: [
      "All four levels done. You're officially money smart.",
      "You finished the whole path. Framing this moment.",
      "Every level done. Okay, I'm properly impressed.",
    ],
  },
  "reality-check": { lines: ["Reality checked. Slightly less scary now.", "One more money truth unlocked.", "Nice one. Same time tomorrow?"] },
  "daily-challenge": { lines: ["Another day, another money win!", "Challenge cleared. Too easy?", "Challenge done. You're making this look easy."] },
  "habit-step": { lines: ["Day {day} of 30, done. Tiny steps, real habits.", "Habit step done. Showing up is a superpower.", "Another day in the books."] },
  "habit-week": { lines: ["Week {week} of the 30-day challenge: done!", "That's week {week} done. Keep going.", "Week {week} cleared. The habit is forming."] },
  "habit-done": {
    title: "30-day challenge complete",
    lines: ["30 days! Thirty! I honestly bet on day 4.", "Thirty days straight. That's a real habit now.", "Challenge complete. You actually did it."],
  },
  "challenge-done": {
    title: "{title} complete",
    lines: ["'{title}', conquered!", "You said 'challenge accepted' and meant it.", "Challenge done. Next one?"],
  },
  streak: { title: "{days}-day streak", lines: HYPE.streak },
  "xp-milestone": { title: "{xp} XP", lines: ["{xp} XP! That's a lot of learning.", "Just crossed {xp} XP. Big brain energy.", "{xp} XP. You're on a roll."] },
  badge: { title: "New badge: {badge}", lines: ["New badge: {badge}. Shiny.", "You earned {badge}. Frame it.", "{badge} unlocked. Wear it proudly."] },
  "rank-up": { title: "New rank: {rank}", lines: ["New rank: {rank}. The glow-up is real.", "Meet {rank}. Fancy.", "{rank} unlocked. Keep climbing."] },
  "item-unlocked": {
    title: "Unlocked: {item}",
    lines: ["You unlocked {item}! Shall we try it on?", "{item} is waiting in Avatar Studio.", "New look unlocked: {item}."],
  },
  simulator: {
    lines: ["Wait... money can make more money?", "Compounding is basically money doing push-ups.", "Time does the heavy lifting here. Start early!"],
  },
  "invest-first": {
    lines: [
      "Your first investment! Fake money, real lessons.",
      "Investor mode: on. Now fast-forward and stay calm.",
      "Money at work instead of in food apps. Nice.",
    ],
  },
  "invest-crash": {
    lines: [
      "Markets just fell {pct}%. Deep breath, this is normal.",
      "Ouch, red everywhere. Selling now locks in the loss.",
      "Don't touch that sell button. Falls like this are why we hold for years.",
    ],
  },
  "invest-up": {
    lines: [
      "Up {pct}%! Don't get cocky, markets humble everyone.",
      "Compounding is doing push-ups for you.",
      "Nice gains. It won't always look like this, so stay calm.",
    ],
  },
  "invest-allin": {
    lines: [
      "All your money in one stock? Bold. Diversify, it's like a seatbelt.",
      "Everything in one company? Good thing this money is fake.",
      "One stock only? That's how people learn hard lessons.",
    ],
  },
  "invest-diversified": {
    lines: [
      "Spread across different options. That's how grown-up investors do it.",
      "A balanced portfolio. I didn't expect this much maturity.",
      "Diversified! Your risk just went on a diet.",
    ],
  },
  "invest-panic": {
    lines: [
      "Selling right after a crash? Classic panic-selling.",
      "You sold in the dip. The market thanks you for your donation.",
      "Sold low after a fall. Next time, hold your nerve.",
    ],
  },
};

// ------------------------------------------------------------------ quizzes

/** Reactions to quiz answers: tease what you know, never who you are. */
export const QUIZ = {
  right: [
    "Correct. I'm as shocked as you are.",
    "Right! Was that knowledge or luck? Don't answer.",
    "Yes! Write this date down.",
    "Correct. Don't let it go to your head.",
    "Look at you, knowing things.",
  ],
  wrong: [
    "Nope. Bold guess, though.",
    "Wrong. Confidently wrong, which is the expensive kind.",
    "Not even close. This is why we're here.",
    "Nope. Your bank was hoping you'd say that.",
    "That's a no. Read this bit slowly.",
  ],
  /** The verdict on a whole quiz, by score. */
  verdict: {
    perfect: ["Full marks. Suspicious, but well done.", "Perfect score. Okay, genius.", "100%. I have nothing to roast."],
    good: ["Pretty good. You almost seem to know about money.", "Solid score. A few slips, but nice.", "Good job. Fix the misses and you're set."],
    pass: ["Passable. Like your attendance.", "You passed. Just about.", "Not bad, not great. Revision will help."],
    rough: [
      "Well, that was rough. Good thing it wasn't real money.",
      "Ouch. Read it once more and try again.",
      "That stung. Mistakes now are cheaper than later.",
    ],
  },
};

// ------------------------------------------------------------------ sign in and landing page

type Mood = { expression: "happy" | "shocked" | "thinking" | "excited" | "welcoming" | "proud" | "confused" | "facepalm"; text: string };

/** The avatar on the sign-in and sign-up page. */
export const SIGN_IN = {
  hello: ["Hi! I'm your new money buddy.", "Hey! Ready to sort out your money?", "Welcome! I'll be your money buddy."],
  welcomeBack: ["You're back! I missed roasting you.", "Welcome back! Your wallet missed me.", "Back again? Let's check on your money."],
  busy: ["Off to Google. Back in a sec!", "Heading to Google. Hold on!", "Taking you to Google. Be right back!"],
  oops: ["Oops. Small hiccup, we'll sort it.", "Hmm, that didn't work. Let's try again.", "Something went wrong. Not your fault."],
  pokes: [
    { expression: "happy", text: "Hey! Fingers off the merchandise." },
    { expression: "shocked", text: "You poke me before you've even logged in?" },
    { expression: "thinking", text: "Still here? The button's right there." },
    { expression: "excited", text: "Fine. One more poke, then we talk about your spending." },
  ] satisfies Mood[],
};

/** The landing page's avatar (it says the next line every time you poke it). */
export const LANDING_HERO: Mood[] = [
  { expression: "welcoming", text: "Hi! I'll teach you money and judge your spending. Mostly judge." },
  { expression: "shocked", text: "₹400 on food delivery? In one night? We need to talk." },
  { expression: "thinking", text: "A credit limit is not free money. I'll repeat this until you believe me." },
  { expression: "proud", text: "Saved a bit this month? Look at you, future crorepati." },
  { expression: "confused", text: "Your bank will never ask for your OTP. That 'bank' calling you? Not a bank." },
  { expression: "excited", text: "Want to try investing? I've got ₹1,00,000 of fake money. Zero risk." },
  { expression: "facepalm", text: "Three weeks over budget in a row? I'm not mad. Just disappointed." },
  { expression: "happy", text: "Keep poking me. I have a lot of opinions about your wallet." },
];

/** The strip of roasts running across the landing page. */
export const LANDING_ROASTS: Lines = [
  "'I'll start saving next month.' You, for 26 months.",
  "You know your food order number by heart. Your CIBIL score? Never met it.",
  "'It's only ₹99.' Said 40 times this month.",
  "You call it self-care. Your bank calls it a pattern.",
  "Investing advice from a reel. Bold.",
  "Your savings plan is 'I'll see next month'.",
  "You read the whole menu but not one loan agreement.",
  "Your budget is a vibe. That's the problem.",
];

// ------------------------------------------------------------------ helpers

/** Fills {placeholders}; anything missing becomes empty. */
export function fill(text: string, values: Record<string, string | number | undefined> = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

/** One version of a line, picked by a number (so server and browser agree). */
export function pick(lines: Lines, seed: number) {
  return lines[Math.abs(Math.floor(seed)) % lines.length];
}

/** A whole-number seed from any text (an event id, a page, a day). */
export function seedOf(text: string) {
  let n = 0;
  for (const ch of text) n = (n * 31 + ch.charCodeAt(0)) % 999983;
  return n;
}
