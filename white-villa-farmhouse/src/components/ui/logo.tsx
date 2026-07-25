"use client";
/**
 * Logo — White Villa FarmHouse custom brand mark.
 *
 * Renders a unique SVG emblem: a stylized white villa silhouette nested
 * inside a sage leaf, with a harvest-amber sun. Distinct from the
 * previous default home-icon fallback so the brand reads as its own.
 *
 * Used in: ThemedAppLoader, SiteHeader, Footer.
 */
import Image from "next/image";
import { MEDIA, FARMHOUSE } from "@/data/media";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Default brand mark — used when no logo image is provided.
 * A sage circle framing a white villa + leaf + amber sun.
 */
export function DefaultHomeIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${FARMHOUSE.name} logo`}
      role="img"
    >
      {/* Sage circular badge */}
      <circle cx="24" cy="24" r="23" fill="oklch(0.55 0.085 145)" />

      {/* Soft sage-leaf halo around the villa */}
      <path
        d="M24 5C16 9 11 16 11 24C11 32 16 39 24 43C32 39 37 32 37 24C37 16 32 9 24 5Z"
        fill="oklch(0.78 0.045 145 / 0.45)"
        stroke="oklch(0.42 0.055 145 / 0.4)"
        strokeWidth="0.6"
      />

      {/* Amber sun behind the villa */}
      <circle cx="24" cy="17" r="3.6" fill="oklch(0.78 0.115 75)" />

      {/* White villa silhouette — roof */}
      <path
        d="M14 27L24 19L34 27V28H14V27Z"
        fill="oklch(0.99 0.005 95)"
        stroke="oklch(0.42 0.055 145)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Villa body */}
      <path
        d="M16 28H32V36C32 36.5523 31.5523 37 31 37H17C16.4477 37 16 36.5523 16 36V28Z"
        fill="oklch(0.99 0.005 95)"
        stroke="oklch(0.42 0.055 145)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Door + window — sage accents */}
      <rect x="22.5" y="31" width="3" height="6" fill="oklch(0.55 0.085 145)" />
      <rect x="18.5" y="30.5" width="2" height="2" rx="0.3" fill="oklch(0.55 0.085 145)" />
      <rect x="27.5" y="30.5" width="2" height="2" rx="0.3" fill="oklch(0.55 0.085 145)" />

      {/* Small leaf glyph on the door — eco-farm motif */}
      <path
        d="M24 33.2C24.4 32.4 25.2 32 26 32.2C25.9 33.2 25.2 33.9 24 34"
        stroke="oklch(0.55 0.085 145)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  const hasLogo = MEDIA.logo !== undefined && MEDIA.logo !== null;

  if (!hasLogo) {
    return <DefaultHomeIcon size={size} />;
  }

  return (
    <Image
      src={MEDIA.logo}
      alt={`${FARMHOUSE.name} logo`}
      width={size}
      height={size}
      className={className}
    />
  );
}
