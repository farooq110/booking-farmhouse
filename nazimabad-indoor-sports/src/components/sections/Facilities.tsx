"use client";
import type { StaticImageData } from "next/image";
import { MediaSlot } from "@/components/ui/media-slot";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { MEDIA } from "@/data/media";

interface Facility {
  /** Key inside MEDIA.facilities that holds this facility's image. */
  key: keyof typeof MEDIA.facilities;
  eyebrow: string;
  icon: string;
  title: string;
  body: string;
  highlights: string[];
}

/**
 * Master catalogue of every facility that COULD be shown.
 *
 * A row is only rendered when its image actually exists in
 * `MEDIA.facilities` — i.e. when someone has uncommented the
 * matching import in `src/data/media.ts` AND added it to the
 * `facilities` object.
 *
 * To add a facility back to the page:
 *   1. Uncomment / add its image import in `src/data/media.ts`.
 *   2. Add the key to the `facilities` object there.
 * No edits needed in this file.
 *
 * To remove a facility from the page:
 *   1. Comment out its entry in the `facilities` object in
 *      `src/data/media.ts`.
 *   No edits needed here either — it will simply not render.
 */
const FACILITY_CATALOG: Facility[] = [
  // {
  //   key: "kids",
  //   eyebrow: "For Small Guests",
  //   icon: "child_care",
  //   title: "Kids Play Area",
  //   body: "Fenced, shaded play zone with swings, slides, and a sandpit. Ages 2–12.",
  //   highlights: ["Fenced & shaded", "Ages 2–12", "Visible from deck"],
  // },
  {
    key: "barbiQArea",
    eyebrow: "Smoke & Fire",
    icon: "outdoor_grill",
    title: "Barbi Q Area",
    body: "An open-air barbeque terrace built around a custom stone pit and a wood-fired smoker, with teak prep counters, hanging skewer racks, and a starlit dining deck that seats up to 16 guests. Perfect for slow-grilled lamb, smoky kebabs, and long celebration feasts under the night sky.",
    highlights: ["Custom stone BBQ pit", "Wood-fired smoker", "Teak prep counters", "Seats 16 under the stars"],
  },
  {
    key: "gaming",
    eyebrow: "For Evenings In",
    icon: "sports_esports",
    title: "Gaming Room",
    body: "Indoor gaming room with billiards, table tennis, foosball, and console setup.",
    highlights: ["Billiards", "Table tennis", "Console gaming"],
  },
  {
    key: "sports",
    eyebrow: "For Active Days",
    icon: "sports_tennis",
    title: "Sports Facilities",
    body: "Open sports area for cricket, football, and badminton. Equipment provided.",
    highlights: ["Cricket & football", "Badminton", "Equipment provided"],
  },
];

function isFacilityImage(value: unknown): value is StaticImageData | string {
  // Treat `undefined`, `null`, and empty string as "not present".
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

/** Build the renderable list — only facilities whose image is defined. */
function getRenderableFacilities(): Facility[] {
  return FACILITY_CATALOG.filter((f) => isFacilityImage(MEDIA.facilities[f.key]));
}

export function Facilities() {
  const facilities = getRenderableFacilities();

  // If no facility images are configured, hide the entire section rather
  // than render an empty grid (avoids an awkward gap on the page).
  if (facilities.length === 0) return null;

  return (
    <section id="facilities" className="relative bg-surface-container py-20 sm:py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>More On The Estate</SectionLabel>
          <SectionHeading>
            Something for
            <span className="text-sage-gradient italic"> every guest, every age.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Dedicated spaces for dining, gamers, and sporty guests — rain or shine.
          </p>
        </header>

        {/*
          Alternating offset zig-zag layout.
          Odd cards (index 0, 2, …): image LEFT, content RIGHT.
          Even cards (index 1, 3, …): image RIGHT, content LEFT.
          On mobile both stack with image on top.

          Distinct from the previous uniform 3-column vertical grid:
          this gives the section a rhythm and lets each facility get
          the full row width for its photo + story.
        */}
        <div className="mt-12 sm:mt-16 flex flex-col gap-8 sm:gap-12">
          {facilities.map((f, i) => {
            const imageLeft = i % 2 === 0;
            return (
              <article
                key={f.key}
                className="group relative grid grid-cols-1 overflow-hidden rounded-[1.5rem] border border-outline-variant bg-surface-lowest transition-all duration-500 hover:border-sage hover:elevation-3 elevation-1 md:grid-cols-2"
              >
                {/* ── Image side ── */}
                <div
                  className={[
                    "relative overflow-hidden",
                    imageLeft ? "md:order-1" : "md:order-2",
                  ].join(" ")}
                >
                  <div className="relative h-56 sm:h-72 md:h-full">
                    <MediaSlot
                      src={MEDIA.facilities[f.key] as StaticImageData | string}
                      alt={f.title}
                      aspectClass="h-full w-full"
                      className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </div>

                  {/* Sage accent bar — vertical strip on the inner edge */}
                  <span
                    className={[
                      "pointer-events-none absolute top-0 bottom-0 w-1.5 bg-sage/55",
                      imageLeft ? "right-0" : "left-0",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {/* Index numeral — top-left of image */}
                  <span className="pointer-events-none absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-lowest/90 font-display text-base font-semibold text-primary backdrop-blur-sm ring-1 ring-sage/30 elevation-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Icon pill — bottom-left of image */}
                  <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-charcoal/55 px-3 py-1.5 backdrop-blur-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-on-primary">
                      <span className="material-symbols-outlined text-sm">{f.icon}</span>
                    </span>
                    <span className="font-sans text-[10px] uppercase tracking-luxe text-cream">
                      {f.eyebrow}
                    </span>
                  </span>
                </div>

                {/* ── Content side ── */}
                <div
                  className={[
                    "relative flex flex-col justify-center p-6 sm:p-8 md:p-10",
                    imageLeft ? "md:order-2" : "md:order-1",
                  ].join(" ")}
                >
                  {/* Decorative offset dot pattern in the corner — adds
                      visual interest without competing with content. */}
                  <span
                    className={[
                      "pointer-events-none absolute h-20 w-20 opacity-30",
                      "bg-[radial-gradient(circle,oklch(0.55_0.085_145/0.45)_1.5px,transparent_1.5px)] [background-size:10px_10px]",
                      imageLeft ? "right-4 top-4" : "left-4 top-4",
                    ].join(" ")}
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

                  {/* "In the estate" arrow — reveals on hover */}
                  <div className="mt-6 flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="h-px w-8 bg-sage" />
                    <span>On the estate</span>
                    <span className="material-symbols-outlined text-base text-sage">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
