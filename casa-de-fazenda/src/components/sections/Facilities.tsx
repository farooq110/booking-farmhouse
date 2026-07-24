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
    key: "dinningArea",
    eyebrow: "For Shared Meals",
    icon: "restaurant",
    title: "Dining Area",
    body: "Spacious indoor-outdoor dining area that seats the whole party. Perfect for family dinners, barbeque nights, and celebration meals served fresh from the kitchen.",
    highlights: ["Indoor-outdoor seating", "Family-style layout", "BBQ-friendly"],
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
            <span className="text-moss-gradient italic"> every guest, every age.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Dedicated spaces for dining, gamers, and sporty guests — rain or shine.
          </p>
        </header>

        {/*
          Responsive grid (no horizontal scroll):
            < 640px  → 1 column (each card full width)
            ≥ 640px  → 2 columns
            ≥ 768px  → 3 columns
          NOTE — do NOT use inline `style={{ gridTemplateColumns: ... }}` here.
          An inline style would override the responsive Tailwind classes
          (`sm:grid-cols-2`, `md:grid-cols-3`) on EVERY viewport, which is
          exactly the bug that used to make this section render 3 columns
          crammed onto a phone screen. The grid auto-flows correctly
          because the catalogue caps at 3 visible items.
        */}
        <div
          className="mt-12 sm:mt-16
                     grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3"
        >
          {facilities.map((f, i) => (
            <article
              key={f.key}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface-container-low text-left transition-all duration-500 hover:-translate-y-1 hover:elevation-3 elevation-1"
            >
              <MediaSlot
                src={MEDIA.facilities[f.key] as StaticImageData | string}
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
