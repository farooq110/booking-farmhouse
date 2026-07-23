"use client";
/**
 * Logo — displays the farmhouse logo image if available, otherwise
 * falls back to a default SVG home icon.
 *
 * Used in: ThemedAppLoader, SiteHeader, Footer.
 */
import Image from "next/image";
import { MEDIA, FARMHOUSE } from "@/data/media";

interface LogoProps {
  size?: number;
  className?: string;
}

/** Default SVG home icon — used when no logo image is provided. */
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
      <circle cx="24" cy="24" r="23" fill="oklch(0.42 0.045 145)" />
      <path
        d="M24 12L12 22V36C12 36.5523 12.4477 37 13 37H19V28C19 27.4477 19.4477 27 20 27H28C28.5523 27 29 27.4477 29 28V37H35C35.5523 37 36 36.5523 36 36V22L24 12Z"
        fill="oklch(0.96 0.005 85)"
        stroke="oklch(0.78 0.13 80)"
        strokeWidth="1.5"
        strokeLinejoin="round"
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