import type { Metadata } from "next";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemedAppLoader } from "@/components/ui/themed-loader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "White Villa FarmHouse — A Private Eco Retreat in Taiser Town, Karachi",
  description:
    "A private eco-farm retreat in Taiser Town, Karachi. Pool, gardens, gaming, and sports facilities. Owned and hosted by one family. Book directly — no middleman, no booking fees.",
  keywords: [
    "White Villa FarmHouse",
    "private resort Karachi",
    "Taiser Town farmhouse",
    "farmhouse rental Karachi",
    "family-owned farmhouse",
    "book farmhouse directly Pakistan",
    "eco farm Karachi",
    "luxury farmhouse Karachi",
  ],
  authors: [{ name: "White Villa FarmHouse" }],
  openGraph: {
    title: "White Villa FarmHouse — A Private Eco Retreat in Taiser Town, Karachi",
    description:
      "Owned and hosted by one family. Pool, gardens, gaming, sports. Book directly — no middleman, no booking fees.",
    siteName: "White Villa FarmHouse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "White Villa FarmHouse — A Private Eco Retreat in Taiser Town, Karachi",
    description:
      "Owned and hosted by one family. Book directly — no middleman, no booking fees.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols Outlined — MD3 icon set used throughout the UI */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body
        className={`${fontClassNames} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <ThemedAppLoader />
        {/* Registers /sw.js — handles HTTP Range requests for /videos/*
            so the hero background video streams chunk-by-chunk. */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
