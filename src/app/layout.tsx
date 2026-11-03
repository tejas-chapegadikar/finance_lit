import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Rubik } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Rubik: rounded and friendly, one variable font for the whole app. The ₹
// sign is in its latin-ext subset.
const rubik = Rubik({
  variable: "--font-rubik",
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
    <ClerkProvider appearance={{ variables: { colorPrimary: "#5b45e0", borderRadius: "1rem", fontFamily: "var(--font-rubik)" } }}>
      <html
        lang="en"
        className={`${rubik.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
