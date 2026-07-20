"use client";
import { MediaSlot } from "@/components/ui/media-slot";
import { SectionHeading, SectionLabel } from "@/components/ui/luxury-primitives";
import { MEDIA } from "@/data/media";

interface Facility {
  eyebrow: string;
  icon: string;
  title: string;
  body: string;
  img: string;
  highlights: string[];
}

const FACILITIES: Facility[] = [
  {
    eyebrow: "For Small Guests",
    icon: "child_care",
    title: "Kids Play Area",
    body: "Fenced, shaded play zone with swings, slides, and a sandpit. Ages 2–12.",
    img: MEDIA.facilities.kids,
    highlights: ["Fenced & shaded", "Ages 2–12", "Visible from deck"],
  },
  {
    eyebrow: "For Evenings In",
    icon: "sports_esports",
    title: "Gaming Room",
    body: "Indoor gaming room with billiards, table tennis, foosball, and console setup.",
    img: MEDIA.facilities.gaming,
    highlights: ["Billiards", "Table tennis", "Console gaming"],
  },
  {
    eyebrow: "For Active Days",
    icon: "sports_tennis",
    title: "Sports Facilities",
    body: "Open sports area for cricket, football, and badminton. Equipment provided.",
    img: MEDIA.facilities.sports,
    highlights: ["Cricket & football", "Badminton", "Equipment provided"],
  },
];

export function Facilities() {
  return (
    <section id="facilities" className="relative bg-surface-container py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <SectionLabel>More On The Estate</SectionLabel>
          <SectionHeading>
            Something for
            <span className="text-moss-gradient italic"> every guest, every age.</span>
          </SectionHeading>
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant text-pretty leading-relaxed">
            Dedicated spaces for children, gamers, and sporty guests — rain or shine.
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
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

              <div className="flex flex-1 flex-col p-7">
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

                <h3 className="font-display text-2xl text-on-surface">{f.title}</h3>
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
