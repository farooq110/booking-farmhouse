"use client";
import { FARMHOUSE } from "@/data/media";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/luxury-primitives";

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

/**
 * Footer — Eco-Farm layout.
 *
 * Distinct from the previous footer in three ways:
 *   1. A sage gradient top border with a centered leaf glyph.
 *   2. A 4-column responsive grid (brand + 2 nav + contact card)
 *      instead of the old 2-column layout.
 *   3. A newsletter signup strip above the legal row.
 */
export function Footer() {
  return (
    <footer className="relative mt-auto bg-surface-container-lowest">
      {/* ── Sage gradient top border with centered leaf glyph ── */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-sage/60 to-transparent">
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-lowest text-primary ring-1 ring-sage/40"
          aria-hidden="true"
        >
          <Icon name="eco" className="text-base" filled />
        </span>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* ── Newsletter strip ── */}
        <div className="mb-12 flex flex-col gap-4 rounded-3xl bg-sage-soft/25 border border-sage/30 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-2xl text-on-surface">
              Seasonal stories from the farm
            </p>
            <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">
              Occasional notes on new facilities, off-season rates, and harvest
              events. No spam — just the farm.
            </p>
          </div>
          <form
            className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              aria-label="Email address"
              className="w-full rounded-full border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-sans text-[11px] uppercase tracking-wide-luxe text-on-primary elevation-1 hover:elevation-2 hover:bg-moss transition-all state-layer whitespace-nowrap sm:w-auto"
            >
              <Icon name="send" className="text-sm" />
              Subscribe
            </button>
          </form>
        </div>

        {/* ── 4-column main grid ── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand stamp */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden ring-1 ring-sage/40 bg-surface-lowest elevation-1">
                <Logo size={48} className="h-full w-full object-cover" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl text-on-surface truncate">
                  {FARMHOUSE.name}
                </p>
                <p className="font-sans text-[9px] uppercase tracking-luxe text-primary">
                  Eco · Farm · Retreat
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
              A private eco-farm retreat in Taiser Town, Karachi. Owned and
              hosted by one family. Book directly — no middleman, no booking
              fees.
            </p>

            {/* Social row */}
            <ul className="mt-5 flex gap-2">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-all hover:border-sage hover:bg-sage-soft/40 hover:text-primary state-layer"
                  >
                    <span className="material-symbols-outlined text-base">
                      {s.icon}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore nav */}
          <nav aria-label="Page navigation">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-primary mb-4 flex items-center gap-2">
              <span className="h-px w-5 bg-sage" />
              Explore
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <span className="h-px w-3 bg-outline-variant transition-all group-hover:w-5 group-hover:bg-sage" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Visit nav */}
          <nav aria-label="Visit information">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-primary mb-4 flex items-center gap-2">
              <span className="h-px w-5 bg-sage" />
              Visit
            </p>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">login</span>
                <span>Check-in · 3:00 PM — 6:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">logout</span>
                <span>Check-out · 11:00 AM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">support_agent</span>
                <span>On-site host · owner lives on the property</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-primary mt-0.5">pets</span>
                <span>Pets welcome with prior notice</span>
              </li>
            </ul>
          </nav>

          {/* Contact card */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 elevation-1">
            <p className="font-sans text-[10px] uppercase tracking-luxe text-primary mb-4 flex items-center gap-2">
              <span className="h-px w-5 bg-sage" />
              Reach the owner
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={FARMHOUSE.phoneHref}
                className="group flex items-center gap-3 text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined text-base">call</span>
                </span>
                <span className="font-medium">{FARMHOUSE.phone}</span>
              </a>
              <a
                href={FARMHOUSE.emailHref}
                className="group flex items-center gap-3 text-on-surface-variant transition-colors hover:text-primary break-all"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined text-base">mail</span>
                </span>
                <span className="font-medium text-xs">{FARMHOUSE.email}</span>
              </a>
              <a
                href={FARMHOUSE.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <span className="material-symbols-outlined text-base">location_on</span>
                </span>
                <span className="text-xs leading-relaxed">{FARMHOUSE.address}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-outline-variant pt-6">
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
            © {new Date().getFullYear()} {FARMHOUSE.name}. Owned & hosted by
            the family who lives here.
          </p>
          <p className="font-sans text-[10px] uppercase tracking-luxe text-on-surface-variant flex items-center gap-2">
            <Icon name="eco" className="text-sm text-primary" filled />
            Book directly · No booking fees · Eco-hosted
          </p>
        </div>
      </div>
    </footer>
  );
}
