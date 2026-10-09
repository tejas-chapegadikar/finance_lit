import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact — StockStreak" };

const CONTENT = `
We'd love to hear from you. Email us at **[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})** about:

- **Feedback** — what you liked, what confused you, what you'd like to learn next
- **A mistake in a lesson** — tell us the lesson name and what looks wrong
- **Your account or data** — questions, corrections or deletion requests (see our [Privacy Policy](/privacy))
- **Colleges and partnerships** — bringing StockStreak to your students

We aim to reply within a few working days.

Please don't send bank, card, UPI or Aadhaar/PAN details — we will never ask for them. And because StockStreak is for education only, we can't give personal financial advice.
`;

export default function ContactPage() {
  return <InfoPage title="Contact us">{CONTENT}</InfoPage>;
}
