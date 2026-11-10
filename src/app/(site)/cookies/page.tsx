import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Cookie Policy | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
Rupli uses only what it needs to work. **No analytics. No advertising. No tracking across other websites.** That is why you don't see a cookie banner: there is nothing optional to accept or refuse.

If we ever add analytics or anything else optional, we will ask you first, and this page will change.

## Cookies

- **Sign-in cookies** (names start with \`sb-\`, set by our login provider, Supabase). They keep you signed in and protect your session. Without them you can't log in. They last while your session is active and are removed when you sign out.

## Things saved in your browser

These stay on your device and aren't used to track you:

- **\`rupli-calm\`**: remembers if you paused animations.
- **\`rupli-tip-dismissed\`**: remembers you closed today's buddy tip.
- **Session items** for animated numbers. These go when you close the tab.

## How to remove them

You can clear cookies and site data in your browser settings at any time. If you clear the sign-in cookies, you will be signed out.

## Third parties

Rupli loads no outside scripts, video embeds, social widgets or ad pixels. Our fonts are served from our own site. When you sign in, Google's own pages and cookies apply while you are on Google.

## Contact

Email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})
`;

export default function CookiesPage() {
  return (
    <InfoPage title="Cookie Policy" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
