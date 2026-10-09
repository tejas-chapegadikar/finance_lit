import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Variable font, so every weight the UI uses (400–800) comes from one file.
// latin-ext carries the ₹ sign, which the plain latin subset doesn't.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "StockStreak",
  description:
    "Learn money before money teaches you the hard way. Short lessons, quizzes and an AI Coach for young Indians.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // brand-600, so Clerk's sign-in buttons and links match the app.
    <ClerkProvider appearance={{ variables: { colorPrimary: "#007aba", borderRadius: "0.75rem" } }}>
      <html
        lang="en"
        className={`${roboto.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
