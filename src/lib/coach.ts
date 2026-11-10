import Anthropic from "@anthropic-ai/sdk";
import { Prisma } from "@prisma/client";
import { db } from "./db";

const COACH_MODEL = "claude-opus-5-5";
const LETTERS = ["A", "B", "C", "D"];

const SYSTEM_PROMPT = `You are the Rupli Coach, a friendly tutor inside a financial-literacy app for Indian college students and fresh graduates. A student just picked a wrong answer on a lesson quiz. Write a short hint that helps them work out the right answer themselves.

- Never reveal the correct option, not by its letter, by quoting or paraphrasing its text, or by ruling out the other options. The student must still choose.
- Briefly say why their pick doesn't fit, then explain the idea from the lesson that decides the question, in plain, friendly language. Use ₹ amounts or everyday Indian examples when they help.
- End with one short question that nudges them to reason it out.
- Hint 1 is gentle: point them at the key idea. Hint 2 means they have now missed twice: be more direct about the concept that decides it, still without giving the answer away.
- 2-3 sentences, under 70 words. Plain text only: no markdown, lists, headings, or emojis.
- Write like a friendly older cousin, not a textbook. Never use the em dash character.
- Stay within the current lesson and question. This is education, not personal financial advice: never recommend stocks, funds or other products, never tell the student what to invest in or do with their own money, and never promise or predict returns.

Latency-sensitive; begin your answer immediately.`;

type CoachOption = { id: string; text: string; isCorrect: boolean };

export type CoachHintInput = {
  questionId: string;
  prompt: string;
  explanation: string;
  /** In display order, so letters match what the student sees. */
  options: CoachOption[];
  lessonTitle: string;
  lessonContent: string;
  /** The course team's own hint for this question, used when the AI is unavailable. */
  authoredHint: string | null;
  /** Wrong options the student has picked so far, in the order picked. */
  wrongOptionIds: string[];
};

/** `source: "fallback"` means the AI was unavailable and this is a written hint. */
export type CoachHint = { level: number; text: string; source: "ai" | "fallback" };

const GENERIC_HINTS: Record<number, string> = {
  1: "Think back to the main idea the lesson used to explain this. Which option fits it best?",
  2: "Re-read the question's key words and compare them with the lesson's main point. Which of the remaining options matches?",
};

/** A hint that never needs the AI: the course team's hint first, then a generic nudge. */
export function fallbackHint(level: number, authoredHint: string | null): CoachHint {
  const text = level === 1 && authoredHint ? authoredHint : (GENERIC_HINTS[level] ?? GENERIC_HINTS[2]);
  return { level, text, source: "fallback" };
}

export async function getOrCreateCoachHint(input: CoachHintInput): Promise<CoachHint> {
  const level = input.wrongOptionIds.length;
  const key = { questionId: input.questionId, wrongOptionIds: [...input.wrongOptionIds].sort().join(",") };

  const cached = await db.coachHint.findUnique({ where: { questionId_wrongOptionIds: key } });
  if (cached) {
    return { level, text: cached.text, source: "ai" };
  }

  const text = await generateHint(input, level);
  if (!text) {
    // The lesson must stay usable when the AI isn't, never fail the quiz here.
    return fallbackHint(level, input.authoredHint);
  }

  try {
    await db.coachHint.create({ data: { ...key, level, text, model: COACH_MODEL } });
  } catch (err) {
    // Another student hit the same wrong path at the same moment, serve the
    // hint that won the race so everyone on this path sees the same text.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await db.coachHint.findUnique({ where: { questionId_wrongOptionIds: key } });
      if (existing) return { level, text: existing.text, source: "ai" };
    } else {
      // Caching is an optimisation, the student still gets this hint.
      console.error("[coach] couldn't cache hint", err);
    }
  }
  return { level, text, source: "ai" };
}

let client: Anthropic | null = null;

