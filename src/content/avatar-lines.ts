// Everything the avatar says on Home and in the guide pop-ups, in one place so
// it's easy to edit. Plain data only (no imports from the app), so it can be
// loaded lazily in the browser.
//
// Roast rules: roast habits, never the person. Never mention family money,
// looks or income. No swear words. src/lib/avatar/hub.test.ts checks every
// line for this, and that no line uses the em dash.
//
// Placeholders: {lesson}, {minutes}, {level}, {xp}.

export type RoastLevel = "mild" | "spicy" | "savage";
export type HubState = "new" | "unfinished" | "spent" | "noExpense" | "investIdle" | "nextLesson" | "done";
export type HubOptionId = "learn" | "money" | "invest";

type Lines = Record<RoastLevel, string[]>;

/** What the avatar says on Home, by situation and roast level. At least 3 of each, so it doesn't repeat. */
export const HUB_LINES: Record<HubState, Lines> = {
  new: {
    mild: [
      "Hi! Main tera paisa buddy hoon. Teen raaste hain: seekh, track kar, ya fake paise se invest kar.",
      "Welcome! Yahan paise ke baare mein seekhte hain aur apna kharcha track karte hain. Aaram se shuru kar.",
      "Naya hai? Koi baat nahi. Paisa samajhna mushkil nahi, bas shuru karna padta hai.",
    ],
    spicy: [
      "Main hoon tera paisa buddy. Teen raaste hain: seekh, track kar, ya fake paise se invest kar. Choose kar, main judge nahi karunga... zyada.",
      "Naya banda! Paisa kahan jaata hai, kisi ko nahi pata. Aaj se tujhe pata hoga.",
      "Welcome. Tera wallet tujhse baat karna chahta tha, isliye main aaya hoon.",
    ],
    savage: [
      "Aa gaya finally. Paisa kahan udta hai, ab pata chalega. Ready ho ja.",
      "Shart laga le, tujhe CIBIL ka matlab nahi pata. Chal, sudharte hain.",
      "Welcome to the party. Yahan excuses nahi chalte, sirf lessons aur kharche.",
    ],
  },
  unfinished: {
    mild: [
      "'{lesson}' adha reh gaya hai. Bas {minutes} min aur, khatam kar le.",
      "Tera '{lesson}' lesson wait kar raha hai. {minutes} min ka kaam hai.",
      "Wahin se shuru kar jahan chhoda tha: '{lesson}'. {minutes} min.",
    ],
    spicy: [
      "'{lesson}' ka lesson adha chhod ke bhaag gaya tha. Wapas aaja, sirf {minutes} min ka hai.",
      "Series adhi nahi chhodta, lesson kyun? '{lesson}' khatam kar, {minutes} min.",
      "'{lesson}' tera intezaar kar raha hai. {minutes} min, bas.",
    ],
    savage: [
      "'{lesson}' adha chhod diya? Commitment issues lesson se bhi? {minutes} min mein khatam kar.",
      "Adha lesson, adha gyaan, poora confusion. '{lesson}' khatam kar, {minutes} min.",
      "'{lesson}' ko ghost kar diya tune. Wapas ja, {minutes} min lagenge.",
    ],
  },
  // Spicy and Savage use a line from the roast engine (your real numbers) when there is one.
  spent: {
    mild: [
      "Is hafte kharcha thoda zyada lag raha hai. Ek baar dekh le kahan gaya.",
      "Paisa thoda tezi se ja raha hai. Chal, milke dekhte hain.",
      "Kharche pe ek nazar daal le, bas 2 minute.",
    ],
    spicy: ["Kharcha dekh ke mera dil baith gaya.", "Tera wallet SOS signal bhej raha hai.", "Paisa aise ja raha hai jaise sale chal rahi ho."],
    savage: [
      "Itna kharcha? Tu shopping karta hai ya shopping tujhe karti hai?",
      "Tera budget ro raha hai. Main bhi thoda.",
      "Paise ko pankh lag gaye hain, aur udaane wala tu hai.",
    ],
  },
  noExpense: {
    mild: [
      "Aaj ka kharcha abhi log nahi kiya. 10 second ka kaam hai.",
      "Aaj kuch kharcha hua? Daal de, main hisaab rakh lunga.",
      "Aaj ka hisaab baaki hai. Jaldi se log kar le.",
    ],
    spicy: [
      "Aaj ka kharcha log nahi kiya. Paise hawa mein gaye kya?",
      "Kharcha hua, pata hai mujhe. Log kar, chhupa mat.",
      "Aaj ka hisaab gayab hai. Chai bhi free nahi milti, log kar.",
    ],
    savage: [
      "Aaj ka kharcha log nahi kiya. Paisa khud se thodi gayab hota hai.",
      "Hisaab nahi rakhega, toh paisa bhi tera nahi rakhega.",
      "Kharcha log kar, ya maan le ki tujhe pata hi nahi kahan gaya.",
    ],
  },
  investIdle: {
    mild: [
      "Fake ₹1 lakh tera wait kar raha hai. Bina darr ke try kar.",
      "Investing seekhni hai? Pehle fake paise se khel ke dekh.",
      "Practice Investing mein galti bhi free hai. Ek baar dekh le.",
    ],
    spicy: [
      "Fake ₹1 lakh pada hai aur tu touch bhi nahi kar raha. Darr gaya?",
      "Paise fake hain, darr real lag raha hai kya?",
      "₹1 lakh free mein, aur tu ignore kar raha hai. Wow.",
    ],
    savage: [
      "Fake paise se bhi darr? Real wale ka kya hoga?",
      "₹1 lakh pada hai, tu reels dekh raha hai. Priorities.",
      "Investing se itna darr ki fake paise bhi nahi chhuta?",
    ],
  },
  nextLesson: {
    mild: [
      "Agla lesson ready hai: '{lesson}'. Sirf {minutes} min.",
      "Aaj ek lesson? '{lesson}' chalega, {minutes} min ka hai.",
      "'{lesson}' se aaj ka dimaag ka kaam ho jayega.",
    ],
    spicy: [
      "'{lesson}' ready hai. {minutes} min, reels se kam time.",
      "Dimaag ko bhi thoda kaam de. '{lesson}', {minutes} min.",
      "'{lesson}' padh le, kal doston ko gyaan dena.",
    ],
    savage: [
      "'{lesson}' padh le, warna paisa tujhe padhayega.",
      "{minutes} min ka lesson bhi heavy lagta hai? '{lesson}' kar.",
      "Gyaan zero, confidence full. '{lesson}' se balance kar.",
    ],
  },
  done: {
    mild: ["Aaj ka kaam done. Bahut badhiya!", "Teeno quests ho gaye. Ab aaram kar.", "Aaj ki streak safe hai. Shabaash."],
    spicy: [
      "Aaj ka kaam done. Legend. Streak bacha liya, ab chill kar.",
      "Teeno quests? Kaun hai tu, aur mere student ko kahan chhupaya?",
      "Done for today. Main impressed hoon, kisi ko batana mat.",
    ],
    savage: [
      "Aaj sab kar liya? Kal bhi karna padega, yaad rakhna.",
      "Done. Ab ye mat soch ki tu Warren Buffett ban gaya.",
      "Aaj ka kaam ho gaya. Kal phir aana, warna streak gayi.",
    ],
  },
};

