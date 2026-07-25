"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/luxury-primitives";
import { Logo } from "@/components/ui/logo";
import { FARMHOUSE } from "@/data/media";

const NAV_LINKS = [
  { label: "Estate", href: "#estate" },
  { label: "Facilities", href: "#facilities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
];

/**
 * SiteHeader — Eco-Farm top bar.
 *
 * Three-zone layout (logo-left · wordmark-center · CTA-right) with a
 * sage leaf-divider underline that grows in when the user scrolls past
 * the hero. Desktop nav lives between the logo and the CTA. On mobile
 * the nav collapses out and only the logo + book button remain.
 *
 * Distinct from the previous transparent hero header — this one has a
 * framed logo badge (sage ring with bark inset), a centered
 * Fraunces-italic wordmark with a tiny leaf glyph, and an eco-tag pill
 * CTA instead of a flat amber button.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    document
      .getElementById("booking-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant elevation-2"
          : "bg-gradient-to-b from-charcoal/35 to-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        {/* ── Left: framed logo + brand name ── */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 sm:gap-3 state-layer rounded-2xl min-w-0 group"
          aria-label={`${FARMHOUSE.name} — back to top`}
        >
          {/* Sage ring frame around the logo badge */}
          <span
            className={[
              "relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
              "ring-1 ring-sage/50 overflow-hidden",
              scrolled
                ? "bg-surface-lowest elevation-1"
                : "bg-cream/12 backdrop-blur-sm ring-cream/30",
              "group-hover:ring-sage group-hover:rotate-[-3deg]",
            ].join(" ")}
          >
            <Logo size={40} className="h-full w-full object-cover" />
            {/* Tiny sage leaf accent in the top-right of the badge */}
            <span
              className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-tertiary ring-2 ring-surface-lowest/80"
              aria-hidden="true"
            />
          </span>
          <span className="hidden sm:flex min-w-0 flex-col leading-tight">
            <span
              className={[
                "font-display tracking-tight truncate text-base sm:text-lg transition-colors",
                scrolled ? "text-on-surface" : "text-cream",
              ].join(" ")}
            >
              {FARMHOUSE.name}
            </span>
            <span
              className={[
                "font-sans text-[9px] uppercase tracking-luxe transition-colors",
                scrolled ? "text-primary" : "text-amber-soft",
              ].join(" ")}
            >
              Eco · Farm · Retreat
            </span>
          </span>
          {/* Mobile: just the name (no tagline) */}
          <span
            className={[
              "sm:hidden font-display tracking-tight truncate text-base transition-colors",
              scrolled ? "text-on-surface" : "text-cream",
            ].join(" ")}
          >
            White Villa
          </span>
        </a>

        {/* ── Center: desktop nav (hidden on mobile, hidden when not scrolled over hero) ── */}
        <nav
          aria-label="Page sections"
          className={[
            "hidden md:flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-500",
            scrolled
              ? "bg-surface-container-low/80 elevation-1 opacity-100"
              : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide-luxe text-on-surface-variant transition-colors hover:text-primary hover:bg-sage-soft/40 state-layer"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── Right: Booking CTA pill (eco-tag style) ── */}
        <button
          type="button"
          onClick={scrollToForm}
          aria-label="Booking slots"
          className={[
            "inline-flex items-center gap-1.5 sm:gap-2 rounded-full font-sans uppercase tracking-luxe transition-all duration-300 state-layer shrink-0",
            "border",
            "px-3 py-2 text-[10px] sm:px-5 sm:py-2.5 sm:text-xs",
            scrolled
              ? "bg-primary text-on-primary border-primary hover:bg-moss elevation-2 hover:elevation-3"
              : "bg-cream/15 text-cream border-cream/40 backdrop-blur-sm hover:bg-cream/25",
          ].join(" ")}
        >
          <Icon name="eco" className="text-sm sm:text-base" filled />
          {/* Compact on mobile, full label on sm+ */}
          <span className="sm:hidden">Book</span>
          <span className="hidden sm:inline">Reserve Your Stay</span>
        </button>
      </div>

      {/* Sage leaf-divider underline — only visible once scrolled, grows in from center */}
      <div
        className={[
          "mx-auto max-w-7xl px-6 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="leaf-divider" />
      </div>
    </header>
  );
}
