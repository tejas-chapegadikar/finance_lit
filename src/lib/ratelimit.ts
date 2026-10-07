import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SLOW_DOWN_MESSAGE } from "./constants";

// Sign-in/sign-up abuse is covered by Clerk's own Attack Protection
// (Clerk Dashboard > Attack Protection) since we use Clerk's prebuilt
// <SignIn/>/<SignUp/> components, which talk directly to Clerk's API —
// we never see those requests server-side to rate-limit them ourselves.
// These limiters cover the actions we DO control.
//
// Until the Upstash env vars are set (local dev, or before the founder has
// created the Redis database) every limiter is null and requests are allowed:
// missing rate-limit infra shouldn't take the app down.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

function limiter(prefix: string, tokens: number, window: Duration) {
  return redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), prefix: `ratelimit:${prefix}` })
    : null;
}

export const adminActionRatelimit = limiter("admin-action", 20, "1 m");
// A quiz is 5 questions × up to 3 tries; this leaves room for retakes while
// stopping scripted hammering.
export const quizAnswerRatelimit = limiter("quiz-answer", 60, "1 m");
// Each AI Coach hint can cost a model call, so it gets the tightest budget.
export const coachRatelimit = limiter("coach", 20, "1 m");
export const challengeRatelimit = limiter("challenge", 10, "1 m");

/** True when the request may proceed. Fails open if Redis is unreachable. */
export async function isAllowed(limit: Ratelimit | null, identifier: string): Promise<boolean> {
  if (!limit) return true;
  try {
    const { success } = await limit.limit(identifier);
    return success;
  } catch (err) {
    console.warn(`[ratelimit] check failed, allowing request: ${err instanceof Error ? err.message : err}`);
    return true;
  }
}

export const TOO_MANY_REQUESTS = SLOW_DOWN_MESSAGE;
