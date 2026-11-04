import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Figtree, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Plus Jakarta Sans — a clean, modern geometric sans — for headings and big
// numbers; Figtree for everything you read. Both are variable fonts
// self-hosted by next/font (no request to Google at runtime), and both
// include the ₹ sign in their latin-ext subset.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
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
      <html lang="en" className={`${jakarta.variable} ${figtree.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
