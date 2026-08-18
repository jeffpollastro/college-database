import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import "./globals.css";

const headingFont = Outfit({
  variable: "--font-heading-family",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Work_Sans({
  variable: "--font-body-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "College Search | Crown Roots Foundation",
  description: "Find affordable colleges for Pocono families. See the real cost gap for your income level — a Crown Roots Foundation tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
