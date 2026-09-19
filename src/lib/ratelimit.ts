import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Sign-in/sign-up abuse is covered by Clerk's own Attack Protection
// (Clerk Dashboard > Attack Protection) since we use Clerk's prebuilt
// <SignIn/>/<SignUp/> components, which talk directly to Clerk's API —
// we never see those requests server-side to rate-limit them ourselves.
// This limiter is for actions we DO control, e.g. admin lesson creation.
const redis = Redis.fromEnv();

export const adminActionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "ratelimit:admin-action",
});

export async function checkRatelimit(limiter: Ratelimit, identifier: string) {
  const { success } = await limiter.limit(identifier);
  return success;
}
