import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
Email us at **[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})** about:

- **Feedback**: what you liked, and what made no sense
- **A mistake in a lesson**: tell us the lesson and what looks wrong
- **Your account or data**: questions, corrections, deletion or a grievance (see the [Privacy Policy](/privacy))
- **A forgotten password**: tell us your username. We may not be able to prove the account is yours, because username accounts have no email on file
- **Colleges and partnerships**

We try to reply within a few working days.

Please don't send bank, card, UPI, Aadhaar or PAN details. We will never ask for them. Rupli is for education only, so we can't give personal financial advice.
`;

export default function ContactPage() {
  return (
    <InfoPage title="Contact us">
      {CONTENT}
    </InfoPage>
  );
}
