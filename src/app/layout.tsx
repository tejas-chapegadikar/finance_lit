import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Two variable fonts: Bricolage Grotesque for headings and big numbers (a
// distinctive display face), Figtree for everything else (simple and very
// readable). Both include the ₹ sign — it's in their latin-ext subset.
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
});

const body = Figtree({
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
    <ClerkProvider appearance={{ variables: { colorPrimary: "#007aba", borderRadius: "0.75rem" } }}>
      <html
        lang="en"
        className={`${display.variable} ${body.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
