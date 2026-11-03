import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Figtree, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Fraunces — a soft, characterful serif — for headings and big numbers;
// Figtree for everything you read. Both are variable fonts self-hosted by
// next/font (no request to Google at runtime), and both include the ₹ sign
// in their latin-ext subset.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "StockStreak",
  description:
    "Learn money before money teaches you the hard way. Practical money skills for Indian college students and first-job professionals — lessons, real-life scenarios, an AI Coach and smart revision.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // brand-600, so Clerk's sign-in buttons and links match the app.
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#5b45e0", borderRadius: "0.75rem", fontFamily: "var(--font-figtree)" },
      }}
    >
      <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
