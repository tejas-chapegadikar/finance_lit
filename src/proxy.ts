import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16 renamed the "middleware" file convention to "proxy" (this file
// must be named src/proxy.ts, not src/middleware.ts, for Next to pick it up
// — the export itself, Clerk's own clerkMiddleware() helper, is unrelated
// to that rename and still works as the default export here).
//
// Only establishes the Clerk auth context for the request (needed for
// auth()/currentUser() to work in Server Components, Server Actions, and
// Route Handlers). Path-based route protection is deliberately NOT done
// here — @clerk/nextjs's createRouteMatcher is deprecated in this version
// in favor of resource-based checks (auth.protect() called directly inside
// each protected layout/page/action). See src/app/(app)/layout.tsx and
// src/app/admin/layout.tsx.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
