"use client";
import { SectionLabel, Icon } from "@/components/ui/luxury-primitives";
import { OptimizedImage } from "@/lib/images";
import { MEDIA, FARMHOUSE } from "@/data/media";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* Beautiful farmhouse cover image (full-bleed background).
          Uses OptimizedImage (next/image) → AVIF/WebP, priority preload. */}
      <div className="absolute inset-0 -z-20">
        <OptimizedImage
          src={MEDIA.hero.cover}
          alt={`${FARMHOUSE.name} — a private farmhouse estate in Malir Cantonment, Karachi`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Subtle dark gradient so cream text stays legible over the photo */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.20 0.018 145 / 0.55) 0%, oklch(0.20 0.018 145 / 0.35) 50%, oklch(0.20 0.018 145 / 0.75) 100%)",
        }}
      />

      {/* 3D windmill as a subtle background element */}
      <HeroBackground3DWrapper />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <SectionLabel className="text-cream/90">
          <span className="h-px w-6 bg-amber-soft" />
          {FARMHOUSE.name} · Private Farmhouse · Karachi
        </SectionLabel>

        <h1 className="font-display font-medium text-balance text-cream leading-[1.02] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          Welcome to our
          <br />
          <span className="text-gold-gradient italic">country farmhouse.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base sm:text-lg text-cream/85 text-pretty leading-relaxed">
          A private farmhouse in Malir Cantonment, Karachi. Pool, gardens,
          gaming, and sports facilities — for your family, friends, and
          quiet weekends. Book directly with the owner.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#booking-form"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-tertiary px-8 py-3.5 font-sans text-xs uppercase tracking-luxe text-on-tertiary transition-all hover:bg-amber-soft elevation-1 hover:elevation-2 state-layer"
          >
            <Icon name="event_available" className="text-base" />
            Book Your Slot
          </a>
          <a
            href="#estate"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-8 py-3.5 font-sans text-xs uppercase tracking-luxe text-cream transition-all hover:bg-cream/10 hover:text-cream state-layer"
          >
            <Icon name="arrow_downward" className="text-base" />
            Explore the Estate
          </a>
        </div>

        {/* Trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-cream/75">
          <TrustItem icon="handshake" label="Owned & hosted by one family" />
          <TrustItem icon="bolt" label="Book directly with us" />
          <TrustItem icon="payments" label="No booking fees" />
          <TrustItem icon="call" label={FARMHOUSE.phone} />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a
          href="#estate"
          className="flex h-10 w-6 items-start justify-center rounded-full border border-cream/40 p-1.5 transition hover:border-cream"
          aria-label="Scroll to explore the estate"
        >
          <div className="h-2 w-1 rounded-full bg-amber-soft animate-bounce" />
        </a>
      </div>
    </section>
  );
}

function TrustItem({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="material-symbols-outlined text-base text-amber-soft">{icon}</span>
      <span className="font-sans text-[11px] uppercase tracking-wide-luxe">{label}</span>
    </span>
  );
}

/**
 * Mounts the 3D windmill as a hero-only background element.
 * Dynamically imported so Three.js never touches the server.
 */
import dynamic from "next/dynamic";
const HeroBackground3D = dynamic(
  () =>
    import("@/components/three/HeroBackgroundWindmill").then(
      (m) => m.HeroBackgroundWindmill
    ),
  { ssr: false, loading: () => null }
);
const HeroBackground3DWrapper = () => <HeroBackground3D />;
