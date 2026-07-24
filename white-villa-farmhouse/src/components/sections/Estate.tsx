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

export function Estate() {
  return (
    <section id="estate" className="relative bg-surface-container-lowest py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>The Estate</SectionLabel>
          <SectionHeading>
            A sanctuary built around
            <span className="text-moss-gradient italic"> light, water, and silence.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Three signature spaces, each private, each yours for the duration of your stay.
          </p>
        </header>

        {/*
          Responsive grid (no horizontal scroll):
            < 640px  → 1 column (each card full width)
            ≥ 640px  → 2 columns
            ≥ 768px  → 3 columns
          The cards themselves are fluid — they shrink to fit the column.
        */}
        <div
          className="mt-12 sm:mt-16
                     grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3"
        >
          {FACILITIES.map((f, i) => (
            <article
              key={f.title}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface-container-low text-left transition-all duration-500 hover:-translate-y-1 hover:elevation-3 elevation-1"
            >
              <MediaSlot
                src={f.img}
                alt={f.title}
                aspectClass="aspect-[4/5]"
                className="rounded-t-3xl"
              />

              <span className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest/90 font-display text-base text-primary backdrop-blur-sm">
                0{i + 1}
              </span>

              <div className="flex flex-1 flex-col p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container">
                    <span className="material-symbols-outlined text-lg text-on-primary-container">
                      {f.icon}
                    </span>
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-luxe text-primary">
                    {f.eyebrow}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl text-on-surface">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {f.body}
                </p>

                <ul className="mt-5 space-y-2 border-t border-outline-variant pt-5">
                  {f.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-xs text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-sm text-tertiary">
                        check_circle
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
