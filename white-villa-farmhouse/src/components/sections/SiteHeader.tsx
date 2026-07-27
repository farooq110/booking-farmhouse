"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/luxury-primitives";
import { Logo } from "@/components/ui/logo";
import { FARMHOUSE } from "@/data/media";

const NAV_LINKS = [
  { label: "Estate", href: "#estate" },
  { label: "Facilities", href: "#facilities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Videos", href: "#videos" },
  { label: "Location", href: "#location" },
];

/**
 * SiteHeader — Eco-Farm top bar with mobile hamburger menu.
 *
 * Layout:
 *   - Desktop (md+): logo-left · centered nav pill · CTA-right. The nav
 *     fades in once the user scrolls past the hero.
 *   - Mobile (< md): logo-left · hamburger-right. Tapping the hamburger
 *     opens a full-width dropdown panel with the nav links + the CTA.
 *     The panel slides down with a framer-motion-free CSS transition
 *     (max-height + opacity).
 *
 * The hamburger replaces the previous mobile layout where the nav was
 * simply hidden. Now all 5 nav tabs are reachable on small screens.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the viewport grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => { if (mq.matches) setMenuOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll when the mobile menu is open so users don't scroll
  // the page behind the dropdown.
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  const scrollToForm = () => {
    setMenuOpen(false);
    document
      .getElementById("booking-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || menuOpen
          ? "bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant elevation-2"
          : "bg-gradient-to-b from-charcoal/35 to-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        {/* ── Left: framed logo + brand name ── */}
        <a
          href="#hero"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 sm:gap-3 state-layer rounded-2xl min-w-0 group"
          aria-label={`${FARMHOUSE.name} — back to top`}
        >
          {/* Sage ring frame around the logo badge */}
          <span
            className={[
              "relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
              "ring-1 ring-sage/50 overflow-hidden",
              scrolled || menuOpen
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
                scrolled || menuOpen ? "text-on-surface" : "text-cream",
              ].join(" ")}
            >
              {FARMHOUSE.name}
            </span>
            <span
              className={[
                "font-sans text-[9px] uppercase tracking-luxe transition-colors",
                scrolled || menuOpen ? "text-primary" : "text-amber-soft",
              ].join(" ")}
            >
              Eco · Farm · Retreat
            </span>
          </span>
          {/* Mobile: just the name (no tagline) */}
          <span
            className={[
              "sm:hidden font-display tracking-tight truncate text-base transition-colors",
              scrolled || menuOpen ? "text-on-surface" : "text-cream",
            ].join(" ")}
          >
            White Villa
          </span>
        </a>

        {/* ── Center: desktop nav (hidden on mobile) ── */}
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

        {/* ── Right: desktop CTA + mobile hamburger ── */}
        {/* Desktop CTA pill (hidden on mobile) */}
        <button
          type="button"
          onClick={scrollToForm}
          aria-label="Booking slots"
          className={[
            "hidden md:inline-flex items-center gap-2 rounded-full font-sans uppercase tracking-luxe transition-all duration-300 state-layer shrink-0",
            "border",
            "px-5 py-2.5 text-xs",
            scrolled
              ? "bg-primary text-on-primary border-primary hover:bg-moss elevation-2 hover:elevation-3"
              : "bg-cream/15 text-cream border-cream/40 backdrop-blur-sm hover:bg-cream/25",
          ].join(" ")}
        >
          <Icon name="eco" className="text-base" filled />
          Reserve Your Stay
        </button>

        {/* Mobile CTA (compact, hidden on desktop) — sits left of hamburger */}
        <button
          type="button"
          onClick={scrollToForm}
          aria-label="Book"
          className={[
            "md:hidden inline-flex items-center gap-1.5 rounded-full font-sans uppercase tracking-luxe transition-all duration-300 state-layer shrink-0 border px-3 py-2 text-[10px]",
            scrolled || menuOpen
              ? "bg-primary text-on-primary border-primary"
              : "bg-cream/15 text-cream border-cream/40 backdrop-blur-sm",
          ].join(" ")}
        >
          <Icon name="eco" className="text-sm" filled />
          Book
        </button>

        {/* Mobile hamburger button (hidden on desktop) */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          className={[
            "md:hidden flex h-10 w-10 items-center justify-center rounded-full transition-all state-layer shrink-0",
            "border",
            scrolled || menuOpen
              ? "border-outline-variant bg-surface-lowest text-on-surface hover:border-sage hover:text-primary"
              : "border-cream/40 bg-cream/15 text-cream backdrop-blur-sm hover:bg-cream/25",
          ].join(" ")}
        >
          <Icon
            name={menuOpen ? "close" : "menu"}
            className="text-xl"
          />
        </button>
      </div>

      {/* ── Mobile dropdown menu ──
          Slides down with max-height + opacity transition.
          Full-width, sage-tinted surface, locks body scroll while open. */}
      <div
        id="mobile-nav-menu"
        className={[
          "md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        <nav
          aria-label="Page sections (mobile)"
          className="mx-auto max-w-7xl px-4 pb-6 pt-2 sm:px-6"
        >
          {/* Sage top divider */}
          <div className="mb-4 leaf-divider" aria-hidden="true" />

          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l, i) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={handleNavClick}
                  className={[
                    "flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all state-layer",
                    "border border-transparent hover:border-sage/30 hover:bg-sage-soft/20",
                  ].join(" ")}
                >
                  {/* Numbered badge — gives the mobile menu a "table of contents" feel */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-soft/40 font-display text-xs font-semibold text-primary ring-1 ring-sage/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg text-on-surface">
                    {l.label}
                  </span>
                  <span className="ml-auto material-symbols-outlined text-base text-on-surface-variant/50">
                    arrow_forward
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* CTA at the bottom of the mobile menu */}
          <button
            type="button"
            onClick={scrollToForm}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sage px-5 py-3 font-sans text-xs uppercase tracking-luxe text-on-primary elevation-2 hover:bg-moss transition-all state-layer"
          >
            <Icon name="eco" className="text-base" filled />
            Reserve Your Stay
          </button>
        </nav>
      </div>

      {/* Sage leaf-divider underline — only visible once scrolled (desktop only) */}
      <div
        className={[
          "hidden md:block mx-auto max-w-7xl px-6 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="leaf-divider" />
      </div>
    </header>
  );
}
