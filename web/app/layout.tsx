import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi-config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const metadata: Metadata = {
  title: "Bejeweled",
  description: "Match-3 — swipe gems, connect your wallet, optional daily check-in.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  other: baseAppId ? { "base:app_id": baseAppId } : {},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookie = headerList.get("cookie") ?? undefined;
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
