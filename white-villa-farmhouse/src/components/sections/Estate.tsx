"use client";
import type { StaticImageData } from "next/image";
import { MediaSlot } from "@/components/ui/media-slot";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { MEDIA } from "@/data/media";

interface Facility {
  eyebrow: string;
  icon: string;
  title: string;
  body: string;
  img: StaticImageData | string;
  highlights: string[];
}

const FACILITIES: Facility[] = [
  {
    eyebrow: "Water",
    icon: "pool",
    title: "Swimming Pool & Deck",
    body: "Heated pool, teak deck, submerged night lighting. Open from dawn to late evening.",
    img: MEDIA.estate.pool,
    highlights: ["Heated", "Teak deck", "Night-lit"],
  },
  {
    eyebrow: "Land",
    icon: "park",
    title: "Garden & Park",
    body: "Landscaped lawns, shaded sitting areas, and walking paths through mature trees.",
    img: MEDIA.estate.park,
    highlights: ["Landscaped lawns", "Shaded seating", "Walking paths"],
  },
  {
    eyebrow: "Shelter",
    icon: "house_siding",
    title: "AC Pavilions",
    body: "Air-conditioned glass pavilions with linen-draped platforms and floor-to-ceiling garden views.",
    img: MEDIA.estate.pavilion,
    highlights: ["Air-conditioned", "Glass walls", "Sleeps up to 16"],
  },
];

/**
 * Estate — horizontal magazine-style cards.
 *
 * Distinct from the previous 3-column vertical grid:
 *   - Each card is a horizontal split (image left, content right on
 *     desktop; stacked on mobile).
 *   - A large offset numeral (01, 02, 03) sits in the top-left of the
 *     image, with a sage accent bar behind it.
 *   - The icon pill + eyebrow sit above the title; highlights are inline
 *     chips instead of a vertical bullet list.
 *   - Hover reveals a "discover" arrow at the bottom of the content
 *     panel.
 */
export function Estate() {
  return (
    <section id="estate" className="relative bg-surface-container-lowest py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>The Estate</SectionLabel>
          <SectionHeading>
            A sanctuary built around
            <span className="text-sage-gradient italic"> light, water, and silence.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Three signature spaces, each private, each yours for the duration of your stay.
          </p>
        </header>

        <div className="mt-12 sm:mt-16 flex flex-col gap-6 sm:gap-8">
          {FACILITIES.map((f, i) => (
            <article
              key={f.title}
              className="group relative grid grid-cols-1 overflow-hidden rounded-[1.5rem] border border-outline-variant bg-surface-lowest transition-all duration-500 hover:border-sage hover:elevation-3 elevation-1 md:grid-cols-[1.1fr_1fr]"
            >
              {/* ── Image side ── */}
              <div className="relative overflow-hidden md:order-1">
                <div className="relative h-64 sm:h-80 md:h-full">
                  <MediaSlot
                    src={f.img}
                    alt={f.title}
                    aspectClass="h-full w-full"
                    className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>

                {/* Large offset numeral in top-left of image */}
                <div className="pointer-events-none absolute left-0 top-0 flex items-end gap-2 p-4 sm:p-5">
                  <div className="relative">
                    {/* Sage accent bar behind the numeral */}
                    <span className="absolute -bottom-1 -left-1 h-3 w-full bg-sage/40 rounded-sm" aria-hidden="true" />
                    <span className="relative font-display text-5xl sm:text-6xl font-bold text-cream leading-none drop-shadow-lg">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Bottom gradient + icon pill — overlay on image */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-charcoal/70 to-transparent p-4 sm:p-5">
                  <span className="flex items-center gap-2 rounded-full bg-surface-lowest/90 px-3 py-1.5 backdrop-blur-sm elevation-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                      <span className="material-symbols-outlined text-sm">{f.icon}</span>
                    </span>
                    <span className="font-sans text-[10px] uppercase tracking-luxe text-primary">
                      {f.eyebrow}
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Content side ── */}
              <div className="relative flex flex-col justify-center p-6 sm:p-8 md:p-10 md:order-2">
                {/* Sage corner accent in the top-right */}
                <span
                  className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] bg-sage-soft/35"
                  aria-hidden="true"
                />

                <h3 className="font-display text-2xl sm:text-3xl text-on-surface">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {f.body}
                </p>

                {/* Highlights as inline chips */}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {f.highlights.map((h) => (
                    <li
                      key={h}
                      className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-sm text-sage">
                        check_circle
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Discover arrow — reveals on hover */}
                <div className="mt-6 flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="h-px w-8 bg-sage" />
                  <span>Discover</span>
                  <span className="material-symbols-outlined text-base text-sage">
                    arrow_forward
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