async function generateHint(input: CoachHintInput, level: number): Promise<string | null> {
  try {
    // A student is waiting on this, so keep the request bounded instead of
    // the SDK's 10-minute default.
    client ??= new Anthropic({ timeout: 20_000, maxRetries: 1 });

    const response = await client.beta.messages.create({
      model: COACH_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(input, level) }],
    });

    if (response.stop_reason !== "end_turn") {
      console.warn(`[coach] no hint for question ${input.questionId}: stop_reason=${response.stop_reason}`);
      return null;
    }

    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    if (!text || revealsAnswer(text, input)) {
      console.warn(`[coach] discarded hint for question ${input.questionId}: empty or revealed the answer`);
      return null;
    }
    return text;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[coach] Anthropic rejected the API key. Check ANTHROPIC_API_KEY");
    } else if (err instanceof Anthropic.RateLimitError) {
      console.warn("[coach] rate limited by the Anthropic API");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[coach] Anthropic API error ${err.status}: ${err.message}`);
    } else {
      console.warn(`[coach] AI hint unavailable, using a built-in hint: ${err instanceof Error ? err.message : err}`);
    }
    return null;
  }
}

// ── Follow-up questions ──────────────────────────────────────────────────
// After a question is answered (so the answer is already on screen), the
// student can ask the Coach a few follow-ups about it.

export const MAX_FOLLOW_UPS = 3;
export const MAX_FOLLOW_UP_LENGTH = 300;

export { COACH_MODEL };

const FOLLOW_UP_PROMPT = `You are the Rupli Coach, a friendly tutor inside a financial-literacy app for Indian college students and fresh graduates. The student has just answered a lesson quiz question. The correct answer and its explanation are already on their screen, and is asking you a follow-up.

- Write like a friendly older cousin, not a textbook. Never use the em dash character.
- Reply in plain, friendly language: 2-4 short sentences, under 100 words. Plain text only: no markdown, lists, headings or emojis.
- Help them understand: why an answer is right or wrong, a simpler explanation, or a fresh everyday Indian example with ₹ amounts.
- Stay grounded in the lesson text you're given. If the question goes beyond the lesson, say so briefly and point them to the lesson or a trusted official source.
- This is education, not personal financial advice: never recommend specific stocks, funds, cards, loans or other products, never tell the student what to do with their own money, never promise or predict returns, and never ask for personal or financial details.
- If they've clearly got it, say so warmly. If they still seem unsure, suggest revisiting the lesson. Questions they missed also come back in Revision.

Latency-sensitive; begin your answer immediately.`;

export type FollowUpInput = {
  lessonTitle: string;
  lessonContent: string;
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  /** What the student picked, in order. */
  picks: string[];
  history: { message: string; reply: string }[];
  message: string;
};

/** The Coach's reply to a follow-up question, or null when the AI is unavailable. */
export async function answerFollowUp(input: FollowUpInput): Promise<string | null> {
  try {
    client ??= new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const context = `<lesson title="${input.lessonTitle}">
${input.lessonContent}
</lesson>

<question>${input.prompt}</question>
<options>
${input.options.map((o, i) => `${LETTERS[i]}. ${o.text}${o.isCorrect ? " (correct)" : ""}`).join("\n")}
</options>
<course_explanation>${input.explanation}</course_explanation>
<student_picks>${input.picks.join(" → ")}</student_picks>`;

    const turns = [...input.history.map((h) => h.message), input.message];
    const messages: Anthropic.Beta.BetaMessageParam[] = [];
    turns.forEach((message, i) => {
      messages.push({ role: "user", content: i === 0 ? `${context}\n\nMy question: ${message}` : message });
      if (i < input.history.length) messages.push({ role: "assistant", content: input.history[i].reply });
    });

    const response = await client.beta.messages.create({
      model: COACH_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: FOLLOW_UP_PROMPT,
      messages,
    });
    if (response.stop_reason !== "end_turn") {
      console.warn(`[coach] no follow-up reply: stop_reason=${response.stop_reason}`);
      return null;
    }
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim();
    return text || null;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[coach] Anthropic rejected the API key. Check ANTHROPIC_API_KEY");
    } else if (err instanceof Anthropic.RateLimitError) {
      console.warn("[coach] rate limited by the Anthropic API");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[coach] Anthropic API error ${err.status}: ${err.message}`);
    } else {
      console.warn(`[coach] follow-up unavailable: ${err instanceof Error ? err.message : err}`);
    }
    return null;
  }
}

function buildPrompt(input: CoachHintInput, level: number): string {
  const letterOf = (id: string) => LETTERS[input.options.findIndex((o) => o.id === id)];
  const correct = input.options.find((o) => o.isCorrect);
  const options = input.options.map((o, i) => `${LETTERS[i]}. ${o.text}`).join("\n");
  const wrongPicks = input.wrongOptionIds
    .map((id) => `${letterOf(id)}. ${input.options.find((o) => o.id === id)?.text}`)
    .join("\n");

  return `<lesson title="${input.lessonTitle}">
${input.lessonContent}
</lesson>

<question>${input.prompt}</question>

<options>
${options}
</options>

<correct_option>${correct ? `${letterOf(correct.id)}. ${correct.text}` : ""}</correct_option>
(For your reference only. Never reveal it.)

<course_explanation>${input.explanation}</course_explanation>

<student_wrong_picks>
${wrongPicks}
</student_wrong_picks>

Write hint ${level} of 2.`;
}

function revealsAnswer(hint: string, input: CoachHintInput): boolean {
  const correctIndex = input.options.findIndex((o) => o.isCorrect);
  if (correctIndex === -1) return false;

  // Letter matched case-sensitively so ordinary prose like "the answer a
  // student gives" doesn't count as naming option A.
  const letter = LETTERS[correctIndex];
  if (new RegExp(`\\b(?:[Oo]ption|[Aa]nswer|[Cc]hoice)\\s*\\(?${letter}\\)?(?![A-Za-z])`).test(hint)) {
    return true;
  }

  // Short option texts like "9" or "50%" show up in normal explanations, so
  // only treat longer ones quoted verbatim as a giveaway.
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const correctText = normalize(input.options[correctIndex].text);
  return correctText.length >= 8 && normalize(hint).includes(correctText);
}