/** The last sentence: always tells you to pick one option. */
export const HUB_CLOSERS: Record<HubOptionId | "none", string> = {
  learn: "Learn pe tap kar.",
  money: "My Money pe tap kar.",
  invest: "Practice Investing pe tap kar.",
  none: "Aur kuch karna ho toh upar se koi bhi chun le.",
};

export const HUB_OPTIONS: Record<HubOptionId, { title: string; subtitle: string }> = {
  learn: { title: "Learn", subtitle: "Money lessons & quizzes" },
  money: { title: "My Money", subtitle: "Track what you spend" },
  invest: { title: "Practice Investing", subtitle: "Invest fake money, real lessons" },
};

// ---------------------------------------------------------------- guide

export type GuideStep = { target: string; text: string };

/** One-time mini tours, the first time someone opens each section. */
export const TOURS: Record<string, GuideStep[]> = {
  home: [{ target: "hub", text: "Teen raaste hain: seekh, track kar, ya fake paise se invest kar. Jo chamak raha hai, wahi try kar." }],
  money: [
    { target: "money-add", text: "Yahan kharcha daal: amount, category, done. Baaki charts main bana dunga." },
    { target: "money-tabs", text: "Upar ke tabs mein budgets, goals aur poori history hai." },
    { target: "money-chart", text: "Ye chart batayega paisa kahan ja raha hai. Sach thoda kadwa ho sakta hai." },
  ],
  learn: [
    { target: "learn-path", text: "Ye tera level map hai. Ek level khatam, agla unlock. Shortcut nahi hai, sorry." },
    { target: "learn-continue", text: "Yahan se seedha agla lesson. Bas tap kar." },
  ],
  invest: [
    { target: "invest-locked", text: "Ye paise fake hain, galti bhi free hai. Pehle lesson padh, phir invest kar." },
    { target: "invest-portfolio", text: "Ye paise fake hain, galti bhi free hai. Pehle lesson padh, phir invest kar." },
    { target: "invest-assets", text: "Yahan chun kahan lagana hai. Risk dekh ke." },
    { target: "invest-ff", text: "Phir time fast-forward kar aur dekh kya hota hai." },
  ],
  profile: [
    { target: "profile-header", text: "Ye tu hai. Matlab tera avatar. Streak tod mat, warna ye rota hai." },
    { target: "profile-streak", text: "Yahan teri streak aur calendar hai. Roz ek quest, bas." },
  ],
};

