import Anthropic from "@anthropic-ai/sdk";
import { Prisma } from "@prisma/client";
import { db } from "./db";

const COACH_MODEL = "claude-opus-5-5";
const LETTERS = ["A", "B", "C", "D"];

const SYSTEM_PROMPT = `You are the StockStreak Coach, a friendly tutor inside a financial-literacy app for Indian college students and fresh graduates. A student just picked a wrong answer on a lesson quiz. Write a short hint that helps them work out the right answer themselves.

- Never reveal the correct option — not by its letter, by quoting or paraphrasing its text, or by ruling out the other options. The student must still choose.
- Briefly say why their pick doesn't fit, then explain the idea from the lesson that decides the question, in plain, friendly language. Use ₹ amounts or everyday Indian examples when they help.
- End with one short question that nudges them to reason it out.
- Hint 1 is gentle: point them at the key idea. Hint 2 means they have now missed twice: be more direct about the concept that decides it, still without giving the answer away.
- 2-3 sentences, under 70 words. Plain text only: no markdown, lists, headings, or emojis.
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
  1: "Think back to the main idea the lesson used to explain this — which option fits it best?",
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
    // The lesson must stay usable when the AI isn't — never fail the quiz here.
    return fallbackHint(level, input.authoredHint);
  }

  try {
    await db.coachHint.create({ data: { ...key, level, text, model: COACH_MODEL } });
  } catch (err) {
    // Another student hit the same wrong path at the same moment — serve the
    // hint that won the race so everyone on this path sees the same text.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await db.coachHint.findUnique({ where: { questionId_wrongOptionIds: key } });
      if (existing) return { level, text: existing.text, source: "ai" };
    } else {
      // Caching is an optimisation — the student still gets this hint.
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
      console.error("[coach] Anthropic rejected the API key — check ANTHROPIC_API_KEY");
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
