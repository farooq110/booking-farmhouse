import type { Metadata } from "next";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemedAppLoader } from "@/components/ui/themed-loader";

export const metadata: Metadata = {
  title: "D-Victoria Elite — A Private Resort in Gadap Town, Karachi",
  description:
    "A private resort in Gadap Town, Karachi. Pool, gardens, gaming, and sports facilities. Owned and hosted by one family. Book directly — no middleman, no booking fees.",
  keywords: [
    "D-Victoria Elite",
    "private resort Karachi",
    "Gadap Town resort",
    "resort rental Karachi",
    "family-owned resort",
    "book resort directly Pakistan",
    "luxury resort Karachi",
  ],
  authors: [{ name: "D-Victoria Elite" }],
  openGraph: {
    title: "D-Victoria Elite — A Private Resort in Gadap Town, Karachi",
    description:
      "Owned and hosted by one family. Pool, gardens, gaming, sports. Book directly — no middleman, no booking fees.",
    siteName: "D-Victoria Elite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "D-Victoria Elite — A Private Resort in Gadap Town, Karachi",
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
      </body>
    </html>
  );
}
