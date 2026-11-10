import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata: Metadata = { title: "Refund Policy | Rupli" };

// Keep this page plain and exact. No roasting on legal pages.
const CONTENT = `
**Rupli is free. We don't charge you for anything, so there is nothing to refund.**

- We don't take payments, and we don't ask for card, UPI or bank details.
- XP, badges and avatar items are earned by using the app. They have no money value and can't be exchanged for cash.
- If we ever add something paid, we will publish clear prices and a real refund policy first, and you will have to agree before being charged.

## If someone asked you to pay for Rupli

That wasn't us. Don't pay. If you already lost money, call the national cybercrime helpline on **1930** or report it at [cybercrime.gov.in](https://cybercrime.gov.in), and tell us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})
`;

export default function RefundsPage() {
  return (
    <InfoPage title="Refund Policy" updated={LEGAL_LAST_UPDATED}>
      {CONTENT}
    </InfoPage>
  );
}