/** "?" on pages that have no tour. */
export const PAGE_HELP: { prefix: string; text: string }[] = [
  { prefix: "/settings", text: "Yahan naam, avatar tips aur roast level badal. Savage chuna toh baad mein rona mat." },
  { prefix: "/profile/avatar", text: "Avatar sajaa. Kuch cheezein XP se khulti hain, toh lessons karta reh." },
  { prefix: "/personality", text: "Chhe sawaal, sach sach jawab de. Main judge karunga, par pyaar se." },
  { prefix: "/revision", text: "Jo galat kiya tha, wapas aaya hai. Is baar sahi kar, phir nahi aayega." },
  { prefix: "/lessons/", text: "Lesson padh, phir quiz de. Galti hui toh Coach hint dega." },
  { prefix: "/practice/", text: "Ye ek kahani hai. Har step pe sabse samajhdaar option chun." },
  { prefix: "/invest/simulator", text: "Sliders hila aur dekh, der se shuru karna kitna mehenga padta hai." },
];
export const FALLBACK_HELP = "Kho gaya? Neeche Today, Learn, Money aur Me tabs hain. Kahin bhi tap kar, main hoon na.";

/** First visit, 15 seconds without a tap or scroll. */
export const IDLE_TEXT = "Kho gaya? Main hoon na. Ye kar:";
export const IDLE_ACTIONS: Record<string, { label: string; target?: string; href?: string; quickAdd?: boolean }> = {
  home: { label: "Ye wala", target: "hub-suggested" },
  money: { label: "Kharcha daal", quickAdd: true },
  learn: { label: "Agla lesson", target: "learn-continue" },
  invest: { label: "Yahan se shuru", target: "invest-assets" },
  profile: { label: "Avatar sajaa", href: "/profile/avatar" },
};

export const EMPTY = {
  expenses: { text: "Abhi tak ek bhi kharcha nahi. Ya toh tu saint hai, ya log karna bhool gaya. Pehla daal.", button: "Pehla kharcha daal" },
  budget: { text: "Budget nahi hai? Matlab mahina tujhe chala raha hai. Ek limit set kar.", button: "Set your first budget" },
  goals: { text: "Koi goal nahi? Bina kaam ka paisa Swiggy pe chala jaata hai. Ek goal bana.", button: "Create a goal" },
  holdings: { text: "Abhi kuch invest nahi kiya. Fake paise hain, darr kaahe ka? Ek option chun.", button: "Show me" },
  holdingsHelp: "Yahan se ek option chun, amount daal aur Invest daba.",
};

export const LOCKED = {
  level: { text: "Abhi locked hai boss. Level {level} khatam kar, phir milega.", button: "Level {level} dikhao" },
  lesson: { text: "Abhi locked hai boss. Pehle '{lesson}' khatam kar.", button: "Wahan chal" },
  xp: { text: "Abhi locked hai boss. {xp} XP pe khulega. Lessons kar, XP aayega.", button: "Agla lesson" },
  tool: { text: "Abhi locked hai boss. Pehle '{lesson}' khatam kar, phir fake paise milenge.", button: "Lesson shuru kar" },
};

export const AFTER = {
  expense: { text: "Ho gaya! Ab neeche chart dekh, sach saamne aayega.", button: "Show me" },
  lesson: { text: "Ho gaya! Ab apna kharcha track kar ke dekh.", button: "Money kholo" },
  invest: { text: "Paisa laga diya. Ab time fast-forward kar ke dekh kya hota hai.", button: "Show me" },
};

export const ERROR_TEXT = "Kuch gadbad hui, meri galti. Ek baar aur try kar.";

/** Fills {placeholders}. */
export function fill(text: string, values: Record<string, string | number> = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
