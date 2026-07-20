import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Country Farm — A Private Farmhouse in Malir Cantonment, Karachi",
  description:
    "A private farmhouse in Malir Cantt, Karachi. Pool, gardens, gaming, and sports facilities. Owned and hosted by one family. Book directly — no middleman, no booking fees.",
  keywords: [
    "Country Farm",
    "private farmhouse Karachi",
    "Malir Cantt farmhouse",
    "farmhouse rental Karachi",
    "family-owned farmhouse",
    "book farmhouse directly Pakistan",
    "luxury farmhouse Karachi",
  ],
  authors: [{ name: "Country Farm" }],
  openGraph: {
    title: "Country Farm — A Private Farmhouse in Malir Cantonment, Karachi",
    description:
      "Owned and hosted by one family. Pool, gardens, gaming, sports. Book directly — no middleman, no booking fees.",
    siteName: "Country Farm",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Country Farm — A Private Farmhouse in Malir Cantonment, Karachi",
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
        className={`${inter.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
