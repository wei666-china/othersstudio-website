import type { Metadata } from "next";
import { Geist, Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getLocale } from "@/i18n/server";
import GuideAssistant from "@/components/GuideAssistant";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DAY 1 — Others Studio",
  description: "记录思考，构建产品。每一天都是新的 Day 1。",
  openGraph: {
    title: "DAY 1 — Others Studio",
    description: "记录思考，构建产品。每一天都是新的 Day 1。",
    siteName: "DAY 1",
    locale: "zh_CN",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale === "en" ? "en" : "zh-CN"}
      className={`${geist.variable} ${inter.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <body>
        <LocaleProvider initialLocale={locale}>
          {children}
          <GuideAssistant />
        </LocaleProvider>
      </body>
    </html>
  );
}
