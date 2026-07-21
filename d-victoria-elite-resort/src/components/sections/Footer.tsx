"use client";
import Image from "next/image";
import { FARMHOUSE, MEDIA } from "@/data/media";

const NAV_LINKS = [
  { label: "The Estate", href: "#estate" },
  { label: "Facilities", href: "#facilities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Videos", href: "#videos" },
  { label: "Location", href: "#location" },
  { label: "Enquire", href: "#booking-form" },
];

const SOCIALS = [
  { label: "Instagram", icon: "photo_camera", href: "#" },
  { label: "Pinterest", icon: "collections", href: "#" },
  { label: "Journal", icon: "menu_book", href: "#" },
];

const LEGAL = [
  { label: "Privacy", href: "#" },
  { label: "House Rules", href: "#" },
  { label: "Cancellation Policy", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-outline-variant bg-surface-container-lowest py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          {/* Brand stamp */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden ring-1 ring-outline-variant bg-primary">
                <Image
                  src={MEDIA.logo}
                  alt={`${FARMHOUSE.name} logo`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </span>
              <p className="font-display text-2xl text-on-surface">{FARMHOUSE.name}</p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-on-surface-variant leading-relaxed">
              A private resort in Gadap Town, Karachi. Owned and hosted
              by one family. Book directly — no middleman, no booking fees.
            </p>

            <div className="mt-5 space-y-1.5 text-sm text-on-surface-variant">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-tertiary">call</span>
                <a href={FARMHOUSE.phoneHref} className="transition hover:text-primary">
                  {FARMHOUSE.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-tertiary">mail</span>
                <a href={FARMHOUSE.emailHref} className="transition hover:text-primary">
                  {FARMHOUSE.email}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-tertiary mt-0.5">location_on</span>
                <span className="max-w-xs">{FARMHOUSE.address}</span>
              </p>
            </div>
          </div>

          {/* Nav + Social */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav aria-label="Page navigation">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-primary">
                Explore
              </p>
              <ul className="mt-3 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social links">
              <p className="font-sans text-[10px] uppercase tracking-luxe text-primary">
                Follow the estate
              </p>
              <ul className="mt-3 space-y-2.5">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-base text-tertiary">
                        {s.icon}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-outline-variant pt-6">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-xs text-on-surface-variant transition-colors hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} {FARMHOUSE.name}. Owned & hosted by the family who lives here.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant">
            Book directly · No booking fees · No middleman
          </p>
        </div>
      </div>
    </footer>
  );
}
