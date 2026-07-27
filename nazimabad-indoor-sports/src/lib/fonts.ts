/**
 * src/lib/fonts.ts — SINGLE SOURCE OF TRUTH for fonts.
 * Refs: https://nextjs.org/docs/app/getting-started/fonts
 *
 * White Villa FarmHouse — Eco-Farm type system (v2).
 *   - Bricolage Grotesque: contemporary display grotesque with optical
 *     sizing and a soft, slightly quirky character — used for headings,
 *     logo wordmark, and large editorial type. Distinct from the
 *     previous Fraunces (and from Cormorant Garamond before it) so the
 *     brand keeps evolving its own voice.
 *   - Plus Jakarta Sans: clean, modern geometric humanist sans for
 *     body, UI labels, and forms. Different from Outfit and Inter so
 *     the brand reads as its own.
 */
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";

export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const fontDisplay = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const fontClassNames = `${fontSans.variable} ${fontDisplay.variable}`;
