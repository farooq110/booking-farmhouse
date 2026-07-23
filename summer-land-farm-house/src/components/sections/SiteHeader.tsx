"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/luxury-primitives";
import { FARMHOUSE, MEDIA } from "@/data/media";

/**
 * SiteHeader — sticky top bar with the Summer Land Farm House logo + name on the
 * left, and a "Booking Slots" button on the right that scrolls to the
 * enquiry form.
 *
 * The header starts transparent over the hero, then gains a frosted
 * surface once the user scrolls past the hero's first viewport.
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
    // Scroll to the form itself (right column), not the section's left
    // column ("Tell the owner when you'd like to arrive" pitch). On mobile
    // (single-column layout) this also lands on the form, skipping the pitch.
    document
      .getElementById("booking-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface-container-lowest/85 backdrop-blur-md border-b border-outline-variant elevation-1"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo + name (left) */}
        <a
          href="#hero"
          className="flex items-center gap-3 state-layer rounded-xl"
          aria-label={`${FARMHOUSE.name} — back to top`}
        >
          <span
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full overflow-hidden transition-colors ring-1",
              scrolled
                ? "bg-primary text-on-primary ring-outline-variant"
                : "bg-cream/15 ring-cream/30 backdrop-blur-sm",
            ].join(" ")}
          >
            <Image
              src={MEDIA.logo}
              alt={`${FARMHOUSE.name} logo`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span
            className={[
              "font-display text-xl tracking-tight transition-colors",
              scrolled ? "text-on-surface" : "text-cream",
            ].join(" ")}
          >
            {FARMHOUSE.name}
          </span>
        </a>

        {/* Booking slots button (right) */}
        <button
          type="button"
          onClick={scrollToForm}
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-xs uppercase tracking-luxe transition-all state-layer",
            scrolled
              ? "bg-tertiary text-on-tertiary hover:bg-amber-soft elevation-1"
              : "bg-tertiary text-on-tertiary hover:bg-amber-soft elevation-2",
          ].join(" ")}
        >
          <Icon name="event_available" className="text-base" />
          Booking Slots
        </button>
      </div>
    </header>
  );
}
