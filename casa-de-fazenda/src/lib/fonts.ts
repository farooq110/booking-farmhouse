/**
 * src/lib/fonts.ts — SINGLE SOURCE OF TRUTH for fonts.
 * Refs: https://nextjs.org/docs/app/getting-started/fonts
 */
import { Inter, Cormorant_Garamond } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const fontDisplay = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const fontClassNames = `${fontSans.variable} ${fontDisplay.variable}`;
