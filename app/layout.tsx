import type { Metadata } from "next";
import { Unbounded, Manrope, Fira_Code } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketAI — Описания товаров за 10 секунд",
  description: "AI-генератор продающих текстов для Wildberries, Ozon и Amazon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} ${firaCode.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
