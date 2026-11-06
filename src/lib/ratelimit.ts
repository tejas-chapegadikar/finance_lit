import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Sign-in/sign-up abuse is covered by Supabase Auth's own rate limits
// (Supabase Dashboard > Authentication > Rate Limits): sign-in requests go
// from the browser straight to Supabase, so we never see them here.
// These limiters cover the actions we DO control.
//
// With the Upstash env vars set, limits are shared across every server
// instance. Without them (local dev, or before the founder has created the
// Redis database) each server process keeps its own in-memory count — weaker
// on a multi-instance host, but scripted hammering is still slowed down.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

const WINDOW_MS = 60_000;

type Limiter = { limit: (identifier: string) => Promise<{ success: boolean }> };

/** A sliding-window limiter for one server process: recent request times per identifier. */
function memoryLimiter(tokens: number): Limiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(identifier) {
      const now = Date.now();
      const recent = (hits.get(identifier) ?? []).filter((t) => now - t < WINDOW_MS);
      const success = recent.length < tokens;
      if (success) recent.push(now);
      hits.set(identifier, recent);
      // Forget idle identifiers so the map can't grow without bound.
      if (hits.size > 5_000) {
        for (const [key, times] of hits) if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
      }
      return { success };
    },
  };
}

/** `tokens` requests per minute, per student. */
function limiter(prefix: string, tokens: number): Limiter {
  return redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, "1 m"), prefix: `ratelimit:${prefix}` })
    : memoryLimiter(tokens);
}

// A quiz is 5 questions × up to 3 tries; this leaves room for retakes while
// stopping scripted hammering.
export const quizAnswerRatelimit = limiter("quiz-answer", 60);
// Each AI Coach hint can cost a model call, so it gets the tightest budget.
export const coachRatelimit = limiter("coach", 20);
export const challengeRatelimit = limiter("challenge", 10);
export const feedbackRatelimit = limiter("feedback", 10);
export const rewardRatelimit = limiter("reward", 10);
export const practiceRatelimit = limiter("practice", 60);
// Profile edits and avatar saves: no XP, but each one is a database write.
export const accountRatelimit = limiter("account", 30);
// Money Manager entries, budgets and goals, and practice-challenge steps.
export const moneyRatelimit = limiter("money", 60);

/** True when the request may proceed. Fails open if Redis is unreachable. */
export async function isAllowed(limit: Limiter, identifier: string): Promise<boolean> {
  try {
    const { success } = await limit.limit(identifier);
    return success;
  } catch (err) {
    console.warn(`[ratelimit] check failed, allowing request: ${err instanceof Error ? err.message : err}`);
    return true;
  }
}
