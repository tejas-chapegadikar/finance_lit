import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { Motion } from "@/components/ui/Motion";
import "./globals.css";

// Poppins for headings and big numbers, Inter for everything you read. Both
// are self-hosted by next/font (no request to Google at runtime). The ₹ sign
// is in Poppins' devanagari subset and Inter's latin-ext subset.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
  subsets: ["latin", "latin-ext", "devanagari"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Rupli",
  description:
    "Learn money before money teaches you the hard way. Practical money skills for Indian college students and first-job professionals: lessons, real-life scenarios, an AI Coach and smart revision.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Toaster richColors position="top-center" />
        <Motion />
      </body>
    </html>
  );
}
