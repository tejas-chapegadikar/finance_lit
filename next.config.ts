import type { NextConfig } from "next";

// Basic hardening headers on every response. No Content-Security-Policy yet:
// it needs tuning for Supabase Auth (the browser talks to the project's
// *.supabase.co URL) and Google sign-in before it can be switched on.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Pages retired in the avatar-centred redesign (their data is kept): old
  // links and bookmarks land somewhere sensible instead of a 404.
  async redirects() {
    return [
      { source: "/practice", destination: "/lessons#practise", permanent: false },
      { source: "/practice/challenges/:id", destination: "/dashboard", permanent: false },
      { source: "/challenge", destination: "/dashboard", permanent: false },
      { source: "/question", destination: "/dashboard", permanent: false },
      { source: "/rewards", destination: "/profile/avatar", permanent: false },
      { source: "/progress", destination: "/profile", permanent: false },
    ];
  },
};

export default nextConfig;
